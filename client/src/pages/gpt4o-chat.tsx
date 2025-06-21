import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Send, 
  Bot, 
  User, 
  Heart, 
  Brain, 
  Sparkles, 
  MessageCircle, 
  Clock, 
  Smile,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Settings,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  emotion?: string;
  confidence?: number;
}

interface Persona {
  id: string;
  name: string;
  role: string;
  emoji: string;
  description: string;
}

interface ConversationMemoryStats {
  shortTermMemories: number;
  longTermMemories: number;
  trustLevel: number;
  intimacyDepth: number;
  dominantEmotions: string[];
}

interface StreamingChunk {
  type: "chunk" | "complete" | "conversation_created" | "error" | "analysis" | "crisis_alert" | "therapeutic_insights";
  content?: string;
  isComplete?: boolean;
  emotion?: string;
  confidence?: number;
  memoryUpdates?: any[];
  thoughtProcess?: string;
  conversation?: { id: number; personaId: string };
  aiMessage?: { id: number };
  memoryStats?: ConversationMemoryStats;
  error?: string;
  stage?: string;
  message?: string;
  level?: string;
  data?: TherapeuticInsights;
  therapeuticContext?: {
    primaryEmotion: string;
    intensity: number;
    clinicalSeverity: {
      depression: string;
      anxiety: string;
    };
    riskLevel?: string;
  };
}

interface TherapeuticInsights {
  emotion: {
    primary: string;
    intensity: number;
    valence: number;
    confidence: number;
    triggers?: string[];
  };
  clinical: {
    depression: {
      severity: string;
      score: number;
      completion?: number;
    };
    anxiety: {
      severity: string;
      score: number;
      completion?: number;
    };
    suicideRisk: boolean;
    trends?: {
      depression: string;
      anxiety: string;
    };
  };
  interventions: Array<{
    id: string;
    name: string;
    type: string;
    duration: string;
    description?: string;
  }>;
  adaptiveQuestions?: string[];
  journalingPrompts?: string[];
  motivationalQuotes?: string[];
  suggestions?: string[];
  questions?: string[];
}

