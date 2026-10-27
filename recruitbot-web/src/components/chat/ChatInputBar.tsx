/**
 * Phase 12: Chat Input Bar
 * Auto-resizing textarea with send button
 */

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputBarProps {
  onSubmit: (query: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSubmit,
  disabled = false,
  placeholder = 'Search for candidates...',
}) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    const trimmedValue = value.trim();
    if (trimmedValue && !disabled) {
      onSubmit(trimmedValue);
      setValue('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = value.trim().length > 0 && !disabled;

  return (
    <div className="shrink-0 border-t border-white/[0.07] bg-bg-surface px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="
                w-full px-4 py-3 pr-12
                bg-white/5 border border-white/10
                rounded-lg resize-none
                text-sm text-text-primary placeholder:text-text-muted
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all
              "
              style={{ minHeight: '44px', maxHeight: '150px' }}
            />

            {/* Hint text */}
            <div className="absolute bottom-2 right-3 pointer-events-none">
              <span className="text-xs text-text-muted">
                {canSubmit ? 'Enter to send' : 'Shift+Enter for new line'}
              </span>
            </div>
          </div>

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`
              flex-shrink-0 w-11 h-11 rounded-lg
              flex items-center justify-center
              transition-all duration-200
              ${
                canSubmit
                  ? 'bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:scale-105 cursor-pointer'
                  : 'bg-white/5 opacity-40 cursor-not-allowed'
              }
            `}
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Helper text */}
        <div className="mt-2 px-1">
          <p className="text-xs text-text-muted">
            Press <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-xs">Enter</kbd> to search · <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-xs">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  );
};
