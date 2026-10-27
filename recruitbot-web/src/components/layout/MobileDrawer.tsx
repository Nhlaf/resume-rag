/**
 * Phase 11: Mobile Drawer
 * Slide-out sidebar for mobile/tablet devices
 */

import React, { useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/stores/ui.store';
import { BrandAvatar } from '@/components/common/BrandAvatar';
import { SectionLabel } from '@/components/common/SectionLabel';
import { SearchModeNav } from '@/components/sidebar/SearchModeNav';
import { HybridWeightPanel } from '@/components/sidebar/HybridWeightPanel';
import { ResultsLimitSelect } from '@/components/sidebar/ResultsLimitSelect';
import { ClearChatButton } from '@/components/sidebar/ClearChatButton';
import { useSearchStore } from '@/lib/stores/search.store';

export const MobileDrawer: React.FC = () => {
  const { mobileDrawerOpen, closeMobileDrawer, openUploadModal } = useUIStore();
  const { searchMode, setSearchMode } = useSearchStore();

  const handleUploadClick = () => {
    closeMobileDrawer();
    openUploadModal();
  };

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileDrawerOpen) {
        closeMobileDrawer();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileDrawerOpen, closeMobileDrawer]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileDrawerOpen]);

  return (
    <AnimatePresence>
      {mobileDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMobileDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-bg-surface border-r border-white/[0.07] z-50 md:hidden flex flex-col overflow-y-auto"
          >
            <div className="p-5 flex flex-col gap-4 h-full">
              {/* Header with close button */}
              <div className="flex items-center justify-between">
                <BrandAvatar />
                <button
                  onClick={closeMobileDrawer}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Search Mode Section */}
              <div>
                <SectionLabel className="mb-3">Search Mode</SectionLabel>
                <SearchModeNav activeMode={searchMode} onChange={setSearchMode} />
              </div>

              {/* Hybrid Weight Panel */}
              <HybridWeightPanel visible={searchMode === 'hybrid'} />

              {/* Spacer */}
              <div className="flex-1" />

              {/* Results Limit */}
              <div>
                <ResultsLimitSelect />
              </div>

              {/* Clear Chat */}
              <ClearChatButton />

              {/* Upload Button */}
              <button
                onClick={handleUploadClick}
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
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
