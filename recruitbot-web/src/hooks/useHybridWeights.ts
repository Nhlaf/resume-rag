/**
 * Phase 11: Hybrid Weights Hook
 * Manages complementary BM25 and Vector weights (sum to 100)
 */

import { useSearchStore } from '@/lib/stores/search.store';

export const useHybridWeights = () => {
  const { bm25Weight, vectorWeight, setWeights } = useSearchStore();

  /**
   * Handle BM25 slider change (automatically adjusts Vector)
   */
  const handleBm25Change = (value: number) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    setWeights(clampedValue, 100 - clampedValue);
  };

  /**
   * Handle Vector slider change (automatically adjusts BM25)
   */
  const handleVectorChange = (value: number) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    setWeights(100 - clampedValue, clampedValue);
  };

  /**
   * Apply a preset (e.g., 50/50, 70/30, 30/70)
   */
  const applyPreset = (bm25: number, vector: number) => {
    setWeights(bm25, vector);
  };

  return {
    bm25Weight,
    vectorWeight,
    handleBm25Change,
    handleVectorChange,
    applyPreset,
  };
};
