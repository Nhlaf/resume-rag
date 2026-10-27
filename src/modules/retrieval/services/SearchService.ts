import { EmbeddingService } from "../../../shared/services/EmbeddingService";
import { ResumeRepository } from "../repositories/ResumeRepository";
import type { SearchCandidate, SearchFilters } from "../types/retrieval.types";

export class SearchService {
  private embeddingService: EmbeddingService;
  private resumeRepository: ResumeRepository;

  constructor() {
    this.embeddingService = new EmbeddingService();
    this.resumeRepository = new ResumeRepository();
  }

  /**
   * Generate embedding for a search query
   */
  async generateQueryEmbedding(query: string): Promise<number[]> {
    return this.embeddingService.generateQueryEmbedding(query);
  }

  /**
   * BM25 lexical search
   */
  async bm25Search(
    query: string,
    filters: SearchFilters,
    topK: number
  ): Promise<SearchCandidate[]> {
    const startTime = Date.now();

    try {
      const results = await this.resumeRepository.searchBM25(
        query,
        topK,
        { minYearsExperience: filters.minYearsExperience }
      );

      console.log(`BM25 search completed in ${Date.now() - startTime}ms, found ${results.length} results`);

      // Map to SearchCandidate format
      return results.map((resume) => {
        const candidate: SearchCandidate = {
          resumeId: typeof resume._id === "string" ? resume._id : resume._id.toString(),
          name: resume.name,
          role: resume.role,
          company: resume.company,
          skills: resume.skills ?? [],
          snippet: resume.rawText?.substring(0, 500) ?? "",
          bm25Score: resume.score,
          sources: ["bm25"],
        };
        return candidate;
      });
    } catch (error) {
      console.error("BM25 search error in SearchService:", error);
      return [];
    }
  }

  /**
   * Vector semantic search
   */
  async vectorSearch(
    query: string,
    filters: SearchFilters,
    topK: number
  ): Promise<SearchCandidate[]> {
    const startTime = Date.now();

    try {
      // Generate query embedding
      const embeddingStartTime = Date.now();
      const queryEmbedding = await this.embeddingService.generateQueryEmbedding(query);
      const embeddingDuration = Date.now() - embeddingStartTime;

      console.log(`Query embedding generated in ${embeddingDuration}ms`);

      // Perform vector search
      const searchStartTime = Date.now();
      const results = await this.resumeRepository.searchVector(
        queryEmbedding,
        topK,
        { minYearsExperience: filters.minYearsExperience }
      );
      const searchDuration = Date.now() - searchStartTime;

      console.log(`Vector search completed in ${searchDuration}ms, found ${results.length} results`);

      // Map to SearchCandidate format
      return results.map((resume) => {
        const candidate: SearchCandidate = {
          resumeId: typeof resume._id === "string" ? resume._id : resume._id.toString(),
          name: resume.name,
          role: resume.role,
          company: resume.company,
          skills: resume.skills ?? [],
          snippet: resume.rawText?.substring(0, 500) ?? "",
          vectorScore: resume.vectorScore,
          sources: ["vector"],
        };
        return candidate;
      });
    } catch (error) {
      console.error("Vector search error in SearchService:", error);
      return [];
    }
  }

  /**
   * Hybrid search combining BM25 and vector
   */
  async hybridSearch(
    query: string,
    filters: SearchFilters,
    bm25TopK: number,
    vectorTopK: number
  ): Promise<{ bm25: SearchCandidate[]; vector: SearchCandidate[]; timings: any }> {
    const startTime = Date.now();
    const timings: any = {};

    try {
      // Run BM25 and Vector searches in parallel
      const [bm25Results, vectorResults] = await Promise.all([
        (async () => {
          const bm25Start = Date.now();
          const results = await this.bm25Search(query, filters, bm25TopK);
          timings.bm25Ms = Date.now() - bm25Start;
          return results;
        })(),
        (async () => {
          const embeddingStart = Date.now();
          const queryEmbedding = await this.embeddingService.generateQueryEmbedding(query);
          timings.embeddingMs = Date.now() - embeddingStart;

          const vectorStart = Date.now();
          const results = await this.vectorSearch(query, filters, vectorTopK);
          timings.vectorMs = Date.now() - vectorStart;
          return results;
        })(),
      ]);

      timings.totalMs = Date.now() - startTime;

      console.log(`Hybrid search completed in ${timings.totalMs}ms (BM25: ${timings.bm25Ms}ms, Embedding: ${timings.embeddingMs}ms, Vector: ${timings.vectorMs}ms)`);

      return {
        bm25: bm25Results,
        vector: vectorResults,
        timings,
      };
    } catch (error) {
      console.error("Hybrid search error in SearchService:", error);
      return {
        bm25: [],
        vector: [],
        timings: { totalMs: Date.now() - startTime },
      };
    }
  }

