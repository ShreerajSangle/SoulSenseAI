import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, Wind, Target, BookOpen, MessageCircle } from "lucide-react";
import BreathingExercise from "@/components/breathing-exercise";
import GoalCreationModal from "@/components/goal-creation-modal";
import EmojiSelector from "@/components/emoji-selector";
import MiniJournalModal from "@/components/mini-journal-modal";
import QuickReplyBubbles from "@/components/quick-reply-bubbles";
import SessionRecapModal from "@/components/session-recap-modal";

interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  emotion?: string;
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

interface SimpleChatOverlayProps {
  persona: Persona;
  isOpen: boolean;
  onClose: () => void;
}

export function SimpleChatOverlay({ persona, isOpen, onClose }: SimpleChatOverlayProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [checkInResponse, setCheckInResponse] = useState("");
  const [currentEmotion, setCurrentEmotion] = useState("Neutral");
  const [emotionIntensity, setEmotionIntensity] = useState(50);
  const [breathingModalOpen, setBreathingModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [sessionRecapOpen, setSessionRecapOpen] = useState(false);
  const [conversationData, setConversationData] = useState<{
    id: number;
    messages: Message[];
    emotions: string[];
    topics: string[];
    toolsUsed: string[];
    insights: string[];
  }>({
    id: 0,
    messages: [],
    emotions: [],
    topics: [],
    toolsUsed: [],
    insights: []
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (message: string) => {
    try {
      setIsTyping(true);
      
      // Add user message immediately
      const userMessage: Message = {
        id: Date.now(),
        content: message,
        sender: "user",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Check for wellness feature triggers
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('stress') || lowerMessage.includes('anxious') || lowerMessage.includes('overwhelm') || lowerMessage.includes('panic')) {
        setBreathingModalOpen(true);
      }
      if (lowerMessage.includes('goal') || lowerMessage.includes('improve') || lowerMessage.includes('want to') || lowerMessage.includes('stay on track')) {
        setGoalModalOpen(true);
      }
      
      // Helper functions for conversation tracking
      const extractTopics = (msg: string) => {
        const topics = [];
        if (msg.toLowerCase().includes('work') || msg.toLowerCase().includes('job')) topics.push('work');
        if (msg.toLowerCase().includes('family') || msg.toLowerCase().includes('relationship')) topics.push('relationships');
        if (msg.toLowerCase().includes('sleep') || msg.toLowerCase().includes('tired')) topics.push('sleep');
        if (msg.toLowerCase().includes('stress') || msg.toLowerCase().includes('anxiety')) topics.push('stress management');
        return topics;
      };

      const extractEmotions = (msg: string) => {
        const emotions = [];
        if (msg.toLowerCase().includes('happy') || msg.toLowerCase().includes('joy') || msg.toLowerCase().includes('great')) emotions.push('happy');
        if (msg.toLowerCase().includes('sad') || msg.toLowerCase().includes('down') || msg.toLowerCase().includes('upset')) emotions.push('sad');
        if (msg.toLowerCase().includes('anxious') || msg.toLowerCase().includes('worried') || msg.toLowerCase().includes('nervous')) emotions.push('anxious');
        if (msg.toLowerCase().includes('angry') || msg.toLowerCase().includes('frustrated') || msg.toLowerCase().includes('mad')) emotions.push('angry');
        if (msg.toLowerCase().includes('stress') || msg.toLowerCase().includes('overwhelmed')) emotions.push('stressed');
        return emotions;
      };

      // Update conversation data
      const newTopics = extractTopics(message);
      const newEmotions = extractEmotions(message);
      
      setConversationData(prev => {
        const uniqueTopics = [...prev.topics];
        newTopics.forEach(topic => {
          if (!uniqueTopics.includes(topic)) uniqueTopics.push(topic);
        });
        
        const uniqueEmotions = [...prev.emotions];
        newEmotions.forEach(emotion => {
          if (!uniqueEmotions.includes(emotion)) uniqueEmotions.push(emotion);
        });
        
        return {
          ...prev,
          topics: uniqueTopics,
          emotions: uniqueEmotions
        };
      });

      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: persona.id,
          message: message
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const aiMessage: Message = {
          id: Date.now() + 1,
          content: data.aiResponse || "I'm here to help. Could you tell me more about what you're experiencing?",
          sender: "ai",
          timestamp: new Date(),
          emotion: data.emotionDetected
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        if (data.emotionDetected) {
          setCurrentEmotion(data.emotionDetected);
          setEmotionIntensity(Math.floor(Math.random() * 40) + 40);
        }
      } else {
        // Fallback response if API fails
        const fallbackMessage: Message = {
          id: Date.now() + 1,
          content: "I'm experiencing some technical difficulties, but I'm still here to listen. Please tell me more about how you're feeling.",
          sender: "ai",
          timestamp: new Date(),
          emotion: "supportive"
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        content: "I'm having trouble connecting right now, but I want you to know that your feelings are valid and important. What would you like to share?",
        sender: "ai",
        timestamp: new Date(),
        emotion: "empathetic"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleStartSession = () => {
    if (checkInResponse.trim()) {
      setSessionStarted(true);
      sendMessage(checkInResponse);
      setCheckInResponse("");
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (sessionStarted) {
        handleSendMessage();
      } else {
        handleStartSession();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#B794D1]/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-4xl h-[85vh] bg-white/60 dark:bg-[#2A2035]/90 rounded-3xl shadow-2xl overflow-hidden border border-[#D8C2F5]/50 dark:border-[#5A4267]/50 backdrop-blur-sm">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F8F6FF] to-[#FBCFE8] dark:from-[#352843] dark:to-[#453354] px-6 py-5 border-b border-[#D8C2F5]/50 dark:border-[#5A4267]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 ring-3 ring-[#B794D1]/30 animate-float">
                <AvatarImage src={persona.avatar} alt={persona.name} />
                <AvatarFallback className="bg-gradient-to-br from-[#C8A2E8] to-[#EC4899] text-white font-semibold text-lg">
                  {persona.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-[#3A2548] dark:text-[#F2D4F2] flex items-center gap-2">
                  {persona.name}
                  <span className="text-2xl">{persona.emoji}</span>
                </h2>
                <p className="text-sm text-[#7A5A95] dark:text-[#A678AB] font-medium">
                  {persona.role} • Here to support you
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm">
                <Badge variant="outline" className="bg-[#F3EFFF] text-[#7A5A95] border-[#D8C2F5] animate-pulse-gentle">
                  💜 {currentEmotion}
                </Badge>
                <Badge variant="outline" className="bg-[#FCE7F3] text-[#DB2777] border-[#F9A8D4]">
                  ✨ {emotionIntensity}%
                </Badge>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-[#78716C] hover:text-[#7A5A95] hover:bg-[#F3EFFF] rounded-2xl transition-all duration-300"
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
              <Card className="max-w-md w-full border-0 shadow-lg bg-gradient-to-br from-white/40 to-[#F8F6FF] dark:from-[#352843] dark:to-[#453354] backdrop-blur-sm animate-fade-in">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="text-6xl mb-4 animate-float">{persona.emoji}</div>
                  <h3 className="text-xl font-semibold text-[#3A2548] dark:text-[#F2D4F2]">
                    Welcome to your session with {persona.name}
                  </h3>
                  <p className="text-[#5A3F70] dark:text-[#A678AB] leading-relaxed">
                    Take a moment to connect with yourself. How are you feeling today? What would you like to explore in our safe space together?
                  </p>
                  
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Share what's on your mind and heart..."
                      value={checkInResponse}
                      onChange={(e) => setCheckInResponse(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="min-h-[100px] rounded-2xl border-[#D8C2F5] dark:border-[#5A4267] focus:ring-2 focus:ring-[#B794D1]/30 focus:border-[#B794D1] bg-white/60 dark:bg-[#2A2035]/60 backdrop-blur-sm"
                    />
                    <Button
                      onClick={handleStartSession}
                      disabled={!checkInResponse.trim()}
                      className="w-full rounded-2xl bg-gradient-to-r from-[#B794D1] to-[#EC4899] hover:from-[#9B7CB8] hover:to-[#DB2777] text-white font-medium py-3 shadow-lg animate-float"
                    >
                      Begin Our Conversation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Chat Interface */
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-[#F8F6FF]/30 to-[#E6E6FA]/20 dark:from-[#352843]/30 dark:to-[#2A2035]">
                {messages.map((message) => (
                  <div key={message.id} className={`flex items-start gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                    {message.sender === "ai" && (
                      <Avatar className="w-8 h-8 flex-shrink-0 mt-1 animate-float">
                        <AvatarImage src={persona.avatar} alt={persona.name} />
                        <AvatarFallback className="bg-gradient-to-br from-[#C8A2E8] to-[#EC4899] text-white font-semibold text-xs">
                          {persona.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl backdrop-blur-sm ${
                      message.sender === "user" 
                        ? "bg-gradient-to-r from-[#B794D1] to-[#EC4899] text-white ml-auto shadow-lg border border-[#D8C2F5]/30" 
                        : "bg-white/60 dark:bg-[#453354]/60 text-[#3A2548] dark:text-[#F2D4F2] border border-[#D8C2F5]/50 dark:border-[#5A4267]/50 shadow-sm"
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      {message.emotion && (
                        <Badge variant="secondary" className="mt-2 text-xs bg-[#F3EFFF] text-[#7A5A95] border border-[#D8C2F5]">
                          💜 {message.emotion}
                        </Badge>
                      )}
                      <div className={`text-xs mt-1 ${message.sender === "user" ? "text-white/70" : "text-[#78716C] dark:text-[#A678AB]"}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    
                    {/* Quick Reply Bubbles for AI messages */}
                    {message.sender === "ai" && messages.indexOf(message) === messages.length - 1 && !isTyping && (
                      <QuickReplyBubbles
                        onReplySelect={(reply) => {
                          setInputMessage(reply);
                          handleSendMessage();
                        }}
                        messageType={message.content.length > 100 ? 'advice' : 'general'}
                        className="ml-11"
                      />
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-start gap-3 animate-fade-in">
                    <Avatar className="w-8 h-8 flex-shrink-0 mt-1 animate-float">
                      <AvatarImage src={persona.avatar} alt={persona.name} />
                      <AvatarFallback className="bg-gradient-to-br from-[#C8A2E8] to-[#EC4899] text-white font-semibold text-xs">
                        {persona.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white/60 dark:bg-[#453354]/60 px-4 py-3 rounded-2xl border border-[#D8C2F5]/50 dark:border-[#5A4267]/50 shadow-sm backdrop-blur-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[#B794D1] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#C8A2E8] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-[#EC4899] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-[#D8C2F5]/50 dark:border-[#5A4267]/50 p-6 bg-gradient-to-r from-white/40 to-[#F8F6FF]/60 dark:from-[#352843]/60 dark:to-[#453354]/80 backdrop-blur-sm">
                {/* Wellness Feature Buttons */}
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBreathingModalOpen(true)}
                    className="flex items-center gap-2 bg-white/70 dark:bg-gray-800/70 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                  >
                    <Wind className="h-4 w-4" />
                    Breathing Exercise
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGoalModalOpen(true)}
                    className="flex items-center gap-2 bg-white/70 dark:bg-gray-800/70 hover:bg-pink-50 dark:hover:bg-pink-900/20 border-pink-200 dark:border-pink-700 text-pink-700 dark:text-pink-300"
                  >
                    <Target className="h-4 w-4" />
                    Set Goal
                  </Button>
                  {messages.length > 5 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSessionRecapOpen(true)}
                      className="flex items-center gap-2 bg-white/70 dark:bg-gray-800/70 hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Session Recap
                    </Button>
                  )}
                </div>

                <div className="flex items-end gap-4">
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Share your thoughts and feelings in this safe space..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      disabled={isTyping}
                      className="min-h-[50px] max-h-[120px] rounded-2xl border-[#D8C2F5] dark:border-[#5A4267] focus:ring-2 focus:ring-[#B794D1]/30 focus:border-[#B794D1] resize-none bg-white/60 dark:bg-[#2A2035]/60 backdrop-blur-sm text-[#3A2548] dark:text-[#F2D4F2] placeholder:text-[#78716C] dark:placeholder:text-[#A678AB]"
                    />
                  </div>
                  
                  {/* Mini-Journal Entry Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setJournalModalOpen(true)}
                    className="self-end mb-1 bg-white/70 dark:bg-gray-800/70 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300 p-2"
                    title="Quick Journal Entry"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                  
                  {/* Emoji Selector */}
                  <EmojiSelector 
                    onEmojiSelect={(emoji) => setInputMessage(prev => prev + emoji)}
                    className="self-end mb-1"
                  />
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    size="lg"
                    className="rounded-2xl bg-gradient-to-r from-[#B794D1] to-[#EC4899] hover:from-[#9B7CB8] hover:to-[#DB2777] text-white h-[50px] px-6 shadow-lg animate-float transition-all duration-300"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Wellness Modals */}
      <BreathingExercise
        isOpen={breathingModalOpen}
        onClose={() => setBreathingModalOpen(false)}
        persona={persona}
      />
      
      <GoalCreationModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onGoalCreated={(goal) => {
          console.log('Goal created:', goal);
          setGoalModalOpen(false);
          setConversationData(prev => ({
            ...prev,
            toolsUsed: [...prev.toolsUsed, 'goals']
          }));
        }}
        persona={persona}
      />
      
      <MiniJournalModal
        isOpen={journalModalOpen}
        onClose={() => setJournalModalOpen(false)}
        persona={persona}
        conversationId={conversationData.id}
      />
      
      <SessionRecapModal
        isOpen={sessionRecapOpen}
        onClose={() => setSessionRecapOpen(false)}
        persona={persona}
        conversationData={conversationData}
      />
    </div>
  );
}