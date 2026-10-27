/**
 * Phase 13: Results List
 * Displays search results with loading/empty states
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchStore } from '@/lib/stores/search.store';
import { useChatStore } from '@/lib/stores/chat.store';
import { ResultCard } from './ResultCard';
import { ResultSummary } from './ResultSummary';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingDots } from '@/components/common/LoadingDots';

export const ResultsList: React.FC = () => {
  const { results, isSearching, searchDuration } = useSearchStore();
  const { messages } = useChatStore();

  // Only show results after at least one search has been performed
  const hasSearched = messages.some(m => m.type === 'user');

  if (isSearching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingDots />
          <p className="mt-4 text-sm text-text-muted">Searching resumes...</p>
        </div>
      </div>
    );
  }

  if (!hasSearched) {
    return null; // Show welcome message instead
  }

  if (results.length === 0) {
    return (
      <EmptyState
        title="No Results Found"
        description="Try adjusting your search query or switching search modes"
      />
    );
  }

  return (
    <div className="space-y-4 h-full overflow-y-auto px-1">
      <ResultSummary
        count={results.length}
        duration={searchDuration}
      />

      <motion.div
        className="space-y-3 pb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="popLayout">
          {results.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05, // Stagger animation
              }}
              layout
            >
              <ResultCard result={result} rank={index + 1} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
