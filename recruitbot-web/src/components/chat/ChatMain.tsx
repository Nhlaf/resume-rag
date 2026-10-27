/**
 * Phase 12: Chat Main Component
 * Composes topbar, messages, and input bar
 */

import React from 'react';
import { ChatTopbar } from './ChatTopbar';
import { ChatMessages } from './ChatMessages';
import { ChatInputBar } from './ChatInputBar';
import { useChatStore } from '@/lib/stores/chat.store';

interface ChatMainProps {
  onSubmitQuery: (query: string) => void;
}

export const ChatMain: React.FC<ChatMainProps> = ({ onSubmitQuery }) => {
  const { isProcessing } = useChatStore();

  const handleSubmit = (query: string) => {
    onSubmitQuery(query);
  };

  const handleSelectSuggestion = (query: string) => {
    onSubmitQuery(query);
  };

  return (
    <main className="flex-1 flex min-h-0 flex-col bg-bg-base overflow-hidden">
      {/* Topbar */}
      <ChatTopbar />

      {/* Messages */}
      <ChatMessages onSelectSuggestion={handleSelectSuggestion} />

      {/* Input Bar */}
      <ChatInputBar onSubmit={handleSubmit} disabled={isProcessing} />
    </main>
  );
};
