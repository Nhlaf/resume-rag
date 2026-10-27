/**
 * Phase 8: Retry Handler
 * Implements exponential backoff retry logic for failed uploads
 */

import { ApiError } from '../types/errors.types';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

export class RetryHandler {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * Calculate delay for next retry using exponential backoff
   */
  calculateDelay(retryCount: number): number {
    const delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, retryCount);
    return Math.min(delay, this.config.maxDelay);
  }

  /**
   * Check if retry should be attempted
   */
  shouldRetry(error: ApiError, retryCount: number): boolean {
    if (retryCount >= this.config.maxRetries) return false;
    return error.retryable;
  }

  /**
   * Execute function with retry logic
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    onRetry?: (retryCount: number, delay: number) => void,
    onError?: (error: ApiError, retryCount: number) => void
  ): Promise<T> {
    let retryCount = 0;

    while (true) {
      try {
        return await fn();
      } catch (error) {
        // Parse error
        const { ErrorParser } = await import('./errorParser');
        const apiError = ErrorParser.parseError(error);

        // Check if should retry
        if (!this.shouldRetry(apiError, retryCount)) {
          onError?.(apiError, retryCount);
          throw apiError;
        }

        // Calculate delay
        const delay = this.calculateDelay(retryCount);
        
        // Notify retry attempt
        onRetry?.(retryCount, delay);

        // Wait before retry
        await this.sleep(delay);

        retryCount++;
      }
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get retry status message
   */
  getRetryMessage(retryCount: number, delay: number): string {
    const seconds = (delay / 1000).toFixed(1);
    return `Retrying in ${seconds}s... (Attempt ${retryCount + 1}/${this.config.maxRetries})`;
  }
}
