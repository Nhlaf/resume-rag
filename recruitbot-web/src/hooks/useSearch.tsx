/**
 * Phase 13: Search Hook
 * Handles search API integration with chat and store updates
 */

import { useState } from 'react';
import { useSearchStore } from '@/lib/stores/search.store';
import { useChatStore } from '@/lib/stores/chat.store';
import { searchApi } from '@/lib/api/search.api';
import type { SearchResult } from '@/types/search.types';
import toast from 'react-hot-toast';

export const useSearch = () => {
  const {
    searchMode,
    vectorWeight,
    bm25Weight,
    topK,
    setResults,
    setSearching,
    setSearchDuration,
    setError,
  } = useSearchStore();

  const { addUserMessage, addBotMessage, setProcessing } = useChatStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const performSearch = async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) {
      toast.error('Search query cannot be empty');
      return [];
    }

    // Add user message
    addUserMessage(query);

    setSearching(true);
    setProcessing(true);
    setError(null);
    setLocalError(null);

    const startTime = performance.now();

    try {
      // Map frontend searchMode to backend searchType
      const searchType = searchMode === 'bm25' ? 'keyword' : searchMode;
      
      // Perform search
      const response = await searchApi.searchResumes({
        query: query.trim(),
        searchType,
        vectorWeight: searchMode === 'hybrid' ? vectorWeight : undefined,
        bm25Weight: searchMode === 'hybrid' ? bm25Weight : undefined,
        topK,
      });

      const duration = Math.round(performance.now() - startTime);
      
      // Normalize results: ensure each has an 'id' field
      const results = response.results.map((result, index) => ({
        ...result,
        id: result.resumeId || result.candidateId || result._id || `result-${index}`,
      }));

      // Update store with results
      setResults(results, query, duration);
      setSearchDuration(duration);

      // Add bot response to chat
      const responseMessage =
        results.length > 0
          ? `Found ${results.length} ${results.length === 1 ? 'candidate' : 'candidates'} matching your query in ${duration}ms`
          : 'No candidates found matching your query. Try adjusting your search or switching modes.';

      // Create bot message component
      const BotMessage = () => (
        <div className="px-4 py-3 bg-bg-card rounded-2xl rounded-tl-md border border-white/5">
          <p className="text-sm text-gray-300">{responseMessage}</p>
        </div>
      );

      addBotMessage(<BotMessage />);

      if (results.length > 0) {
        toast.success(`Found ${results.length} candidates`);
      }

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';

      setError(errorMessage);
      setLocalError(errorMessage);

      // Add error message to chat
      const ErrorMessage = () => (
        <div className="px-4 py-3 bg-red-500/10 rounded-2xl rounded-tl-md border border-red-500/30">
          <p className="text-sm text-red-300">❌ {errorMessage}</p>
          <p className="text-xs text-red-400/70 mt-1">
            Please try again or adjust your query.
          </p>
        </div>
      );

      addBotMessage(<ErrorMessage />, true);

      toast.error(errorMessage);

      throw err;
    } finally {
      setSearching(false);
      setProcessing(false);
    }
  };

  return {
    performSearch,
    error: localError,
  };
};
