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
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [currentEmotion, setCurrentEmotion] = useState<string>("");
  const [sessionEnded, setSessionEnded] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Therapeutic panel state
  const [showTherapeuticPanel, setShowTherapeuticPanel] = useState(true);
  const [analysisStage, setAnalysisStage] = useState<string>("");
  const [crisisAlert, setCrisisAlert] = useState<string>("");
  const [therapeuticInsights, setTherapeuticInsights] = useState<any>(null);
  const [currentTherapeuticContext, setCurrentTherapeuticContext] = useState<any>(null);
  const [moodHistory, setMoodHistory] = useState<Array<{emotion: string, intensity: number, timestamp: Date}>>([]);
  const [memoryStats, setMemoryStats] = useState<any>(null);

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
    
    // Update therapeutic context with initial mood
    const primaryEmotion = moodData.emotions[0] || 'neutral';
    const intensity = moodData.moodRating / 5;
    
    setCurrentTherapeuticContext({
      primaryEmotion,
      intensity,
      valence: moodData.moodRating >= 4 ? 0.8 : moodData.moodRating <= 2 ? -0.6 : 0,
      arousal: intensity
    });

    // Add to mood history
    setMoodHistory(prev => [...prev, {
      emotion: primaryEmotion,
      intensity,
      timestamp: new Date()
    }]);
    
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

      // Try GPT-4o streaming first, fallback to enhanced chat
      let response;
      try {
        await handleStreamingResponse(message.trim());
        return; // Exit early if streaming succeeds
      } catch (streamingError) {
        console.log("Streaming failed, using enhanced chat fallback:", streamingError);
        // Use enhanced chat system as fallback
        response = await sendMessageMutation.mutateAsync({
          message: message.trim(),
          conversationId: conversationId || undefined,
          emotionContext,
          moodData: sessionMoodData || undefined
        });
      }
      
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

  // GPT-4o streaming response handler
  const handleStreamingResponse = async (message: string) => {
    if (!personaId) return;

    setIsStreaming(true);
    setStreamingContent("");
    
    // Abort any previous streaming request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch('/api/chat/gpt4o-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          personaId,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
          userId: 'user-123' // TODO: Get from auth
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      let accumulatedContent = '';
      const aiMessageId = Date.now() + 1;
      
      // Add initial AI message placeholder
      const aiMessage = {
        id: aiMessageId,
        content: '',
        sender: 'ai' as const,
        timestamp: new Date(),
        personaId,
        isStreaming: true
      };
      setMessages(prev => [...prev, aiMessage]);

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6);
              if (jsonStr === '[DONE]') {
                break;
              }
              
              try {
                const data = JSON.parse(jsonStr);
                if (data.content) {
                  accumulatedContent += data.content;
                  setStreamingContent(accumulatedContent);
                  
                  // Update the message in real-time
                  setMessages(prev => prev.map(msg => 
                    msg.id === aiMessageId 
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  ));
                }
                
                if (data.emotion) {
                  setCurrentEmotion(data.emotion);
                  
                  // Update therapeutic context from streaming response
                  if (showTherapeuticPanel && data.therapeuticInsights) {
                    setTherapeuticInsights(data.therapeuticInsights);
                    
                    if (data.emotion.primary) {
                      setMoodHistory(prev => [...prev, {
                        emotion: data.emotion.primary,
                        intensity: data.emotion.intensity || 0.5,
                        timestamp: new Date()
                      }]);
                      
                      setCurrentTherapeuticContext({
                        primaryEmotion: data.emotion.primary,
                        intensity: data.emotion.intensity || 0.5,
                        valence: data.emotion.valence || 0,
                        arousal: data.emotion.arousal || 0.5
                      });
                    }
                    
                    if (data.therapeuticInsights.crisisAlert) {
                      setCrisisAlert(data.therapeuticInsights.crisisAlert);
                    }
                  }
                }
                
                if (data.error) {
                  throw new Error(data.error);
                }
              } catch (parseError) {
                console.warn('Failed to parse streaming data:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Mark streaming as complete
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, isStreaming: false }
          : msg
      ));

      // Speak AI response if voice is enabled
      if (voiceEnabled && accumulatedContent && !sessionEnded) {
        const personaVoice = getPersonaVoice(personaId);
        speakText(accumulatedContent, personaVoice);
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Streaming request aborted');
        return;
      }
      
      console.error('Streaming error:', error);
      
      // Remove the placeholder message on error
      setMessages(prev => prev.filter(msg => !msg.isStreaming));
      
      throw error; // Re-throw to trigger fallback
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      abortControllerRef.current = null;
    }
  };

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

  const getEmotionColor = (emotion: string) => {
    const colors = {
      happy: "bg-yellow-500",
      sad: "bg-blue-500",
      angry: "bg-red-500",
      anxious: "bg-orange-500",
      calm: "bg-green-500",
      excited: "bg-purple-500",
      neutral: "bg-gray-500",
      content: "bg-emerald-500",
      frustrated: "bg-red-600",
      hopeful: "bg-sky-500"
    };
    return colors[emotion as keyof typeof colors] || "bg-gray-500";
  };

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
        
        {/* Therapeutic Panel Toggle */}
        <div className="px-4 py-2 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTherapeuticPanel(!showTherapeuticPanel)}
              className="flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              {showTherapeuticPanel ? "Hide" : "Show"} Therapeutic Insights
            </Button>
            {memoryStats && (
              <div className="flex gap-2 text-xs">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Trust: {Math.round(memoryStats.trustLevel * 100)}%
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Connection: {Math.round(memoryStats.intimacyDepth * 100)}%
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Therapeutic Insights Panel */}
        {showTherapeuticPanel && (
          <div className="w-80 bg-white border-r overflow-y-auto p-4 space-y-4">
            {/* Real-time Analysis */}
            <Card className="border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  Live Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Analysis Stage */}
                {analysisStage && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      {analysisStage}
                    </div>
                  </div>
                )}

                {/* Crisis Alert */}
                {crisisAlert && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 text-sm text-red-700 font-medium">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      {crisisAlert}
                    </div>
                  </div>
                )}

                {/* Current Mood */}
                {currentTherapeuticContext && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Detected Emotion</span>
                      <Badge variant="secondary" className={`text-white ${getEmotionColor(currentTherapeuticContext.primaryEmotion)}`}>
                        {currentTherapeuticContext.primaryEmotion}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Intensity</span>
                        <span>{Math.round(currentTherapeuticContext.intensity * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${currentTherapeuticContext.intensity * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mood History Chart */}
                {moodHistory.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Mood Trend</span>
                    <div className="h-16 flex items-end gap-1 p-2 bg-gray-50 rounded">
                      {moodHistory.slice(-8).map((mood, index) => (
                        <div
                          key={index}
                          className={`w-4 rounded-t ${getEmotionColor(mood.emotion)}`}
                          style={{ height: `${mood.intensity * 100}%` }}
                          title={`${mood.emotion} (${Math.round(mood.intensity * 100)}%)`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Clinical Assessment */}
            {therapeuticInsights?.clinical && (
              <Card className="border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Mental Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Depression Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Depression</span>
                      <Badge variant={therapeuticInsights.clinical.depression.severity === 'minimal' ? 'default' : 'destructive'}>
                        {therapeuticInsights.clinical.depression.severity}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>PHQ-9 Score</span>
                        <span>{therapeuticInsights.clinical.depression.score}/27</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(therapeuticInsights.clinical.depression.score / 27) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Anxiety Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Anxiety</span>
                      <Badge variant={therapeuticInsights.clinical.anxiety.severity === 'minimal' ? 'default' : 'destructive'}>
                        {therapeuticInsights.clinical.anxiety.severity}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>GAD-7 Score</span>
                        <span>{therapeuticInsights.clinical.anxiety.score}/21</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(therapeuticInsights.clinical.anxiety.score / 21) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Suicide Risk */}
                  {therapeuticInsights.clinical.suicideRisk && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-sm text-red-700 font-medium">
                        Elevated Risk Detected
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recommended Interventions */}
            {therapeuticInsights?.interventions && therapeuticInsights.interventions.length > 0 && (
              <Card className="border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    Suggested Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {therapeuticInsights.interventions.slice(0, 3).map((intervention: any, index: number) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-green-800">
                          {intervention.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {intervention.duration}
                        </Badge>
                      </div>
                      <p className="text-xs text-green-700">
                        {intervention.type} technique
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Journaling Prompts */}
            {therapeuticInsights?.journalingPrompts && therapeuticInsights.journalingPrompts.length > 0 && (
              <Card className="border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Reflection Prompts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {therapeuticInsights.journalingPrompts.slice(0, 2).map((prompt: string, index: number) => (
                    <div key={index} className="p-2 bg-blue-50 rounded text-sm text-blue-800">
                      {prompt}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

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
          <InputBar 
            onSendMessage={handleSendMessage} 
            disabled={isLoading || isStreaming || sessionEnded}
            placeholder={sessionEnded ? "Session has ended" : isStreaming ? "AI is responding..." : "Type your message..."}
          />
          <VoiceInterface 
            onTranscription={handleSendMessage}
            isEnabled={voiceEnabled && !sessionEnded}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={voiceEnabled && !sessionEnded ? 'text-green-600' : 'text-gray-400'}
            disabled={sessionEnded}
          >
            {sessionEnded ? 'Voice Off' : voiceEnabled ? 'Voice On' : 'Voice Off'}
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