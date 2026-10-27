/**
 * Phase 12: Chat Messages Container
 * Scrollable message list with auto-scroll
 */

import React, { useEffect, useRef } from 'react';
import { useChatStore } from '@/lib/stores/chat.store';
import { UserBubble } from './UserBubble';
import { BotBubble } from './BotBubble';
import { LoadingDots } from '@/components/common/LoadingDots';
import { WelcomeMessage } from './WelcomeMessage';
import { SuggestionChips } from './SuggestionChips';

interface ChatMessagesProps {
  onSelectSuggestion: (query: string) => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ onSelectSuggestion }) => {
  const { messages, isProcessing } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const showWelcome = messages.length === 0;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="min-h-full flex flex-col">
        {/* Welcome message when empty */}
        {showWelcome && (
          <>
            <div className="flex-1 flex items-center justify-center">
              <WelcomeMessage />
            </div>
            <SuggestionChips onSelectSuggestion={onSelectSuggestion} />
          </>
        )}

        {/* Messages */}
        {!showWelcome && (
          <div className="flex-1 py-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                {message.type === 'user' ? (
                  <UserBubble text={message.text || ''} timestamp={message.timestamp} />
                ) : (
                  <BotBubble isError={message.isError}>{message.content}</BotBubble>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isProcessing && (
              <BotBubble>
                <div className="px-4 py-3 bg-bg-card rounded-2xl rounded-tl-md">
                  <LoadingDots />
                </div>
              </BotBubble>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};
