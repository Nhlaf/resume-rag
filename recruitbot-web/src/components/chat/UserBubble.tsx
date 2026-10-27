/**
 * Phase 12: User Message Bubble
 * Displays user's query message
 */

import React from 'react';
import { motion } from 'framer-motion';
import { formatTime } from '@/lib/utils/formatters';

interface UserBubbleProps {
  text: string;
  timestamp: Date;
}

export const UserBubble: React.FC<UserBubbleProps> = ({ text, timestamp }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-end px-6 py-2"
    >
      <div className="max-w-[80%] md:max-w-[60%]">
        <div
          className="
            px-4 py-3 rounded-2xl rounded-tr-md
            bg-gradient-to-r from-primary to-accent
            text-white text-sm
          "
        >
          {text}
        </div>
        <div className="flex justify-end mt-1">
          <span className="text-xs text-text-muted">{formatTime(timestamp)}</span>
        </div>
      </div>
    </motion.div>
  );
};
