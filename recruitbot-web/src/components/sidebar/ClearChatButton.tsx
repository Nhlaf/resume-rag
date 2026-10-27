/**
 * Phase 11: Clear Chat Button
 * Clears all chat messages and search results
 */

import React from 'react';
import { X } from 'lucide-react';
import { useChatStore } from '@/lib/stores/chat.store';
import { useSearchStore } from '@/lib/stores/search.store';
import toast from 'react-hot-toast';

export const ClearChatButton: React.FC = () => {
  const { clearMessages } = useChatStore();
  const { clearResults } = useSearchStore();

  const handleClear = () => {
    clearMessages();
    clearResults();
    toast.success('Chat cleared');
  };

  return (
    <button
      onClick={handleClear}
      className="
        w-full flex items-center justify-center gap-2 px-4 py-2.5
        bg-white/5 hover:bg-white/8
        border border-white/10 hover:border-white/15
        rounded-lg
        text-sm font-medium text-gray-300 hover:text-text-primary
        transition-all duration-200
      "
    >
      <X className="w-4 h-4" />
      <span>Clear Chat</span>
    </button>
  );
};
