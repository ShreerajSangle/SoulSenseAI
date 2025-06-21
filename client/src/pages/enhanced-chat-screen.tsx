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

  // Fetch persona data with improved error handling
  const { data: persona, isLoading: personaLoading, error: personaError } = useQuery({
    queryKey: ["/api/personas", personaId],
    queryFn: async () => {
      const response = await fetch(`/api/personas/${personaId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch persona: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!personaId,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
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
    // Improved auto-scrolling with delay for better UX
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    };
    
    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

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
    if (!personaId || !message.trim() || sessionEnded) return;
    
    setIsLoading(true);
    
    try {
      // Add user message to chat immediately for better UX
      const userMessage = {
        id: Date.now(),
        content: message,
        sender: 'user' as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      const response = await sendMessageMutation.mutateAsync({
        message: message.trim(),
        conversationId: conversationId || undefined,
        emotionContext,
        moodData: sessionMoodData || undefined
      });
      
      // Don't process AI response if session has ended
      if (sessionEnded) return;
      
      // Update conversation ID if this was the first message
      if (response?.conversationId && !conversationId) {
        setConversationId(response.conversationId);
      }
      
      // Add AI response to messages
      if (response?.aiMessage) {
        setMessages(prev => [...prev, response.aiMessage]);
      }
      
      // Update suggested tools based on response
      if (response?.suggestedMicroTools) {
        setSuggestedTools(response.suggestedMicroTools);
      }
      
      // Check for crisis detection
      if (response?.crisisDetected) {
        setShowCrisisAlert(true);
      }
      
      // Speak AI response if voice is enabled and session hasn't ended
      if (voiceEnabled && response?.aiMessage?.content && !sessionEnded) {
        const personaVoice = getPersonaVoice(personaId!);
        speakText(response.aiMessage.content, personaVoice);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the optimistically added user message on error
      setMessages(prev => prev.slice(0, -1));
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

  const [sessionEnded, setSessionEnded] = useState(false);
  
  const handleEndSession = () => {
    if (sessionEnded) return;
    
    // Stop any ongoing speech
    stopSpeaking();
    
    // Mark session as ended to prevent new AI responses
    setSessionEnded(true);
    
    // Show session feedback
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
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Start your conversation with {persona.name}</h3>
              <p className="text-gray-600">Share what's on your mind. I'm here to listen and support you.</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div key={`${message.id}-${index}`} className="group">
              <MessageBubble 
                message={message} 
                persona={message.sender === 'ai' ? persona : undefined}
                isUser={message.sender === 'user'}
              />
              
              {/* Feedback buttons for AI messages */}
              {message.sender === 'ai' && (
                <div className="flex items-center gap-2 mt-2 ml-14 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMessageFeedback(message.id, 'thumbs_up')}
                    className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMessageFeedback(message.id, 'thumbs_down')}
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <TypingIndicator persona={persona} />
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-white p-4">
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant={sessionEnded ? "secondary" : "destructive"}
            size="sm"
            onClick={handleEndSession}
            disabled={sessionEnded}
            className={sessionEnded ? "opacity-50 cursor-not-allowed" : ""}
          >
            {sessionEnded ? "Session Ended" : "End Session"}
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