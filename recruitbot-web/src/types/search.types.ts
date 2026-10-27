/**
 * Phase 10: Search & Retrieval Type Definitions
 */

export type SearchMode = 'vector' | 'bm25' | 'hybrid';

export interface SearchRequest {
  query: string;
  searchType: 'vector' | 'keyword' | 'hybrid'; // Backend expects 'keyword' not 'bm25'
  topK: number;
  bm25Weight?: number;
  vectorWeight?: number;
  filters?: SearchFilters;
}

export interface SearchFilters {
  experienceYears?: {
    min?: number;
    max?: number;
  };
  skills?: string[];
  location?: string;
}

export interface SearchResult {
  id: string; // Unique identifier (use candidateId or _id)
  candidateId: string;
  resumeId?: string; // Backend may return this
  _id?: string; // MongoDB ID
  name: string;
  email?: string;
  phoneNumber?: string;
  phone?: string; // Backend variation
  role?: string; // Job role/title
  title?: string;
  company?: string;
  score: number;
  experienceYears?: number;
  experience?: string; // Backend may return string
  skills?: string[];
  summary?: string; // AI-generated summary
  content?: string; // Resume text snippet
  location?: string;
  sources?: string[]; // hybrid: ['bm25', 'vector']
  bm25Score?: number;
  vectorScore?: number;
  rank?: number;
}

export interface SearchResponse {
  query: string;
  searchType: string;
  topK: number;
  resultCount: number;
  duration: number; // milliseconds
  results: SearchResult[];
  metadata?: {
    bm25Weight?: number;
    vectorWeight?: number;
    fallbackUsed?: boolean;
    rerankingApplied?: boolean;
  };
}

export interface SearchState {
  // Search parameters
  query: string;
  searchMode: SearchMode;
  bm25Weight: number; // 0-100
  vectorWeight: number; // 0-100
  topK: number;
  
  // Results
  results: SearchResult[];
  isSearching: boolean;
  lastSearchQuery: string;
  lastSearchDuration: number;
  
  // Error
  error: string | null;
}
