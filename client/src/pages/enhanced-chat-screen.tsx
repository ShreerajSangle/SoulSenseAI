import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { TopNavBar } from "@/components/top-nav-bar";
import { MessageBubble } from "@/components/message-bubble";
import { InputBar } from "@/components/input-bar";
import { TypingIndicator } from "@/components/typing-indicator";
import { CrisisAlert } from "@/components/crisis-alert";
import { MoodCheckInWidget, MoodCheckInData } from "@/components/mood-checkin-widget";
import { BreathingExercise, GroundingTechnique, CBTJournal } from "@/components/micro-tools";
import { MoodTrackerDashboard } from "@/components/mood-tracker-dashboard";
import { VoiceInterface, useVoiceInterface, getPersonaVoice } from "@/components/voice-interface";
import { SessionFeedbackDialog } from "@/components/ui/session-feedback-dialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import { 
  MessageSquare, 
  Heart, 
  Brain, 
  Wind, 
  Target,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ArrowLeft,
  BarChart3
} from "lucide-react";

export default function EnhancedChatScreen() {
  const { persona: personaId } = useParams();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Chat state
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [emotionContext, setEmotionContext] = useState<any>(null);

  // Mood check-in state
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(true);
  const [sessionMoodData, setSessionMoodData] = useState<MoodCheckInData | null>(null);
  
  // Session feedback state
  const [showSessionFeedback, setShowSessionFeedback] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [showMoodCheckOut, setShowMoodCheckOut] = useState(false);

  // Micro-tools state
  const [activeMicroTool, setActiveMicroTool] = useState<'breathing' | 'grounding' | 'cbt' | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  // UI state
  const [suggestedTools, setSuggestedTools] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Voice interface
  const { speakText, stopSpeaking } = useVoiceInterface();
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const userId = "anonymous"; // Will be replaced with actual user ID when auth is enabled

  // Fetch persona data
  const { data: persona, isLoading: personaLoading, error: personaError } = useQuery({
    queryKey: ["/api/personas", personaId],
    queryFn: async () => {
      const response = await fetch(`/api/personas/${personaId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch persona: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!personaId
  });

  // Fetch conversation messages
  const { data: conversationMessages } = useQuery({
    queryKey: ["/api/conversations", conversationId, "messages"],
    queryFn: () => fetch(`/api/conversations/${conversationId}/messages`).then(res => res.json()),
    enabled: !!conversationId
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (data: { userId: string; personaId: string; title?: string }) => {
      const response = await apiRequest("/api/conversations", "POST", data);
      return await response.json();
    },
    onSuccess: (conversation) => {
      setConversationId(conversation.id);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    }
  });

  // Send message mutation with emotion analysis
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { 
      message: string; 
      conversationId?: number; 
      emotionContext?: any;
      moodData?: MoodCheckInData;
    }) => {
      const response = await apiRequest("/api/chat/enhanced-message", "POST", {
        message: data.message,
        personaId,
        userId,
        conversationId: data.conversationId,
        emotionContext: data.emotionContext,
        moodData: data.moodData,
        isFirstMessage: !data.conversationId
      });
      return await response.json();
    },
    onSuccess: (response) => {
      const { conversation, aiMessage, emotionAnalysis, suggestedMicroTools, crisisDetected } = response;
      
      if (!conversationId) {
        setConversationId(conversation.id);
      }

      setMessages(prev => [...prev, aiMessage]);
      setEmotionContext(emotionAnalysis);
      setSuggestedTools(suggestedMicroTools || []);
      
      if (crisisDetected) {
        setShowCrisisAlert(true);
      }

      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    }
  });

  // Mood entry mutation
  const moodEntryMutation = useMutation({
    mutationFn: async (data: MoodCheckInData) => {
      const response = await apiRequest("/api/mood-entries", "POST", {
        ...data,
        userId,
        sessionId: conversationId
      });
      return await response.json();
    }
  });

  // Micro-tool usage mutation
  const microToolMutation = useMutation({
    mutationFn: async (data: {
      toolType: string;
      toolName: string;
      duration?: number;
      completed: boolean;
      effectiveness?: number;
    }) => {
      const response = await apiRequest("/api/micro-tools/usage", "POST", {
        ...data,
        userId,
        sessionId: conversationId
      });
      return await response.json();
    }
  });

  // Message feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async (data: { messageId: number; rating: 'thumbs_up' | 'thumbs_down'; feedback?: string }) => {
      const response = await apiRequest(`/api/messages/${data.messageId}/feedback`, "POST", {
        rating: data.rating,
        feedback: data.feedback,
        userId
      });
      return await response.json();
    }
  });

  useEffect(() => {
    if (conversationMessages) {
      setMessages(conversationMessages);
    }
  }, [conversationMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation on first message
  useEffect(() => {
    if (personaId && !conversationId && !createConversationMutation.isPending) {
      // Wait for mood check-in to complete before creating conversation
    }
  }, [personaId, conversationId]);

  const handleMoodCheckInComplete = async (moodData: MoodCheckInData) => {
    setSessionMoodData(moodData);
    setShowMoodCheckIn(false);
    
    // Save mood entry
    await moodEntryMutation.mutateAsync(moodData);
    
    // Create conversation if it doesn't exist
    if (!conversationId) {
      await createConversationMutation.mutateAsync({
        userId,
        personaId: personaId!,
        title: `Session with ${persona?.name}`
      });
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!personaId) return;
    
    setIsLoading(true);
    
    try {
      // Add user message to chat immediately
      const userMessage = {
        id: Date.now(),
        content: message,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      const response = await sendMessageMutation.mutateAsync({
        message,
        conversationId: conversationId || undefined,
        emotionContext,
        moodData: sessionMoodData || undefined
      });
      
      // Speak AI response if voice is enabled
      if (voiceEnabled && response?.aiMessage?.content) {
        const personaVoice = getPersonaVoice(personaId!);
        speakText(response.aiMessage.content, personaVoice);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicroToolComplete = async (toolType: string, toolName: string, duration: number, effectiveness?: number) => {
    await microToolMutation.mutateAsync({
      toolType,
      toolName,
      duration,
      completed: true,
      effectiveness
    });
    setActiveMicroTool(null);
  };

  const handleMessageFeedback = async (messageId: number, rating: 'thumbs_up' | 'thumbs_down') => {
    await feedbackMutation.mutateAsync({ messageId, rating });
  };

  const handleEndSession = () => {
    setShowSessionFeedback(true);
  };

  const handleSessionFeedbackSubmit = async (feedback: any) => {
    try {
      // Submit session feedback using useMutation for proper React Query integration
      const response = await fetch('/api/session-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          personaId,
          ...feedback,
          sessionDuration: getSessionDuration()
        })
      });
      
      if (!response.ok) throw new Error('Failed to submit feedback');
    } catch (error) {
      console.error('Failed to submit session feedback:', error);
    }
  };

  const getSessionDuration = () => {
    const duration = Date.now() - sessionStartTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const handleMoodCheckOutComplete = async (moodData: MoodCheckInData) => {
    await moodEntryMutation.mutateAsync(moodData);
    setShowMoodCheckOut(false);
    // Navigate to summary or dashboard
  };

  if (personaLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (personaError) {
    console.error('Persona error:', personaError);
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4">
        <div>Error loading persona: {personaError.message}</div>
        <div>Persona ID: {personaId}</div>
        <Button onClick={() => setLocation("/")}>Back to Home</Button>
      </div>
    );
  }

  if (!persona) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4">
        <div>Persona not found</div>
        <div>Persona ID: {personaId}</div>
        <Button onClick={() => setLocation("/")}>Back to Home</Button>
      </div>
    );
  }

  // Show mood check-in first
  if (showMoodCheckIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
        <MoodCheckInWidget
          type="check_in"
          onComplete={handleMoodCheckInComplete}
          onSkip={() => setShowMoodCheckIn(false)}
        />
      </div>
    );
  }

  // Show mood check-out
  if (showMoodCheckOut) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
        <MoodCheckInWidget
          type="check_out"
          onComplete={handleMoodCheckOutComplete}
          onSkip={() => setShowMoodCheckOut(false)}
        />
      </div>
    );
  }

  // Show active micro-tool
  if (activeMicroTool) {
    const toolComponents = {
      breathing: (
        <BreathingExercise
          onComplete={(duration, effectiveness) => handleMicroToolComplete('breathing', 'breathing-exercise', duration, effectiveness)}
          onClose={() => setActiveMicroTool(null)}
        />
      ),
      grounding: (
        <GroundingTechnique
          onComplete={(duration, effectiveness) => handleMicroToolComplete('grounding', '5-4-3-2-1', duration, effectiveness)}
          onClose={() => setActiveMicroTool(null)}
        />
      ),
      cbt: (
        <CBTJournal
          onComplete={(duration, effectiveness) => handleMicroToolComplete('cbt_journal', 'thought-record', duration, effectiveness)}
          onClose={() => setActiveMicroTool(null)}
        />
      )
    };

    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
        {toolComponents[activeMicroTool]}
      </div>
    );
  }

  // Show dashboard
  if (showDashboard) {
    return (
      <div className="h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" onClick={() => setShowDashboard(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Chat
            </Button>
            <h1 className="text-lg font-semibold">Your Mental Health Dashboard</h1>
            <div></div>
          </div>
        </div>
        <div className="p-4 max-w-6xl mx-auto">
          <MoodTrackerDashboard userId={userId} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Crisis Alert */}
      {showCrisisAlert && (
        <CrisisAlert onClose={() => setShowCrisisAlert(false)} />
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <TopNavBar 
          persona={persona} 
          onBack={() => setLocation("/")}
        />
        
        {/* Hidden Emotion & Tools Bar - emotion detection indicators removed */}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="group">
            <MessageBubble 
              message={message} 
              persona={message.sender === 'ai' ? persona : undefined}
              isUser={message.sender === 'user'}
            />
            
            {/* Feedback buttons for AI messages */}
            {message.sender === 'ai' && (
              <div className="flex items-center gap-2 mt-2 ml-12 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMessageFeedback(message.id, 'thumbs_up')}
                  className="h-6 w-6 p-0"
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMessageFeedback(message.id, 'thumbs_down')}
                  className="h-6 w-6 p-0"
                >
                  <ThumbsDown className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        ))}
        
        {isLoading && <TypingIndicator persona={persona} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEndSession}
          >
            End Session
          </Button>
          
          <div className="flex gap-1 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveMicroTool('breathing')}
            >
              <Wind className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveMicroTool('grounding')}
            >
              <Target className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveMicroTool('cbt')}
            >
              <Brain className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <InputBar onSendMessage={handleSendMessage} disabled={isLoading} />
          <VoiceInterface 
            onTranscription={handleSendMessage}
            isEnabled={voiceEnabled}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={voiceEnabled ? 'text-green-600' : 'text-gray-400'}
          >
            {voiceEnabled ? 'Voice On' : 'Voice Off'}
          </Button>
        </div>
      </div>

      {/* Session Feedback Dialog */}
      <SessionFeedbackDialog
        open={showSessionFeedback}
        onClose={() => setShowSessionFeedback(false)}
        personaName={persona.name}
        sessionDuration={getSessionDuration()}
        onSubmit={handleSessionFeedbackSubmit}
      />
    </div>
  );
}