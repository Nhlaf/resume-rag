/**
 * Phase 9: Searchability Test Component
 * Shows verification that uploaded resume is searchable
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, Search, Zap, FileText, GitMerge } from 'lucide-react';
import { SearchabilityTester, SearchabilityTestResult } from '../utils/searchabilityTester';

interface SearchabilityTestProps {
  candidateId: string;
  candidateName: string;
  skills?: string[];
  onComplete?: (results: {
    vector: SearchabilityTestResult;
    keyword: SearchabilityTestResult;
    hybrid: SearchabilityTestResult;
  }) => void;
}

export const SearchabilityTest: React.FC<SearchabilityTestProps> = ({
  candidateId,
  candidateName,
  skills,
  onComplete,
}) => {
  const [testing, setTesting] = useState(true);
  const [results, setResults] = useState<{
    vector?: SearchabilityTestResult;
    keyword?: SearchabilityTestResult;
    hybrid?: SearchabilityTestResult;
  }>({});

  useEffect(() => {
    runSearchabilityTest();
  }, [candidateId]);

  const runSearchabilityTest = async () => {
    setTesting(true);

    try {
      const testResults = await SearchabilityTester.testMultipleSearchModes(
        candidateId,
        candidateName,
        skills
      );
      
      setResults(testResults);
      onComplete?.(testResults);
    } catch (error) {
      console.error('Searchability test failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (result?: SearchabilityTestResult) => {
    if (!result) return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />;
    if (result.foundInSearch) return <CheckCircle className="w-4 h-4 text-green-400" />;
    return <XCircle className="w-4 h-4 text-red-400" />;
  };

  const getStatusText = (result?: SearchabilityTestResult) => {
    if (!result) return 'Testing...';
    if (result.foundInSearch) return 'Searchable';
    return 'Not found';
  };

  const getStatusColor = (result?: SearchabilityTestResult) => {
    if (!result) return 'text-blue-400';
    if (result.foundInSearch) return 'text-green-400';
    return 'text-red-400';
  };

  const searchModes = [
    { key: 'vector', label: 'Vector Search', icon: Zap, description: 'Semantic similarity' },
    { key: 'keyword', label: 'Keyword Search', icon: FileText, description: 'BM25 lexical' },
    { key: 'hybrid', label: 'Hybrid Search', icon: GitMerge, description: 'Combined ranking' },
  ] as const;

  const allSearchable = results.vector?.foundInSearch && 
                        results.keyword?.foundInSearch && 
                        results.hybrid?.foundInSearch;

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Search className="w-5 h-5 text-indigo-400" />
        <div>
          <h4 className="text-sm font-semibold text-gray-200">Searchability Verification</h4>
          <p className="text-xs text-gray-400">Testing resume across all search modes</p>
        </div>
      </div>

      {/* Search Mode Tests */}
      <div className="space-y-3">
        {searchModes.map(({ key, label, icon: Icon, description }) => {
          const result = results[key];
          return (
            <div
              key={key}
              className="flex items-center justify-between p-3 rounded bg-white/5 border border-white/5"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-200">{label}</p>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(result)}
                <span className={`text-xs font-medium ${getStatusColor(result)}`}>
                  {getStatusText(result)}
                </span>
                {result?.searchDuration && (
                  <span className="text-xs text-gray-500 ml-2">
                    {result.searchDuration}ms
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Status */}
      {!testing && (
        <div
          className={`mt-4 p-3 rounded border ${
            allSearchable
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {allSearchable ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">
                  Resume is fully searchable across all modes
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">
                  Resume partially searchable - indexing may still be in progress
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Search Query Info */}
      {results.vector && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-xs text-gray-500">
            Search query: <span className="text-gray-400">"{results.vector.searchQuery}"</span>
          </p>
        </div>
      )}
    </div>
  );
};
