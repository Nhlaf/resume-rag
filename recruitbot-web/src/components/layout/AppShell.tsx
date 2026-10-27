/**
 * Phase 10: AppShell Layout
 * Main layout container with sidebar + main content area
 */

import React from 'react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen w-screen overflow-x-hidden overflow-y-auto bg-bg-base">
      {children}
    </div>
  );
};
