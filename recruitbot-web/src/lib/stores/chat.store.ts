/**
 * Phase 10: Chat Store
 * Manages chat messages for search interface
 */

import { create } from 'zustand';
import { Message } from '@/types/chat.types';

interface ChatStore {
  messages: Message[];
  isProcessing: boolean;
  
  // Actions
  addUserMessage: (text: string) => void;
  addBotMessage: (content: React.ReactNode, isError?: boolean) => void; // Phase 13: Added isError
  setProcessing: (isProcessing: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isProcessing: false,
  
  addUserMessage: (text) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: crypto.randomUUID(),
          type: 'user',
          text,
          timestamp: new Date(),
        },
      ],
    })),
  
  addBotMessage: (content, isError = false) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: crypto.randomUUID(),
          type: 'bot',
          content,
          timestamp: new Date(),
          isError,
        },
      ],
    })),
  
  setProcessing: (isProcessing) => set({ isProcessing }),
  
  clearMessages: () => set({ messages: [], isProcessing: false }),
}));
