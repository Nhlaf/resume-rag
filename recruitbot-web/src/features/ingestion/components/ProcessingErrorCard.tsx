/**
 * Phase 8: Processing Error Card
 * Shows which pipeline stage failed with detailed error info
 */

import React from 'react';
import { FileX, FileSearch, Zap, Database, AlertCircle } from 'lucide-react';
import { ProcessingError } from '../types/errors.types';

interface ProcessingErrorCardProps {
  error: ProcessingError;
  onRetry?: () => void;
}

const STAGE_INFO = {
  extraction: {
    icon: FileSearch,
    label: 'PDF Extraction',
    description: 'Failed to extract text from PDF',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  parsing: {
    icon: FileX,
    label: 'Resume Parsing',
    description: 'Failed to parse resume structure',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  embedding: {
    icon: Zap,
    label: 'Embedding Generation',
    description: 'Failed to generate embeddings',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  storage: {
    icon: Database,
    label: 'Database Storage',
    description: 'Failed to save to database',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
};

export const ProcessingErrorCard: React.FC<ProcessingErrorCardProps> = ({ error, onRetry }) => {
  const stageInfo = STAGE_INFO[error.stage];
  const Icon = stageInfo.icon;

  return (
    <div
      className={`rounded-lg border ${stageInfo.bgColor} ${stageInfo.borderColor} p-4 animate-in fade-in slide-in-from-bottom-3 duration-300`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`${stageInfo.color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className={`text-sm font-semibold ${stageInfo.color}`}>{stageInfo.label} Failed</h4>
          <p className="text-xs text-gray-400">{stageInfo.description}</p>
        </div>
      </div>

      {/* Error message */}
      <div className="bg-black/20 rounded p-3 mb-3">
        <p className="text-sm text-gray-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
          <span>{error.message}</span>
        </p>
        {error.details && (
          <p className="text-xs text-gray-500 mt-2 pl-6">{error.details}</p>
        )}
      </div>

      {/* Retry button */}
      {error.retryable && onRetry && (
        <button
          onClick={onRetry}
          className={`w-full text-sm font-medium ${stageInfo.color} hover:opacity-80 transition-opacity px-4 py-2 rounded border ${stageInfo.borderColor} hover:bg-white/5`}
        >
          Retry Upload
        </button>
      )}

      {!error.retryable && (
        <p className="text-xs text-gray-500 text-center">
          This error cannot be retried. Please check your file and try again.
        </p>
      )}
    </div>
  );
};
