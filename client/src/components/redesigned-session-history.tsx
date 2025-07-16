import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { X, Search, Calendar, Clock, MessageSquare, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ChatSession {
  id: string;
  userId: string;
  personaId: string;
  personaName: string;
  startTime: string;
  endTime?: string;
  messageCount: number;
  duration: number;
  summary: string;
  emotionalTone: string;
  topics: string[];
  lastMessage: string;
  status: "active" | "completed";
}

interface ChatMessage {
  id: string;
  sessionId: string;
  sender: "user" | "persona";
  content: string;
  timestamp: string;
  emotion?: string;
}

interface RedesignedSessionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionSelect?: (sessionId: string) => void;
  currentPersonaId?: string;
}

export default function RedesignedSessionHistory({ 
  isOpen, 
  onClose, 
  onSessionSelect,
  currentPersonaId 
}: RedesignedSessionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPersona, setFilterPersona] = useState("all");
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['/api/chat-sessions'],
  });

  const { data: sessionMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['/api/chat-sessions', selectedSession?.id, 'messages'],
    enabled: !!selectedSession,
  });

  const filteredSessions = (sessions as ChatSession[])?.filter((session: ChatSession) => {
    const matchesSearch = session.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPersona = filterPersona === "all" || session.personaId === filterPersona;
    return matchesSearch && matchesPersona;
  }) || [];

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getPersonaEmoji = (personaId: string) => {
    const emojis = {
      'sarah': '👩‍⚕️',
      'alex': '🤝',
      'marcus': '💪',
      'maya': '🧘‍♀️'
    };
    return emojis[personaId as keyof typeof emojis] || '🤖';
  };

  const getEmotionColor = (emotion: string) => {
    const colors = {
      'happy': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'calm': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'anxious': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'neutral': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
      'supportive': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'hopeful': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'peaceful': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300'
    };
    return colors[emotion as keyof typeof colors] || colors.neutral;
  };

  const handleSessionClick = (session: ChatSession) => {
    if (onSessionSelect) {
      onSessionSelect(session.id);
      onClose();
    } else {
      setSelectedSession(session);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Main Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-5xl bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 shadow-2xl z-50 overflow-hidden"
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
              <div className="absolute top-40 right-10 w-24 h-24 bg-gradient-to-r from-pink-300 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse delay-1000"></div>
              <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
            </div>

            <div className="flex flex-col h-full relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/20 dark:border-gray-700/50 backdrop-blur-sm">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Your Journey Timeline
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Explore your growth and conversations
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Search and Filter */}
              <div className="p-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search your conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-200"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {["all", "sarah", "alex", "marcus", "maya"].map((persona) => (
                    <Button
                      key={persona}
                      variant={filterPersona === persona ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterPersona(persona)}
                      className={`rounded-full px-4 py-2 transition-all duration-200 ${
                        filterPersona === persona
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                          : "bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80"
                      }`}
                    >
                      {persona === "all" ? "All" : persona.charAt(0).toUpperCase() + persona.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sessions List */}
              <ScrollArea className="flex-1 px-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading your journey...</p>
                    </div>
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No conversations found</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pb-6">
                    {filteredSessions.map((session: ChatSession) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/20 dark:border-gray-700/50"
                        onClick={() => handleSessionClick(session)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{getPersonaEmoji(session.personaId)}</div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {session.personaName}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatRelativeTime(session.startTime)}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${getEmotionColor(session.emotionalTone)} border-0`}>
                            {session.emotionalTone}
                          </Badge>
                        </div>

                        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                          {session.summary}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {session.topics.slice(0, 3).map((topic, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="h-4 w-4" />
                              <span>{session.messageCount}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{session.duration}min</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </motion.div>

          {/* Session Detail Modal */}
          {selectedSession && (
            <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 border-0">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {selectedSession.personaName} - {formatRelativeTime(selectedSession.startTime)}
                  </DialogTitle>
                </DialogHeader>
                
                <ScrollArea className="h-96 pr-4">
                  <div className="space-y-4">
                    {isLoadingMessages ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                      </div>
                    ) : (
                      (sessionMessages as ChatMessage[])?.map((message: ChatMessage) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              message.sender === 'user'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                : 'bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </AnimatePresence>
  );
}