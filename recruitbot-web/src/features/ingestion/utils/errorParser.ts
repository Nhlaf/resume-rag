/**
 * Phase 8: Error Parser Utility
 * Parses backend and network errors into standardized format
 */

import { AxiosError } from 'axios';
import { ApiError, BackendErrorResponse, ErrorCategory, ErrorSeverity } from '../types/errors.types';

export class ErrorParser {
  /**
   * Parse any error into standardized ApiError format
   */
  static parseError(error: unknown): ApiError {
    // Axios error with response
    if (this.isAxiosError(error) && error.response) {
      return this.parseBackendError(error);
    }

    // Axios error without response (network error)
    if (this.isAxiosError(error) && error.request) {
      return this.parseNetworkError(error);
    }

    // Generic error
    return this.parseGenericError(error);
  }

  /**
   * Parse backend error response
   */
  private static parseBackendError(error: AxiosError<BackendErrorResponse>): ApiError {
    const data = error.response?.data;
    const status = error.response?.status || 500;

    // Extract error message
    const message = data?.error || data?.details || error.message || 'Server error occurred';

    // Determine category and severity
    const category = this.categorizeError(status, message);
    const severity = this.determineSeverity(status);
    const retryable = this.isRetryable(status, category);

    return {
      message: this.formatErrorMessage(message, status),
      code: data?.code || `HTTP_${status}`,
      details: data?.details,
      severity,
      category,
      retryable,
      timestamp: new Date(),
    };
  }

  /**
   * Parse network error (no response from server)
   */
  private static parseNetworkError(error: AxiosError): ApiError {
    const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
    const message = isTimeout
      ? 'Request timed out. Please check your connection and try again.'
      : 'Network error. Please check your internet connection.';

    return {
      message,
      code: error.code || 'NETWORK_ERROR',
      details: error.message,
      severity: 'error',
      category: 'network',
      retryable: true,
      timestamp: new Date(),
    };
  }

  /**
   * Parse generic/unknown error
   */
  private static parseGenericError(error: unknown): ApiError {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';

    return {
      message,
      severity: 'error',
      category: 'unknown',
      retryable: false,
      timestamp: new Date(),
    };
  }

  /**
   * Categorize error based on status code and message
   */
  private static categorizeError(status: number, message: string): ErrorCategory {
    // Validation errors (4xx)
    if (status >= 400 && status < 500) {
      if (status === 413 || message.toLowerCase().includes('file') || message.toLowerCase().includes('size')) {
        return 'validation';
      }
      return 'validation';
    }

    // Server errors (5xx)
    if (status >= 500) {
      return 'server';
    }

    // Processing errors (inferred from message)
    if (
      message.toLowerCase().includes('parsing') ||
      message.toLowerCase().includes('extraction') ||
      message.toLowerCase().includes('embedding')
    ) {
      return 'processing';
    }

    return 'unknown';
  }

  /**
   * Determine error severity
   */
  private static determineSeverity(status: number): ErrorSeverity {
    if (status >= 500) return 'error';
    if (status >= 400 && status < 500) return 'warning';
    return 'info';
  }

  /**
   * Determine if error is retryable
   */
  private static isRetryable(status: number, category: ErrorCategory): boolean {
    // Network errors are always retryable
    if (category === 'network') return true;

    // Server errors (5xx) are retryable
    if (status >= 500) return true;

    // Specific retryable statuses
    if ([408, 429, 503, 504].includes(status)) return true;

    // Client errors (4xx) are generally not retryable
    return false;
  }

  /**
   * Format error message with context
   */
  private static formatErrorMessage(message: string, status: number): string {
    // Add context for common errors
    const errorMessages: Record<number, string> = {
      400: 'Invalid request. Please check your file and try again.',
      401: 'Authentication required. Please log in.',
      403: 'Access denied. You do not have permission to perform this action.',
      404: 'Resource not found. The endpoint may be unavailable.',
      408: 'Request timeout. Please try again.',
      413: 'File too large. Maximum size is 5 MB.',
      415: 'Unsupported file type. Only PDF files are allowed.',
      429: 'Too many requests. Please wait a moment and try again.',
      500: 'Server error. Please try again later.',
      502: 'Bad gateway. The server is temporarily unavailable.',
      503: 'Service unavailable. Please try again later.',
      504: 'Gateway timeout. The server took too long to respond.',
    };

    return errorMessages[status] || message;
  }

  /**
   * Type guard for AxiosError
   */
  private static isAxiosError(error: unknown): error is AxiosError {
    return (error as AxiosError).isAxiosError === true;
  }

  /**
   * Extract user-friendly message for display
   */
  static getUserMessage(error: ApiError): string {
    // Override messages for specific categories
    if (error.category === 'processing') {
      return `Processing failed: ${error.message}. Please try uploading again.`;
    }

    if (error.category === 'network') {
      return `${error.message} ${error.retryable ? 'Retrying...' : ''}`;
    }

    return error.message;
  }

  /**
   * Get retry suggestion text
   */
  static getRetrySuggestion(error: ApiError, retryCount: number, maxRetries: number): string | null {
    if (!error.retryable) return null;
    if (retryCount >= maxRetries) return 'Maximum retry attempts reached. Please try again later.';

    return `Retry attempt ${retryCount + 1} of ${maxRetries}...`;
  }
}
