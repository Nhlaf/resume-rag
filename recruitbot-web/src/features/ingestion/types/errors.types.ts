/**
 * Phase 8: Error Handling Types
 * Comprehensive error types for backend and network errors
 */

export type ErrorSeverity = 'error' | 'warning' | 'info';
export type ErrorCategory = 'network' | 'validation' | 'processing' | 'server' | 'unknown';

export interface ApiError {
  message: string;
  code?: string;
  details?: string;
  field?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  retryable: boolean;
  timestamp: Date;
}

export interface BackendErrorResponse {
  success: false;
  error: string;
  details?: string;
  code?: string;
  statusCode?: number;
  requestId?: string;
}

export interface ProcessingError {
  stage: 'extraction' | 'parsing' | 'embedding' | 'storage';
  message: string;
  details?: string;
  retryable: boolean;
}

export interface NetworkError {
  type: 'timeout' | 'connection' | 'abort' | 'unknown';
  message: string;
  retryable: boolean;
  retryCount: number;
  maxRetries: number;
}

export interface ErrorState {
  hasError: boolean;
  error: ApiError | null;
  retryCount: number;
  lastRetryAt: Date | null;
}
