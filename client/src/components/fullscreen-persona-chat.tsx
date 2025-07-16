import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Wind, Target, BookOpen, MessageCircle, Smile, X } from "lucide-react";
import BreathingExercise from "@/components/breathing-exercise";
import { GoalCreationModal } from "@/components/goal-creation-modal";
import { MiniJournalModal } from "@/components/mini-journal-modal";
import { QuickReplyBubbles } from "@/components/quick-reply-bubbles";
import { SessionRecapModal } from "@/components/session-recap-modal";
import { DynamicTypingIndicator } from "@/components/dynamic-typing-indicator";
import { MoodTimeline } from "@/components/mood-timeline";
// Removed duplicate import - BreathingExercise already imported above

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

interface FullscreenPersonaChatProps {
  persona: Persona;
  isOpen: boolean;
  onClose: () => void;
}

export function FullscreenPersonaChat({ persona, isOpen, onClose }: FullscreenPersonaChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [checkInResponse, setCheckInResponse] = useState("");
  const [currentEmotion, setCurrentEmotion] = useState("Neutral");
  const [emotionIntensity, setEmotionIntensity] = useState(50);
  const [showBreathingGuide, setShowBreathingGuide] = useState(false);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
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

  // ESC key handler for closing modals
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showBreathingExercise) setShowBreathingExercise(false);
        else if (goalModalOpen) setGoalModalOpen(false);
        else if (journalModalOpen) setJournalModalOpen(false);
        else if (sessionRecapOpen) setSessionRecapOpen(false);
        else if (showMoodTimeline) setShowMoodTimeline(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [isOpen, showBreathingExercise, goalModalOpen, journalModalOpen, sessionRecapOpen, showMoodTimeline]);

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
      
      // Auto-trigger breathing guide for stress indicators
      if (stressIndicators.some(indicator => lowerMessage.includes(indicator))) {
        setTimeout(() => setShowBreathingExercise(true), 2000);
      }
      
      // Auto-suggest goal setting for goal indicators
      if (goalIndicators.some(indicator => lowerMessage.includes(indicator))) {
        setTimeout(() => {
          const suggestion = "Would you like to set a specific goal around this?";
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            content: suggestion,
            sender: "ai",
            timestamp: new Date(),
            persona: persona.id
          }]);
        }, 1500);
      }

      // Send to persona-specific API endpoint
      const response = await fetch(`/api/chat/${persona.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: messages.slice(-10),
          emotionalContext: {
            currentEmotion,
            intensity: emotionIntensity / 100,
            detectedEmotions: [currentEmotion.toLowerCase()]
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: Message = {
          id: Date.now() + 1,
          content: data.message || data.response || "I hear you. Let me think about that...",
          sender: "ai",
          timestamp: new Date(),
          persona: persona.id
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to get response');
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        content: "I'm having trouble connecting right now. Can you try again?",
        sender: "ai",
        timestamp: new Date(),
        persona: persona.id
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setInputMessage("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage.trim());
    }
  };

  const getPersonaColors = () => {
    switch (persona.id) {
      case 'maya':
        return {
          primary: 'from-purple-400 to-pink-400',
          secondary: 'bg-purple-50 dark:bg-purple-900/20',
          accent: 'text-purple-700 dark:text-purple-300',
          button: 'bg-purple-500 hover:bg-purple-600'
        };
      case 'sarah':
        return {
          primary: 'from-blue-400 to-teal-400',
          secondary: 'bg-blue-50 dark:bg-blue-900/20',
          accent: 'text-blue-700 dark:text-blue-300',
          button: 'bg-blue-500 hover:bg-blue-600'
        };
      case 'alex':
        return {
          primary: 'from-orange-400 to-red-400',
          secondary: 'bg-orange-50 dark:bg-orange-900/20',
          accent: 'text-orange-700 dark:text-orange-300',
          button: 'bg-orange-500 hover:bg-orange-600'
        };
      case 'marcus':
        return {
          primary: 'from-green-400 to-emerald-400',
          secondary: 'bg-green-50 dark:bg-green-900/20',
          accent: 'text-green-700 dark:text-green-300',
          button: 'bg-green-500 hover:bg-green-600'
        };
      default:
        return {
          primary: 'from-gray-400 to-gray-500',
          secondary: 'bg-gray-50 dark:bg-gray-900/20',
          accent: 'text-gray-700 dark:text-gray-300',
          button: 'bg-gray-500 hover:bg-gray-600'
        };
    }
  };

  const colors = getPersonaColors();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 animate-in fade-in duration-300">
      {/* Header with Back Button */}
      <div className={`bg-gradient-to-r ${colors.primary} shadow-lg`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white/20">
              <AvatarImage src={persona.avatar} alt={persona.name} />
              <AvatarFallback className="bg-white/20 text-white">
                {persona.emoji}
              </AvatarFallback>
            </Avatar>
            <div className="text-white">
              <h2 className="font-semibold">{persona.name}</h2>
              <p className="text-sm opacity-90">{persona.role}</p>
            </div>
          </div>
          
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-[calc(100vh-80px)]">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className={`text-center p-8 rounded-2xl ${colors.secondary} border border-purple-100 dark:border-purple-800`}>
              <div className="text-6xl mb-4">{persona.emoji}</div>
              <h3 className={`text-xl font-semibold mb-2 ${colors.accent}`}>
                Welcome to your session with {persona.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {persona.description}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary" className="bg-white/50">Safe Space</Badge>
                <Badge variant="secondary" className="bg-white/50">Confidential</Badge>
                <Badge variant="secondary" className="bg-white/50">Judgment-Free</Badge>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                {message.sender === 'ai' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={persona.avatar} alt={persona.name} />
                      <AvatarFallback className={colors.secondary}>
                        {persona.emoji}
                      </AvatarFallback>
                    </Avatar>
                    <span className={`text-sm font-medium ${colors.accent}`}>
                      {persona.name}
                    </span>
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl ${
                    message.sender === 'user'
                      ? `bg-gradient-to-r ${colors.primary} text-white`
                      : `${colors.secondary} text-gray-800 dark:text-gray-200`
                  } shadow-sm`}
                >
                  {message.content}
                </div>
                <div className="text-xs text-gray-500 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={persona.avatar} alt={persona.name} />
                  <AvatarFallback className={colors.secondary}>
                    {persona.emoji}
                  </AvatarFallback>
                </Avatar>
                <DynamicTypingIndicator persona={persona.id as any} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions Bar */}
        <div className="px-4 py-2 border-t border-purple-100 dark:border-gray-700">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGoalModalOpen(true)}
              className="text-xs"
            >
              <Target className="h-3 w-3 mr-1" />
              Set Goal
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBreathingExercise(true)}
              className="text-xs"
            >
              <Wind className="h-3 w-3 mr-1" />
              Breathe
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setJournalModalOpen(true)}
              className="text-xs"
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Journal
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSessionRecapOpen(true)}
              className="text-xs"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Recap
            </Button>
          </div>

          {/* Quick Reply Bubbles */}
          <QuickReplyBubbles
            persona={persona}
            onReplySelect={(reply) => {
              setInputMessage(reply);
              document.querySelector<HTMLTextAreaElement>('textarea')?.focus();
            }}
          />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-purple-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Share what's on your mind with ${persona.name}...`}
                className="min-h-[60px] resize-none pr-12 rounded-xl border-purple-200 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <div className="absolute bottom-3 right-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-purple-100"
                  onClick={() => setShowBreathingExercise(true)}
                >
                  <Smile className="h-4 w-4 text-purple-600" />
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className={`${colors.button} text-white px-6 py-3 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100`}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Enhanced Modals with ESC Support and Overlay Click */}
      {showBreathingExercise && (
        <BreathingExercise
          isOpen={showBreathingExercise}
          onClose={() => setShowBreathingExercise(false)}
          persona={{ id: persona.id, name: persona.name, color: persona.color }}
        />
      )}

      {goalModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setGoalModalOpen(false);
          }}
        >
          <div className="w-full max-w-md">
            <GoalCreationModal
              isOpen={goalModalOpen}
              onClose={() => setGoalModalOpen(false)}
              persona={persona}
              onGoalCreated={(goal) => {
                setCurrentGoals(prev => [...prev, goal]);
                setGoalModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {journalModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setJournalModalOpen(false);
          }}
        >
          <div className="w-full max-w-md">
            <MiniJournalModal
              isOpen={journalModalOpen}
              onClose={() => setJournalModalOpen(false)}
              persona={persona}
              currentEmotion={currentEmotion}
              onEntryCreated={(entry) => {
                setJournalEntries(prev => [...prev, entry]);
                setJournalModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {sessionRecapOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSessionRecapOpen(false);
          }}
        >
          <div className="w-full max-w-md">
            <SessionRecapModal
              isOpen={sessionRecapOpen}
              onClose={() => setSessionRecapOpen(false)}
              persona={persona}
              sessionData={sessionData}
              conversationData={conversationData}
            />
          </div>
        </div>
      )}

      {/* Back to Chat Button for Modals */}
      {(goalModalOpen || journalModalOpen || sessionRecapOpen) && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setGoalModalOpen(false);
            setJournalModalOpen(false);
            setSessionRecapOpen(false);
          }}
          className="fixed bottom-6 right-6 z-[70] shadow-lg"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Back to Chat
        </Button>
      )}
    </div>
  );
}