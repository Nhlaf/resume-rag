/**
 * Phase 12: Bot Message Bubble
 * Wrapper for bot responses (text or components like results)
 */

import React from 'react';
import { motion } from 'framer-motion';

interface BotBubbleProps {
  children: React.ReactNode;
  showAvatar?: boolean;
  isError?: boolean; // Phase 13: Error styling
}

export const BotBubble: React.FC<BotBubbleProps> = ({ children, showAvatar = true, isError = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-start px-6 py-2"
    >
      <div className="flex items-start gap-3 max-w-[90%] md:max-w-[80%]">
        {/* Avatar */}
        {showAvatar && (
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mt-1 ${
            isError ? 'bg-red-500' : 'bg-gradient-to-br from-primary to-accent'
          }`}>
            {isError ? '!' : 'R'}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </motion.div>
  );
};
