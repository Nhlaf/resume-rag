/**
 * Phase 8: Enhanced Ingestion API
 * API client with improved error handling
 */

import apiClient from './client';
import { AxiosProgressEvent } from 'axios';

export interface UploadResumeRequest {
  file: File;
  onProgress?: (progress: number) => void;
}

export interface UploadResumeResponse {
  success: true;
  message: string;
  data: {
    candidateId: string;
    name: string;
    email?: string;
    phoneNumber?: string;
    skills?: string[];
    experienceYears?: number;
    processingTime: {
      total: number;
      extraction: number;
      parsing: number;
      embedding: number;
      storage: number;
    };
  };
}

export const ingestionApi = {
  /**
   * Upload resume with progress tracking and enhanced error handling
   */
  async uploadResume({ file, onProgress }: UploadResumeRequest): Promise<UploadResumeResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post<UploadResumeResponse>('/v1/resume/inject', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for file upload
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress?.(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      // Error will be parsed by ErrorParser in the hook
      throw error;
    }
  },

  /**
   * Check server health (for network diagnostics)
   */
  async checkHealth(): Promise<{ status: string }> {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
