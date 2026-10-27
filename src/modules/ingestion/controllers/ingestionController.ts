import { unlink } from "node:fs/promises";
import { RequestHandler } from "express";
import { IngestionHealthResponse } from "../types/ingestion.types";
import { ResumeParserService } from "../services/ResumeParserService";
import { SKILLS } from "../../../config/skills";
import { cleanResumeText } from "../utils/textCleaner";
import { escapeRegex } from "../utils/regex";
import { AlgorithmResumeParser } from "../services/AlgorithmResumeParser";
import { LLMResumeParser } from "../services/LLMResumeParser";
import { env } from "../../../config/env";
import { EmbeddingService, ResumeEmbeddingInput } from "../services/EmbeddingService";
import { ResumeIngestionRepository } from "../repositories/ResumeIngestionRepository";
import { IngestionError, ResumeIngestionService } from "../services/ResumeIngestionService";

const resumeParserService = new ResumeParserService();
const algorithmResumeParser = new AlgorithmResumeParser();
const llmResumeParser = new LLMResumeParser();
const embeddingService = new EmbeddingService();
const resumeIngestionRepository = new ResumeIngestionRepository();
const resumeIngestionService = new ResumeIngestionService();

export const getIngestionHealth: RequestHandler = (_req, res) => {
  const response: IngestionHealthResponse = {
    status: "ok",
    module: "resume-ingestion",
  };

  res.status(200).json(response);
};

export const uploadResume: RequestHandler = (req, res) => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      errorCode: "FILE_REQUIRED",
      message: "Resume PDF is required",
      requestId: res.locals.requestId,
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Resume uploaded successfully",
    file: {
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    },
  });
};

export const extractResumeText: RequestHandler = async (req, res) => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      errorCode: "FILE_REQUIRED",
      message: "Resume PDF is required",
      requestId: res.locals.requestId,
    });
    return;
  }

  try {
    const rawText = await resumeParserService.extractTextFromPdf(req.file.path);

    if (!rawText.trim()) {
      res.status(422).json({
        success: false,
        errorCode: "RESUME_EXTRACTION_FAILED",
        message: "Resume extraction failed",
        requestId: res.locals.requestId,
      });
      return;
    }

    res.status(200).json({
      success: true,
      rawText,
      characters: rawText.length,
    });
  } catch (_error) {
    res.status(422).json({
      success: false,
      errorCode: "RESUME_EXTRACTION_FAILED",
      message: "Resume extraction failed",
      requestId: res.locals.requestId,
    });
  } finally {
    await unlink(req.file.path).catch(() => undefined);
  }
};

export const cleanResume: RequestHandler = (req, res) => {
  if (typeof req.body?.rawText !== "string") {
    res.status(400).json({
      success: false,
      errorCode: "RAW_TEXT_REQUIRED",
      message: "rawText must be a string",
      requestId: res.locals.requestId,
    });
    return;
  }

  res.status(200).json({
    success: true,
    cleanText: cleanResumeText(req.body.rawText),
  });
};

export const detectResumeSkills: RequestHandler = (req, res) => {
  if (typeof req.body?.rawText !== "string") {
    res.status(400).json({
      success: false,
      errorCode: "RAW_TEXT_REQUIRED",
      message: "rawText must be a string",
      requestId: res.locals.requestId,
    });
    return;
  }

  const skills = SKILLS.filter((skill) => {
    const skillPattern = new RegExp(
      `(?<![A-Za-z0-9])${escapeRegex(skill)}(?![A-Za-z0-9])`,
      "i",
    );
    return skillPattern.test(req.body.rawText);
  });

  res.status(200).json({
    success: true,
    skills,
  });
};

export const parseResume: RequestHandler = (req, res) => {
  if (typeof req.body?.rawText !== "string") {
    res.status(400).json({
      success: false,
      errorCode: "RAW_TEXT_REQUIRED",
      message: "rawText must be a string",
      requestId: res.locals.requestId,
    });
    return;
  }

  res.status(200).json({
    success: true,
    resume: algorithmResumeParser.parseResume(req.body.rawText),
  });
};

export const parseResumeWithLlm: RequestHandler = async (req, res) => {
  if (typeof req.body?.rawText !== "string") {
    res.status(400).json({
      success: false,
      errorCode: "RAW_TEXT_REQUIRED",
      message: "rawText must be a string",
    });
    return;
  }

  if (!env.useLlmParser) {
    res.status(400).json({
      success: false,
      errorCode: "LLM_PARSER_DISABLED",
      message: "LLM resume parser is disabled",
      requestId: res.locals.requestId,
    });
    return;
  }

  try {
    const resume = await llmResumeParser.parseResume(req.body.rawText);
    res.status(200).json({ success: true, resume });
  } catch (_error) {
    res.status(502).json({
      success: false,
      errorCode: "RESUME_PARSE_FAILED",
      message: "Resume parsing failed",
      requestId: res.locals.requestId,
    });
  }
};

