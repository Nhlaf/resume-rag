/**
 * Phase 11: Sidebar Component
 * Complete sidebar with brand, search mode, weights, and controls
 */

import React from 'react';
import { BrandAvatar } from '@/components/common/BrandAvatar';
import { SectionLabel } from '@/components/common/SectionLabel';
import { SearchModeNav } from '@/components/sidebar/SearchModeNav';
import { HybridWeightPanel } from '@/components/sidebar/HybridWeightPanel';
import { ResultsLimitSelect } from '@/components/sidebar/ResultsLimitSelect';
import { ClearChatButton } from '@/components/sidebar/ClearChatButton';
import { useSearchStore } from '@/lib/stores/search.store';
import { useUIStore } from '@/lib/stores/ui.store';
import { Upload } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { searchMode, setSearchMode } = useSearchStore();
  const { openUploadModal } = useUIStore();

  return (
    <aside className="w-[260px] shrink-0 bg-bg-surface border-r border-white/[0.07] flex flex-col overflow-y-auto">
      <div className="p-5 flex flex-col gap-4 h-full">
        {/* Brand */}
        <BrandAvatar />

        {/* Search Mode Section */}
        <div>
          <SectionLabel className="mb-3">Search Mode</SectionLabel>
          <SearchModeNav activeMode={searchMode} onChange={setSearchMode} />
        </div>

        {/* Hybrid Weight Panel (only visible when hybrid is selected) */}
        <HybridWeightPanel visible={searchMode === 'hybrid'} />

        {/* Spacer to push bottom controls down */}
        <div className="flex-1" />

        {/* Results Limit */}
        <div>
          <ResultsLimitSelect />
        </div>

        {/* Clear Chat */}
        <ClearChatButton />

        {/* Upload Button */}
        <button
          onClick={openUploadModal}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-primary hover:bg-accent-primary/90 text-white font-medium rounded-md transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Resume
        </button>

        {/* Footer */}
        <footer className="pt-2 border-t border-white/5">
          <p className="text-xs text-text-muted text-center">RecruitBot v2.0</p>
        </footer>
      </div>
    </aside>
  );
};
