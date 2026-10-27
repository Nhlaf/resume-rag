/**
 * Phase 14: Experience Section
 * Work experience timeline
 */

import React from 'react';
import { Experience } from '@/types/candidate.types';

interface ExperienceSectionProps {
  experience: Experience[];
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experience }) => {
  if (!experience || experience.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Experience</h3>
      
      <div className="space-y-6">
        {experience.map((exp, index) => (
          <div key={index} className="relative pl-8 border-l-2 border-primary/20">
            {/* Timeline dot */}
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-bg-surface" />
            
            <div className="space-y-2">
              <div>
                <h4 className="font-semibold text-text-primary">{exp.title}</h4>
                <p className="text-sm text-text-secondary">{exp.company}</p>
                {exp.duration && (
                  <p className="text-xs text-text-muted mt-1">{exp.duration}</p>
                )}
                {exp.location && (
                  <p className="text-xs text-text-muted">{exp.location}</p>
                )}
              </div>
              
              {exp.description && (
                <p className="text-sm text-text-secondary leading-relaxed">
                  {exp.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
