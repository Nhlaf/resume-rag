/**
 * Phase 11: Search Mode Navigation
 * Three buttons for Vector, BM25, and Hybrid search modes
 */

import React from 'react';
import { Zap, FileText, GitMerge, Check } from 'lucide-react';
import { SearchMode } from '@/types/search.types';

interface SearchModeNavProps {
  activeMode: SearchMode;
  onChange: (mode: SearchMode) => void;
}

const SEARCH_MODES = [
  {
    mode: 'vector' as SearchMode,
    icon: Zap,
    label: 'Vector Search',
    description: 'Semantic similarity',
    color: 'text-score-vector',
  },
  {
    mode: 'bm25' as SearchMode,
    icon: FileText,
    label: 'BM25 Keyword',
    description: 'Lexical matching',
    color: 'text-score-bm25',
  },
  {
    mode: 'hybrid' as SearchMode,
    icon: GitMerge,
    label: 'Hybrid',
    description: 'Combined ranking',
    color: 'text-score-hybrid',
  },
];

export const SearchModeNav: React.FC<SearchModeNavProps> = ({ activeMode, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      {SEARCH_MODES.map(({ mode, icon: Icon, label, description, color }) => {
        const isActive = activeMode === mode;
        
        return (
          <button
            key={mode}
            onClick={() => onChange(mode)}
            className={`
              group relative flex items-start gap-3 p-3 rounded-lg
              border transition-all duration-200
              ${
                isActive
                  ? 'bg-indigo-500/12 border-indigo-400/30 shadow-sm'
                  : 'bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10'
              }
            `}
          >
            {/* Icon */}
            <div className={`flex-shrink-0 ${isActive ? color : 'text-gray-400'}`}>
              <Icon className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span
                  className={`text-sm font-medium ${
                    isActive ? 'text-text-primary' : 'text-gray-300'
                  }`}
                >
                  {label}
                </span>
                
                {/* Active checkmark */}
                {isActive && (
                  <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                )}
              </div>
              
              <p className="text-xs text-text-muted">{description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
