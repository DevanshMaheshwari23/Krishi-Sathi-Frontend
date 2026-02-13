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
  // Check browser support once and memoize it
  const isSupported = useMemo(() => {
    const supported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    if (supported) {
      console.log('✅ Speech Recognition supported');
    } else {
      console.warn('⚠️ Speech Recognition not supported in this browser');
    }
    return supported;
  }, []);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const hasResultRef = useRef(false);
  const retryCountRef = useRef(0);
  const isManualStopRef = useRef(false);

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    // Get the Speech Recognition constructor
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    // Create recognition instance
    const recognition = new SpeechRecognition();
    
    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    
    // Set language
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    
    console.log('🎤 Speech Recognition initialized with language:', recognition.lang);
    
    // Handle results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      try {
        let finalTranscript = '';
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            console.log('🎤 Final result:', transcript);
            console.log('🎤 Confidence:', event.results[i][0].confidence);
          } else {
            console.log('🎤 Interim result:', transcript);
          }
        }
        
        // If we got a final result, use it
        if (finalTranscript.trim()) {
          hasResultRef.current = true;
          retryCountRef.current = 0; // Reset retry count
          onResult(finalTranscript.trim());
          
          // Auto-stop after getting final result
          isManualStopRef.current = true;
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        }
      } catch (error) {
        console.error('❌ Result processing error:', error);
        onError('Failed to process speech');
        setIsListening(false);
      }
    };
    
    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('❌ Speech Recognition error:', event.error);
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Handle specific errors
      if (event.error === 'no-speech') {
        // Auto-retry up to 3 times for no-speech
        if (retryCountRef.current < 3 && !isManualStopRef.current) {
          retryCountRef.current += 1;
          console.log(`🔄 No speech detected. Auto-retry ${retryCountRef.current}/3...`);
          
          // Restart recognition after a short delay
          setTimeout(() => {
            if (recognitionRef.current && !isManualStopRef.current) {
              try {
                recognitionRef.current.start();
                console.log('🎤 Restarted recognition');
              } catch (e) {
                console.log('Restart failed:', e);
              }
            }
          }, 300);
          return;
        } else {
          onError('🎤 No speech detected. Please speak clearly and try again.');
        }
      } else if (event.error === 'audio-capture') {
        onError('🎤 Microphone not accessible. Please check permissions.');
      } else if (event.error === 'not-allowed') {
        onError('🎤 Microphone permission denied. Please allow access.');
      } else if (event.error === 'network') {
        onError('🌐 Network error. Check your internet connection.');
      } else if (event.error === 'aborted') {
        // Ignore aborted if we got a result
        if (hasResultRef.current) {
          return;
        }
      }
      
      setIsListening(false);
      retryCountRef.current = 0;
    };
    
    // Handle end
    recognition.onend = () => {
      console.log('🎤 Speech Recognition ended');
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Only set listening to false if it was a manual stop or we got a result
      if (isManualStopRef.current || hasResultRef.current) {
        setIsListening(false);
        hasResultRef.current = false;
        isManualStopRef.current = false;
        retryCountRef.current = 0;
      }
    };
    
    // Handle start
    recognition.onstart = () => {
      console.log('🎤 Speech Recognition started - Speak now!');
      setIsListening(true);
      
      // Set overall timeout (30 seconds max)
      timeoutRef.current = window.setTimeout(() => {
        if (recognitionRef.current) {
          console.log('⏱️ Maximum time reached (30s). Stopping...');
          isManualStopRef.current = true;
          recognitionRef.current.stop();
          
          if (!hasResultRef.current) {
            onError('⏱️ Listening timeout. Please try again.');
          }
        }
      }, 30000); // 30 seconds total
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.log('Recognition cleanup:', e);
        }
      }
    };
  }, [language, onResult, onError, isSupported]);

  const startListening = () => {
    if (!isSupported) {
      onError('Speech recognition not supported. Use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      console.warn('⚠️ Already listening');
      return;
    }

    try {
      if (recognitionRef.current) {
        // Reset states
        hasResultRef.current = false;
        isManualStopRef.current = false;
        retryCountRef.current = 0;
        
        // Update language
        recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        console.log('🎤 Starting recognition with language:', recognitionRef.current.lang);
        
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('❌ Start error:', error);
      onError('Failed to start. Please try again.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (!isListening) {
      return;
    }

    try {
      if (recognitionRef.current) {
        console.log('🎤 Manually stopping');
        isManualStopRef.current = true;
        
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        recognitionRef.current.stop();
        retryCountRef.current = 0;
      }
    } catch (error) {
      console.error('❌ Stop error:', error);
      setIsListening(false);
    }
  };

  return {
    isListening,
    isSupported,
    startListening,
    stopListening
  };
};
