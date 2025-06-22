import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";


import { MessageBubble } from "@/components/message-bubble";
import { TypingIndicator } from "@/components/typing-indicator";
import { MoodCheckInWidget, MoodCheckInData } from "@/components/mood-checkin-widget";
import { MoodTrackerDashboard } from "@/components/mood-tracker-dashboard";
import RedesignedSessionHistory from "@/components/redesigned-session-history";
import { SimpleInput } from "@/components/simple-input";

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
  BarChart3,
  Clock,
  Mic,
  Calendar,
  LogOut
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

  // Session history state
  const [showUnifiedHistory, setShowUnifiedHistory] = useState(false);

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

  // GPT-4o persona streaming response handler
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
      const response = await fetch('/api/chat/gpt4o-persona-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          personaId,
          userId: 'user-123', // TODO: Get from auth
          conversationId: conversationId || undefined,
          isFirstMessage: !conversationId,
          moodData: sessionMoodData,
          emotionalContext: emotionContext
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
                
                // Handle conversation creation
                if (data.type === "conversation" && data.conversation) {
                  setConversationId(data.conversation.id);
                }
                
                // Handle streaming content chunks
                if (data.type === "chunk" && data.content) {
                  accumulatedContent = data.content; // GPT-4o sends full content, not incremental
                  setStreamingContent(accumulatedContent);
                  
                  // Update the message in real-time
                  setMessages(prev => prev.map(msg => 
                    msg.id === aiMessageId 
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  ));
                  
                  if (data.emotion) {
                    setCurrentEmotion(data.emotion);
                  }
                }
                
                // Handle completion
                if (data.type === "complete") {
                  if (data.aiMessage) {
                    // Update the message with final content and database ID
                    setMessages(prev => prev.map(msg => 
                      msg.id === aiMessageId 
                        ? { 
                            ...msg, 
                            id: data.aiMessage.id,
                            content: data.aiMessage.content,
                            isStreaming: false 
                          }
                        : msg
                    ));
                  }
                  
                  if (data.emotion) {
                    setCurrentEmotion(data.emotion);
                  }
                  
                  if (data.conversationStats) {
                    // Update any conversation stats if needed
                    console.log('Conversation stats:', data.conversationStats);
                  }
                  
                  break; // Exit streaming loop
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

  const handleSessionSelect = (sessionId: string) => {
    console.log('Loading session:', sessionId);
    // In a real app, this would load the selected session data
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-300 via-purple-200 to-purple-400 relative overflow-hidden">
      {/* Background Elements matching homepage */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-24 h-24 bg-gradient-to-r from-pink-300 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>



      {/* Main Chat Container */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Crisis Alert */}
        {showCrisisAlert && (
          <CrisisAlert onClose={() => setShowCrisisAlert(false)} />
        )}

        {/* Elegant Header matching homepage aesthetic */}
        <div className="bg-white/90 backdrop-blur-xl border-b border-purple-100/50 shadow-lg">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/")}
                className="text-purple-700 hover:bg-purple-50 rounded-2xl"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Home
              </Button>
              
              {persona && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">{persona.emoji}</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-purple-900">{persona.name}</h1>
                    <p className="text-sm text-purple-600">{persona.role}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Clean Header Actions - Only History */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUnifiedHistory(true)}
                className="text-purple-700 hover:bg-purple-50 rounded-xl px-4 py-2"
              >
                <Clock className="w-4 h-4 mr-2" />
                History
              </Button>

              {/* Connection Status */}
              {memoryStats && (
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                    Trust {Math.round(memoryStats.trustLevel * 100)}%
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex transition-all duration-300">
          {/* Chat Messages Container */}
          <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-sm rounded-3xl m-6 shadow-xl border border-white/50 overflow-hidden">
            {/* Therapeutic Context Bar (Subtle) */}
            {currentTherapeuticContext && (
              <div className="px-6 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100/50">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-purple-700">
                        Emotion: {currentTherapeuticContext.primaryEmotion}
                      </span>
                    </div>
                    <div className="w-px h-4 bg-purple-200"></div>
                    <span className="text-purple-600">
                      Intensity: {Math.round(currentTherapeuticContext.intensity * 100)}%
                    </span>
                  </div>
                  
                  {/* Suggested Tools */}
                  {suggestedTools.length > 0 && (
                    <div className="flex gap-2">
                      {suggestedTools.slice(0, 2).map((tool, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="text-xs text-purple-600 hover:bg-purple-100 rounded-xl"
                          onClick={() => {
                            if (tool === 'breathing') setActiveMicroTool('breathing');
                            if (tool === 'grounding') setActiveMicroTool('grounding');
                            if (tool === 'cbt') setActiveMicroTool('cbt');
                          }}
                        >
                          {tool === 'breathing' && <Wind className="w-3 h-3 mr-1" />}
                          {tool === 'grounding' && <Target className="w-3 h-3 mr-1" />}
                          {tool === 'cbt' && <Brain className="w-3 h-3 mr-1" />}
                          {tool}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Welcome Message */}
              {messages.length === 0 && !showMoodCheckIn && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    {persona && <span className="text-3xl">{persona.emoji}</span>}
                  </div>
                  <h3 className="text-2xl font-bold text-purple-900 mb-3">
                    Welcome! I'm {persona?.name}
                  </h3>
                  <p className="text-purple-700 text-lg max-w-md mx-auto leading-relaxed">
                    {persona?.role}. I'm here to support you on your journey.
                  </p>
                </div>
              )}

              {/* Mood Check-in */}
              {showMoodCheckIn && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <MoodCheckInWidget
                    onSubmit={(data) => {
                      setSessionMoodData(data);
                      setShowMoodCheckIn(false);
                    }}
                    onSkip={() => setShowMoodCheckIn(false)}
                  />
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((message, index) => (
                <MessageBubble
                  key={index}
                  message={message}
                  isUser={message.sender === "user"}
                  persona={persona}
                />
              ))}

              {/* Streaming Response */}
              {isStreaming && streamingContent && (
                <MessageBubble
                  message={{
                    content: streamingContent,
                    sender: "assistant",
                    timestamp: new Date().toISOString(),
                    emotion: currentEmotion
                  }}
                  isUser={false}
                  persona={persona}
                  isStreaming={true}
                />
              )}

              {/* Typing Indicator */}
              {isLoading && !isStreaming && (
                <div className="flex justify-start">
                  <TypingIndicator persona={persona} />
                </div>
              )}
              
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white/90 backdrop-blur-sm border-t border-purple-100/50">
              <div className="flex items-center gap-3 mb-4">
                <Button
                  variant={sessionEnded ? "secondary" : "destructive"}
                  size="sm"
                  onClick={handleEndSession}
                  disabled={sessionEnded}
                  className={`rounded-2xl ${sessionEnded ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {sessionEnded ? "Session Ended" : "End Session"}
                </Button>
                
                <div className="flex gap-2 ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveMicroTool('breathing')}
                    className="rounded-xl text-purple-600 hover:bg-purple-50"
                  >
                    <Wind className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveMicroTool('grounding')}
                    className="rounded-xl text-purple-600 hover:bg-purple-50"
                  >
                    <Target className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveMicroTool('cbt')}
                    className="rounded-xl text-purple-600 hover:bg-purple-50"
                  >
                    <Brain className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
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
                  className={`rounded-xl ${voiceEnabled && !sessionEnded ? 'text-green-600' : 'text-gray-400'}`}
                  disabled={sessionEnded}
                >
                  {sessionEnded ? 'Voice Off' : voiceEnabled ? 'Voice On' : 'Voice Off'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Redesigned Session History Overlay */}
      <RedesignedSessionHistory
        isOpen={showUnifiedHistory}
        onClose={() => setShowUnifiedHistory(false)}
        currentPersonaId={personaId}
        onSessionSelect={(sessionId) => {
          console.log('Selected session:', sessionId);
        }}
      />

      {/* Session Feedback Dialog */}
      <SessionFeedbackDialog
        open={showSessionFeedback}
        onClose={() => setShowSessionFeedback(false)}
        personaName={persona?.name || "AI Companion"}
        sessionDuration={getSessionDuration()}
        onSubmit={handleSessionFeedbackSubmit}
      />
    </div>
  );
}