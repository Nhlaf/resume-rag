/**
 * Phase 11: Results Limit Selector
 * Dropdown to select top N results (3, 5, 10, 20)
 */

import React from 'react';
import { useSearchStore } from '@/lib/stores/search.store';

const LIMIT_OPTIONS = [3, 5, 10, 20];

export const ResultsLimitSelect: React.FC = () => {
  const { topK, setTopK } = useSearchStore();

  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-widest text-text-muted mb-2 block">
        Results Limit
      </label>
      
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400">Show top</span>
        
        <select
          value={topK}
          onChange={(e) => setTopK(Number(e.target.value))}
          className="
            px-3 py-1.5 bg-white/5 border border-white/10 rounded-md
            text-text-primary font-medium
            hover:bg-white/8 hover:border-white/15
            focus:outline-none focus:ring-2 focus:ring-indigo-500/50
            transition-all cursor-pointer
          "
        >
          {LIMIT_OPTIONS.map((limit) => (
            <option key={limit} value={limit} className="bg-bg-surface">
              {limit}
            </option>
          ))}
        </select>
        
        <span className="text-gray-400">results</span>
      </div>
    </div>
  );
};
