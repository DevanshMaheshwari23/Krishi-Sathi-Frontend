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

// Advanced text cleaning for natural, flowing speech
const cleanTextForTTS = (text: string): string => {
  let cleaned = text;
  
  // Step 1: Remove all markdown formatting
  cleaned = cleaned.replace(/\*\*\*(.+?)\*\*\*/g, '$1'); // ***bold italic***
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');     // **bold**
  cleaned = cleaned.replace(/\*(.+?)\*/g, '$1');         // *italic*
  cleaned = cleaned.replace(/__(.+?)__/g, '$1');         // __underline__
  cleaned = cleaned.replace(/_(.+?)_/g, '$1');           // _italic_
  cleaned = cleaned.replace(/~~(.+?)~~/g, '$1');         // ~~strikethrough~~
  
  // Step 2: Remove markdown headers but keep text
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  
  // Step 3: Remove code blocks and inline code
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  // Step 4: Remove markdown links but keep the display text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Step 5: Remove all emojis (they sound terrible in TTS)
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{2600}-\u{26FF}]/gu, '');
  cleaned = cleaned.replace(/[\u{2700}-\u{27BF}]/gu, '');
  cleaned = cleaned.replace(/[\u{1F000}-\u{1F02F}]/gu, '');
  cleaned = cleaned.replace(/[\u{1F0A0}-\u{1F0FF}]/gu, '');
  
  // Step 6: Handle list items - convert bullets to natural flow
  cleaned = cleaned.replace(/^\s*[-*+•]\s+/gm, '');
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');
  
  // Step 7: Convert headings (text ending with colon) to natural speech
  // "सही जगह और मिट्टी:" becomes "सही जगह और मिट्टी।"
  cleaned = cleaned.replace(/([^:]):\s*$/gm, '$1।');
  cleaned = cleaned.replace(/([^:]):\s*\n/g, '$1। ');
  
  // Step 8: Handle parentheses naturally
  // "(cutting)" becomes "यानी cutting" for better flow
  cleaned = cleaned.replace(/\(([^)]+)\)/g, ' यानी $1 ');
  
  // Step 9: Convert line breaks to natural pauses
  cleaned = cleaned.replace(/\n{3,}/g, '। ');  // Multiple breaks = full stop
  cleaned = cleaned.replace(/\n\n/g, '। ');     // Double break = full stop
  cleaned = cleaned.replace(/\n/g, '। ');       // Single break = full stop
  
  // Step 10: Clean up punctuation
  cleaned = cleaned.replace(/\.{2,}/g, '।');    // Multiple dots to single Devanagari full stop
  cleaned = cleaned.replace(/,{2,}/g, ',');     // Multiple commas to single
  cleaned = cleaned.replace(/!{2,}/g, '!');     // Multiple exclamations to single
  
  // Step 11: Fix spacing around punctuation
  cleaned = cleaned.replace(/\s+([,.!?;।])/g, '$1');      // Remove space before punctuation
  cleaned = cleaned.replace(/([,.!?;।])\s*/g, '$1 ');    // Add single space after
  
  // Step 12: Handle numbers and ranges naturally
  // Keep "7-8" as is, don't break it up
  cleaned = cleaned.replace(/(\d+)\s*-\s*(\d+)/g, '$1 से $2');  // "7-8" becomes "7 से 8"
  
  // Step 13: Remove extra whitespace
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  
  // Step 14: Final cleanup
  cleaned = cleaned.trim();
  
  // Step 15: Ensure proper sentence endings
  if (cleaned && !cleaned.match(/[।.!?]$/)) {
    cleaned += '।';
  }
  
  return cleaned;
};

