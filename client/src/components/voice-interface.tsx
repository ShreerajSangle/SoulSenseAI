import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, Pause, Play } from "lucide-react";

interface VoiceInterfaceProps {
  onTranscription: (text: string) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  isEnabled?: boolean;
}

export function VoiceInterface({ 
  onTranscription, 
  onSpeechStart, 
  onSpeechEnd, 
  isEnabled = true 
}: VoiceInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcription, setTranscription] = useState("");
  
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition && speechSynthesis) {
      setIsSupported(true);
      synthRef.current = speechSynthesis;
      
      // Initialize speech recognition
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        setIsRecording(true);
        onSpeechStart?.();
      };
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscription(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          onTranscription(finalTranscript);
          setTranscription("");
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        onSpeechEnd?.();
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
        onSpeechEnd?.();
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [onTranscription, onSpeechStart, onSpeechEnd]);

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      // Stop any current speech synthesis
      if (synthRef.current) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
      
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  const speakText = (text: string, voice?: string) => {
    if (!synthRef.current || !isSupported) return;
    
    // Cancel any ongoing speech
    synthRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    // Configure voice settings
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Select voice based on persona if provided
    const voices = synthRef.current.getVoices();
    if (voice && voices.length > 0) {
      const selectedVoice = voices.find(v => 
        v.name.toLowerCase().includes(voice.toLowerCase()) ||
        v.lang.includes('en')
      );
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const pauseSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.pause();
    }
  };

  const resumeSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.resume();
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <p className="text-sm text-yellow-800">
          Voice features are not supported in your browser. Please use Chrome, Safari, or Edge for voice interaction.
        </p>
      </Card>
    );
  }

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Voice Input */}
      <div className="relative">
        <Button
          variant={isRecording ? "destructive" : "outline"}
          size="sm"
          onClick={isRecording ? stopRecording : startRecording}
          className={`${isRecording ? 'animate-pulse' : ''}`}
          disabled={isSpeaking}
        >
          {isRecording ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>
        
        {transcription && (
          <div className="absolute bottom-full mb-2 left-0 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap max-w-48 truncate">
            {transcription}
          </div>
        )}
      </div>

      {/* Voice Output Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={isSpeaking ? stopSpeaking : undefined}
          disabled={!isSpeaking}
          className={isSpeaking ? 'bg-green-50 border-green-200' : ''}
        >
          {isSpeaking ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
        
        {isSpeaking && (
          <Button
            variant="outline"
            size="sm"
            onClick={synthRef.current?.speaking && !synthRef.current?.paused ? pauseSpeaking : resumeSpeaking}
          >
            {synthRef.current?.paused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// Hook for easy voice interface integration
export function useVoiceInterface() {
  const voiceRef = useRef<{
    speakText: (text: string, voice?: string) => void;
    stopSpeaking: () => void;
    isSupported: boolean;
  } | null>(null);

  const speakText = (text: string, voice?: string) => {
    if (voiceRef.current) {
      voiceRef.current.speakText(text, voice);
    }
  };

  const stopSpeaking = () => {
    if (voiceRef.current) {
      voiceRef.current.stopSpeaking();
    }
  };

  return {
    speakText,
    stopSpeaking,
    voiceRef
  };
}

// Persona voice mapping
export const getPersonaVoice = (personaId: string): string => {
  const voiceMap: Record<string, string> = {
    sarah: 'female', // Professional, warm female voice
    alex: 'male',   // Casual, friendly male voice  
    marcus: 'male', // Confident, motivational male voice
    maya: 'female'  // Gentle, soothing female voice
  };
  
  return voiceMap[personaId] || 'female';
};