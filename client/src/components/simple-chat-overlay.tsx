import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { X, Send, Wind, Target, BookOpen, MessageCircle, Smile } from "lucide-react";
import { EnhancedEmojiSelector } from "@/components/enhanced-emoji-selector";
import { GentleBreathingGuide } from "@/components/gentle-breathing-guide";
import { GoalCreationModal } from "@/components/goal-creation-modal";
import { MiniJournalModal } from "@/components/mini-journal-modal";
import { QuickReplyBubbles } from "@/components/quick-reply-bubbles";
import { SessionRecapModal } from "@/components/session-recap-modal";
import { DynamicTypingIndicator } from "@/components/dynamic-typing-indicator";
import { MoodTimeline } from "@/components/mood-timeline";

interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  emotion?: string;
  emotions?: string[];
  intensity?: number;
  persona?: string;
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
  const [showBreathingGuide, setShowBreathingGuide] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [currentGoals, setCurrentGoals] = useState<any[]>([]);
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [sessionRecapOpen, setSessionRecapOpen] = useState(false);
  const [showMoodTimeline, setShowMoodTimeline] = useState(false);
  const [sessionData, setSessionData] = useState({
    emotionalThemes: [] as string[],
    keyInsights: [] as string[],
    goalsSet: [] as string[],
    breathingExercises: 0,
    duration: "0 minutes",
    startTime: new Date()
  });
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
      
      // Check for wellness feature triggers with enhanced detection
      const lowerMessage = message.toLowerCase();
      const stressIndicators = ['stress', 'anxious', 'overwhelm', 'panic', 'worried', 'nervous', 'tense', 'breathless'];
      const goalIndicators = ['goal', 'improve', 'want to', 'need to', 'should', 'better', 'change', 'plan'];
      
      const hasStress = stressIndicators.some(indicator => lowerMessage.includes(indicator));
      const needsGoals = goalIndicators.some(indicator => lowerMessage.includes(indicator));
      
      // Auto-trigger breathing exercise for stress/anxiety
      if (hasStress && !showBreathingGuide) {
        setTimeout(() => setShowBreathingGuide(true), 2000);
      }
      
      // Suggest goal setting for improvement desires
      if (needsGoals && currentGoals.length === 0) {
        setTimeout(() => setGoalModalOpen(true), 4000);
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
        
        // Update user message with detected emotions
        if (data.emotionalContext && data.emotionalContext.detectedEmotions) {
          setMessages(prev => prev.map(msg => 
            msg.id === userMessage.id 
              ? { 
                  ...msg, 
                  emotions: data.emotionalContext.detectedEmotions,
                  intensity: data.emotionalContext.intensity 
                }
              : msg
          ));
          
          // Update global emotion state
          const primaryEmotion = data.emotionalContext.detectedEmotions[0];
          if (primaryEmotion) {
            setCurrentEmotion(primaryEmotion.charAt(0).toUpperCase() + primaryEmotion.slice(1));
            setEmotionIntensity(Math.round(data.emotionalContext.intensity * 100));
          }
        }
        
        const aiMessage: Message = {
          id: Date.now() + 1,
          content: data.message?.content || data.aiResponse || "I'm here to help. Could you tell me more about what you're experiencing?",
          sender: "ai",
          timestamp: new Date(),
          persona: persona.name,
          emotion: data.emotionDetected
        };
        
        setMessages(prev => [...prev, aiMessage]);
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
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        
        {/* Minimalist Header */}
        <div className="bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {persona.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h2 className="font-heading text-lg font-normal text-gray-900 dark:text-white">
                  {persona.name}
                </h2>
                <p className="font-body text-xs text-gray-500 dark:text-gray-400 font-light">
                  {persona.role}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Minimalist Status Indicators */}
              {sessionStarted && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
                </div>
              )}
              
              {/* Clean Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Session Check-in or Chat Content */}
        <div className="flex-1 flex flex-col h-[calc(85vh-80px)]">
          {!sessionStarted ? (
            /* Minimalist Session Check-in */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-lg w-full space-y-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-xl font-medium">
                      {persona.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="font-heading text-2xl font-normal text-gray-900 dark:text-white">
                    {persona.name}
                  </h3>
                  <p className="font-body text-gray-600 dark:text-gray-400 text-sm font-light">
                    How are you feeling today?
                  </p>
                </div>
                
                <div className="space-y-4">
                  <Textarea
                    placeholder="Tell me what's on your mind..."
                    value={checkInResponse}
                    onChange={(e) => setCheckInResponse(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="min-h-[120px] resize-none border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 transition-all"
                  />
                  <Button
                    onClick={handleStartSession}
                    disabled={!checkInResponse.trim()}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-body font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start Conversation
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <>
              {/* Therapeutic Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-purple-50/20 via-pink-50/10 to-purple-50/20">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex items-start gap-3 max-w-[70%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                      {message.sender === "ai" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-medium">
                            {persona.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}
                      
                      <div className={`px-4 py-3 transition-all animate-therapeutic-fade ${
                        message.sender === "user" 
                          ? "bubble-user" 
                          : "bubble-ai"
                      }`}>
                        <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        
                        {/* Clean timestamp */}
                        <div className={`text-xs mt-2 ${
                          message.sender === "user" ? "text-white/70" : "text-gray-500 dark:text-gray-400"
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Minimalist Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3 max-w-[70%]">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-medium">
                          {persona.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Input Area with Wellness Features */}
              <div className="glass-therapeutic border-t-0">
                {/* Breathing Guide (when triggered) */}
                {showBreathingGuide && (
                  <div className="mb-4">
                    <GentleBreathingGuide 
                      persona={persona.id === 'sarah' ? 'sarah' : persona.id as any}
                      onComplete={() => {
                        setShowBreathingGuide(false);
                        setSessionData(prev => ({
                          ...prev,
                          breathingExercises: prev.breathingExercises + 1
                        }));
                      }}
                      onClose={() => setShowBreathingGuide(false)}
                    />
                  </div>
                )}

                {/* Active Goals Display */}
                {currentGoals.length > 0 && (
                  <div className="mb-4 p-3 bg-white/60 rounded-lg border border-purple-200/50 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                    <p className="text-xs font-medium text-purple-700 mb-2">Today's Goals:</p>
                    <div className="space-y-1">
                      {currentGoals.slice(-2).map((goal, index) => (
                        <div 
                          key={goal.id} 
                          className="text-sm text-purple-600 flex items-center gap-2 animate-in fade-in-0 slide-in-from-left-2 duration-200"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                          {goal.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Reply Bubbles (show under AI messages) */}
                {messages.length > 0 && messages[messages.length - 1]?.sender === 'ai' && !isTyping && (
                  <div className="mb-4">
                    <QuickReplyBubbles 
                      persona={persona.id === 'sarah' ? 'dr_sarah' : persona.id as any}
                      onReplySelect={(reply) => {
                        setInputMessage(reply);
                        // Auto-focus textarea after selection
                        setTimeout(() => {
                          const textarea = document.querySelector('textarea');
                          if (textarea) textarea.focus();
                        }, 100);
                      }}
                      lastAiMessage={messages.length > 0 ? messages[messages.length - 1]?.content || "" : ""}
                      userEmotion={currentEmotion || "neutral"}
                      conversationHistory={messages}
                    />
                  </div>
                )}

                {/* Unified Message Input Container */}
                <div className="input-container-unified">
                  {/* Emoji Selector */}
                  <EnhancedEmojiSelector 
                    onEmojiSelect={(emoji) => setInputMessage(prev => prev + emoji)}
                    className="action-button"
                  />
                  
                  {/* Journal Entry Icon */}
                  <button
                    onClick={() => setJournalModalOpen(true)}
                    className="action-button"
                    title="Quick journal entry"
                  >
                    <BookOpen className="h-4 w-4" />
                  </button>
                  
                  {/* Message Input Field */}
                  <Textarea
                    placeholder={`Share with ${persona.name}...`}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isTyping}
                    className="input-field text-therapeutic-body placeholder:text-slate-400 placeholder:font-light"
                  />

                  {/* Quick Wellness Actions */}
                  <button
                    onClick={() => setGoalModalOpen(true)}
                    className="action-button"
                    title="Set a wellness goal"
                  >
                    <Target className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowBreathingGuide(true);
                      setSessionData(prev => ({
                        ...prev,
                        breathingExercises: prev.breathingExercises + 1
                      }));
                    }}
                    className="action-button"
                    title="Breathing exercise"
                  >
                    <Wind className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => {
                      const duration = Math.floor((new Date().getTime() - sessionData.startTime.getTime()) / 60000);
                      setSessionData(prev => ({
                        ...prev,
                        duration: `${duration} minutes`,
                        emotionalThemes: Array.from(new Set([...prev.emotionalThemes, currentEmotion]))
                      }));
                      setSessionRecapOpen(true);
                    }}
                    className="action-button"
                    title="Session summary"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                  
                  {/* Send Message Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="send-button"
                    title="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Enhanced Wellness Components */}
      <GoalCreationModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onGoalCreated={(goal) => {
          setCurrentGoals(prev => [...prev, goal]);
          setSessionData(prev => ({
            ...prev,
            goalsSet: [...prev.goalsSet, goal.text]
          }));
          setGoalModalOpen(false);
        }}
        persona={persona.id === 'sarah' ? 'dr_sarah' : persona.id as any}
      />

      <MiniJournalModal
        isOpen={journalModalOpen}
        onClose={() => setJournalModalOpen(false)}
        onEntryCreated={(entry) => {
          setJournalEntries(prev => [...prev, entry]);
          setSessionData(prev => ({
            ...prev,
            keyInsights: [...prev.keyInsights, `Journal: ${entry.text.slice(0, 50)}...`]
          }));
          setJournalModalOpen(false);
        }}
        persona={persona.id === 'sarah' ? 'dr_sarah' : persona.id as any}
      />

      <SessionRecapModal
        isOpen={sessionRecapOpen}
        onClose={() => setSessionRecapOpen(false)}
        persona={{
          name: persona.name,
          emoji: persona.emoji
        }}
        sessionData={sessionData}
      />
    </div>
  );
}