export default function GPT4oChat() {
  const [selectedPersona, setSelectedPersona] = useState<string>("sarah");
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [currentEmotion, setCurrentEmotion] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(0);
  const [memoryStats, setMemoryStats] = useState<ConversationMemoryStats | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"positive" | "negative" | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Enhanced mood-reactive states
  const [analysisStage, setAnalysisStage] = useState<string>("");
  const [therapeuticInsights, setTherapeuticInsights] = useState<TherapeuticInsights | null>(null);
  const [showTherapeuticPanel, setShowTherapeuticPanel] = useState(true);
  const [crisisAlert, setCrisisAlert] = useState<string | null>(null);
  const [currentTherapeuticContext, setCurrentTherapeuticContext] = useState<any>(null);
  const [moodHistory, setMoodHistory] = useState<Array<{emotion: string, intensity: number, timestamp: Date}>>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  // Fetch available personas
  const { data: personas = [] } = useQuery({
    queryKey: ["/api/personas"]
  });

  // Fetch conversation messages if we have a conversation ID
  const { data: conversationMessages = [] } = useQuery({
    queryKey: ["/api/conversations", conversationId, "messages"],
    enabled: !!conversationId
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Update messages when conversation messages change
  useEffect(() => {
    if (conversationMessages.length > 0) {
      const formattedMessages = conversationMessages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.timestamp),
        emotion: msg.emotionDetected,
        confidence: 0.8
      }));
      setMessages(formattedMessages);
    }
  }, [conversationMessages]);

  const sendMessage = async () => {
    if (!currentMessage.trim() || isStreaming) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage("");
    setIsStreaming(true);
    setStreamingContent("");
    setCurrentEmotion("");
    setConfidence(0);

    // Add user message immediately
    const newUserMessage: Message = {
      id: Date.now(),
      content: userMessage,
      sender: "user",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Abort any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/chat/gpt4o-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: "anonymous",
          personaId: selectedPersona,
          message: userMessage,
          conversationId: conversationId,
          isFirstMessage: !conversationId
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamingChunk = JSON.parse(line.slice(6));
              
              if (data.type === "conversation_created" && data.conversation) {
                setConversationId(data.conversation.id);
              } else if (data.type === "analysis") {
                // Show analysis stage progress
                setAnalysisStage(data.message || `Analyzing ${data.stage}...`);
              } else if (data.type === "crisis_alert") {
                // Handle crisis alerts
                setCrisisAlert(data.message || "Crisis intervention may be needed");
              } else if (data.type === "chunk" && data.content) {
                accumulatedContent += data.content;
                setStreamingContent(accumulatedContent);
                if (data.emotion) setCurrentEmotion(data.emotion);
                if (data.confidence) setConfidence(data.confidence);
                
                // Update therapeutic context if available
                if (data.therapeuticContext) {
                  setCurrentTherapeuticContext(data.therapeuticContext);
                  
                  // Update mood history
                  setMoodHistory(prev => [...prev, {
                    emotion: data.therapeuticContext.primaryEmotion,
                    intensity: data.therapeuticContext.intensity,
                    timestamp: new Date()
                  }].slice(-10)); // Keep last 10 mood points
                }
              } else if (data.type === "therapeutic_insights") {
                // Process comprehensive therapeutic insights
                if (data.data) {
                  setTherapeuticInsights(data.data);
                }
              } else if (data.type === "complete") {
                // Add AI message to messages
                const aiMessage: Message = {
                  id: data.aiMessage?.id || Date.now(),
                  content: accumulatedContent,
                  sender: "ai",
                  timestamp: new Date(),
                  emotion: currentEmotion,
                  confidence: confidence
                };
                setMessages(prev => [...prev, aiMessage]);
                
                if (data.memoryStats) {
                  setMemoryStats(data.memoryStats);
                }
                
                // Clear streaming state
                setStreamingContent("");
                setIsStreaming(false);
                
                // Invalidate queries to refresh data
                queryClient.invalidateQueries({ 
                  queryKey: ["/api/conversations", conversationId, "messages"] 
                });
                
                break;
              } else if (data.type === "error") {
                console.error("Streaming error:", data.error);
                setIsStreaming(false);
                setStreamingContent("");
                break;
              }
            } catch (e) {
              console.error("Error parsing streaming data:", e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error sending message:", error);
        setIsStreaming(false);
        setStreamingContent("");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const regenerateResponse = async () => {
    if (messages.length < 2) return;
    
    // Remove the last AI message and regenerate
    const lastUserMessage = messages[messages.length - 2];
    if (lastUserMessage.sender === "user") {
      setMessages(prev => prev.slice(0, -1));
      setCurrentMessage(lastUserMessage.content);
      setTimeout(() => sendMessage(), 100);
    }
  };

  const submitFeedback = async () => {
    if (!feedbackType || !feedbackText.trim()) return;

    try {
      // This would typically send feedback to the backend
      console.log("Feedback submitted:", { type: feedbackType, text: feedbackText });
      setShowFeedback(false);
      setFeedbackType(null);
      setFeedbackText("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCurrentMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const selectedPersonaData = personas.find((p: Persona) => p.id === selectedPersona);

  const getEmotionColor = (emotion: string) => {
    const colors = {
      supportive: "bg-blue-500",
      empathetic: "bg-purple-500",
      encouraging: "bg-green-500",
      understanding: "bg-indigo-500",
      warm: "bg-orange-500",
      neutral: "bg-gray-500"
    };
    return colors[emotion as keyof typeof colors] || "bg-gray-500";
  };

  const getPersonaGradient = (personaId: string) => {
    const gradients = {
      sarah: "from-blue-500 to-indigo-600",
      alex: "from-green-500 to-teal-600", 
      marcus: "from-orange-500 to-red-600",
      maya: "from-purple-500 to-pink-600"
    };
    return gradients[personaId as keyof typeof gradients] || "from-gray-500 to-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-3 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-200 dark:border-purple-800 mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SoulSense AI Chat
              </h1>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTherapeuticPanel(!showTherapeuticPanel)}
                  className="rounded-xl"
                  title="Toggle Therapeutic Insights"
                >
                  <Brain className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="rounded-xl"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Persona Selection */}
            <div className="flex justify-center mb-4">
              <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                <SelectTrigger className="w-64 border-2 border-purple-200 dark:border-purple-700 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50">
                  {personas.map((persona: Persona) => (
                    <SelectItem 
                      key={persona.id} 
                      value={persona.id}
                      className="hover:bg-purple-50 dark:hover:bg-purple-900/30 focus:bg-purple-50 dark:focus:bg-purple-900/30"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{persona.emoji}</span>
                        <span className="font-medium">{persona.name}</span>
                        <span className="text-sm text-gray-500">- {persona.role}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Memory Stats */}
            {memoryStats && (
              <div className="flex justify-center gap-4 text-sm">
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                  <Brain className="w-3 h-3 mr-1" />
                  Trust: {Math.round(memoryStats.trustLevel * 100)}%
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                  <Heart className="w-3 h-3 mr-1" />
                  Connection: {Math.round(memoryStats.intimacyDepth * 100)}%
                </Badge>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Memories: {memoryStats.longTermMemories}
                </Badge>
              </div>
            )}
          </div>

          {/* Main Chat Layout */}
          <div className="flex gap-6">
            {/* Therapeutic Insights Panel */}
            {showTherapeuticPanel && (
              <div className="w-80 space-y-4">
                {/* Real-time Analysis */}
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-purple-200 dark:border-purple-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      Live Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Analysis Stage */}
                    {analysisStage && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          {analysisStage}
                        </div>
                      </div>
                    )}

                    {/* Crisis Alert */}
                    {crisisAlert && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300 font-medium">
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
                          <Badge variant="secondary" className={cn("text-white", getEmotionColor(currentTherapeuticContext.primaryEmotion))}>
                            {currentTherapeuticContext.primaryEmotion}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Intensity</span>
                            <span>{Math.round(currentTherapeuticContext.intensity * 100)}%</span>
                          </div>
                          <Progress value={currentTherapeuticContext.intensity * 100} className="h-2" />
                        </div>
                      </div>
                    )}

                    {/* Mood History Chart */}
                    {moodHistory.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Mood Trend</span>
                        <div className="h-16 flex items-end gap-1 p-2 bg-gray-50 dark:bg-slate-700/50 rounded">
                          {moodHistory.slice(-8).map((mood, index) => (
                            <div
                              key={index}
                              className={cn("w-4 rounded-t", getEmotionColor(mood.emotion))}
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
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-purple-200 dark:border-purple-800">
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
                          <Progress 
                            value={(therapeuticInsights.clinical.depression.score / 27) * 100} 
                            className="h-2"
                          />
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
                          <Progress 
                            value={(therapeuticInsights.clinical.anxiety.score / 21) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>

                      {/* Suicide Risk */}
                      {therapeuticInsights.clinical.suicideRisk && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div className="text-sm text-red-700 dark:text-red-300 font-medium">
                            Elevated Risk Detected
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Recommended Interventions */}
                {therapeuticInsights?.interventions && therapeuticInsights.interventions.length > 0 && (
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-purple-200 dark:border-purple-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-green-600" />
                        Suggested Tools
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {therapeuticInsights.interventions.slice(0, 3).map((intervention, index) => (
                        <div key={index} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-green-800 dark:text-green-200">
                              {intervention.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {intervention.duration}
                            </Badge>
                          </div>
                          <p className="text-xs text-green-700 dark:text-green-300">
                            {intervention.type} technique
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Journaling Prompts */}
                {therapeuticInsights?.journalingPrompts && therapeuticInsights.journalingPrompts.length > 0 && (
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-purple-200 dark:border-purple-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                        Reflection Prompts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {therapeuticInsights.journalingPrompts.slice(0, 2).map((prompt, index) => (
                        <div key={index} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-800 dark:text-blue-200">
                          {prompt}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Chat Container */}
            <div className="flex-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-200 dark:border-purple-800 overflow-hidden">
              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getPersonaGradient(selectedPersona)} flex items-center justify-center mb-4`}>
                    <span className="text-2xl text-white">
                      {selectedPersonaData?.emoji || "🤖"}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Welcome to {selectedPersonaData?.name || "SoulSense AI"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    {selectedPersonaData?.description || "I'm here to listen, understand, and support you. Share what's on your mind."}
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 items-start",
                    message.sender === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className={cn(
                      "text-white font-medium",
                      message.sender === "user" 
                        ? "bg-gradient-to-r from-blue-500 to-purple-600"
                        : `bg-gradient-to-r ${getPersonaGradient(selectedPersona)}`
                    )}>
                      {message.sender === "user" ? <User className="w-4 h-4" /> : selectedPersonaData?.emoji || <Bot className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={cn(
                    "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg",
                    message.sender === "user"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      : "bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-600"
                  )}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                      <Clock className="w-3 h-3" />
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      
                      {message.emotion && message.sender === "ai" && (
                        <>
                          <div className={cn("w-2 h-2 rounded-full", getEmotionColor(message.emotion))}></div>
                          <span className="capitalize">{message.emotion}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Streaming Message */}
              {isStreaming && streamingContent && (
                <div className="flex gap-3 items-start">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className={`bg-gradient-to-r ${getPersonaGradient(selectedPersona)} text-white`}>
                      {selectedPersonaData?.emoji || <Bot className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-600">
                    <p className="text-sm leading-relaxed">{streamingContent}<span className="animate-pulse">|</span></p>
                    
                    {currentEmotion && (
                      <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                        <div className={cn("w-2 h-2 rounded-full", getEmotionColor(currentEmotion))}></div>
                        <span className="capitalize">{currentEmotion}</span>
                        {confidence > 0 && (
                          <Progress value={confidence * 100} className="w-12 h-1" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Typing Indicator */}
              {isStreaming && !streamingContent && (
                <div className="flex gap-3 items-start">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className={`bg-gradient-to-r ${getPersonaGradient(selectedPersona)} text-white`}>
                      {selectedPersonaData?.emoji || <Bot className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 dark:border-slate-600 p-4">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Textarea
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Share your thoughts with ${selectedPersonaData?.name || "me"}...`}
                    className="min-h-[60px] border-2 border-purple-200 dark:border-purple-700 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={isStreaming}
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  {/* Voice Input Button */}
                  <Button
                    onClick={startVoiceInput}
                    disabled={isStreaming || isListening}
                    variant="outline"
                    size="sm"
                    className="border-2 border-purple-200 dark:border-purple-700 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30"
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  
                  {/* Send Button */}
                  <Button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || isStreaming}
                    className={`bg-gradient-to-r ${getPersonaGradient(selectedPersona)} hover:opacity-90 text-white px-6 py-2 rounded-xl shadow-lg transition-all duration-300`}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              {messages.length > 0 && (
                <div className="flex gap-2 mt-3 justify-center">
                  <Button
                    onClick={() => setShowFeedback(true)}
                    variant="outline"
                    size="sm"
                    className="border border-gray-300 dark:border-gray-600 rounded-xl"
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Feedback
                  </Button>
                  
                  <Button
                    onClick={regenerateResponse}
                    variant="outline"
                    size="sm"
                    className="border border-gray-300 dark:border-gray-600 rounded-xl"
                    disabled={isStreaming}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Regenerate
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent className="bg-white dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-700 rounded-3xl shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Share Your Feedback
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setFeedbackType("positive")}
                variant={feedbackType === "positive" ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <ThumbsUp className="w-4 h-4" />
                Helpful
              </Button>
              <Button
                onClick={() => setFeedbackType("negative")}
                variant={feedbackType === "negative" ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <ThumbsDown className="w-4 h-4" />
                Needs Work
              </Button>
            </div>
            
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us more about your experience..."
              className="border-2 border-purple-200 dark:border-purple-700 rounded-xl"
            />
            
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setShowFeedback(false)}
                variant="outline"
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={submitFeedback}
                disabled={!feedbackType || !feedbackText.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl"
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-white dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-700 rounded-3xl shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Chat Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span>Voice Responses</span>
              </div>
              <Button
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                variant={isVoiceEnabled ? "default" : "outline"}
                size="sm"
                className="rounded-xl"
              >
                {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}