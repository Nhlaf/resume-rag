/**
 * Phase 9: End-to-End Upload Hook
 * Combines upload, validation, and searchability testing
 */

import { useState, useCallback } from 'react';
import { ingestionApi, UploadResumeResponse } from '@/lib/api/ingestion.api';
import { useUploadWithRetry } from './useUploadWithRetry';
import { SearchabilityTester, SearchabilityTestResult } from '../utils/searchabilityTester';
import toast from 'react-hot-toast';

interface EndToEndUploadResult {
  uploadSuccess: boolean;
  uploadData?: UploadResumeResponse['data'];
  searchabilityResults?: {
    vector: SearchabilityTestResult;
    keyword: SearchabilityTestResult;
    hybrid: SearchabilityTestResult;
  };
  error?: string;
}

export const useEndToEndUpload = () => {
  const [uploadResult, setUploadResult] = useState<EndToEndUploadResult | null>(null);
  const [isTestingSearchability, setIsTestingSearchability] = useState(false);
  const [validationStage, setValidationStage] = useState<
    'idle' | 'uploading' | 'testing_searchability' | 'complete' | 'error'
  >('idle');

  const uploadWithRetry = useUploadWithRetry(
    (file: File) => ingestionApi.uploadResume({ file }),
    {
      maxRetries: 3,
      onSuccess: (data) => {
        console.log('Upload successful:', data);
      },
      onError: (error, retryCount) => {
        console.error(`Upload failed after ${retryCount} retries:`, error);
      },
    }
  );

  /**
   * Upload file and run full end-to-end validation
   */
  const uploadAndValidate = useCallback(
    async (file: File): Promise<EndToEndUploadResult> => {
      setValidationStage('uploading');
      setUploadResult(null);

      try {
        // Step 1: Upload resume
        const uploadResponse = await uploadWithRetry.upload(file);

        if (!uploadResponse || !uploadResponse.data) {
          throw new Error('Upload response missing data');
        }

        const { candidateId, name, skills } = uploadResponse.data;

        // Step 2: Test searchability
        setValidationStage('testing_searchability');
        setIsTestingSearchability(true);

        const searchabilityResults = await SearchabilityTester.testMultipleSearchModes(
          candidateId,
          name,
          skills
        );

        // Check if searchable in at least one mode
        const isSearchable =
          searchabilityResults.vector.foundInSearch ||
          searchabilityResults.keyword.foundInSearch ||
          searchabilityResults.hybrid.foundInSearch;

        if (!isSearchable) {
          console.warn('Resume uploaded but not immediately searchable - indexing may be in progress');
          toast('Resume uploaded! Search indexing in progress...', {
            icon: '⏳',
            duration: 4000,
          });
        } else {
          toast.success('Resume uploaded and searchable!');
        }

        const result: EndToEndUploadResult = {
          uploadSuccess: true,
          uploadData: uploadResponse.data,
          searchabilityResults,
        };

        setUploadResult(result);
        setValidationStage('complete');
        return result;
      } catch (error: any) {
        const result: EndToEndUploadResult = {
          uploadSuccess: false,
          error: error.message || 'Upload failed',
        };

        setUploadResult(result);
        setValidationStage('error');
        return result;
      } finally {
        setIsTestingSearchability(false);
      }
    },
    [uploadWithRetry]
  );

  /**
   * Reset validation state
   */
  const reset = useCallback(() => {
    setUploadResult(null);
    setValidationStage('idle');
    setIsTestingSearchability(false);
    uploadWithRetry.clearError();
  }, [uploadWithRetry]);

  return {
    // Upload functions
    uploadAndValidate,
    reset,

    // States
    isUploading: uploadWithRetry.isUploading,
    isTestingSearchability,
    validationStage,
    uploadResult,

    // Upload with retry states
    error: uploadWithRetry.error,
    retryCount: uploadWithRetry.retryCount,
    canRetry: uploadWithRetry.canRetry,
    retry: uploadWithRetry.retry,
  };
};
