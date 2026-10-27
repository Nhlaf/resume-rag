/**
 * Phase 10: Empty State Component
 * Displays when no results are found
 */

import React from 'react';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No results found',
  description = 'Try adjusting your search query or filters',
  icon: Icon = Search,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
        <Icon className="w-8 h-8 text-gray-500" />
      </div>
      
      <h3 className="text-base font-semibold text-gray-300 mb-2">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm">{description}</p>
    </div>
  );
};
