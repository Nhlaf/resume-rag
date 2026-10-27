/**
 * Phase 14: Contact Section
 * Email, phone, and social links
 */

import React from 'react';
import { CandidateProfile } from '@/types/candidate.types';
import { Mail, Phone, Linkedin, Github, Globe } from 'lucide-react';

interface ContactSectionProps {
  candidate: CandidateProfile;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ candidate }) => {
  const email = candidate.email;
  const phone = candidate.phoneNumber || candidate.phone;
  const { linkedIn, github, portfolio } = candidate;

  const hasContact = email || phone || linkedIn || github || portfolio;

  if (!hasContact) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-text-primary">Contact</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {email && (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-3 p-3 rounded-lg bg-bg-card hover:bg-bg-card/70 border border-white/10 transition-colors"
          >
            <Mail className="w-4 h-4 text-primary" />
            <span className="text-sm text-text-secondary">{email}</span>
          </a>
        )}

        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-3 p-3 rounded-lg bg-bg-card hover:bg-bg-card/70 border border-white/10 transition-colors"
          >
            <Phone className="w-4 h-4 text-primary" />
            <span className="text-sm text-text-secondary">{phone}</span>
          </a>
        )}

        {linkedIn && (
          <a
            href={linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg bg-bg-card hover:bg-bg-card/70 border border-white/10 transition-colors"
          >
            <Linkedin className="w-4 h-4 text-primary" />
            <span className="text-sm text-text-secondary">LinkedIn</span>
          </a>
        )}

        {github && (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg bg-bg-card hover:bg-bg-card/70 border border-white/10 transition-colors"
          >
            <Github className="w-4 h-4 text-primary" />
            <span className="text-sm text-text-secondary">GitHub</span>
          </a>
        )}

        {portfolio && (
          <a
            href={portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg bg-bg-card hover:bg-bg-card/70 border border-white/10 transition-colors"
          >
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm text-text-secondary">Portfolio</span>
          </a>
        )}
      </div>
    </div>
  );
};
