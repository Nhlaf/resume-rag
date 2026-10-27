/**
 * Phase 13: Search Page
 * Main search/chat interface with sidebar, chat, and results display
 */

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { ChatMain } from '@/components/chat/ChatMain';
import { ResultsList } from '@/components/results/ResultsList';
import { MenuButton } from '@/components/common/MenuButton';
import { useSearch } from '@/hooks/useSearch';
import { UploadModal } from '@/components/upload/UploadModal';

import { CandidateModal } from '@/components/candidate/CandidateModal';

export const SearchPage: React.FC = () => {
  const { performSearch } = useSearch();

  const handleSubmitQuery = async (query: string) => {
    try {
      await performSearch(query);
    } catch (error) {
      // Error already handled in useSearch hook
      console.error('Search failed:', error);
    }
  };

  return (
    <>
      <AppShell>
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0 gap-4 overflow-y-auto p-4">
          {/* Chat Area (Left) */}
          <div className="flex-1 flex min-h-0 min-w-0 flex-col">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-bg-surface mb-4">
              <MenuButton />
              <span className="text-sm font-semibold text-text-primary">RecruitBot</span>
              <div className="w-10" /> {/* Spacer for alignment */}
            </div>

            {/* Chat Interface */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <ChatMain onSubmitQuery={handleSubmitQuery} />
            </div>
          </div>

          {/* Results Area (Right - Desktop only ≥1024px) */}
          <div className="hidden lg:block w-96 flex-shrink-0">
            <ResultsList />
          </div>
        </div>
      </AppShell>

      {/* Mobile Drawer */}
      <MobileDrawer />
      
      {/* Candidate Modal */}
      <CandidateModal />
      
      {/* Upload Modal */}
      <UploadModal />
    </>
  );
};
