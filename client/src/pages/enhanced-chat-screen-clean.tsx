import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MessageBubble } from "@/components/message-bubble";
import { TypingIndicator } from "@/components/typing-indicator";
import { SimpleInput } from "@/components/simple-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Heart, Brain, Target, Leaf } from "lucide-react";

interface Message {
  id: number;
  conversationId: number;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  emotionDetected?: string | null;
}

interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  color: string;
  emoji: string;
}

const personas: Record<string, Persona> = {
  sarah: {
    id: "sarah",
    name: "Dr. Sarah",
    role: "Clinical Therapist",
    description: "Compassionate therapy with CBT techniques",
    avatar: "/avatars/sarah.png",
    color: "from-blue-500 to-purple-600",
    emoji: "🧠"
  },
  alex: {
    id: "alex", 
    name: "Alex",
    role: "Supportive Friend",
    description: "Your caring companion for daily support",
    avatar: "/avatars/alex.png",
    color: "from-green-500 to-blue-500",
    emoji: "😊"
  },
  marcus: {
    id: "marcus",
    name: "Marcus", 
    role: "Motivational Coach",
    description: "Energetic guidance for achieving goals",
    avatar: "/avatars/marcus.png",
    color: "from-orange-500 to-red-600",
    emoji: "💪"
  },
  maya: {
    id: "maya",
    name: "Maya",
    role: "Mindfulness Guide", 
    description: "Peaceful wisdom for inner balance",
    avatar: "/avatars/maya.png",
    color: "from-purple-500 to-pink-500",
    emoji: "🌸"
  }
};

export default function EnhancedChatScreen() {
  const { persona: personaId } = useParams<{ persona: string }>();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const persona = personas[personaId || "sarah"];
  
  if (!persona) {
    setLocation("/");
    return null;
  }

  // Fetch conversation messages
  const { data: conversationMessages = [] } = useQuery({
    queryKey: ["/api/conversations", conversationId, "messages"],
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (conversationMessages && Array.isArray(conversationMessages) && conversationMessages.length > 0) {
      setMessages(conversationMessages as Message[]);
    }
  }, [conversationMessages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("/api/chat/message", "POST", {
        message,
        personaId: persona.id,
        conversationId,
        userId: "anonymous",
        isFirstMessage: !conversationId
      });
      return response as any;
    },
    onSuccess: (data) => {
      if (!conversationId) {
        setConversationId(data.conversationId);
      }
      
      // Add both user and AI messages to the state
      const userMessage: Message = {
        id: Date.now(),
        conversationId: data.conversationId,
        content: data.message.content,
        sender: "user",
        timestamp: new Date()
      };
      
      const aiMessage: Message = {
        id: Date.now() + 1,
        conversationId: data.conversationId,
        content: data.aiResponse,
        sender: "ai",
        timestamp: new Date(),
        emotionDetected: data.emotionDetected || null
      };
      
      setMessages(prev => [...prev, userMessage, aiMessage]);
      setIsTyping(false);
      
      // Invalidate conversations cache
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
      setIsTyping(false);
    }
  });

  const handleSendMessage = (message: string) => {
    if (message.trim()) {
      // Add user message immediately
      const userMessage: Message = {
        id: Date.now(),
        conversationId: conversationId || 0,
        content: message,
        sender: "user", 
        timestamp: new Date(),
        emotionDetected: null
      };
      
      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);
      
      // Send to API
      sendMessageMutation.mutate(message);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getPersonaIcon = () => {
    switch (persona.id) {
      case "sarah": return <Brain className="h-5 w-5" />;
      case "alex": return <Heart className="h-5 w-5" />;
      case "marcus": return <Target className="h-5 w-5" />;
      case "maya": return <Leaf className="h-5 w-5" />;
      default: return <Heart className="h-5 w-5" />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className={`bg-gradient-to-r ${persona.color} text-white p-4 shadow-lg`}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarImage src={persona.avatar} alt={persona.name} />
            <AvatarFallback className="bg-white/20">
              {persona.emoji}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="font-semibold text-lg flex items-center gap-2">
              {getPersonaIcon()}
              {persona.name}
            </h1>
            <p className="text-white/80 text-sm">{persona.description}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">
                Start a conversation with {persona.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                {persona.description}
              </p>
            </CardContent>
          </Card>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`flex items-start gap-3 mb-4 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            {message.sender === "ai" && persona && (
              <Avatar className="w-10 h-10 flex-shrink-0 mt-1">
                <AvatarImage src={persona.avatar} alt={persona.name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-semibold">
                  {persona.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            )}
            
            <div className={`max-w-[75%] lg:max-w-md px-4 py-3 rounded-2xl relative ${
              message.sender === "user" 
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto" 
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
            }`}>
              <p className="text-sm leading-relaxed">{message.content}</p>
              {message.emotionDetected && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  {message.emotionDetected}
                </Badge>
              )}
              <div className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
              <TypingIndicator />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <SimpleInput
        onSendMessage={handleSendMessage}
        disabled={sendMessageMutation.isPending}
        placeholder={`Message ${persona.name}...`}
      />
    </div>
  );
}