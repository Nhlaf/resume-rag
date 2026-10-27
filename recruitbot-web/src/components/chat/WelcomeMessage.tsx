/**
 * Phase 12: Welcome Message
 * Initial message shown when chat is empty
 */

import React from 'react';
import { Zap, FileText, GitMerge } from 'lucide-react';

export const WelcomeMessage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="bg-bg-card rounded-lg p-6 border border-white/5">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Welcome to RecruitBot 👋
          </h2>
          <p className="text-sm text-text-muted">
            Search and discover candidates using AI-powered search modes
          </p>
        </div>

        {/* Search Modes Explanation */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-score-vector/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-score-vector" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                Vector Search
              </h3>
              <p className="text-xs text-text-muted">
                Find candidates by meaning and context. Great for discovering similar skills and experience patterns.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-score-bm25/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-score-bm25" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                BM25 Keyword
              </h3>
              <p className="text-xs text-text-muted">
                Match exact keywords and phrases. Perfect when you know the specific terms you're looking for.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-score-hybrid/20 flex items-center justify-center">
              <GitMerge className="w-4 h-4 text-score-hybrid" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                Hybrid
              </h3>
              <p className="text-xs text-text-muted">
                Combines vector and keyword search with adjustable weights for the best of both worlds.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tip */}
        <div className="pt-4 border-t border-white/5">
          <p className="text-xs text-text-muted">
            💡 <span className="font-medium">Tip:</span> Try clicking the suggestion chips below to get started, or type your own query.
          </p>
        </div>
      </div>
    </div>
  );
};
