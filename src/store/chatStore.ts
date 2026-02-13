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

// Helper function to clean markdown and format text for TTS
const cleanTextForTTS = (text: string): string => {
  let cleaned = text;
  
  // Remove markdown bold/italic
  cleaned = cleaned.replace(/\*\*\*(.+?)\*\*\*/g, '$1'); // ***text***
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');     // **text**
  cleaned = cleaned.replace(/\*(.+?)\*/g, '$1');         // *text*
  cleaned = cleaned.replace(/__(.+?)__/g, '$1');         // __text__
  cleaned = cleaned.replace(/_(.+?)_/g, '$1');           // _text_
  
  // Remove markdown headers
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  
  // Remove markdown lists (keep the content)
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '');
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');
  
  // Remove code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  // Remove links but keep text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove emojis (they sound weird when read)
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{2600}-\u{26FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{2700}-\u{27BF}]/gu, '');
  
  // Remove extra whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  
  // Clean up spacing around punctuation
  cleaned = cleaned.trim();
  
  return cleaned;
};

// Helper function to play browser TTS
const playBrowserTTS = (text: string, language: 'en' | 'hi'): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Stop any existing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      
      // Set voice properties for better quality
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to find the best voice
      const voices = window.speechSynthesis.getVoices();
      const targetLang = language === 'hi' ? 'hi' : 'en';
      
      // Prefer local voices first
      let preferredVoice = voices.find(voice => 
        voice.lang.startsWith(targetLang) && voice.localService
      );
      
      // Fallback to any voice with the language
      if (!preferredVoice) {
        preferredVoice = voices.find(voice => 
          voice.lang.startsWith(targetLang)
        );
      }
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        reject(event);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      reject(error);
    }
  });
};

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
          // Stop any existing audio
          if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
          }
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
          }

          set({
            messages: get().messages.map(msg =>
              msg.id === messageId
                ? { ...msg, isAudioPlaying: true }
                : { ...msg, isAudioPlaying: false }
            )
          });

          // Clean the text before sending to TTS
          const cleanedText = cleanTextForTTS(text);
          console.log('🧹 Original text length:', text.length);
          console.log('🧹 Cleaned text length:', cleanedText.length);

          // Try ElevenLabs first
          let usingElevenLabs = false;
          try {
            console.log('🎙️ Trying ElevenLabs TTS...');
            
            const response = await api.post('/chat/text-to-speech', {
              text: cleanedText,
              language: get().language
            }, {
              responseType: 'blob',
              timeout: 10000
            });

            if (response.data && response.data.size > 0) {
              console.log('✅ ElevenLabs TTS success!');
              
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

              currentAudio.onerror = () => {
                console.warn('⚠️ Audio playback error, falling back to browser TTS');
                URL.revokeObjectURL(audioUrl);
                
                playBrowserTTS(cleanedText, get().language)
                  .finally(() => {
                    set({
                      messages: get().messages.map(msg =>
                        msg.id === messageId
                          ? { ...msg, isAudioPlaying: false }
                          : msg
                      )
                    });
                  });
              };

              await currentAudio.play();
              usingElevenLabs = true;
            }
          } catch (elevenLabsError) {
            console.warn('⚠️ ElevenLabs unavailable, using browser TTS:', 
              elevenLabsError instanceof Error ? elevenLabsError.message : 'Unknown error'
            );
          }

          // If ElevenLabs didn't work, use browser TTS
          if (!usingElevenLabs) {
            console.log('🔊 Using browser TTS...');
            await playBrowserTTS(cleanedText, get().language);
            
            set({
              messages: get().messages.map(msg =>
                msg.id === messageId
                  ? { ...msg, isAudioPlaying: false }
                  : msg
              )
            });
          }
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
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
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
