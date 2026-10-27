/**
 * Phase 14: UI Store
 * Manages modal and drawer state
 */

import { create } from 'zustand';

interface UIStore {
  // Modal state
  candidateModalOpen: boolean;
  candidateId: string | null;
  uploadModalOpen: boolean;
  
  // Mobile drawer state
  mobileDrawerOpen: boolean;
  
  // Actions
  openCandidateModal: (id: string) => void;
  closeCandidateModal: () => void;
  openUploadModal: () => void;
  closeUploadModal: () => void;
  toggleMobileDrawer: () => void;
  closeMobileDrawer: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  candidateModalOpen: false,
  candidateId: null,
  uploadModalOpen: false,
  mobileDrawerOpen: false,
  
  openCandidateModal: (id) => set({ candidateModalOpen: true, candidateId: id }),
  closeCandidateModal: () => set({ candidateModalOpen: false, candidateId: null }),
  openUploadModal: () => set({ uploadModalOpen: true }),
  closeUploadModal: () => set({ uploadModalOpen: false }),
  toggleMobileDrawer: () => set((state) => ({ mobileDrawerOpen: !state.mobileDrawerOpen })),
  closeMobileDrawer: () => set({ mobileDrawerOpen: false }),
}));
