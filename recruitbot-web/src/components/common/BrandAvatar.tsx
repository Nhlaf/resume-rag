/**
 * Phase 10: Brand Avatar Component
 * RecruitBot logo with status indicator
 */

import React from 'react';

interface BrandAvatarProps {
  showStatus?: boolean;
}

export const BrandAvatar: React.FC<BrandAvatarProps> = ({ showStatus = true }) => {
  return (
    <div className="flex items-center gap-3">
      {/* Logo */}
      <div className="relative flex-shrink-0">
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="rounded-full"
        >
          <defs>
            <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="20" fill="url(#brand-gradient)" />
          <text
            x="20"
            y="26"
            fontFamily="Inter, sans-serif"
            fontSize="18"
            fontWeight="700"
            fill="white"
            textAnchor="middle"
          >
            R
          </text>
        </svg>
        
        {/* Status dot */}
        {showStatus && (
          <div className="absolute bottom-0 right-0 flex items-center justify-center w-3 h-3 bg-bg-surface rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-status-pulse" />
          </div>
        )}
      </div>

      {/* Brand name */}
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-text-primary">RecruitBot</span>
        {showStatus && (
          <span className="text-xs text-text-muted">Online</span>
        )}
      </div>
    </div>
  );
};
