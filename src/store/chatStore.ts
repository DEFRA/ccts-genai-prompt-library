import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChatMessage } from "../types";

interface ChatState {
  messages: Record<string, ChatMessage[]>;
  contentVersions: Record<string, string[]>;
  activeConversation: string | null;

  addMessage: (conversationId: string, message: ChatMessage) => void;
  addContentVersion: (conversationId: string, content: string) => void;
  setActiveConversation: (conversationId: string | null) => void;
  clearConversation: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: {},
      contentVersions: {},
      activeConversation: null,

      addMessage: (conversationId: string, message: ChatMessage) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [
              ...(state.messages[conversationId] || []),
              message,
            ],
          },
        }));
      },

      addContentVersion: (conversationId: string, content: string) => {
        set((state) => ({
          contentVersions: {
            ...state.contentVersions,
            [conversationId]: [
              ...(state.contentVersions[conversationId] || []),
              content,
            ],
          },
        }));
      },

      setActiveConversation: (conversationId: string | null) => {
        set({ activeConversation: conversationId });
      },

      clearConversation: (conversationId: string) => {
        set((state) => {
          const { [conversationId]: _, ...remainingMessages } = state.messages;
          const { [conversationId]: __, ...remainingVersions } =
            state.contentVersions;
          return {
            messages: remainingMessages,
            contentVersions: remainingVersions,
            activeConversation: null,
          };
        });
      },
    }),
    {
      name: "prompt-laibrary-chat",
      partialize: (state) => ({
        messages: state.messages,
        contentVersions: state.contentVersions,
      }),
    }
  )
);
