/**
 * Phase 14: Projects Section
 * Project showcase
 */

import React from 'react';
import { Project } from '@/types/candidate.types';
import { Folder, ExternalLink } from 'lucide-react';

interface ProjectsSectionProps {
  projects: Project[];
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Projects</h3>
      
      <div className="space-y-4">
        {projects.map((project, index) => (
          <div key={index} className="p-4 rounded-lg bg-bg-card border border-white/10">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-text-primary">{project.name}</h4>
                </div>
                
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              
              <p className="text-sm text-text-secondary leading-relaxed">
                {project.description}
              </p>
              
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-2 py-1 text-xs bg-white/5 text-text-muted rounded border border-white/10"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              
              {project.duration && (
                <p className="text-xs text-text-muted mt-2">{project.duration}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
