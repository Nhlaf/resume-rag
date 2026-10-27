/**
 * Phase 11: Hybrid Weight Panel
 * Sliders and presets for BM25 and Vector weights (complementary)
 */

import React from 'react';
import { useHybridWeights } from '@/hooks/useHybridWeights';
import { motion, AnimatePresence } from 'framer-motion';

interface HybridWeightPanelProps {
  visible: boolean;
}

const PRESETS = [
  { label: '50/50', bm25: 50, vector: 50 },
  { label: '70/30', bm25: 70, vector: 30 },
  { label: '30/70', bm25: 30, vector: 70 },
];

export const HybridWeightPanel: React.FC<HybridWeightPanelProps> = ({ visible }) => {
  const { bm25Weight, vectorWeight, handleBm25Change, handleVectorChange, applyPreset } =
    useHybridWeights();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="pt-2 pb-1 space-y-4">
            {/* Section Title */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-widest text-text-muted mb-3">
                Search Weights
              </h3>
            </div>

            {/* BM25 Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">BM25</label>
                <span className="text-sm font-semibold text-score-bm25">{bm25Weight}%</span>
              </div>
              
              <input
                type="range"
                min="0"
                max="100"
                value={bm25Weight}
                onChange={(e) => handleBm25Change(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-bm25"
                style={{
                  background: `linear-gradient(to right, #f472b6 0%, #f472b6 ${bm25Weight}%, rgba(255,255,255,0.1) ${bm25Weight}%, rgba(255,255,255,0.1) 100%)`,
                }}
              />
            </div>

            {/* Vector Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">Vector</label>
                <span className="text-sm font-semibold text-score-vector">{vectorWeight}%</span>
              </div>
              
              <input
                type="range"
                min="0"
                max="100"
                value={vectorWeight}
                onChange={(e) => handleVectorChange(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-vector"
                style={{
                  background: `linear-gradient(to right, #818cf8 0%, #818cf8 ${vectorWeight}%, rgba(255,255,255,0.1) ${vectorWeight}%, rgba(255,255,255,0.1) 100%)`,
                }}
              />
            </div>

            {/* Preset Pills */}
            <div>
              <p className="text-xs text-text-muted mb-2">Presets</p>
              <div className="flex items-center gap-2">
                {PRESETS.map(({ label, bm25, vector }) => {
                  const isActive = bm25Weight === bm25 && vectorWeight === vector;
                  
                  return (
                    <button
                      key={label}
                      onClick={() => applyPreset(bm25, vector)}
                      className={`
                        px-3 py-1.5 text-xs font-medium rounded-md
                        transition-all duration-200
                        ${
                          isActive
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                            : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-gray-300'
                        }
                      `}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Info */}
            <div className="pt-2 border-t border-white/5">
              <p className="text-xs text-text-muted">
                Weights must sum to 100%. Adjust one slider to automatically update the other.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
