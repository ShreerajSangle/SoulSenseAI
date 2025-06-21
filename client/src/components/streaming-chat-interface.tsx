import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Mic, 
  MicOff, 
  Heart, 
  Zap, 
  AlertTriangle,
  Sparkles,
  Brain,
  Smile
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StreamingMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  emotion?: string;
  confidence?: number;
  isStreaming?: boolean;
  personaEmoji?: string;
}

interface EmotionalContext {
  primary: string;
  intensity: number;
  urgency: 'low' | 'medium' | 'high' | 'crisis';
  supportNeeds: string[];
}

interface StreamingChatInterfaceProps {
  personaId: string;
  personaName: string;
  personaEmoji: string;
  userId: string;
  onEmotionDetected?: (emotion: EmotionalContext) => void;
  onCrisisDetected?: () => void;
}

export function StreamingChatInterface({
  personaId,
  personaName,
  personaEmoji,
  userId,
  onEmotionDetected,
  onCrisisDetected
}: StreamingChatInterfaceProps) {
  const [messages, setMessages] = useState<StreamingMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionalContext | null>(null);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: StreamingMessage = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setShowTypingIndicator(true);

    // Create abort controller for streaming
    abortControllerRef.current = new AbortController();

    try {
      // Start streaming response
      const assistantMessage: StreamingMessage = {
        id: `assistant-${Date.now()}`,
        content: "",
        sender: 'assistant',
        timestamp: new Date(),
        isStreaming: true,
        personaEmoji
      };

      setMessages(prev => [...prev, assistantMessage]);
      setShowTypingIndicator(false);

      const response = await fetch('/api/chat/streaming', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          personaId,
          userId,
          conversationHistory: messages.slice(-10)
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'content') {
                accumulatedContent += data.content;
                
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id
                    ? { 
                        ...msg, 
                        content: accumulatedContent,
                        emotion: data.emotion,
                        confidence: data.confidence
                      }
                    : msg
                ));
              } else if (data.type === 'emotion') {
                const emotionContext: EmotionalContext = {
                  primary: data.primary,
                  intensity: data.intensity,
                  urgency: data.urgency,
                  supportNeeds: data.supportNeeds
                };
                
                setCurrentEmotion(emotionContext);
                onEmotionDetected?.(emotionContext);

                if (data.urgency === 'crisis') {
                  onCrisisDetected?.();
                }
              } else if (data.type === 'complete') {
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessage.id
                    ? { ...msg, isStreaming: false }
                    : msg
                ));
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Streaming error:', error);
        
        // Find the assistant message to replace
        const assistantMessageId = `assistant-${Date.now()}`;
        
        // Add error message
        const errorMessage: StreamingMessage = {
          id: `error-${Date.now()}`,
          content: "I'm having trouble responding right now. Let me try a different approach.",
          sender: 'assistant',
          timestamp: new Date(),
          personaEmoji
        };
        
        setMessages(prev => [
          ...prev.filter(msg => !msg.id.startsWith('assistant-')),
          errorMessage
        ]);
      }
    } finally {
      setIsLoading(false);
      setShowTypingIndicator(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording implementation would go here
  };

  const getEmotionIcon = (emotion?: string) => {
    switch (emotion) {
      case 'joy':
      case 'happiness':
        return <Smile className="w-4 h-4 text-yellow-500" />;
      case 'love':
      case 'caring':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'excitement':
        return <Zap className="w-4 h-4 text-orange-500" />;
      case 'anxiety':
      case 'fear':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'sadness':
        return <Brain className="w-4 h-4 text-blue-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  const getEmotionColor = (urgency?: string) => {
    switch (urgency) {
      case 'crisis':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-green-100 border-green-300 text-green-800';
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header with persona info and emotion status */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{personaEmoji}</span>
            <div>
              <h2 className="font-semibold text-gray-900">{personaName}</h2>
              <p className="text-sm text-gray-500">AI Mental Health Companion</p>
            </div>
          </div>
          
          {currentEmotion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getEmotionColor(currentEmotion.urgency)}`}
            >
              {getEmotionIcon(currentEmotion.primary)}
              <span className="text-sm font-medium">
                {currentEmotion.primary} ({currentEmotion.intensity}/10)
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                {message.sender === 'assistant' && (
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{message.personaEmoji}</span>
                    <span className="text-sm text-gray-500 font-medium">{personaName}</span>
                    {message.emotion && (
                      <div className="flex items-center space-x-1">
                        {getEmotionIcon(message.emotion)}
                        {message.confidence && (
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(message.confidence * 100)}%
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                <Card className={`${
                  message.sender === 'user' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white border-gray-200'
                }`}>
                  <CardContent className="p-3">
                    <div className="text-sm leading-relaxed">
                      {message.content}
                      {message.isStreaming && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                          className="ml-1 inline-block w-2 h-5 bg-current"
                        />
                      )}
                    </div>
                    <div className={`text-xs mt-2 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {showTypingIndicator && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">{personaEmoji}</span>
              <span className="text-sm text-gray-500 font-medium">{personaName} is thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        {currentEmotion?.urgency === 'crisis' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Crisis Support Available
              </span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              If you're having thoughts of self-harm, please reach out to a crisis helpline: 988 (US)
            </p>
          </motion.div>
        )}

        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${personaName}...`}
              disabled={isLoading}
              className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <Button
            onClick={toggleRecording}
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            className="shrink-0"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {currentEmotion?.supportNeeds && currentEmotion.supportNeeds.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {currentEmotion.supportNeeds.slice(0, 3).map((need, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {need.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}