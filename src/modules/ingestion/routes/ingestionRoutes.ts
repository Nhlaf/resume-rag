import { Router } from "express";
import { uploadResumePdf } from "../../../config/multerConfig";
import { cleanResume, detectResumeSkills, embedResume, extractResumeText, getIngestionHealth, ingestResume, parseResume, parseResumeWithLlm, storeResume, uploadResume } from "../controllers/ingestionController";

export const ingestionRoutes = Router();

ingestionRoutes.get("/resume/health", getIngestionHealth);
ingestionRoutes.post("/resume/upload", uploadResumePdf.single("file"), uploadResume);
ingestionRoutes.post("/resume/ingest", uploadResumePdf.single("file"), ingestResume);
ingestionRoutes.post("/resume/inject", uploadResumePdf.single("file"), ingestResume);
ingestionRoutes.post("/resume/extract", uploadResumePdf.single("file"), extractResumeText);
ingestionRoutes.post("/resume/clean", cleanResume);
ingestionRoutes.post("/resume/skills", detectResumeSkills);
ingestionRoutes.post("/resume/parse", parseResume);
ingestionRoutes.post("/resume/llm-parse", parseResumeWithLlm);
ingestionRoutes.post("/resume/embed", embedResume);
ingestionRoutes.post("/resume/store", storeResume);