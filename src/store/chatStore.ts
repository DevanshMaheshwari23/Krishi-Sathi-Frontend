import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isAudioPlaying?: boolean;
}

export interface Conversation {
  id: string;
  preview: string;
  messageCount: number;
  lastMessage: string;
  lastUpdated: Date;
  language: string;
}

interface ApiMessage {
  role: 'user' | 'model';
  parts: string;
  timestamp: string;
}

interface ChatStore {
  messages: Message[];
  conversations: Conversation[];
  conversationId: string | null;
  isLoading: boolean;
  isListening: boolean;
  language: 'en' | 'hi';
  
  sendMessage: (content: string) => Promise<void>;
  playAudio: (messageId: string, text: string) => Promise<void>;
  stopAudio: () => void;
  clearChat: () => void;
  loadConversations: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  setLanguage: (lang: 'en' | 'hi') => void;
  setIsListening: (listening: boolean) => void;
  getCropAdvice: (cropType: string) => Promise<void>;
  analyzePest: (description: string, cropType?: string) => Promise<void>;
}

let currentAudio: HTMLAudioElement | null = null;

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      conversations: [],
      conversationId: null,
      isLoading: false,
      isListening: false,
      language: 'en',

      sendMessage: async (content: string) => {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content,
          timestamp: new Date()
        };

        set({ 
          messages: [...get().messages, userMessage],
          isLoading: true 
        });

        try {
          const response = await api.post('/chat/chat', {
            message: content,
            conversationId: get().conversationId,
            language: get().language
          });

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            content: response.data.response,
            timestamp: new Date()
          };

          set({
            messages: [...get().messages, aiMessage],
            conversationId: response.data.conversationId,
            isLoading: false
          });
        } catch (error) {
          console.error('Send message error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      playAudio: async (messageId: string, text: string) => {
        try {
          if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
          }

          set({
            messages: get().messages.map(msg =>
              msg.id === messageId
                ? { ...msg, isAudioPlaying: true }
                : { ...msg, isAudioPlaying: false }
            )
          });

          const response = await api.post('/chat/text-to-speech', {
            text,
            language: get().language
          }, {
            responseType: 'blob'
          });

          const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          currentAudio = new Audio(audioUrl);

          currentAudio.onended = () => {
            set({
              messages: get().messages.map(msg =>
                msg.id === messageId
                  ? { ...msg, isAudioPlaying: false }
                  : msg
              )
            });
            URL.revokeObjectURL(audioUrl);
          };

          await currentAudio.play();
        } catch (error) {
          console.error('Play audio error:', error);
          set({
            messages: get().messages.map(msg =>
              msg.id === messageId
                ? { ...msg, isAudioPlaying: false }
                : msg
            )
          });
        }
      },

      stopAudio: () => {
        if (currentAudio) {
          currentAudio.pause();
          currentAudio = null;
        }
        set({
          messages: get().messages.map(msg => ({
            ...msg,
            isAudioPlaying: false
          }))
        });
      },

      clearChat: () => {
        set({
          messages: [],
          conversationId: null
        });
      },

      loadConversations: async () => {
        try {
          const response = await api.get('/chat/conversations');
          set({
            conversations: response.data.conversations
          });
        } catch (error) {
          console.error('Load conversations error:', error);
        }
      },

      loadConversation: async (id: string) => {
        try {
          const response = await api.get(`/chat/conversations/${id}`);
          
          const messages = response.data.conversation.messages.map((msg: ApiMessage, index: number) => ({
            id: `${id}-${index}`,
            role: msg.role,
            content: msg.parts,
            timestamp: new Date(msg.timestamp)
          }));

          set({
            messages,
            conversationId: id,
            language: response.data.conversation.language
          });
        } catch (error) {
          console.error('Load conversation error:', error);
          throw error;
        }
      },

      deleteConversation: async (id: string) => {
        try {
          await api.delete(`/chat/conversations/${id}`);
          
          set({
            conversations: get().conversations.filter(c => c.id !== id)
          });

          if (get().conversationId === id) {
            set({
              messages: [],
              conversationId: null
            });
          }
        } catch (error) {
          console.error('Delete conversation error:', error);
          throw error;
        }
      },

      setLanguage: (lang: 'en' | 'hi') => {
        set({ language: lang });
      },

      setIsListening: (listening: boolean) => {
        set({ isListening: listening });
      },

      getCropAdvice: async (cropType: string) => {
        set({ isLoading: true });

        try {
          const response = await api.post('/chat/crop-advice', {
            cropType,
            language: get().language
          });

          const aiMessage: Message = {
            id: Date.now().toString(),
            role: 'model',
            content: response.data.advice,
            timestamp: new Date()
          };

          set({
            messages: [...get().messages, aiMessage],
            isLoading: false
          });
        } catch (error) {
          console.error('Crop advice error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      analyzePest: async (description: string, cropType?: string) => {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: `Pest/Disease Issue: ${description}${cropType ? ` (Crop: ${cropType})` : ''}`,
          timestamp: new Date()
        };

        set({ 
          messages: [...get().messages, userMessage],
          isLoading: true 
        });

        try {
          const response = await api.post('/chat/analyze-pest', {
            description,
            cropType
          });

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            content: response.data.analysis,
            timestamp: new Date()
          };

          set({
            messages: [...get().messages, aiMessage],
            isLoading: false
          });
        } catch (error) {
          console.error('Analyze pest error:', error);
          set({ isLoading: false });
          throw error;
        }
      }
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        language: state.language,
        conversationId: state.conversationId
      })
    }
  )
);
