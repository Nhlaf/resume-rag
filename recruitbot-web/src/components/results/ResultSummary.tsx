/**
 * Phase 13: Result Summary
 * Displays count and search duration
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface ResultSummaryProps {
  count: number;
  duration: number | null;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({ count, duration }) => {
  return (
    <motion.div
      className="flex items-center justify-between px-4 py-3 bg-bg-card/50 border border-white/10 rounded-lg"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-text-secondary">
          Found <span className="text-text-primary font-semibold">{count}</span>{' '}
          {count === 1 ? 'candidate' : 'candidates'}
        </span>
      </div>

      {duration !== null && (
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Clock className="w-3.5 h-3.5" />
          <span>{duration}ms</span>
        </div>
      )}
    </motion.div>
  );
};
