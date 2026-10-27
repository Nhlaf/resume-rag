/**
 * Phase 13: Result Card
 * Individual resume result card with rank, score, and skills
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { SearchResult } from '@/types/search.types';
import { useUIStore } from '@/lib/stores/ui.store';

interface ResultCardProps {
  result: SearchResult;
  rank: number;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, rank }) => {
  const { openCandidateModal } = useUIStore();

  const handleClick = () => {
    openCandidateModal(result.id);
  };

  // Determine score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (score >= 0.6) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    if (score >= 0.4) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-text-muted bg-white/5 border-white/10';
  };

  // Rank badge color (top 3 get special colors)
  const getRankColor = () => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900';
    if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-700 text-white';
    return 'bg-white/10 text-text-muted';
  };

  // Format score
  const formatScore = (score: number) => {
    return (score * 100).toFixed(0) + '%';
  };

  return (
    <motion.div
      className="relative bg-bg-card border border-white/10 rounded-lg p-4 hover:bg-bg-card/70 hover:border-white/20 transition-all cursor-pointer group"
      onClick={handleClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Rank Badge */}
      <div
        className={`absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${getRankColor()}`}
      >
        {rank}
      </div>

      {/* Score Badge */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
            {result.name}
          </h3>
          {result.email && (
            <p className="text-sm text-text-muted truncate">{result.email}</p>
          )}
        </div>

        <div
          className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border ${getScoreColor(
            result.score
          )}`}
        >
          {formatScore(result.score)}
        </div>
      </div>

      {/* Summary */}
      {result.summary && (
        <p className="text-sm text-text-secondary line-clamp-2 mb-3">
          {result.summary}
        </p>
      )}

      {/* Skills Tags */}
      {result.skills && result.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {result.skills.slice(0, 6).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded border border-primary/20"
            >
              {skill}
            </span>
          ))}
          {result.skills.length > 6 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-white/5 text-text-muted rounded">
              +{result.skills.length - 6} more
            </span>
          )}
        </div>
      )}

      {/* View Details Hint */}
      <div className="absolute bottom-2 right-3 text-xs text-text-muted group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
        Click to view full profile →
      </div>
    </motion.div>
  );
};
