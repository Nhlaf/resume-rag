/**
 * Phase 14: Skills Section
 * Skill chips display
 */

import React from 'react';

interface SkillsSectionProps {
  skills: string[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-text-primary">Skills</h3>
      
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary rounded-lg border border-primary/20"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};
