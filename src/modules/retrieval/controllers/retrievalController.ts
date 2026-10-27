import type { Request, Response } from "express";
import { RetrievalValidationService } from "../services/RetrievalValidationService";
import { SearchService } from "../services/SearchService";
import { ResumeRepository } from "../repositories/ResumeRepository";
import { LLMService } from "../services/LLMService";
import { mergeCandidates, sortCandidatesByScore } from "../utils/deduplicate";
import { env } from "../../../config/env";

export class RetrievalController {
  /**
   * GET /v1/search/readiness
   * Check if retrieval system is ready with prerequisite data
   */
  static async checkReadiness(_req: Request, res: Response): Promise<void> {
    try {
      const readiness = await RetrievalValidationService.checkReadiness();

      if (readiness.ready) {
        res.status(200).json(readiness);
      } else {
        res.status(503).json(readiness);
      }
    } catch (error) {
      console.error("Readiness check error:", error);
      res.status(500).json({
        ready: false,
        reason: "Internal server error during readiness check",
      });
    }
  }

  /**
   * POST /v1/embeddings
   * Generate embedding for a search query
   */
  static async generateEmbedding(req: Request, res: Response): Promise<void> {
    try {
      const { model, input } = req.body;

      // Validate request
      if (!input || typeof input !== "string" || input.trim().length === 0) {
        res.status(400).json({
          success: false,
          errorCode: "INVALID_INPUT",
          message: "Input text is required and must be a non-empty string",
        });
        return;
      }

      // Validate model
      if (model && model !== env.mistralEmbedModel) {
        res.status(400).json({
          success: false,
          errorCode: "INVALID_MODEL",
          message: `Only ${env.mistralEmbedModel} is supported`,
        });
        return;
      }

      const searchService = new SearchService();
      const startTime = Date.now();

      const embedding = await searchService.generateQueryEmbedding(input);
      const duration = Date.now() - startTime;

      res.status(200).json({
        embedding,
        model: env.mistralEmbedModel,
        dimension: env.embeddingDimension,
        durationMs: duration,
      });
    } catch (error) {
      console.error("Embedding generation error:", error);
      res.status(500).json({
        success: false,
        errorCode: "EMBEDDING_GENERATION_FAILED",
        message: error instanceof Error ? error.message : "Failed to generate embedding",
      });
    }
  }

