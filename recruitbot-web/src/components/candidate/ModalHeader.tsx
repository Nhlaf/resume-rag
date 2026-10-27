/**
 * Phase 14: Modal Header
 * Candidate name, title, and company
 */

import React from 'react';
import { CandidateProfile } from '@/types/candidate.types';
import { Briefcase, MapPin } from 'lucide-react';

interface ModalHeaderProps {
  candidate: CandidateProfile;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ candidate }) => {
  return (
    <div className="space-y-3">
      <h2 className="text-3xl font-bold text-text-primary">{candidate.name}</h2>
      
      {candidate.title && (
        <div className="flex items-center gap-2 text-text-secondary">
          <Briefcase className="w-4 h-4" />
          <span>{candidate.title}</span>
        </div>
      )}

      {candidate.location && (
        <div className="flex items-center gap-2 text-text-muted">
          <MapPin className="w-4 h-4" />
          <span>{candidate.location}</span>
        </div>
      )}

      {candidate.summary && (
        <p className="text-text-secondary leading-relaxed mt-4">
          {candidate.summary}
        </p>
      )}
    </div>
  );
};
