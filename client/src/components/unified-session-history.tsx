import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Clock, 
  MessageCircle, 
  Calendar, 
  Search, 
  X, 
  Heart, 
  Brain, 
  Trophy, 
  Leaf, 
  ChevronRight,
  Filter,
  Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

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

interface UnifiedSessionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionSelect?: (sessionId: string) => void;
  currentPersonaId?: string;
}

const personaIcons = {
  "sarah": Brain,
  "alex": Heart,
  "marcus": Trophy,
  "maya": Leaf,
};

const personaGradients = {
  "sarah": "from-blue-500 via-cyan-500 to-indigo-500",
  "alex": "from-pink-500 via-rose-500 to-red-500", 
  "marcus": "from-orange-500 via-amber-500 to-yellow-500",
  "maya": "from-green-500 via-emerald-500 to-teal-500",
};

const emotionColors = {
  "happy": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "sad": "bg-blue-100 text-blue-800 border-blue-200",
  "anxious": "bg-orange-100 text-orange-800 border-orange-200",
  "calm": "bg-green-100 text-green-800 border-green-200",
  "frustrated": "bg-red-100 text-red-800 border-red-200",
  "neutral": "bg-gray-100 text-gray-800 border-gray-200",
  "supportive": "bg-purple-100 text-purple-800 border-purple-200",
};

export default function UnifiedSessionHistory({ 
  isOpen, 
  onClose, 
  onSessionSelect,
  currentPersonaId 
}: UnifiedSessionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [filterPersona, setFilterPersona] = useState<string>("all");

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['/api/chat-sessions'],
    enabled: isOpen,
  });

  const { data: sessionMessages = [] } = useQuery({
    queryKey: ['/api/chat-sessions', selectedSession?.id, 'messages'],
    enabled: !!selectedSession,
  });

  const filteredSessions = sessions.filter((session: ChatSession) => {
    const matchesSearch = session.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPersona = filterPersona === "all" || session.personaId === filterPersona;
    return matchesSearch && matchesPersona;
  });

  const formatDate = (dateString: string) => {
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

          {/* Side Panel */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white/95 backdrop-blur-lg shadow-2xl z-50 border-l border-slate-200/50"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Session History</h2>
                    <p className="text-sm text-slate-600">Your therapeutic journey</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Search and Filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/70 border-slate-200/50 focus:bg-white transition-colors"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={filterPersona === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterPersona("all")}
                    className="text-xs"
                  >
                    All
                  </Button>
                  {Object.entries(personaIcons).map(([personaId, Icon]) => (
                    <Button
                      key={personaId}
                      variant={filterPersona === personaId ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterPersona(personaId)}
                      className="text-xs px-2"
                    >
                      <Icon className="w-3 h-3" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sessions List */}
            <ScrollArea className="flex-1 p-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-200/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium">No sessions found</p>
                  <p className="text-sm">Start a conversation to see your history</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSessions.map((session: ChatSession) => {
                    const PersonaIcon = personaIcons[session.personaId as keyof typeof personaIcons] || Brain;
                    const gradient = personaGradients[session.personaId as keyof typeof personaGradients];
                    const isCurrentPersona = session.personaId === currentPersonaId;

                    return (
                      <motion.div
                        key={session.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card 
                          className={`cursor-pointer group transition-all duration-300 hover:shadow-lg border-0 bg-white/70 hover:bg-white/90 ${
                            isCurrentPersona ? 'ring-2 ring-indigo-200 shadow-md' : ''
                          }`}
                          onClick={() => handleSessionClick(session)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                <PersonaIcon className="w-5 h-5 text-white" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">
                                    {session.personaName}
                                  </h3>
                                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                </div>
                                
                                <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                                  {session.summary}
                                </p>
                                
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      className={`${emotionColors[session.emotionalTone as keyof typeof emotionColors] || emotionColors.neutral} text-xs px-2 py-0.5`}
                                    >
                                      {session.emotionalTone}
                                    </Badge>
                                    <span className="text-slate-500 flex items-center gap-1">
                                      <MessageCircle className="w-3 h-3" />
                                      {session.messageCount}
                                    </span>
                                  </div>
                                  <span className="text-slate-500 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(session.startTime)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </motion.div>

          {/* Session Detail Modal */}
          <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedSession && (
                    <>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${personaGradients[selectedSession.personaId as keyof typeof personaGradients]} flex items-center justify-center`}>
                        {(() => {
                          const Icon = personaIcons[selectedSession.personaId as keyof typeof personaIcons];
                          return <Icon className="w-5 h-5 text-white" />;
                        })()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">Session with {selectedSession.personaName}</div>
                        <div className="text-sm text-slate-600 font-normal">
                          {formatDate(selectedSession.startTime)} • {selectedSession.duration} min • {selectedSession.messageCount} messages
                        </div>
                      </div>
                    </>
                  )}
                </DialogTitle>
              </DialogHeader>
              
              <ScrollArea className="h-96 pr-4">
                <div className="space-y-4">
                  {sessionMessages.map((message: ChatMessage) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.sender === 'user'
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </>
      )}
    </AnimatePresence>
  );
}