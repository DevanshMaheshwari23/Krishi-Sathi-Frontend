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

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    // Get the Speech Recognition constructor
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    // Create recognition instance
    const recognition = new SpeechRecognition();
    
    // Configure recognition
    recognition.continuous = false; // Stop after one result
    recognition.interimResults = false; // Only final results
    recognition.maxAlternatives = 1;
    
    // Set language
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    
    console.log('🎤 Speech Recognition initialized with language:', recognition.lang);
    
    // Handle results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      try {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Recognized text:', transcript);
        console.log('🎤 Confidence:', event.results[0][0].confidence);
        
        if (transcript && transcript.trim()) {
          onResult(transcript);
        }
        
        setIsListening(false);
      } catch (error) {
        console.error('❌ Result processing error:', error);
        onError('Failed to process speech result');
        setIsListening(false);
      }
    };
    
    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('❌ Speech Recognition error:', event.error);
      
      let errorMessage = 'Speech recognition failed';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not accessible. Check permissions.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          break;
        case 'network':
          errorMessage = 'Network error. Check your internet connection.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition aborted';
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
      setIsListening(false);
    };
    
    // Handle start
    recognition.onstart = () => {
      console.log('🎤 Speech Recognition started');
      setIsListening(true);
    };
    
    recognitionRef.current = recognition;
    
    return () => {
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
        console.log('🎤 Stopping recognition');
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
