/**
 * Phase 9: Validation Summary Component
 * Shows final validation results with all checks
 */

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { SearchabilityTestResult } from '../utils/searchabilityTester';

interface ValidationSummaryProps {
  uploadSuccess: boolean;
  candidateName?: string;
  candidateId?: string;
  processingTime?: {
    total: number;
    extraction: number;
    parsing: number;
    embedding: number;
    storage: number;
  };
  searchabilityResults?: {
    vector: SearchabilityTestResult;
    keyword: SearchabilityTestResult;
    hybrid: SearchabilityTestResult;
  };
  onViewInSearch?: () => void;
  onUploadAnother?: () => void;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  uploadSuccess,
  candidateName,
  candidateId,
  processingTime,
  searchabilityResults,
  onViewInSearch,
  onUploadAnother,
}) => {
  const allSearchModesWork =
    searchabilityResults?.vector.foundInSearch &&
    searchabilityResults?.keyword.foundInSearch &&
    searchabilityResults?.hybrid.foundInSearch;

  const someSearchModesWork =
    searchabilityResults?.vector.foundInSearch ||
    searchabilityResults?.keyword.foundInSearch ||
    searchabilityResults?.hybrid.foundInSearch;

  const getSearchabilityStatus = () => {
    if (allSearchModesWork) {
      return {
        icon: CheckCircle,
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/30',
        text: 'Fully Searchable',
        description: 'Resume is searchable across all search modes',
      };
    }

    if (someSearchModesWork) {
      return {
        icon: AlertCircle,
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'Partially Searchable',
        description: 'Resume is searchable in some modes - indexing may still be in progress',
      };
    }

    return {
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'Not Yet Searchable',
      description: 'Resume is being indexed - try searching in a few moments',
    };
  };

  const searchabilityStatus = getSearchabilityStatus();
  const StatusIcon = searchabilityStatus.icon;

  return (
    <div className="space-y-4">
      {/* Upload Status */}
      <div
        className={`rounded-lg border p-5 ${
          uploadSuccess
            ? 'bg-green-500/10 border-green-500/30'
            : 'bg-red-500/10 border-red-500/30'
        }`}
      >
        <div className="flex items-start gap-3">
          {uploadSuccess ? (
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          )}

          <div className="flex-1">
            <h3
              className={`text-base font-semibold ${
                uploadSuccess ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {uploadSuccess ? 'Resume Uploaded Successfully' : 'Upload Failed'}
            </h3>

            {uploadSuccess && candidateName && (
              <p className="text-sm text-gray-300 mt-1">
                Candidate: <span className="font-medium">{candidateName}</span>
              </p>
            )}

            {uploadSuccess && candidateId && (
              <p className="text-xs text-gray-500 mt-1">ID: {candidateId}</p>
            )}
          </div>
        </div>

        {/* Processing Time */}
        {processingTime && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-400 mb-2">Processing Time</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Extraction', time: processingTime.extraction },
                { label: 'Parsing', time: processingTime.parsing },
                { label: 'Embedding', time: processingTime.embedding },
                { label: 'Storage', time: processingTime.storage },
              ].map(({ label, time }) => (
                <div
                  key={label}
                  className="text-xs bg-white/5 px-2 py-1.5 rounded flex justify-between"
                >
                  <span className="text-gray-400">{label}</span>
                  <span className="text-gray-300 font-medium">{time}ms</span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs bg-white/5 px-2 py-1.5 rounded flex justify-between font-semibold">
              <span className="text-gray-300">Total</span>
              <span className="text-green-400">{processingTime.total}ms</span>
            </div>
          </div>
        )}
      </div>

      {/* Searchability Status */}
      {searchabilityResults && (
        <div className={`rounded-lg border p-5 ${searchabilityStatus.bg} ${searchabilityStatus.border}`}>
          <div className="flex items-start gap-3 mb-4">
            <StatusIcon className={`w-6 h-6 ${searchabilityStatus.color} flex-shrink-0`} />
            <div>
              <h3 className={`text-base font-semibold ${searchabilityStatus.color}`}>
                {searchabilityStatus.text}
              </h3>
              <p className="text-sm text-gray-400 mt-1">{searchabilityStatus.description}</p>
            </div>
          </div>

          {/* Search Mode Details */}
          <div className="space-y-2">
            {[
              { key: 'vector', label: 'Vector Search', result: searchabilityResults.vector },
              { key: 'keyword', label: 'Keyword Search', result: searchabilityResults.keyword },
              { key: 'hybrid', label: 'Hybrid Search', result: searchabilityResults.hybrid },
            ].map(({ key, label, result }) => (
              <div
                key={key}
                className="flex items-center justify-between text-xs bg-white/5 px-3 py-2 rounded"
              >
                <span className="text-gray-400">{label}</span>
                <div className="flex items-center gap-2">
                  {result.foundInSearch ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-green-400 font-medium">Found</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-500">Not found</span>
                    </>
                  )}
                  {result.searchDuration && (
                    <span className="text-gray-600 ml-2">{result.searchDuration}ms</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onViewInSearch && someSearchModesWork && (
          <button
            onClick={onViewInSearch}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-medium transition-colors"
          >
            <span>View in Search</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {onUploadAnother && (
          <button
            onClick={onUploadAnother}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-white/20 hover:bg-white/5 text-gray-300 font-medium transition-colors"
          >
            <span>Upload Another Resume</span>
          </button>
        )}
      </div>
    </div>
  );
};
