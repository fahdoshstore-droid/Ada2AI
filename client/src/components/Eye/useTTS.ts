import { useState, useCallback, useRef, useEffect } from 'react';

export interface UseTTSOptions {
  language?: 'ar-SA' | 'en-US';
  rate?: number;      // 0.1-10, default 1
  pitch?: number;     // 0-2, default 1
  volume?: number;    // 0-1, default 1
  onEnd?: () => void;
  onStart?: () => void;
  onBoundary?: (event: SpeechSynthesisEvent) => void;
}

export interface UseTTSReturn {
  speak: (text: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  voices: SpeechSynthesisVoice[];
  arabicVoice: SpeechSynthesisVoice | null;
  isSupported: boolean;
  currentText: string;
}

/**
 * Hook for browser-native text-to-speech.
 * Automatically selects the best Arabic voice available.
 * Falls back to text-only display if no voices are available.
 */
export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  const {
    language = 'ar-SA',
    rate = 1,
    pitch = 1,
    volume = 1,
    onEnd,
    onStart,
    onBoundary,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [arabicVoice, setArabicVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [currentText, setCurrentText] = useState('');

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load voices (they load asynchronously)
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Find the best Arabic voice
      const langPrefix = language.split('-')[0]; // 'ar' from 'ar-SA'

      // Priority: exact language match > language prefix > any Arabic
      const exactMatch = availableVoices.find(v => v.lang === language);
      const prefixMatch = availableVoices.find(v => v.lang.startsWith(langPrefix));
      const anyArabic = availableVoices.find(v => v.lang.startsWith('ar'));

      const bestVoice = exactMatch || prefixMatch || anyArabic || null;
      setArabicVoice(bestVoice ?? null);
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      speechSynthesis.cancel();
    };
  }, [language, isSupported]);

  const speak = useCallback((text: string) => {
    if (!isSupported) return;

    // Cancel any in-progress speech
    speechSynthesis.cancel();
    setCurrentText(text);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Set the voice (Arabic preferred)
    if (arabicVoice) {
      utterance.voice = arabicVoice;
      utterance.lang = arabicVoice.lang;
    } else {
      utterance.lang = language;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentText('');
      onEnd?.();
    };

    utterance.onerror = (event) => {
      // "canceled" is normal when we call cancel() — don't treat it as an error
      if (event.error !== 'canceled') {
        setIsSpeaking(false);
        setIsPaused(false);
      }
    };

    utterance.onboundary = onBoundary ?? null;

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [isSupported, rate, pitch, volume, arabicVoice, language, onEnd, onStart, onBoundary]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentText('');
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported || !isSpeaking) return;
    speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return;
    speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported, isPaused]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    voices,
    arabicVoice,
    isSupported,
    currentText,
  };
}