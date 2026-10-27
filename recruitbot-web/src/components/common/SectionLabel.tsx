/**
 * Phase 11: Section Label Component
 * Uppercase label for sidebar sections
 */

import React from 'react';

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ children, className = '' }) => {
  return (
    <h3
      className={`text-xs font-medium uppercase tracking-widest text-text-muted ${className}`}
    >
      {children}
    </h3>
  );
};
