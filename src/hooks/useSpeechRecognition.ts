import { useState, useEffect, useRef, useMemo } from 'react';

interface SpeechRecognitionOptions {
  language: 'en' | 'hi';
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

export const useSpeechRecognition = ({
  language,
  onResult,
  onError
}: SpeechRecognitionOptions) => {
  const isSupported = useMemo(() => {
    const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    if (supported) {
      console.log('✅ Speech Recognition supported');
    } else {
      console.warn('⚠️ Speech Recognition NOT supported');
    }
    return supported;
  }, []);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // More aggressive settings for better capture
    recognition.continuous = false; // Will auto-restart on error
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    
    console.log('🎤 Initialized with:', {
      lang: recognition.lang,
      continuous: recognition.continuous,
      interimResults: recognition.interimResults
    });
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      console.log('🎤 onResult triggered!');
      
      try {
        let finalTranscript = '';
        
        // Process all results
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += transcript;
            console.log('✅ FINAL:', transcript, '| Confidence:', result[0].confidence);
          } else {
            // Just log interim results, no need to store
            console.log('⏳ INTERIM:', transcript);
          }
        }
        
        // Send final result
        if (finalTranscript.trim()) {
          console.log('📤 Sending final result:', finalTranscript);
          onResult(finalTranscript.trim());
          
          // Stop after final result
          setTimeout(() => {
            if (recognitionRef.current) {
              console.log('🛑 Stopping after final result');
              recognitionRef.current.stop();
              setIsListening(false);
            }
          }, 100);
        }
      } catch (error) {
        console.error('❌ Result processing error:', error);
        onError('Failed to process speech');
      }
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('❌ Error event:', event.error, event);
      
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      
      switch (event.error) {
        case 'no-speech':
          console.log('🔄 No speech - will auto-restart...');
          // Auto-restart after short delay
          restartTimeoutRef.current = window.setTimeout(() => {
            if (isListening && recognitionRef.current) {
              try {
                console.log('🔄 Restarting recognition...');
                recognitionRef.current.start();
              } catch (error) {
                console.log('Restart failed:', error);
                setIsListening(false);
              }
            }
          }, 500);
          break;
          
        case 'audio-capture':
          onError('🎤 Cannot access microphone. Check permissions.');
          setIsListening(false);
          break;
          
        case 'not-allowed':
          onError('🎤 Microphone access denied. Please allow in browser settings.');
          setIsListening(false);
          break;
          
        case 'network':
          onError('🌐 Network error. Check internet connection.');
          setIsListening(false);
          break;
          
        case 'aborted':
          console.log('Recognition aborted');
          setIsListening(false);
          break;
          
        default:
          onError(`Speech error: ${event.error}`);
          setIsListening(false);
      }
    };
    
    recognition.onend = () => {
      console.log('🏁 Recognition ended. isListening:', isListening);
      
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
    };
    
    recognition.onstart = () => {
      console.log('🎙️ Recognition STARTED - Speak now!');
      console.log('   Language:', recognition.lang);
      console.log('   Continuous:', recognition.continuous);
      console.log('   Interim:', recognition.interimResults);
      setIsListening(true);
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [language, onResult, onError, isSupported, isListening]);

  const startListening = () => {
    console.log('🎬 startListening called');
    
    if (!isSupported) {
      console.error('❌ Not supported');
      onError('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      console.warn('⚠️ Already listening');
      return;
    }

    if (!recognitionRef.current) {
      console.error('❌ Recognition not initialized');
      return;
    }

    try {
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      console.log('🎤 Starting with language:', recognitionRef.current.lang);
      recognitionRef.current.start();
    } catch (error) {
      console.error('❌ Start failed:', error);
      onError('Failed to start. Try again.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    console.log('🛑 stopListening called');
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('❌ Stop failed:', error);
      }
    }
    
    setIsListening(false);
  };

  return {
    isListening,
    isSupported,
    startListening,
    stopListening
  };
};
