export interface SearchCandidate {
  resumeId: string;
  name?: string;
  role?: string;
  company?: string;
  skills?: string[];
  snippet?: string;
  bm25Score?: number;
  vectorScore?: number;
  sources: ("bm25" | "vector")[];
}

export interface SearchFilters {
  minYearsExperience?: number;
  skills?: string[];
  location?: string;
  company?: string;
}

export interface SearchOptions {
  bm25TopK?: number;
  vectorTopK?: number;
  rerankTopN?: number;
  finalTopK?: number;
  summarize?: boolean;
  summaryStyle?: "short" | "detailed";
}

export interface ReadinessResponse {
  ready: boolean;
  collection?: string;
  resumeCount?: number;
  resumesWithEmbedding?: number;
  embeddingModel?: string;
  embeddingDimension?: number;
  reason?: string;
}

export interface SearchResult {
  rank: number;
  resumeId: string;
  name?: string;
  role?: string;
  company?: string;
  totalExperience?: number;
  skills?: string[];
  sources: ("bm25" | "vector")[];
  summary?: string;
  relevanceScore?: number;
  reason?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  degraded: boolean;
  warnings: string[];
  timings: {
    embeddingMs?: number;
    bm25Ms?: number;
    vectorMs?: number;
    rerankMs?: number;
    summarizeMs?: number;
    totalMs: number;
  };
}

export interface ComponentTimings {
  embeddingMs?: number;
  bm25Ms?: number;
  vectorMs?: number;
  rerankMs?: number;
  summarizeMs?: number;
  totalMs: number;
}
