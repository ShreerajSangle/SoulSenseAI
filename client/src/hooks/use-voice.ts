import { useState, useRef, useCallback, useEffect } from 'react';

interface VoiceHookReturn {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  confidence: number;
  startListening: () => Promise<void>;
  stopListening: () => void;
  speak: (text: string, voice?: SpeechSynthesisVoice) => Promise<void>;
  stopSpeaking: () => void;
  clearTranscript: () => void;
  isSupported: boolean;
  error: string | null;
  voices: SpeechSynthesisVoice[];
}

export function useVoice(): VoiceHookReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  useEffect(() => {
    if (isSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        setTranscript(result.transcript);
        setConfidence(result.confidence || 0);
      };

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        setError(event.error);
        setIsListening(false);
      };
    }

    // Load voices
    const loadVoices = () => {
      setVoices(speechSynthesis.getVoices());
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (utteranceRef.current) {
        speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  const startListening = useCallback(async (): Promise<void> => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition not supported');
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setTranscript('');
      setConfidence(0);
      setError(null);
      recognitionRef.current.start();
    } catch (err) {
      setError('Microphone access denied');
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const speak = useCallback(async (text: string, voice?: SpeechSynthesisVoice): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Stop any current speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;

      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      speechSynthesis.speak(utterance);
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    confidence,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearTranscript,
    isSupported,
    error,
    voices
  };
}