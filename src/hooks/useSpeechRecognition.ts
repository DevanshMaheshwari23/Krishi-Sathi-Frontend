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

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    // Get the Speech Recognition constructor
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    // Create recognition instance
    const recognition = new SpeechRecognition();
    
    // Configure recognition for better capture
    recognition.continuous = true; // Keep listening until manually stopped
    recognition.interimResults = true; // Show interim results
    recognition.maxAlternatives = 1;
    
    // Set language
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    
    console.log('🎤 Speech Recognition initialized with language:', recognition.lang);
    
    // Handle results (both interim and final)
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
          onResult(finalTranscript.trim());
          
          // Auto-stop after getting final result
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        }
      } catch (error) {
        console.error('❌ Result processing error:', error);
        onError('Failed to process speech result');
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
      
      let errorMessage = 'Speech recognition failed';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = '🎤 No speech detected. Please speak clearly and try again.';
          break;
        case 'audio-capture':
          errorMessage = '🎤 Microphone not accessible. Please check your microphone.';
          break;
        case 'not-allowed':
          errorMessage = '🎤 Microphone permission denied. Please allow microphone access in browser settings.';
          break;
        case 'network':
          errorMessage = '🌐 Network error. Please check your internet connection.';
          break;
        case 'aborted':
          // Don't show error if we got a result
          if (hasResultRef.current) {
            return;
          }
          errorMessage = 'Speech recognition was stopped';
          break;
        case 'language-not-supported':
          errorMessage = 'Language not supported by your browser';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      onError(errorMessage);
      setIsListening(false);
    };
    
    // Handle end
    recognition.onend = () => {
      console.log('🎤 Speech Recognition ended');
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // If no result was captured, show message
      if (isListening && !hasResultRef.current) {
        onError('🎤 No speech detected. Please try speaking again.');
      }
      
      setIsListening(false);
      hasResultRef.current = false;
    };
    
    // Handle start
    recognition.onstart = () => {
      console.log('🎤 Speech Recognition started - Listening...');
      setIsListening(true);
      hasResultRef.current = false;
      
      // Set a timeout to auto-stop after 10 seconds
      timeoutRef.current = window.setTimeout(() => {
        if (recognitionRef.current && isListening) {
          console.log('⏱️ Timeout: Stopping recognition after 10 seconds');
          recognitionRef.current.stop();
        }
      }, 10000); // 10 seconds max
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
  }, [language, onResult, onError, isSupported, isListening]);

  const startListening = () => {
    if (!isSupported) {
      onError('Speech recognition is not supported in your browser. Try Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      console.warn('⚠️ Already listening');
      return;
    }

    try {
      if (recognitionRef.current) {
        // Update language before starting
        recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        console.log('🎤 Starting recognition with language:', recognitionRef.current.lang);
        
        hasResultRef.current = false;
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error('❌ Start recognition error:', error);
      onError('Failed to start speech recognition. Please try again.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (!isListening) {
      return;
    }

    try {
      if (recognitionRef.current) {
        console.log('🎤 Manually stopping recognition');
        
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        
        recognitionRef.current.stop();
      }
    } catch (error) {
      console.error('❌ Stop recognition error:', error);
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
