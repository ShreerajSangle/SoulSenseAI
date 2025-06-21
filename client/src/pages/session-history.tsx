import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, MessageCircle, User, Calendar, Filter, Search, ChevronRight, Heart, Brain, Trophy, Leaf, Play, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface ChatSession {
  id: string;
  userId: string;
  personaId: string;
  personaName: string;
  startTime: string;
  endTime?: string;
  messageCount: number;
  duration: number; // in minutes
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

const personaIcons = {
  "sarah": Brain,
  "alex": Heart,
  "marcus": Trophy,
  "maya": Leaf,
};

const personaColors = {
  "sarah": "from-blue-500 to-cyan-500",
  "alex": "from-pink-500 to-rose-500", 
  "marcus": "from-orange-500 to-amber-500",
  "maya": "from-green-500 to-emerald-500",
};

const emotionColors = {
  "positive": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  "neutral": "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  "anxious": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "sad": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function SessionHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPersona, setFilterPersona] = useState<string>("all");
  const [filterEmotion, setFilterEmotion] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [, setLocation] = useLocation();

  // Mock data for demonstration
  const mockSessions: ChatSession[] = [
    {
      id: "1",
      userId: "user1",
      personaId: "sarah",
      personaName: "Dr. Sarah",
      startTime: "2024-06-20T10:30:00Z",
      endTime: "2024-06-20T11:15:00Z",
      messageCount: 23,
      duration: 45,
      summary: "Discussed anxiety management techniques and breathing exercises",
      emotionalTone: "anxious",
      topics: ["anxiety", "breathing", "mindfulness"],
      lastMessage: "Thank you for the breathing exercise suggestions, they really helped!",
      status: "completed"
    },
    {
      id: "2",
      userId: "user1",
      personaId: "alex",
      personaName: "Alex",
      startTime: "2024-06-19T14:20:00Z",
      endTime: "2024-06-19T15:05:00Z",
      messageCount: 18,
      duration: 45,
      summary: "Explored relationship challenges and communication strategies",
      emotionalTone: "neutral",
      topics: ["relationships", "communication", "conflict resolution"],
      lastMessage: "I'll try those communication techniques with my partner tonight.",
      status: "completed"
    },
    {
      id: "3",
      userId: "user1",
      personaId: "marcus",
      personaName: "Marcus",
      startTime: "2024-06-18T09:15:00Z",
      endTime: "2024-06-18T09:50:00Z",
      messageCount: 15,
      duration: 35,
      summary: "Goal setting and motivation strategies for career advancement",
      emotionalTone: "positive",
      topics: ["career", "goals", "motivation"],
      lastMessage: "That action plan looks perfect! I'm excited to get started.",
      status: "completed"
    },
    {
      id: "4",
      userId: "user1",
      personaId: "maya",
      personaName: "Maya",
      startTime: "2024-06-17T16:00:00Z",
      endTime: "2024-06-17T16:30:00Z",
      messageCount: 12,
      duration: 30,
      summary: "Mindfulness practice and stress reduction techniques",
      emotionalTone: "positive",
      topics: ["mindfulness", "meditation", "stress relief"],
      lastMessage: "The guided meditation was exactly what I needed today.",
      status: "completed"
    }
  ];

  // Filter sessions based on search and filters
  const filteredSessions = mockSessions.filter(session => {
    const matchesSearch = session.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         session.personaName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPersona = filterPersona === "all" || session.personaId === filterPersona;
    const matchesEmotion = filterEmotion === "all" || session.emotionalTone === filterEmotion;
    
    return matchesSearch && matchesPersona && matchesEmotion;
  });

  const openSessionDetails = (session: ChatSession) => {
    setSelectedSession(session);
    setIsDialogOpen(true);
  };

  const continueSession = (sessionId: string, personaId: string) => {
    setLocation(`/chat/${personaId}?sessionId=${sessionId}`);
  };

  const getPersonaIcon = (personaId: string) => {
    const IconComponent = personaIcons[personaId as keyof typeof personaIcons] || Brain;
    return IconComponent;
  };

  const getPersonaColor = (personaId: string) => {
    return personaColors[personaId as keyof typeof personaColors] || "from-purple-500 to-indigo-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-block p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl mb-6 shadow-2xl">
              <Clock className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Session History
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Review your past conversations, track your progress, and continue where you left off
            </p>
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-purple-200 dark:border-purple-800">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 border-slate-200 dark:border-slate-700 rounded-xl h-12"
                />
              </div>
              
              <Select value={filterPersona} onValueChange={setFilterPersona}>
                <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 rounded-xl h-12">
                  <SelectValue placeholder="Filter by persona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Personas</SelectItem>
                  <SelectItem value="sarah">Dr. Sarah</SelectItem>
                  <SelectItem value="alex">Alex</SelectItem>
                  <SelectItem value="marcus">Marcus</SelectItem>
                  <SelectItem value="maya">Maya</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterEmotion} onValueChange={setFilterEmotion}>
                <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 rounded-xl h-12">
                  <SelectValue placeholder="Filter by emotion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Emotions</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="anxious">Anxious</SelectItem>
                  <SelectItem value="sad">Sad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sessions Grid */}
          {filteredSessions.length === 0 ? (
            <div className="text-center py-16 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl">
              <MessageCircle className="w-20 h-20 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">No sessions found</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
                {searchQuery || filterPersona !== "all" || filterEmotion !== "all" 
                  ? "Try adjusting your filters" 
                  : "Start your first conversation to see sessions here"}
              </p>
              <Button 
                onClick={() => setLocation('/personas')}
                className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4" />
                Start New Conversation
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredSessions.map((session) => {
                const PersonaIcon = getPersonaIcon(session.personaId);
                const personaColor = getPersonaColor(session.personaId);
                
                return (
                  <Card 
                    key={session.id} 
                    className="group hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 rounded-3xl overflow-hidden transform hover:scale-105"
                    onClick={() => openSessionDetails(session)}
                  >
                    <CardHeader className={`pb-4 bg-gradient-to-r ${personaColor} text-white`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-xl">
                            <PersonaIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-white">
                              {session.personaName}
                            </CardTitle>
                            <p className="text-white/80 text-sm">
                              {formatDate(session.startTime)}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${emotionColors[session.emotionalTone as keyof typeof emotionColors] || emotionColors.neutral} font-semibold`}>
                          {session.emotionalTone}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <p className="text-slate-600 dark:text-slate-300 line-clamp-3">
                          {session.summary}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {session.topics.slice(0, 3).map((topic) => (
                            <Badge key={topic} variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                              {topic}
                            </Badge>
                          ))}
                          {session.topics.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700">
                              +{session.topics.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{session.messageCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(session.duration)}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openSessionDetails(session);
                              }}
                              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                continueSession(session.id, session.personaId);
                              }}
                              className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 hover:text-green-700"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Session Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-3xl">
          <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
            <DialogTitle className="flex items-center justify-between text-2xl">
              {selectedSession && (
                <>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 bg-gradient-to-r ${getPersonaColor(selectedSession.personaId)} rounded-2xl`}>
                      {(() => {
                        const PersonaIcon = getPersonaIcon(selectedSession.personaId);
                        return <PersonaIcon className="w-6 h-6 text-white" />;
                      })()}
                    </div>
                    <div>
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Session with {selectedSession.personaName}
                      </span>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                        {formatDate(selectedSession.startTime)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => continueSession(selectedSession.id, selectedSession.personaId)}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Continue
                  </Button>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-6 py-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-700 dark:text-blue-300">Messages</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{selectedSession.messageCount}</p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-700 dark:text-green-300">Duration</span>
                  </div>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-200">{formatDuration(selectedSession.duration)}</p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-700 dark:text-purple-300">Emotion</span>
                  </div>
                  <Badge className={`${emotionColors[selectedSession.emotionalTone as keyof typeof emotionColors] || emotionColors.neutral} text-lg px-3 py-1`}>
                    {selectedSession.emotionalTone}
                  </Badge>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl">
                <h4 className="font-semibold mb-4 text-lg text-slate-700 dark:text-slate-300">Session Summary</h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedSession.summary}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-lg text-slate-700 dark:text-slate-300">Topics Discussed</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedSession.topics.map((topic) => (
                    <Badge key={topic} variant="secondary" className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 text-sm">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-2xl">
                <h4 className="font-semibold mb-4 text-lg text-purple-700 dark:text-purple-300">Last Message</h4>
                <p className="text-purple-700 dark:text-purple-300 italic">
                  "{selectedSession.lastMessage}"
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}