import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, ArrowLeft } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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

interface ChatOverlayProps {
  persona: Persona;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatOverlay({ persona, isOpen, onClose }: ChatOverlayProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [checkInResponse, setCheckInResponse] = useState("");
  const [currentEmotion, setCurrentEmotion] = useState("Neutral");
  const [emotionIntensity, setEmotionIntensity] = useState(50);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch existing conversation messages
  const { data: existingMessages } = useQuery({
    queryKey: ["/api/conversations", conversationId, "messages"],
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (existingMessages && Array.isArray(existingMessages)) {
      setMessages(existingMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    }
  }, [existingMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { personaId: string; message: string; conversationId?: number }) => {
      return await apiRequest(`/api/chat/message`, "POST", data);
    },
    onSuccess: (data: any) => {
      if (!conversationId) {
        setConversationId(data.conversationId);
      }
      
      const userMessage: Message = {
        id: Date.now(),
        conversationId: data.conversationId,
        content: data.message.content,
        sender: "user",
        timestamp: new Date(),
        emotionDetected: null
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
      
      if (data.emotionDetected) {
        setCurrentEmotion(data.emotionDetected);
        setEmotionIntensity(Math.floor(Math.random() * 40) + 40); // 40-80%
      }
      
      setIsTyping(false);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: () => {
      setIsTyping(false);
    }
  });

  const handleStartSession = () => {
    if (checkInResponse.trim()) {
      setSessionStarted(true);
      handleSendMessage(checkInResponse);
      setCheckInResponse("");
    }
  };

  const handleSendMessage = (message: string) => {
    if (message.trim()) {
      const userMessage: Message = {
        id: Date.now(),
        conversationId: conversationId || 0,
        content: message,
        sender: "user", 
        timestamp: new Date(),
        emotionDetected: null
      };

      setMessages(prev => [...prev, userMessage]);
      setInputMessage("");
      setIsTyping(true);

      sendMessageMutation.mutate({
        personaId: persona.id,
        message: message,
        conversationId: conversationId || undefined
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (sessionStarted) {
        handleSendMessage(inputMessage);
      } else {
        handleStartSession();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[85vh] bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-800/50">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 ring-2 ring-white/50">
                <AvatarImage src={persona.avatar} alt={persona.name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-semibold text-lg">
                  {persona.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {persona.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {persona.role}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Real-time emotion feedback */}
              <div className="flex items-center gap-3 text-sm">
                <Badge variant="outline" className="bg-white/50 text-gray-700 border-gray-300">
                  Emotion: {currentEmotion}
                </Badge>
                <Badge variant="outline" className="bg-white/50 text-gray-700 border-gray-300">
                  Intensity: {emotionIntensity}%
                </Badge>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 hover:bg-white/50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Session Check-in or Chat Content */}
        <div className="flex-1 flex flex-col h-[calc(85vh-80px)]">
          {!sessionStarted ? (
            /* Session Check-in */
            <div className="flex-1 flex items-center justify-center p-8">
              <Card className="max-w-md w-full border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="text-6xl mb-4">{persona.emoji}</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Welcome to your session
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    How are you feeling today? What would you like to discuss or explore in our conversation?
                  </p>
                  
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Share what's on your mind..."
                      value={checkInResponse}
                      onChange={(e) => setCheckInResponse(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="min-h-[100px] rounded-2xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                    />
                    <Button
                      onClick={handleStartSession}
                      disabled={!checkInResponse.trim()}
                      className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium py-3"
                    >
                      Begin Conversation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Chat Interface */
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950">
                {messages.map((message) => (
                  <div key={message.id} className={`flex items-start gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    {message.sender === "ai" && (
                      <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
                        <AvatarImage src={persona.avatar} alt={persona.name} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-semibold text-xs">
                          {persona.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                      message.sender === "user" 
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white ml-auto shadow-lg" 
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-sm"
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      {message.emotionDetected && (
                        <Badge variant="secondary" className="mt-2 text-xs bg-purple-100 text-purple-700">
                          {message.emotionDetected}
                        </Badge>
                      )}
                      <div className={`text-xs mt-1 ${message.sender === "user" ? "text-white/70" : "text-gray-500"}`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
                      <AvatarImage src={persona.avatar} alt={persona.name} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-semibold text-xs">
                        {persona.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-6 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isTyping}
                      className="min-h-[50px] max-h-[120px] rounded-2xl border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 resize-none pr-12"
                    />
                  </div>
                  <Button
                    onClick={() => handleSendMessage(inputMessage)}
                    disabled={!inputMessage.trim() || isTyping}
                    size="lg"
                    className="rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white h-[50px] px-6 shadow-lg"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}