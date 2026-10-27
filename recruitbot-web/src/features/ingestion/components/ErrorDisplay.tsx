/**
 * Phase 8: Error Display Component
 * Displays error messages with retry options
 */

import React from 'react';
import { AlertCircle, WifiOff, ServerCrash, XCircle, AlertTriangle, Info } from 'lucide-react';
import { ApiError } from '../types/errors.types';
import { ErrorParser } from '../utils/errorParser';

interface ErrorDisplayProps {
  error: ApiError;
  retryCount?: number;
  maxRetries?: number;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ERROR_ICONS = {
  network: WifiOff,
  server: ServerCrash,
  validation: XCircle,
  processing: AlertCircle,
  unknown: AlertTriangle,
};

const ERROR_COLORS = {
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: 'text-red-500',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    icon: 'text-yellow-500',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: 'text-blue-500',
  },
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  retryCount = 0,
  maxRetries = 3,
  onRetry,
  onDismiss,
}) => {
  const Icon = ERROR_ICONS[error.category];
  const colors = ERROR_COLORS[error.severity];
  const userMessage = ErrorParser.getUserMessage(error);
  const retrySuggestion = ErrorParser.getRetrySuggestion(error, retryCount, maxRetries);
  const canRetry = error.retryable && retryCount < maxRetries && onRetry;

  return (
    <div
      className={`rounded-lg border ${colors.bg} ${colors.border} p-4 animate-in fade-in slide-in-from-top-2 duration-300`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${colors.icon}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Error message */}
          <p className={`text-sm font-medium ${colors.text}`}>{userMessage}</p>

          {/* Details */}
          {error.details && (
            <p className="text-xs text-gray-400 mt-1">{error.details}</p>
          )}

          {/* Retry suggestion */}
          {retrySuggestion && (
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Info className="w-3 h-3" />
              {retrySuggestion}
            </p>
          )}

          {/* Error code */}
          {error.code && (
            <p className="text-xs text-gray-600 mt-1">Error code: {error.code}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {canRetry && (
              <button
                onClick={onRetry}
                className={`text-xs font-medium ${colors.text} hover:opacity-80 transition-opacity px-3 py-1.5 rounded border ${colors.border} hover:bg-white/5`}
              >
                Retry Upload
              </button>
            )}

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-xs font-medium text-gray-400 hover:text-gray-300 transition-colors px-3 py-1.5"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>

        {/* Close button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Dismiss error"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
