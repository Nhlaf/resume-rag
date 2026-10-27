/**
 * Phase 14: Certifications Section
 * Professional certifications
 */

import React from 'react';
import { Certification } from '@/types/candidate.types';
import { Award, ExternalLink } from 'lucide-react';

interface CertificationsSectionProps {
  certifications: Certification[];
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({ certifications }) => {
  if (!certifications || certifications.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Certifications</h3>
      
      <div className="space-y-3">
        {certifications.map((cert, index) => (
          <div key={index} className="p-4 rounded-lg bg-bg-card border border-white/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                
                <div className="space-y-1">
                  <h4 className="font-semibold text-text-primary">{cert.name}</h4>
                  {cert.issuer && (
                    <p className="text-sm text-text-secondary">{cert.issuer}</p>
                  )}
                  
                  <div className="flex gap-3 text-xs text-text-muted">
                    {cert.date && <span>Issued: {cert.date}</span>}
                    {cert.expiryDate && <span>Expires: {cert.expiryDate}</span>}
                    {cert.credentialId && <span>ID: {cert.credentialId}</span>}
                  </div>
                </div>
              </div>
              
              {cert.url && (
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
