/**
 * Phase 14: Candidate Modal
 * Full-screen modal displaying complete candidate profile
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useUIStore } from '@/lib/stores/ui.store';
import { useSearchStore } from '@/lib/stores/search.store';
import { candidateApi } from '@/lib/api/candidate.api';
import { CandidateProfile } from '@/types/candidate.types';
import { ModalHeader } from './ModalHeader';
import { ContactSection } from './ContactSection';
import { SkillsSection } from './SkillsSection';
import { ExperienceSection } from './ExperienceSection';
import { EducationSection } from './EducationSection';
import { ProjectsSection } from './ProjectsSection';
import { CertificationsSection } from './CertificationsSection';
import toast from 'react-hot-toast';

export const CandidateModal: React.FC = () => {
  const { candidateModalOpen, candidateId, closeCandidateModal } = useUIStore();
  const { lastSearchQuery } = useSearchStore();
  const [candidate, setCandidate] = React.useState<CandidateProfile | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (candidateModalOpen && candidateId) {
      fetchCandidate(candidateId);
    }
  }, [candidateModalOpen, candidateId]);

  const fetchCandidate = async (id: string) => {
    setLoading(true);
    try {
      const data = await candidateApi.getCandidateById(id);
      setCandidate(data);
    } catch (error) {
      toast.error('Failed to load candidate profile');
      closeCandidateModal();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    closeCandidateModal();
    setTimeout(() => setCandidate(null), 300); // Clear after animation
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && candidateModalOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [candidateModalOpen]);

  return (
    <AnimatePresence>
      {candidateModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            className="relative w-full max-w-3xl max-h-[90vh] bg-bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-bg-card hover:bg-bg-card/70 border border-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8">
              {loading ? (
                <LoadingSkeleton />
              ) : candidate ? (
                <div className="space-y-8">
                  <ModalHeader candidate={candidate} />
                  <ContactSection candidate={candidate} />
                  <SkillsSection skills={candidate.skills || []} />
                  <ExperienceSection experience={candidate.experience || []} />
                  <EducationSection education={candidate.education || []} />
                  <ProjectsSection projects={candidate.projects || []} />
                  <CertificationsSection certifications={candidate.certifications || []} />
                  <ResumeTextSection text={candidate.rawText} query={lastSearchQuery} />
                </div>
              ) : (
                <div className="text-center py-12 text-text-muted">
                  No candidate data available
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface ResumeTextSectionProps {
  text?: string;
  query: string;
}

const ResumeTextSection: React.FC<ResumeTextSectionProps> = ({ text, query }) => {
  if (!text) return null;

  const terms = query
    .split(/\s+/)
    .map((term) => term.replace(/[^a-zA-Z0-9+#.-]/g, ''))
    .filter((term) => term.length >= 2);
  const pattern = terms.length > 0
    ? new RegExp(`(${terms.sort((a, b) => b.length - a.length).map(escapeRegExp).join('|')})`, 'gi')
    : null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-text-primary">Full CV</h3>
        {terms.length > 0 && (
          <span className="text-xs text-text-muted">Matching search terms highlighted</span>
        )}
      </div>
      <div className="rounded-lg border border-white/10 bg-bg-card p-5">
        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-text-secondary">
          {pattern
            ? text.split(pattern).map((part, index) =>
                index % 2 === 1 ? (
                  <mark key={index} className="rounded bg-yellow-400/30 px-1 text-yellow-100">
                    {part}
                  </mark>
                ) : (
                  <React.Fragment key={index}>{part}</React.Fragment>
                )
              )
            : text}
        </p>
      </div>
    </section>
  );
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-white/5 rounded w-1/3" />
      <div className="h-4 bg-white/5 rounded w-1/2" />
      <div className="space-y-3">
        <div className="h-4 bg-white/5 rounded" />
        <div className="h-4 bg-white/5 rounded w-5/6" />
        <div className="h-4 bg-white/5 rounded w-4/6" />
      </div>
    </div>
  );
};
