import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseVoiceInputOptions {
  language?: 'ar-SA' | 'en-US';
  continuous?: boolean;
  interimResults?: boolean;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  resetTranscript: () => void;
}

interface SpeechRecognitionResult {
  0?: { transcript: string; confidence: number };
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionEvent {
  results: {
    length: number;
    item: (i: number) => SpeechRecognitionResult;
  };
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
  onstart: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

/**
 * Hook for browser-native voice input using Web Speech API.
 * Falls back gracefully when not supported (isSupported = false).
 * Default language is Arabic (ar-SA).
 */
export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const {
    language = 'ar-SA',
    continuous = false,
    interimResults = true,
    onTranscript,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const manualStopRef = useRef(false);

  useEffect(() => {
    // Check for browser support — webkit prefix for Safari
    const win = window as unknown as {
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
      SpeechRecognition?: new () => SpeechRecognitionInstance;
    };

    const SpeechRecognitionAPI = win.webkitSpeechRecognition || win.SpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results.item(i);
        const text = result[0]?.transcript || '';

        if (result.isFinal) {
          finalTranscript += text;
        } else {
          interim += text;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript);
        onTranscript?.(finalTranscript, true);
      }

      if (interim) {
        setInterimTranscript(interim);
        onTranscript?.(interim, false);
      }
    };

    recognition.onerror = (event: { error: string }) => {
      // "aborted" is normal when we call stop(), ignore it
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        onError?.(event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      // If not manually stopped and continuous mode, restart
      if (!manualStopRef.current && continuous) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
      manualStopRef.current = false;
    };

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current = recognition;
    setIsSupported(true);

    return () => {
      try {
        recognition.abort();
      } catch {
        // Ignore
      }
    };
  }, [language, continuous, interimResults, onTranscript, onError]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    manualStopRef.current = false;
    try {
      recognitionRef.current.start();
    } catch {
      // May already be started
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    manualStopRef.current = true;
    try {
      recognitionRef.current.stop();
    } catch {
      // Ignore
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}