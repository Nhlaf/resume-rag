/**
 * Phase 10: Search Store
 * Manages search mode, weights, results, and search state
 */

import { create } from 'zustand';
import { SearchMode, SearchResult } from '@/types/search.types';

interface SearchStore {
  // Search parameters
  searchMode: SearchMode;
  bm25Weight: number; // 0-100
  vectorWeight: number; // 0-100
  topK: number;
  
  // Results
  results: SearchResult[];
  isSearching: boolean;
  lastSearchQuery: string;
  lastSearchDuration: number;
  searchDuration: number | null; // Phase 13: Latest search duration
  
  // Error
  error: string | null;
  
  // Actions
  setSearchMode: (mode: SearchMode) => void;
  setWeights: (bm25: number, vector: number) => void;
  setTopK: (k: number) => void;
  setResults: (results: SearchResult[], query: string, duration: number) => void;
  setSearching: (isSearching: boolean) => void;
  setError: (error: string | null) => void;
  setSearchDuration: (duration: number | null) => void; // Phase 13
  clearResults: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  // Initial state
  searchMode: 'vector',
  bm25Weight: 50,
  vectorWeight: 50,
  topK: 5,
  
  results: [],
  isSearching: false,
  lastSearchQuery: '',
  lastSearchDuration: 0,
  searchDuration: null,
  
  error: null,
  
  // Actions
  setSearchMode: (mode) => set({ searchMode: mode }),
  
  setWeights: (bm25, vector) => {
    // Ensure weights are between 0-100
    const clampedBm25 = Math.max(0, Math.min(100, bm25));
    const clampedVector = Math.max(0, Math.min(100, vector));
    
    set({
      bm25Weight: clampedBm25,
      vectorWeight: clampedVector,
    });
  },
  
  setTopK: (k) => set({ topK: Math.max(1, Math.min(20, k)) }),
  
  setResults: (results, query, duration) =>
    set({
      results,
      lastSearchQuery: query,
      lastSearchDuration: duration,
      error: null,
    }),
  
  setSearching: (isSearching) => set({ isSearching }),
  
  setError: (error) => set({ error, isSearching: false }),
  
  setSearchDuration: (duration) => set({ searchDuration: duration }),
  
  clearResults: () =>
    set({
      results: [],
      lastSearchQuery: '',
      lastSearchDuration: 0,
      searchDuration: null,
      error: null,
    }),
}));
