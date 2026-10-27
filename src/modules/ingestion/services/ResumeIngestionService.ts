import { env } from "../../../config/env";
import { ResumeIngestionRepository } from "../repositories/ResumeIngestionRepository";
import { AlgorithmResumeParser } from "./AlgorithmResumeParser";
import { EmbeddingService } from "./EmbeddingService";
import { LLMResumeParser } from "./LLMResumeParser";
import { ResumeParserService } from "./ResumeParserService";
import { cleanResumeText } from "../utils/textCleaner";
import { ParsedResume } from "../types/ingestion.types";

export type IngestionTimings = {
	extractMs: number;
	cleanMs: number;
	parseMs: number;
	embeddingMs: number;
	mongoInsertMs: number;
	totalMs: number;
};

export type IngestionResult = {
	resumeId: string;
	resume: ParsedResume;
	timings: IngestionTimings;
};

export type IngestionStage = "EXTRACTION" | "PARSING" | "EMBEDDING" | "MONGODB";

export class IngestionError extends Error {
	constructor(
		public readonly stage: IngestionStage,
		message: string,
	) {
		super(message);
		this.name = "IngestionError";
	}
}

export class ResumeIngestionService {
	constructor(
		private readonly resumeParserService = new ResumeParserService(),
		private readonly algorithmResumeParser = new AlgorithmResumeParser(),
		private readonly llmResumeParser = new LLMResumeParser(),
		private readonly embeddingService = new EmbeddingService(),
		private readonly repository = new ResumeIngestionRepository(),
	) {}

	async ingestResume(file: Express.Multer.File): Promise<IngestionResult> {
		const totalStartedAt = Date.now();

		const extractStartedAt = Date.now();
		let rawText: string;
		try {
			rawText = await this.resumeParserService.extractTextFromPdf(file.path);
		} catch (error) {
			throw new IngestionError("EXTRACTION", error instanceof Error ? error.message : "PDF extraction failed");
		}
		const extractMs = Date.now() - extractStartedAt;

		if (!rawText.trim()) {
			throw new Error("Resume extraction failed: PDF contains no text");
		}

		const cleanStartedAt = Date.now();
		const cleanText = cleanResumeText(rawText);
		const cleanMs = Date.now() - cleanStartedAt;

		if (!cleanText) {
			throw new Error("Resume extraction failed: cleaned text is empty");
		}

		const parseStartedAt = Date.now();
		let resume: ParsedResume;
		try {
			resume = env.useLlmParser
				? await this.llmResumeParser.parseResume(cleanText)
				: this.algorithmResumeParser.parseResume(cleanText);
		} catch (error) {
			throw new IngestionError("PARSING", error instanceof Error ? error.message : "Resume parsing failed");
		}
		const parseMs = Date.now() - parseStartedAt;

		const embeddingStartedAt = Date.now();
		let embedding: number[];
		try {
			embedding = await this.embeddingService.generateResumeEmbedding({
				name: resume.name,
				role: resume.role,
				skills: resume.skills,
				company: resume.company,
				experienceSummary: resume.experienceSummary,
				rawText: cleanText,
			});
		} catch (error) {
			throw new IngestionError("EMBEDDING", error instanceof Error ? error.message : "Embedding generation failed");
		}
		const embeddingMs = Date.now() - embeddingStartedAt;

		const mongoInsertStartedAt = Date.now();
		let resumeId: string;
		try {
			resumeId = await this.repository.storeResume(
				file.originalname,
				resume,
				cleanText,
				embedding,
			);
		} catch (error) {
			throw new IngestionError("MONGODB", error instanceof Error ? error.message : "MongoDB insert failed");
		}
		const mongoInsertMs = Date.now() - mongoInsertStartedAt;

		return {
			resumeId,
			resume,
			timings: {
				extractMs,
				cleanMs,
				parseMs,
				embeddingMs,
				mongoInsertMs,
				totalMs: Date.now() - totalStartedAt,
			},
		};
	}
}