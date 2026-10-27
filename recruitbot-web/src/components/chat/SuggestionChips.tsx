/**
 * Phase 12: Suggestion Chips
 * Pre-canned query buttons for quick searches
 */

import React from 'react';
import { Search } from 'lucide-react';

interface SuggestionChipsProps {
  onSelectSuggestion: (query: string) => void;
}

const SUGGESTIONS = [
  {
    icon: '🔍',
    label: 'Selenium QA 3 yrs',
    query: 'Selenium automation engineer with 3 years experience',
  },
  {
    icon: '🐍',
    label: 'Python ML dev',
    query: 'Python developer with machine learning experience',
  },
  {
    icon: '☁️',
    label: 'Java AWS backend',
    query: 'Java backend developer with AWS cloud experience',
  },
  {
    icon: '⚡',
    label: 'Lead QA Cypress',
    query: 'Lead QA engineer with Cypress and CI/CD experience',
  },
];

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({ onSelectSuggestion }) => {
  return (
    <div className="max-w-2xl mx-auto px-6 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <Search className="w-4 h-4 text-text-muted" />
        <span className="text-sm text-text-muted font-medium">Try searching for:</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelectSuggestion(suggestion.query)}
            className="
              group flex items-center gap-2 px-4 py-2.5 
              bg-white/5 hover:bg-white/10 
              border border-white/10 hover:border-indigo-400/30
              rounded-lg 
              transition-all duration-200
              hover:scale-105
            "
          >
            <span className="text-base">{suggestion.icon}</span>
            <span className="text-sm font-medium text-gray-300 group-hover:text-text-primary">
              {suggestion.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
