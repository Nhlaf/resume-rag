/**
 * Phase 10: Chat Message Type Definitions
 */

import { ReactNode } from 'react';

export type MessageType = 'user' | 'bot';

export interface Message {
  id: string;
  type: MessageType;
  text?: string; // For user messages
  content?: ReactNode; // For bot messages (can include components)
  timestamp: Date;
  isError?: boolean; // For error messages (Phase 13)
}

export interface ChatState {
  messages: Message[];
  isProcessing: boolean;
}
