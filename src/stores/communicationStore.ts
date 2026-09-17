import { create } from 'zustand';
import { ChatMessage } from '@/types';
import { mockChatMessages } from '@/data/chatMessages';
import { generateId } from '@/lib/utils';

interface CommunicationState {
  messages: ChatMessage[];
  sendMessage: (content: string, senderId: string, senderName: string, senderRole: string, teamId: string) => void;
}

export const useCommunicationStore = create<CommunicationState>((set) => ({
  messages: [...mockChatMessages],
  sendMessage: (content, senderId, senderName, senderRole, teamId) => set((state) => ({
    messages: [...state.messages, {
      id: `msg-${generateId()}`,
      teamId,
      senderId,
      senderName,
      senderRole,
      content,
      timestamp: new Date().toISOString(),
      isOwn: true,
    }],
  })),
}));
export type { CommunicationState };
export type { ChatMessage };
