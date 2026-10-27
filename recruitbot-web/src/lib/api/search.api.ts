/**
 * Phase 10: Search API Client
 * API calls for search and retrieval operations
 */

import apiClient from './client';
import { SearchRequest, SearchResponse } from '@/types/search.types';
import { CandidateProfile } from '@/types/candidate.types';

export const searchApi = {
  /**
   * Search resumes using specified search mode
   */
  async searchResumes(params: SearchRequest): Promise<SearchResponse> {
    const response = await apiClient.post<SearchResponse>('/v1/search', params);
    return response.data;
  },

  /**
   * Get candidate profile by ID
   */
  async getCandidateById(id: string): Promise<CandidateProfile> {
    const response = await apiClient.get<CandidateProfile>(`/v1/search/resumes/${id}`);
    return response.data;
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

  /**
   * Check if retrieval system is ready
   */
  async checkReadiness(): Promise<{ ready: boolean; resumeCount: number }> {
    const response = await apiClient.get('/v1/search/readiness');
    return response.data;
  },
};
