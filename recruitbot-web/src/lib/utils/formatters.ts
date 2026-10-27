/**
 * Phase 10: Formatting Utilities
 * Helper functions for formatting scores, dates, durations, etc.
 */

import { SearchMode } from '@/types/search.types';

/**
 * Format search score (0-1 to percentage or display format)
 */
export function formatScore(score: number, searchMode: SearchMode): string {
  if (searchMode === 'bm25') {
    // BM25 scores can be > 1, show as decimal
    return score.toFixed(2);
  }
  
  // Vector and hybrid scores are 0-1, show as percentage
  return (score * 100).toFixed(0) + '%';
}

/**
 * Format duration in milliseconds to human-readable
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  
  const seconds = (ms / 1000).toFixed(2);
  return `${seconds}s`;
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}

/**
 * Format date to simple string (e.g., "Jan 15, 2026")
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format time (HH:mm)
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Truncate text to max length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Get score color class based on search mode
 */
export function getScoreColorClass(searchMode: SearchMode): string {
  switch (searchMode) {
    case 'vector':
      return 'text-score-vector bg-score-vector/10';
    case 'bm25':
      return 'text-score-bm25 bg-score-bm25/10';
    case 'hybrid':
      return 'text-score-hybrid bg-score-hybrid/10';
    default:
      return 'text-gray-400 bg-gray-500/10';
  }
}

/**
 * Get search mode display name
 */
export function getSearchModeLabel(mode: SearchMode): string {
  switch (mode) {
    case 'vector':
      return 'Vector Search';
    case 'bm25':
      return 'BM25 Keyword';
    case 'hybrid':
      return 'Hybrid';
    default:
      return mode;
  }
}

/**
 * Get search mode description
 */
export function getSearchModeDescription(mode: SearchMode): string {
  switch (mode) {
    case 'vector':
      return 'Semantic similarity search';
    case 'bm25':
      return 'Lexical keyword matching';
    case 'hybrid':
      return 'Combined ranking';
    default:
      return '';
  }
}

/**
 * Pluralize word based on count
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}
