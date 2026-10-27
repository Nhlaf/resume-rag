import { Router } from "express";
import { 
  validateSearchQuery, 
  validateSearchOptions, 
  validateSearchFilters,
  validateRerankCandidates 
} from "../../../middleware/validation";
import { RetrievalController } from "../controllers/retrievalController";

export const retrievalRoutes = Router();

// PHASE 1 - Retrieval Readiness Check
retrievalRoutes.get("/search/readiness", RetrievalController.checkReadiness);

// PHASE 3 - Query Embedding
retrievalRoutes.post("/embeddings", RetrievalController.generateEmbedding);

// PHASE 4 - Resume Repository Test Endpoints
retrievalRoutes.get("/search/resumes", RetrievalController.listResumes);
retrievalRoutes.get("/search/resumes/:id", RetrievalController.getResumeById);

// PHASE 5 - BM25 Lexical Search (with validation)
retrievalRoutes.post(
  "/search/bm25", 
  validateSearchQuery,
  validateSearchFilters,
  RetrievalController.bm25Search
);

// PHASE 6 - Vector Semantic Search (with validation)
retrievalRoutes.post(
  "/search/vector", 
  validateSearchQuery,
  validateSearchFilters,
  RetrievalController.vectorSearch
);

// PHASE 8 - Hybrid Search (with validation)
retrievalRoutes.post(
  "/search/hybrid", 
  validateSearchQuery,
  validateSearchFilters,
  RetrievalController.hybridSearch
);

// PHASE 9 - Hybrid Search with Merge & Deduplicate (with validation)
retrievalRoutes.post(
  "/search/hybrid/merged", 
  validateSearchQuery,
  validateSearchFilters,
  RetrievalController.hybridSearchMerged
);

// PHASE 10-11 - LLM Re-Ranking (with validation)
retrievalRoutes.post(
  "/search/rerank", 
  validateSearchQuery,
  validateRerankCandidates,
  RetrievalController.rerankCandidates
);

// PHASE 12 - Candidate Summarization (with validation)
retrievalRoutes.post(
  "/search/summarize", 
  validateSearchQuery,
  RetrievalController.summarizeCandidate
);

// PHASE 13-14-15-16-17 - Full End-to-End Search (PRODUCTION ENDPOINT with full validation)
retrievalRoutes.post(
  "/search",
  validateSearchQuery,
  validateSearchOptions,
  validateSearchFilters,
  RetrievalController.fullSearch
);
