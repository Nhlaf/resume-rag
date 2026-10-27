/**
 * Phase 12: Chat Topbar
 * Shows bot name, mode, and status
 */

import React from 'react';
import { BrandAvatar } from '@/components/common/BrandAvatar';
import { useSearchStore } from '@/lib/stores/search.store';
import { getSearchModeLabel, getSearchModeDescription } from '@/lib/utils/formatters';

export const ChatTopbar: React.FC = () => {
  const { searchMode } = useSearchStore();

  const getModeColorClass = () => {
    switch (searchMode) {
      case 'vector':
        return 'bg-score-vector/20 text-score-vector border-score-vector/30';
      case 'bm25':
        return 'bg-score-bm25/20 text-score-bm25 border-score-bm25/30';
      case 'hybrid':
        return 'bg-score-hybrid/20 text-score-hybrid border-score-hybrid/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] bg-bg-surface">
      {/* Left: Bot Info */}
      <div className="flex items-center gap-3">
        <BrandAvatar showStatus={false} />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-text-primary">RecruitBot</span>
          <span className="text-xs text-text-muted">{getSearchModeDescription(searchMode)}</span>
        </div>
      </div>

      {/* Right: Mode Badge */}
      <div>
        <div
          className={`
            px-3 py-1.5 rounded-full text-xs font-medium border
            ${getModeColorClass()}
          `}
        >
          {getSearchModeLabel(searchMode)}
        </div>
      </div>
    </div>
  );
};
