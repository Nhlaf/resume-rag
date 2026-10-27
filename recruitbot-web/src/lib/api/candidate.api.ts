/**
 * Phase 14: Candidate API Client
 * API calls for fetching candidate profiles
 */

import apiClient from './client';
import { CandidateProfile } from '@/types/candidate.types';

export const candidateApi = {
  /**
   * Get candidate profile by ID
   */
  async getCandidateById(id: string): Promise<CandidateProfile> {
    const response = await apiClient.get<CandidateProfile & { resume?: CandidateProfile }>(
      `/v1/search/resumes/${id}`
    );
    return response.data.resume ?? response.data;
  },

  /**
   * List all resumes (for testing/admin)
   */
  async listResumes(limit: number = 50): Promise<CandidateProfile[]> {
    const response = await apiClient.get<CandidateProfile[]>(`/v1/search/resumes`, {
      params: { limit },
    });
    return response.data;
  },
};
