/**
 * Phase 10: Loading Dots Component
 * Three-dot typing indicator animation
 */

import React from 'react';

export const LoadingDots: React.FC = () => {
  return (
    <div className="flex items-center gap-1">
      <span
        className="w-2 h-2 bg-gray-400 rounded-full animate-dot-bounce"
        style={{ animationDelay: '0ms' }}
      />
      <span
        className="w-2 h-2 bg-gray-400 rounded-full animate-dot-bounce"
        style={{ animationDelay: '150ms' }}
      />
      <span
        className="w-2 h-2 bg-gray-400 rounded-full animate-dot-bounce"
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );
};
