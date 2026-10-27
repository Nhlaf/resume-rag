/**
 * Phase 9: Searchability Tester
 * Verifies that uploaded resumes are searchable via retrieval API
 */

import apiClient from '@/lib/api/client';

export interface SearchabilityTestResult {
  success: boolean;
  candidateId: string;
  candidateName: string;
  searchable: boolean;
  foundInSearch: boolean;
  searchQuery: string;
  searchDuration?: number;
  error?: string;
  timestamp: Date;
}

export class SearchabilityTester {
  /**
   * Test if uploaded candidate is searchable
   * Waits for indexing (up to 10 seconds) then performs search
   */
  static async testCandidateSearchability(
    candidateId: string,
    candidateName: string,
    skills?: string[]
  ): Promise<SearchabilityTestResult> {
    const timestamp = new Date();
    
    try {
      // Wait for indexing (vector embeddings take time)
      await this.waitForIndexing(2000); // 2 second delay

      // Generate search query from candidate info
      const searchQuery = this.generateSearchQuery(candidateName, skills);

      // Perform vector search
      const startTime = Date.now();
      const response = await apiClient.post('/v1/search', {
        query: searchQuery,
        searchType: 'vector',
        topK: 10, // Search top 10 to be thorough
      });
      const searchDuration = Date.now() - startTime;

      // Check if candidate appears in results
      const foundInSearch = response.data.results.some(
        (result: any) => result.candidateId === candidateId || result._id === candidateId
      );

      return {
        success: true,
        candidateId,
        candidateName,
        searchable: true,
        foundInSearch,
        searchQuery,
        searchDuration,
        timestamp,
      };
    } catch (error: any) {
      return {
        success: false,
        candidateId,
        candidateName,
        searchable: false,
        foundInSearch: false,
        searchQuery: '',
        error: error.message || 'Search test failed',
        timestamp,
      };
    }
  }

  /**
   * Test multiple search modes (vector, keyword, hybrid)
   */
  static async testMultipleSearchModes(
    candidateId: string,
    candidateName: string,
    skills?: string[]
  ): Promise<{
    vector: SearchabilityTestResult;
    keyword: SearchabilityTestResult;
    hybrid: SearchabilityTestResult;
  }> {
    const searchQuery = this.generateSearchQuery(candidateName, skills);

    // Wait for indexing
    await this.waitForIndexing(2000);

    const [vectorResult, keywordResult, hybridResult] = await Promise.all([
      this.searchCandidate(candidateId, candidateName, searchQuery, 'vector'),
      this.searchCandidate(candidateId, candidateName, searchQuery, 'keyword'),
      this.searchCandidate(candidateId, candidateName, searchQuery, 'hybrid'),
    ]);

    return {
      vector: vectorResult,
      keyword: keywordResult,
      hybrid: hybridResult,
    };
  }

  /**
   * Search for candidate using specific search mode
   */
  private static async searchCandidate(
    candidateId: string,
    candidateName: string,
    searchQuery: string,
    searchType: 'vector' | 'keyword' | 'hybrid'
  ): Promise<SearchabilityTestResult> {
    const timestamp = new Date();

    try {
      const startTime = Date.now();
      const response = await apiClient.post('/v1/search', {
        query: searchQuery,
        searchType,
        topK: 10,
        ...(searchType === 'hybrid' && {
          bm25Weight: 0.5,
          vectorWeight: 0.5,
        }),
      });
      const searchDuration = Date.now() - startTime;

      const foundInSearch = response.data.results.some(
        (result: any) => result.candidateId === candidateId || result._id === candidateId
      );

      return {
        success: true,
        candidateId,
        candidateName,
        searchable: true,
        foundInSearch,
        searchQuery,
        searchDuration,
        timestamp,
      };
    } catch (error: any) {
      return {
        success: false,
        candidateId,
        candidateName,
        searchable: false,
        foundInSearch: false,
        searchQuery,
        error: error.message,
        timestamp,
      };
    }
  }

  /**
   * Generate search query from candidate info
   */
  private static generateSearchQuery(candidateName: string, skills?: string[]): string {
    if (skills && skills.length > 0) {
      // Use top 3 skills for search
      const topSkills = skills.slice(0, 3).join(' ');
      return `${topSkills} professional`;
    }

    // Fallback: use name-based search
    const nameParts = candidateName.split(' ');
    return nameParts.length > 1 ? `${nameParts[0]} professional` : candidateName;
  }

  /**
   * Wait for indexing to complete
   */
  private static async waitForIndexing(delayMs: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  /**
   * Check if retrieval system is ready
   */
  static async checkRetrievalReadiness(): Promise<{
    ready: boolean;
    resumeCount: number;
    error?: string;
  }> {
    try {
      const response = await apiClient.get('/v1/search/readiness');
      return {
        ready: response.data.ready || false,
        resumeCount: response.data.resumeCount || 0,
      };
    } catch (error: any) {
      return {
        ready: false,
        resumeCount: 0,
        error: error.message,
      };
    }
  }
}
