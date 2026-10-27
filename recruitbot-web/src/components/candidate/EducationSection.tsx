/**
 * Phase 14: Education Section
 * Education history
 */

import React from 'react';
import { Education } from '@/types/candidate.types';
import { GraduationCap } from 'lucide-react';

interface EducationSectionProps {
  education: Education[];
}

export const EducationSection: React.FC<EducationSectionProps> = ({ education }) => {
  if (!education || education.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Education</h3>
      
      <div className="space-y-4">
        {education.map((edu, index) => (
          <div key={index} className="p-4 rounded-lg bg-bg-card border border-white/10">
            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              
              <div className="space-y-1">
                <h4 className="font-semibold text-text-primary">{edu.degree}</h4>
                <p className="text-sm text-text-secondary">{edu.institution}</p>
                
                <div className="flex gap-3 text-xs text-text-muted">
                  {edu.year && <span>{edu.year}</span>}
                  {edu.gpa && <span>GPA: {edu.gpa}</span>}
                  {edu.location && <span>{edu.location}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
