import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Mic, Settings, User, Brain, Heart, Trophy, Leaf, Sparkles, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  content: string;
  sender: "user" | "persona";
  timestamp: Date;
  emotion?: string;
  streaming?: boolean;
}

interface Persona {
  id: string;
  name: string;
  role: string;
  emoji: string;
  personality: {
    warmth: number;
    empathy: number;
    directness: number;
    humor: number;
    formality: number;
  };
  specializations: string[];
}

const personaIcons = {
  sarah: Brain,
  alex: Heart,
  marcus: Trophy,
  maya: Leaf,
};

const personaColors = {
  sarah: "from-blue-500 to-cyan-500",
  alex: "from-pink-500 to-rose-500",
  marcus: "from-orange-500 to-amber-500", 
  maya: "from-green-500 to-emerald-500",
};

export default function ConversationHub() {
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showPersonaSelector, setShowPersonaSelector] = useState(true);
  const [currentEmotion, setCurrentEmotion] = useState<string>("neutral");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch personas
  const { data: personas } = useQuery({
    queryKey: ["/api/personas"],
    enabled: showPersonaSelector,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message mutation with streaming
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, personaId }: { message: string; personaId: string }) => {
      const response = await fetch('/api/chat/gpt4o-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          personaId,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      // Add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Add streaming persona response
      const personaMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "",
        sender: "persona",
        timestamp: new Date(),
        streaming: true,
      };

      setMessages(prev => [...prev, personaMessage]);
      setIsStreaming(true);

      // Process stream
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.content) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === personaMessage.id 
                      ? { ...msg, content: msg.content + data.content }
                      : msg
                  ));
                }

                if (data.emotion) {
                  setCurrentEmotion(data.emotion);
                }

                if (data.isComplete) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === personaMessage.id 
                      ? { ...msg, streaming: false }
                      : msg
                  ));
                  setIsStreaming(false);
                  break;
                }
              } catch (e) {
                console.error('Error parsing stream data:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('Streaming error:', error);
        setIsStreaming(false);
        
        // Fallback response
        setMessages(prev => prev.map(msg => 
          msg.id === personaMessage.id 
            ? { 
                ...msg, 
                content: "I'm here to support you. How are you feeling today?",
                streaming: false 
              }
            : msg
        ));
      }
    },
  });

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona.id);
    setShowPersonaSelector(false);
    
    // Add welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `Hello! I'm ${persona.name}. ${persona.role} I'm here to support you on your wellness journey. How are you feeling today?`,
      sender: "persona",
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedPersona || isStreaming) return;

    const message = inputValue.trim();
    setInputValue("");

    sendMessageMutation.mutate({
      message,
      personaId: selectedPersona,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPersonaIcon = (personaId: string) => {
    return personaIcons[personaId as keyof typeof personaIcons] || Brain;
  };

  const getPersonaColor = (personaId: string) => {
    return personaColors[personaId as keyof typeof personaColors] || "from-purple-500 to-indigo-500";
  };

  const resetConversation = () => {
    setMessages([]);
    setSelectedPersona(null);
    setShowPersonaSelector(true);
    setCurrentEmotion("neutral");
  };

  // Persona selector overlay
  if (showPersonaSelector) {
    return (
      <div className="h-screen bg-gradient-to-br from-purple-300 via-purple-200 to-purple-400 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-24 h-24 bg-gradient-to-r from-pink-300 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse delay-2000"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl animate-pulse">
              <Sparkles className="text-white text-3xl" />
            </div>
            <h1 className="text-5xl font-bold text-purple-900 mb-4">
              Choose Your AI Companion
            </h1>
            <p className="text-xl text-purple-800 max-w-2xl mx-auto">
              Select a therapeutic companion to begin your personalized mental wellness journey
            </p>
          </div>

          {/* Persona Grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-6xl w-full">
            {Array.isArray(personas) && personas.map((persona: Persona) => {
              const PersonaIcon = getPersonaIcon(persona.id);
              const personaColor = getPersonaColor(persona.id);
              
              return (
                <Card 
                  key={persona.id}
                  className="group hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white/80 backdrop-blur-sm border-0 rounded-3xl overflow-hidden transform hover:scale-105"
                  onClick={() => handlePersonaSelect(persona)}
                >
                  <CardContent className="p-8 text-center">
                    <div className={`w-20 h-20 mx-auto bg-gradient-to-r ${personaColor} rounded-3xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                      <PersonaIcon className="text-white text-2xl" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-purple-900 mb-2">{persona.name}</h3>
                    <p className="text-purple-700 mb-4 text-sm leading-relaxed">{persona.role}</p>
                    
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                      {persona.specializations?.slice(0, 2).map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-purple-200 text-purple-700">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button className={`w-full bg-gradient-to-r ${personaColor} hover:opacity-90 text-white rounded-2xl py-3 font-semibold shadow-xl transform hover:scale-105 transition-all duration-300`}>
                      Start Conversation
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Full-screen conversation interface
  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center">
            <Sparkles className="text-white text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-purple-900">SoulSense AI</h2>
            <p className="text-sm text-purple-600">
              {Array.isArray(personas) ? personas.find((p: Persona) => p.id === selectedPersona)?.name || "AI Companion" : "AI Companion"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            {currentEmotion}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetConversation}
            className="text-purple-600 hover:bg-purple-50"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-md p-4 rounded-3xl ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "bg-white shadow-xl border border-purple-100"
                }`}
              >
                <p className={`text-sm leading-relaxed ${
                  message.sender === "user" ? "text-white" : "text-purple-800"
                }`}>
                  {message.content}
                  {message.streaming && (
                    <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-pulse" />
                  )}
                </p>
                <p className={`text-xs mt-2 ${
                  message.sender === "user" ? "text-purple-100" : "text-purple-400"
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-purple-200 p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share your thoughts..."
            className="flex-1 h-12 bg-white border-2 border-purple-200 rounded-2xl px-4 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
            disabled={isStreaming}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isStreaming}
            className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-xl"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}