export const embedResume: RequestHandler = async (req, res) => {
  const input = req.body as Partial<ResumeEmbeddingInput> | undefined;

  if (!input || typeof input.rawText !== "string" || !Array.isArray(input.skills)) {
    res.status(400).json({
      success: false,
      errorCode: "EMBEDDING_INPUT_INVALID",
      message: "rawText and skills are required",
      requestId: res.locals.requestId,
    });
    return;
  }

  if (input.skills.some((skill) => typeof skill !== "string")) {
    res.status(400).json({
      success: false,
      errorCode: "EMBEDDING_INPUT_INVALID",
      message: "skills must contain only strings",
      requestId: res.locals.requestId,
    });
    return;
  }

  try {
    const embedding = await embeddingService.generateResumeEmbedding(input as ResumeEmbeddingInput);
    res.status(200).json({
      success: true,
      model: env.mistralEmbedModel,
      dimension: embedding.length,
      embedding,
    });
  } catch (_error) {
    res.status(502).json({
      success: false,
      errorCode: "EMBEDDING_FAILED",
      message: "Mistral embedding failed",
      requestId: res.locals.requestId,
    });
  }
};

export const storeResume: RequestHandler = async (req, res) => {
  const { fileName, resume, rawText, embedding } = req.body ?? {};

  if (
    typeof fileName !== "string" ||
    !fileName.trim() ||
    typeof rawText !== "string" ||
    !rawText.trim() ||
    !resume ||
    typeof resume !== "object" ||
    !Array.isArray(resume.skills) ||
    resume.skills.some((skill: unknown) => typeof skill !== "string") ||
    !Array.isArray(embedding) ||
    embedding.length !== env.embeddingDimension ||
    embedding.some((value: unknown) => typeof value !== "number" || !Number.isFinite(value))
  ) {
    res.status(400).json({
      success: false,
      errorCode: "RESUME_STORAGE_INPUT_INVALID",
      message: "fileName, resume, rawText, and a valid embedding are required",
      requestId: res.locals.requestId,
    });
    return;
  }

  try {
    const resumeId = await resumeIngestionRepository.storeResume(
      fileName,
      resume,
      rawText,
      embedding,
    );

    res.status(201).json({
      success: true,
      message: "Resume stored successfully",
      resumeId,
    });
  } catch (_error) {
    res.status(503).json({
      success: false,
      errorCode: "INGESTION_FAILED",
      message: "Resume ingestion failed",
      requestId: res.locals.requestId,
    });
  }
};

export const ingestResume: RequestHandler = async (req, res) => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      errorCode: "FILE_REQUIRED",
      message: "Resume PDF is required",
      requestId: res.locals.requestId,
    });
    return;
  }

  res.locals.fileName = req.file.originalname;

  try {
    const result = await resumeIngestionService.ingestResume(req.file);
    res.locals.ingestionTimings = result.timings;
    res.status(201).json({
      success: true,
      message: "Resume ingestion completed",
      resumeId: result.resumeId,
      data: {
        name: result.resume.name,
        role: result.resume.role,
        company: result.resume.company,
        totalExperience: result.resume.totalExperience,
        skillsCount: result.resume.skills.length,
        embeddingModel: env.mistralEmbedModel,
        embeddingDimension: env.embeddingDimension,
      },
      timings: result.timings,
    });
  } catch (error) {
    const ingestionError = error instanceof IngestionError ? error : undefined;
    const statusCode = ingestionError?.stage === "EXTRACTION" || ingestionError?.stage === "PARSING"
      ? 422
      : ingestionError?.stage === "EMBEDDING"
        ? 502
        : 503;
    const errorCode = ingestionError?.stage === "EXTRACTION"
      ? "RESUME_EXTRACTION_FAILED"
      : ingestionError?.stage === "PARSING"
        ? "RESUME_PARSE_FAILED"
        : ingestionError?.stage === "EMBEDDING"
          ? "EMBEDDING_FAILED"
          : "INGESTION_FAILED";
    const message = ingestionError?.stage === "EXTRACTION"
      ? "Resume extraction failed"
      : ingestionError?.stage === "PARSING"
        ? "Resume parsing failed"
        : ingestionError?.stage === "EMBEDDING"
          ? "Mistral embedding failed"
          : "Resume ingestion failed";
    res.status(statusCode).json({
      success: false,
      requestId: res.locals.requestId,
      errorCode,
      message,
    });
  } finally {
    await unlink(req.file.path).catch(() => undefined);
  }
};