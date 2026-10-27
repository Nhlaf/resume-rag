/**
 * Phase 8: Upload Hook with Retry Logic
 * Enhanced upload hook with automatic retry and error handling
 */

import { useState, useCallback } from 'react';
import { ApiError } from '../types/errors.types';
import { ErrorParser } from '../utils/errorParser';
import { RetryHandler, DEFAULT_RETRY_CONFIG } from '../utils/retryHandler';
import toast from 'react-hot-toast';

interface UploadWithRetryOptions {
  maxRetries?: number;
  onRetry?: (retryCount: number, delay: number) => void;
  onError?: (error: ApiError, retryCount: number) => void;
  onSuccess?: (data: any) => void;
}

export const useUploadWithRetry = (
  uploadFn: (file: File) => Promise<any>,
  options: UploadWithRetryOptions = {}
) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retryHandler = new RetryHandler({
    maxRetries: options.maxRetries || DEFAULT_RETRY_CONFIG.maxRetries,
  });

  /**
   * Upload with automatic retry
   */
  const upload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setError(null);
      setRetryCount(0);
      setIsRetrying(false);

      try {
        const result = await retryHandler.executeWithRetry(
          () => uploadFn(file),
          (currentRetryCount, delay) => {
            setRetryCount(currentRetryCount + 1);
            setIsRetrying(true);
            
            const message = retryHandler.getRetryMessage(currentRetryCount, delay);
            toast.loading(message, { id: 'upload-retry' });
            
            options.onRetry?.(currentRetryCount, delay);
          },
          (apiError, finalRetryCount) => {
            setError(apiError);
            setRetryCount(finalRetryCount);
            toast.dismiss('upload-retry');
            options.onError?.(apiError, finalRetryCount);
          }
        );

        // Success
        toast.dismiss('upload-retry');
        toast.success('Resume uploaded successfully!');
        options.onSuccess?.(result);
        
        return result;
      } catch (err) {
        // Final error after all retries
        const apiError = err as ApiError;
        setError(apiError);
        
        // Show error toast
        toast.error(ErrorParser.getUserMessage(apiError), {
          duration: 5000,
        });
        
        throw apiError;
      } finally {
        setIsUploading(false);
        setIsRetrying(false);
      }
    },
    [uploadFn, options, retryHandler]
  );

  /**
   * Manual retry
   */
  const retry = useCallback(
    async (file: File) => {
      if (!error) return;
      await upload(file);
    },
    [error, upload]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  return {
    upload,
    retry,
    clearError,
    isUploading,
    error,
    retryCount,
    isRetrying,
    canRetry: error?.retryable && retryCount < (options.maxRetries || DEFAULT_RETRY_CONFIG.maxRetries),
  };
};