// Optimized browser TTS with best quality settings
const playBrowserTTS = (text: string, language: 'en' | 'hi'): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Cancel any existing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      // Small delay for cancel to complete
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set optimal language code
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        
        // Optimal voice settings for natural, clear speech
        if (language === 'hi') {
          utterance.rate = 0.85;   // Slightly slower for Hindi clarity
          utterance.pitch = 1.0;   // Natural pitch
          utterance.volume = 1.0;  // Full volume
        } else {
          utterance.rate = 0.9;    // Normal speed for English
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
        }

        // Get all available voices
        const voices = window.speechSynthesis.getVoices();
        console.log('📢 Total voices available:', voices.length);
        
        let selectedVoice = null;
        
        if (language === 'hi') {
          // Find all Hindi voices
          const hindiVoices = voices.filter(voice => 
            voice.lang.toLowerCase().startsWith('hi')
          );
          
          console.log('🇮🇳 Hindi voices found:', hindiVoices.length);
          
          if (hindiVoices.length > 0) {
            console.log('Available Hindi voices:');
            hindiVoices.forEach((voice, index) => {
              console.log(`  ${index + 1}. ${voice.name} (${voice.lang}) ${voice.localService ? '[Local]' : '[Remote]'}`);
            });
            
            // Prefer Google voices, then any local voice, then first available
            selectedVoice = 
              hindiVoices.find(v => v.name.toLowerCase().includes('google')) ||
              hindiVoices.find(v => v.localService) ||
              hindiVoices[0];
            
            console.log('✅ Selected Hindi voice:', selectedVoice.name, selectedVoice.lang);
          } else {
            console.warn('⚠️ No Hindi voices found! Will use default system voice.');
          }
        } else {
          // Find English voices
          const englishVoices = voices.filter(v => 
            v.lang.toLowerCase().startsWith('en')
          );
          
          console.log('🇬🇧 English voices found:', englishVoices.length);
          
          if (englishVoices.length > 0) {
            // Prefer Indian English for farming context
            selectedVoice = 
              englishVoices.find(v => v.lang === 'en-IN') ||
              englishVoices.find(v => v.name.toLowerCase().includes('google')) ||
              englishVoices[0];
            
            console.log('✅ Selected English voice:', selectedVoice.name, selectedVoice.lang);
          }
        }
        
        // Apply selected voice
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        // Event handlers
        utterance.onstart = () => {
          console.log('🔊 Speech started');
          console.log('   Voice:', utterance.voice?.name || 'System Default');
          console.log('   Lang:', utterance.lang);
          console.log('   Rate:', utterance.rate);
        };

        utterance.onend = () => {
          console.log('✅ Speech completed successfully');
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('❌ Speech error:', event.error, event);
          
          // If interrupted, resolve anyway (user might have stopped it)
          if (event.error === 'interrupted' || event.error === 'canceled') {
            resolve();
          } else {
            reject(new Error(`Speech error: ${event.error}`));
          }
        };

        // Start speaking
        window.speechSynthesis.speak(utterance);
        
        // Debug log
        console.log('🎤 Speaking text preview:', text.substring(0, 100) + '...');
      }, 100);
    } catch (error) {
      console.error('❌ TTS initialization error:', error);
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

          // Clean and optimize text for natural speech
          const cleanedText = cleanTextForTTS(text);
          console.log('🧹 Original text length:', text.length);
          console.log('🧹 Cleaned text length:', cleanedText.length);
          console.log('🧹 Preview:', cleanedText.substring(0, 150) + '...');

          // Try ElevenLabs first (premium quality)
          let usingElevenLabs = false;
          try {
            console.log('🎙️ Attempting ElevenLabs TTS...');
            
            const response = await api.post('/chat/text-to-speech', {
              text: cleanedText,
              language: get().language
            }, {
              responseType: 'blob',
              timeout: 10000
            });

            if (response.data && response.data.size > 0) {
              console.log('✅ ElevenLabs TTS successful');
              
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
                console.warn('⚠️ Audio playback failed, switching to browser TTS');
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
            console.warn('⚠️ ElevenLabs unavailable:', 
              elevenLabsError instanceof Error ? elevenLabsError.message : 'Unknown error'
            );
          }

          // Fallback to browser TTS (always works)
          if (!usingElevenLabs) {
            console.log('🔊 Using browser TTS (high quality mode)');
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
          console.error('❌ Audio playback error:', error);
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