  /**
   * GET /v1/search/resumes/:id
   * Fetch a single resume by ID (Phase 4 test endpoint)
   */
  static async getResumeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || typeof id !== "string") {
        res.status(400).json({
          success: false,
          errorCode: "INVALID_ID",
          message: "Resume ID is required and must be a string",
        });
        return;
      }

      const repository = new ResumeRepository();
      const resume = await repository.findById(id);

      if (!resume) {
        res.status(404).json({
          success: false,
          errorCode: "RESUME_NOT_FOUND",
          message: "Resume not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        resume: {
          _id: resume._id,
          rawText: resume.rawText,
          name: resume.name,
          email: resume.email,
          phone: resume.phone,
          location: resume.location,
          company: resume.company,
          role: resume.role,
          title: resume.role,
          totalExperience: resume.totalExperience,
          skills: resume.skills,
          jobTitles: resume.jobTitles,
          experienceSummary: resume.experienceSummary,
          summary: resume.experienceSummary,
          hasEmbedding: Array.isArray(resume.embedding) && resume.embedding.length > 0,
          embeddingDimension: resume.embeddingDimension,
        },
      });
    } catch (error) {
      console.error("Get resume by ID error:", error);
      res.status(500).json({
        success: false,
        errorCode: "FETCH_FAILED",
        message: error instanceof Error ? error.message : "Failed to fetch resume",
      });
    }
  }

  /**
   * GET /v1/search/resumes
   * List all resumes with optional filtering (Phase 4 test endpoint)
   */
  static async listResumes(req: Request, res: Response): Promise<void> {
    try {
      const { limit, minYearsExperience, skills, location, company } = req.query;

      const repository = new ResumeRepository();
      
      // If filters provided, use filter query
      if (minYearsExperience || skills || location || company) {
        const filters: any = {};
        
        if (minYearsExperience) {
          filters.minYearsExperience = parseInt(minYearsExperience as string, 10);
        }
        
        if (skills) {
          filters.skills = (skills as string).split(",").map(s => s.trim());
        }
        
        if (location) {
          filters.location = location as string;
        }
        
        if (company) {
          filters.company = company as string;
        }

        const resumes = await repository.findByFilter(filters);
        
        res.status(200).json({
          success: true,
          count: resumes.length,
          resumes: resumes.map(r => ({
            _id: r._id,
            name: r.name,
            role: r.role,
            company: r.company,
            totalExperience: r.totalExperience,
            skills: r.skills,
            location: r.location,
          })),
        });
      } else {
        // No filters, get all with optional limit
        const limitNum = limit ? parseInt(limit as string, 10) : undefined;
        const resumes = await repository.findAll(limitNum);
        
        res.status(200).json({
          success: true,
          count: resumes.length,
          resumes: resumes.map(r => ({
            _id: r._id,
            name: r.name,
            role: r.role,
            company: r.company,
            totalExperience: r.totalExperience,
            skills: r.skills,
            location: r.location,
          })),
        });
      }
    } catch (error) {
      console.error("List resumes error:", error);
      res.status(500).json({
        success: false,
        errorCode: "LIST_FAILED",
        message: error instanceof Error ? error.message : "Failed to list resumes",
      });
    }
  }

  /**
   * POST /v1/search/bm25
   * BM25 lexical search (Phase 5)
   */
  static async bm25Search(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();

    try {
      const { query, topK = 20, filters = {} } = req.body;

      // Validate query
      if (!query || typeof query !== "string" || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          errorCode: "INVALID_QUERY",
          message: "Search query is required and must be a non-empty string",
        });
        return;
      }

      // Validate topK
      const topKNum = Math.min(Math.max(1, topK), 100); // Cap between 1 and 100

      const searchService = new SearchService();
      const results = await searchService.bm25Search(query, filters, topKNum);

      const duration = Date.now() - startTime;

      res.status(200).json({
        mode: "bm25",
        query,
        count: results.length,
        results: results.map(r => ({
          resumeId: r.resumeId,
          name: r.name,
          role: r.role,
          company: r.company,
          score: r.bm25Score,
          matchedSkills: r.skills?.filter(skill => 
            query.toLowerCase().split(' ').some(word => 
              skill.toLowerCase().includes(word) || word.includes(skill.toLowerCase())
            )
          ) || [],
        })),
        durationMs: duration,
      });
    } catch (error) {
      console.error("BM25 search error:", error);
      res.status(500).json({
        success: false,
        errorCode: "BM25_SEARCH_FAILED",
        message: error instanceof Error ? error.message : "BM25 search failed",
      });
    }
  }

  /**
   * POST /v1/search/vector
   * Vector semantic search (Phase 6)
   */
  static async vectorSearch(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();

    try {
      const { query, topK = 20, filters = {} } = req.body;

      // Validate query
      if (!query || typeof query !== "string" || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          errorCode: "INVALID_QUERY",
          message: "Search query is required and must be a non-empty string",
        });
        return;
      }

      // Validate topK
      const topKNum = Math.min(Math.max(1, topK), 100); // Cap between 1 and 100

      const searchService = new SearchService();
      const results = await searchService.vectorSearch(query, filters, topKNum);

      const duration = Date.now() - startTime;

      res.status(200).json({
        mode: "vector",
        query,
        count: results.length,
        results: results.map(r => ({
          resumeId: r.resumeId,
          name: r.name,
          role: r.role,
          company: r.company,
          vectorScore: r.vectorScore,
          skills: r.skills,
        })),
        durationMs: duration,
      });
    } catch (error) {
      console.error("Vector search error:", error);
      res.status(500).json({
        success: false,
        errorCode: "VECTOR_SEARCH_FAILED",
        message: error instanceof Error ? error.message : "Vector search failed",
      });
    }
  }

  /**
   * POST /v1/search/hybrid
   * Hybrid search combining BM25 and Vector (Phase 8)
   */
  static async hybridSearch(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();

    try {
      const { query, topK = 20, filters = {} } = req.body;

      // Validate query
      if (!query || typeof query !== "string" || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          errorCode: "INVALID_QUERY",
          message: "Search query is required and must be a non-empty string",
        });
        return;
      }

      // Validate topK
      const topKNum = Math.min(Math.max(1, topK), 100); // Cap between 1 and 100

      const searchService = new SearchService();
      const result = await searchService.hybridSearch(query, filters, topKNum, topKNum);

      const duration = Date.now() - startTime;

      res.status(200).json({
        mode: "hybrid-debug",
        query,
        bm25: {
          count: result.bm25.length,
          results: result.bm25.map(r => ({
            resumeId: r.resumeId,
            name: r.name,
            role: r.role,
            company: r.company,
            score: r.bm25Score,
            matchedSkills: r.skills?.filter(skill => 
              query.toLowerCase().split(' ').some(word => 
                skill.toLowerCase().includes(word) || word.includes(skill.toLowerCase())
              )
            ) || [],
          })),
        },
        vector: {
          count: result.vector.length,
          results: result.vector.map(r => ({
            resumeId: r.resumeId,
            name: r.name,
            role: r.role,
            company: r.company,
            score: r.vectorScore,
          })),
        },
        timings: {
          bm25Ms: result.timings.bm25Ms,
          embeddingMs: result.timings.embeddingMs,
          vectorMs: result.timings.vectorMs,
          totalMs: result.timings.totalMs,
        },
      });
    } catch (error) {
      console.error("Hybrid search error:", error);
      res.status(500).json({
        success: false,
        errorCode: "HYBRID_SEARCH_FAILED",
        message: error instanceof Error ? error.message : "Hybrid search failed",
      });
    }
  }

  /**
   * POST /v1/search/hybrid/merged
   * Hybrid search with merged and deduplicated results (Phase 9)
   */
  static async hybridSearchMerged(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();

    try {
      const { query, topK = 20, filters = {} } = req.body;

      // Validate query
      if (!query || typeof query !== "string" || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          errorCode: "INVALID_QUERY",
          message: "Search query is required and must be a non-empty string",
        });
        return;
      }

      // Validate topK
      const topKNum = Math.min(Math.max(1, topK), 100); // Cap between 1 and 100

      const searchService = new SearchService();
      const result = await searchService.hybridSearch(query, filters, topKNum, topKNum);

      // Merge and deduplicate
      const mergedCandidates = mergeCandidates(result.bm25, result.vector);
      
      // Sort by fallback score (before LLM re-ranking)
      const sortedCandidates = sortCandidatesByScore(mergedCandidates);

      const duration = Date.now() - startTime;

      res.status(200).json({
        mode: "hybrid-merged",
        query,
        count: sortedCandidates.length,
        results: sortedCandidates.map((r, index) => ({
          rank: index + 1,
          resumeId: r.resumeId,
          name: r.name,
          role: r.role,
          company: r.company,
          totalExperience: r.name, // This should be from resume data
          skills: r.skills,
          sources: r.sources,
          bm25Score: r.bm25Score,
          vectorScore: r.vectorScore,
          inBothSearches: r.sources.length === 2,
        })),
        metadata: {
          totalBm25Results: result.bm25.length,
          totalVectorResults: result.vector.length,
          mergedCount: sortedCandidates.length,
          duplicatesRemoved: result.bm25.length + result.vector.length - sortedCandidates.length,
        },
        timings: {
          bm25Ms: result.timings.bm25Ms,
          embeddingMs: result.timings.embeddingMs,
          vectorMs: result.timings.vectorMs,
          mergingMs: duration - result.timings.totalMs,
          totalMs: duration,
        },
      });
    } catch (error) {
      console.error("Hybrid merged search error:", error);
      res.status(500).json({
        success: false,
        errorCode: "HYBRID_MERGED_SEARCH_FAILED",
        message: error instanceof Error ? error.message : "Hybrid merged search failed",
      });
    }
  }

  /**
   * POST /v1/search/rerank
   * LLM re-ranking of candidates (Phase 10-11)
   */
  static async rerankCandidates(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();

    try {
      const { query, candidates, topK = 10 } = req.body;

      // Validate query
      if (!query || typeof query !== "string" || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          errorCode: "INVALID_QUERY",
          message: "Search query is required and must be a non-empty string",
        });
        return;
      }

      // Validate candidates
      if (!Array.isArray(candidates) || candidates.length === 0) {
        res.status(400).json({
          success: false,
          errorCode: "INVALID_CANDIDATES",
          message: "Candidates array is required and must not be empty",
        });
        return;
      }

      // Validate topK
      const topKNum = Math.min(Math.max(1, topK), 50); // Cap between 1 and 50

      const llmService = new LLMService();
      const results = await llmService.rerankCandidates(query, candidates, topKNum);

      const duration = Date.now() - startTime;

      if (results.length === 0) {
        res.status(500).json({
          success: false,
          errorCode: "RERANK_FAILED",
          message: "LLM re-ranking failed or returned no results",
        });
        return;
      }

      res.status(200).json({
        mode: "rerank",
        query,
        count: results.length,
        results: results.map(r => ({
          resumeId: r.resumeId,
          rank: r.rank,
          relevanceScore: r.relevanceScore,
          reason: r.reason,
        })),
        model: env.groqModel,
        durationMs: duration,
      });
    } catch (error) {
      console.error("Rerank endpoint error:", error);
      res.status(500).json({
        success: false,
        errorCode: "RERANK_ENDPOINT_FAILED",
        message: error instanceof Error ? error.message : "Re-ranking failed",
      });
    }
  }

  /**
   * POST /v1/search/summarize
   * Generate candidate fit summary (Phase 12)
   */
  static async summarizeCandidate(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();

    try {
      const { query, candidate, style = "short", maxTokens } = req.body;

      // Validate query
      if (!query || typeof query !== "string" || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          errorCode: "INVALID_QUERY",
          message: "Search query is required and must be a non-empty string",
        });
        return;
      }

      // Validate candidate
      if (!candidate || !candidate.resumeId) {
        res.status(400).json({
          success: false,
          errorCode: "INVALID_CANDIDATE",
          message: "Candidate object with resumeId is required",
        });
        return;
      }

      // Validate style
      if (style && style !== "short" && style !== "detailed") {
        res.status(400).json({
          success: false,
          errorCode: "INVALID_STYLE",
          message: "Style must be either 'short' or 'detailed'",
        });
        return;
      }

      const llmService = new LLMService();
      const summary = await llmService.summarizeCandidateFit(query, candidate, {
        style,
        maxTokens,
      });

      const duration = Date.now() - startTime;

      if (!summary || summary.trim().length === 0) {
        res.status(500).json({
          success: false,
          errorCode: "SUMMARIZATION_FAILED",
          message: "Failed to generate summary",
        });
        return;
      }

      res.status(200).json({
        resumeId: candidate.resumeId,
        summary,
        style,
        model: env.groqModel,
        durationMs: duration,
      });
    } catch (error) {
      console.error("Summarization endpoint error:", error);
      res.status(500).json({
        success: false,
        errorCode: "SUMMARIZATION_ENDPOINT_FAILED",
        message: error instanceof Error ? error.message : "Summarization failed",
      });
    }
  }

  /**
   * POST /v1/search
   * Full end-to-end search (Phase 13-17)
   * With comprehensive fallback logic and validation
   */
  static async fullSearch(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();

    try {
      // Query is already validated and trimmed by middleware (Phase 17)
      const { query, filters = {}, options = {}, searchType, topK } = req.body;
      const requestedSearchType = typeof searchType === "string" ? searchType.toLowerCase() : "vector";
      const requestedTopK = Number(topK ?? options.finalTopK ?? 5);

      // Compatibility layer for frontend legacy payloads and existing search clients
      const baseSearchOptions: {
        bm25TopK: number;
        vectorTopK: number;
        rerankTopN: number;
        finalTopK: number;
        summarize: boolean;
        summaryStyle: "short" | "detailed";
      } = {
        bm25TopK: Number(options.bm25TopK ?? requestedTopK ?? 20),
        vectorTopK: Number(options.vectorTopK ?? requestedTopK ?? 20),
        rerankTopN: Number(options.rerankTopN ?? 10),
        finalTopK: Number(options.finalTopK ?? requestedTopK ?? 5),
        summarize: options.summarize === true,
        summaryStyle: options.summaryStyle === "detailed" ? "detailed" : "short",
      };

      if (requestedSearchType === "keyword" || requestedSearchType === "bm25") {
        const searchService = new SearchService();
        const results = await searchService.bm25Search(query, filters, Math.max(1, Math.min(100, requestedTopK)));
        const normalizedResults = results.map((result, index) => ({
          id: result.resumeId,
          resumeId: result.resumeId,
          candidateId: result.resumeId,
          rank: index + 1,
          name: result.name,
          role: result.role,
          company: result.company,
          score: result.bm25Score ?? 0,
          skills: result.skills ?? [],
          sources: ["bm25"],
        }));

        res.status(200).json({
          query,
          searchType: "keyword",
          topK: normalizedResults.length,
          resultCount: normalizedResults.length,
          duration: Date.now() - startTime,
          results: normalizedResults,
        });
        return;
      }

      if (requestedSearchType === "vector") {
        const searchService = new SearchService();
        const results = await searchService.vectorSearch(query, filters, Math.max(1, Math.min(100, requestedTopK)));
        const normalizedResults = results.map((result, index) => ({
          id: result.resumeId,
          resumeId: result.resumeId,
          candidateId: result.resumeId,
          rank: index + 1,
          name: result.name,
          role: result.role,
          company: result.company,
          score: result.vectorScore ?? 0,
          skills: result.skills ?? [],
          sources: ["vector"],
        }));

        res.status(200).json({
          query,
          searchType: "vector",
          topK: normalizedResults.length,
          resultCount: normalizedResults.length,
          duration: Date.now() - startTime,
          results: normalizedResults,
        });
        return;
      }

      const searchOptions = baseSearchOptions;
      const searchService = new SearchService();
      const result = await searchService.endToEndSearch(query, filters, searchOptions);

      // Check if both BM25 and vector searches failed (Phase 15)
      if (result.warnings.includes("SEARCH_UNAVAILABLE")) {
        // Attach logging info (Phase 16)
        res.locals.componentTimings = {
          embeddingMs: 0,
          bm25Ms: 0,
          vectorMs: 0,
          rerankMs: 0,
          summarizeMs: 0,
          totalMs: Date.now() - startTime,
        };
        res.locals.warnings = result.warnings;
        res.locals.degraded = true;

        res.status(503).json({
          success: false,
          errorCode: "SEARCH_UNAVAILABLE",
          message: "No retrieval strategy is currently available",
          warnings: result.warnings,
        });
        return;
      }

      const duration = Date.now() - startTime;

      // Build response with fallback indicators (Phase 15)
      const response: any = {
        query,
        results: result.results,
        degraded: result.degraded,
        warnings: result.warnings,
        timings: {
          embeddingMs: result.timings.embeddingMs || 0,
          bm25Ms: result.timings.bm25Ms || 0,
          vectorMs: result.timings.vectorMs || 0,
          rerankMs: result.timings.rerankMs || 0,
          summarizeMs: result.timings.summarizeMs || 0,
          totalMs: result.timings.totalMs,
        },
      };

      // Add fallback indicators if present (Phase 15)
      if (result.bm25Fallback) {
        response.bm25Fallback = true;
      }
      if (result.vectorFallback) {
        response.vectorFallback = true;
      }

      // Attach structured logging info to res.locals (Phase 16)
      res.locals.componentTimings = {
        embeddingMs: result.timings.embeddingMs || 0,
        bm25Ms: result.timings.bm25Ms || 0,
        vectorMs: result.timings.vectorMs || 0,
        rerankMs: result.timings.rerankMs || 0,
        summarizeMs: result.timings.summarizeMs || 0,
        totalMs: result.timings.totalMs,
      };
      res.locals.warnings = result.warnings;
      res.locals.degraded = result.degraded;
      res.locals.bm25Fallback = result.bm25Fallback;
      res.locals.vectorFallback = result.vectorFallback;

      res.status(200).json(response);
    } catch (error) {
      console.error("Full search endpoint error:", error);
      res.status(500).json({
        success: false,
        errorCode: "SEARCH_FAILED",
        message: error instanceof Error ? error.message : "Search failed",
      });
    }
  }
}