  /**
   * Full end-to-end search (Phase 13-15)
   * Combines all retrieval components: BM25, Vector, Merge, Dedup, Re-rank, Summarize
   * With comprehensive fallback logic (Phase 15)
   */
  async endToEndSearch(
    query: string,
    filters: SearchFilters,
    options: {
      bm25TopK?: number;
      vectorTopK?: number;
      rerankTopN?: number;
      finalTopK?: number;
      summarize?: boolean;
      summaryStyle?: "short" | "detailed";
    }
  ): Promise<{
    results: any[];
    degraded: boolean;
    warnings: string[];
    timings: any;
    bm25Fallback?: boolean;
    vectorFallback?: boolean;
  }> {
    const startTime = Date.now();
    const timings: any = {};
    const warnings: string[] = [];
    let degraded = false;
    let bm25Fallback = false;
    let vectorFallback = false;

    try {
      // Step 1: Hybrid Search (BM25 + Vector in parallel) with individual fallbacks
      const bm25TopK = options.bm25TopK || 20;
      const vectorTopK = options.vectorTopK || 20;
      
      // Run BM25 and vector searches independently with error isolation
      const [bm25Results, vectorResults] = await Promise.all([
        (async () => {
          try {
            const bm25Start = Date.now();
            const results = await this.bm25Search(query, filters, bm25TopK);
            timings.bm25Ms = Date.now() - bm25Start;
            return results;
          } catch (error) {
            console.error("BM25 search failed, continuing with vector only:", error);
            warnings.push("BM25_SEARCH_FAILED");
            degraded = true;
            bm25Fallback = true;
            timings.bm25Ms = 0;
            return [];
          }
        })(),
        (async () => {
          try {
            const embeddingStart = Date.now();
            await this.embeddingService.generateQueryEmbedding(query);
            timings.embeddingMs = Date.now() - embeddingStart;

            const vectorStart = Date.now();
            const results = await this.vectorSearch(query, filters, vectorTopK);
            timings.vectorMs = Date.now() - vectorStart;
            return results;
          } catch (error) {
            console.error("Vector search failed, continuing with BM25 only:", error);
            warnings.push("VECTOR_SEARCH_FAILED");
            degraded = true;
            vectorFallback = true;
            timings.embeddingMs = 0;
            timings.vectorMs = 0;
            return [];
          }
        })(),
      ]);

      // Step 2: Check if both searches failed
      if (bm25Results.length === 0 && vectorResults.length === 0) {
        console.error("Both BM25 and vector searches failed or returned no results");
        return {
          results: [],
          degraded: true,
          warnings: ["SEARCH_UNAVAILABLE", ...warnings],
          timings: { 
            bm25Ms: timings.bm25Ms || 0,
            embeddingMs: timings.embeddingMs || 0,
            vectorMs: timings.vectorMs || 0,
            totalMs: Date.now() - startTime 
          },
          bm25Fallback,
          vectorFallback,
        };
      }

      // Step 3: Merge and Deduplicate
      const { mergeCandidates, sortCandidatesByScore } = require("../utils/deduplicate");
      const mergedCandidates = mergeCandidates(bm25Results, vectorResults);
      
      if (mergedCandidates.length === 0) {
        // No results from either search
        return {
          results: [],
          degraded: true,
          warnings: ["NO_RESULTS_FOUND", ...warnings],
          timings: { 
            bm25Ms: timings.bm25Ms || 0,
            embeddingMs: timings.embeddingMs || 0,
            vectorMs: timings.vectorMs || 0,
            totalMs: Date.now() - startTime 
          },
          bm25Fallback,
          vectorFallback,
        };
      }

      // Step 4: LLM Re-ranking with fallback
      const rerankTopN = Math.min(options.rerankTopN || 10, mergedCandidates.length);
      const candidatesForRerank = mergedCandidates.slice(0, rerankTopN);
      
      const { LLMService } = require("./LLMService");
      const llmService = new LLMService();
      
      let finalCandidates: any[];
      
      try {
        const rerankStart = Date.now();
        const rerankedResults = await llmService.rerankCandidates(query, candidatesForRerank, rerankTopN);
        timings.rerankMs = Date.now() - rerankStart;

        if (rerankedResults.length === 0) {
          throw new Error("LLM re-ranking returned empty results");
        }

        // Use LLM rankings
        finalCandidates = rerankedResults.map((r: any) => {
          const candidate = candidatesForRerank.find((c: any) => c.resumeId === r.resumeId);
          return {
            rank: r.rank,
            resumeId: r.resumeId,
            name: candidate?.name,
            role: candidate?.role,
            company: candidate?.company,
            skills: candidate?.skills,
            sources: candidate?.sources || [],
            bm25Score: candidate?.bm25Score,
            vectorScore: candidate?.vectorScore,
            relevanceScore: r.relevanceScore,
            reason: r.reason,
          };
        });
      } catch (error) {
        // LLM re-ranking failed, use fallback ordering
        console.warn("LLM re-ranking failed, using fallback ordering:", error);
        warnings.push("LLM_RERANK_FAILED");
        degraded = true;
        timings.rerankMs = 0;
        
        // Fallback: BM25 priority, then vector score
        const sorted = sortCandidatesByScore(candidatesForRerank);
        finalCandidates = sorted.map((c: any, idx: number) => ({
          rank: idx + 1,
          resumeId: c.resumeId,
          name: c.name,
          role: c.role,
          company: c.company,
          skills: c.skills,
          sources: c.sources,
          bm25Score: c.bm25Score,
          vectorScore: c.vectorScore,
          relevanceScore: undefined,
          reason: "Fallback ranking used due to LLM re-ranking failure",
        }));
      }

      // Step 5: Apply final top-k limit
      const finalTopK = options.finalTopK || 5;
      finalCandidates = finalCandidates.slice(0, finalTopK);

      // Step 6: Optional Summarization with graceful degradation
      if (options.summarize) {
        const summarizeStart = Date.now();
        const summaryStyle = options.summaryStyle || "short";
        
        try {
          const summariesPromises = finalCandidates.map(async (candidate: any) => {
            const originalCandidate = candidatesForRerank.find((c: any) => c.resumeId === candidate.resumeId);
            if (!originalCandidate) return null;

            try {
              const summary = await llmService.summarizeCandidateFit(
                query,
                originalCandidate,
                { style: summaryStyle }
              );
              return { resumeId: candidate.resumeId, summary };
            } catch (error) {
              console.error(`Summarization failed for ${candidate.resumeId}:`, error);
              return { resumeId: candidate.resumeId, summary: "" };
            }
          });

          const summaries = await Promise.all(summariesPromises);
          timings.summarizeMs = Date.now() - summarizeStart;

          // Attach summaries to candidates
          let summarizationFailedCount = 0;
          finalCandidates.forEach(candidate => {
            const summaryObj = summaries.find(s => s?.resumeId === candidate.resumeId);
            candidate.summary = summaryObj?.summary || undefined;
            if (!candidate.summary || candidate.summary.length === 0) {
              summarizationFailedCount++;
            }
          });

          // Only add warning if ALL summarizations failed
          if (summarizationFailedCount === finalCandidates.length && finalCandidates.length > 0) {
            warnings.push("SUMMARIZATION_FAILED");
            degraded = true;
          }
        } catch (error) {
          console.error("Summarization process failed:", error);
          warnings.push("SUMMARIZATION_FAILED");
          degraded = true;
          timings.summarizeMs = Date.now() - summarizeStart;
          // Continue without summaries - results are still valid
        }
      } else {
        timings.summarizeMs = 0;
      }

      timings.totalMs = Date.now() - startTime;

      return {
        results: finalCandidates,
        degraded,
        warnings,
        timings,
        bm25Fallback,
        vectorFallback,
      };
    } catch (error) {
      console.error("End-to-end search error:", error);
      return {
        results: [],
        degraded: true,
        warnings: ["SEARCH_FAILED"],
        timings: { totalMs: Date.now() - startTime },
      };
    }
  }
}
