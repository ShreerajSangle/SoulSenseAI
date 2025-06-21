import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, MessageCircle, User, Calendar, Filter, Search, ChevronRight, Heart, Brain, Trophy, Leaf, Play, Eye, ArrowLeft, Sparkles } from "lucide-react";
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
  "positive": "bg-green-100 text-green-800",
  "neutral": "bg-gray-100 text-gray-800",
  "anxious": "bg-yellow-100 text-yellow-800",
  "sad": "bg-blue-100 text-blue-800",
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
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-purple-200 to-purple-400 relative overflow-hidden">
      {/* Background Elements matching home page */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-24 h-24 bg-gradient-to-r from-pink-300 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-gradient-to-r from-pink-200 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-3000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
        {/* Navigation Header matching home page */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold text-purple-900">SoulSense AI</span>
          </div>
          <Button
            onClick={() => setLocation('/')}
            variant="outline"
            className="bg-white/90 border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Hero Section matching home page style */}
        <div className="text-center mb-16">
          <div className="w-32 h-32 mx-auto bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-pulse">
            <Clock className="text-white text-4xl" />
          </div>
          <h1 className="text-6xl font-bold text-purple-900 mb-6 leading-tight">
            Your Journey
            <span className="block text-5xl bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
              Session History
            </span>
          </h1>
          <p className="text-xl text-purple-800 max-w-3xl mx-auto leading-relaxed">
            Review your therapeutic conversations, track emotional progress, and continue building meaningful connections with your AI companions
          </p>
        </div>

        {/* Search and Filter Controls matching home page style */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5" />
              <Input
                placeholder="Search your conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-white border-2 border-purple-200 rounded-2xl text-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
              />
            </div>
            
            <Select value={filterPersona} onValueChange={setFilterPersona}>
              <SelectTrigger className="h-14 bg-white border-2 border-purple-200 rounded-2xl text-lg hover:border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300">
                <SelectValue placeholder="Filter by AI companion" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-purple-200 rounded-2xl shadow-2xl">
                <SelectItem value="all" className="text-lg py-3 hover:bg-purple-50 focus:bg-purple-50">All Companions</SelectItem>
                <SelectItem value="sarah" className="text-lg py-3 hover:bg-purple-50 focus:bg-purple-50">🧠 Dr. Sarah</SelectItem>
                <SelectItem value="alex" className="text-lg py-3 hover:bg-purple-50 focus:bg-purple-50">❤️ Alex</SelectItem>
                <SelectItem value="marcus" className="text-lg py-3 hover:bg-purple-50 focus:bg-purple-50">🏆 Marcus</SelectItem>
                <SelectItem value="maya" className="text-lg py-3 hover:bg-purple-50 focus:bg-purple-50">🍃 Maya</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterEmotion} onValueChange={setFilterEmotion}>
              <SelectTrigger className="h-14 bg-white border-2 border-purple-200 rounded-2xl text-lg hover:border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300">
                <SelectValue placeholder="Filter by mood" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-purple-200 rounded-2xl shadow-2xl">
                <SelectItem value="all" className="text-lg py-3 hover:bg-purple-50 focus:bg-purple-50">All Moods</SelectItem>
                <SelectItem value="positive" className="text-lg py-3 hover:bg-purple-50 focus:bg-purple-50">😊 Positive</SelectItem>
                <SelectItem value="neutral" className="text-lg py-3 hover:bg-purple-50 focus:bg-purple-50">😐 Neutral</SelectItem>
                <SelectItem value="anxious" className="text-lg py-3 hover:bg-purple-50 focus:bg-purple-50">😰 Anxious</SelectItem>
                <SelectItem value="sad" className="text-lg py-3 hover:bg-purple-50 focus:bg-purple-50">😔 Sad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sessions Grid */}
        {filteredSessions.length === 0 ? (
          <div className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-8 animate-pulse">
              <MessageCircle className="text-white text-4xl" />
            </div>
            <h3 className="text-3xl font-bold text-purple-900 mb-4">No conversations yet</h3>
            <p className="text-xl text-purple-700 mb-10 max-w-md mx-auto">
              {searchQuery || filterPersona !== "all" || filterEmotion !== "all" 
                ? "Try adjusting your search filters" 
                : "Begin your therapeutic journey with one of our AI companions"}
            </p>
            <Button 
              onClick={() => setLocation('/personas')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Your First Session
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredSessions.map((session) => {
              const PersonaIcon = getPersonaIcon(session.personaId);
              const personaColor = getPersonaColor(session.personaId);
              
              return (
                <Card 
                  key={session.id} 
                  className="group hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white/80 backdrop-blur-sm border-0 rounded-3xl overflow-hidden transform hover:scale-105"
                  onClick={() => openSessionDetails(session)}
                >
                  <CardHeader className={`pb-4 bg-gradient-to-r ${personaColor} text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-2xl">
                          <PersonaIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg font-bold">{session.personaName}</CardTitle>
                          <p className="text-white/80 text-sm">{formatDate(session.startTime)}</p>
                        </div>
                      </div>
                      <Badge className={`${emotionColors[session.emotionalTone as keyof typeof emotionColors]} font-medium`}>
                        {session.emotionalTone}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6 space-y-4">
                    <p className="text-purple-800 text-sm leading-relaxed line-clamp-3">{session.summary}</p>
                    
                    <div className="flex items-center gap-4 text-purple-600 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(session.duration)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {session.messageCount} messages
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {session.topics.slice(0, 3).map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-purple-200 text-purple-700">
                          {topic}
                        </Badge>
                      ))}
                      {session.topics.length > 3 && (
                        <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                          +{session.topics.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-purple-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openSessionDetails(session);
                        }}
                        className="text-purple-600 hover:bg-purple-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      
                      {session.status === "active" && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            continueSession(session.id, session.personaId);
                          }}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Continue
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Session Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] bg-white rounded-3xl border-0 shadow-2xl">
            <DialogHeader className="pb-6 border-b border-purple-100">
              <DialogTitle className="text-2xl font-bold text-purple-900 flex items-center gap-3">
                {selectedSession && (
                  <>
                    <div className={`p-3 bg-gradient-to-r ${getPersonaColor(selectedSession.personaId)} rounded-2xl`}>
                      {(() => {
                        const PersonaIcon = getPersonaIcon(selectedSession.personaId);
                        return <PersonaIcon className="w-6 h-6 text-white" />;
                      })()}
                    </div>
                    Session with {selectedSession.personaName}
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {selectedSession && (
              <ScrollArea className="max-h-96">
                <div className="space-y-6 pr-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-purple-900">Session Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-600">Duration:</span>
                          <span className="font-medium">{formatDuration(selectedSession.duration)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-600">Messages:</span>
                          <span className="font-medium">{selectedSession.messageCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-600">Status:</span>
                          <Badge className={selectedSession.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {selectedSession.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-600">Emotional tone:</span>
                          <Badge className={emotionColors[selectedSession.emotionalTone as keyof typeof emotionColors]}>
                            {selectedSession.emotionalTone}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-purple-900">Topics Discussed</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSession.topics.map((topic, index) => (
                          <Badge key={index} variant="outline" className="border-purple-200 text-purple-700">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-purple-900">Summary</h4>
                    <p className="text-purple-800 leading-relaxed bg-purple-50 p-4 rounded-2xl">
                      {selectedSession.summary}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-purple-900">Last Message</h4>
                    <p className="text-purple-700 italic bg-purple-25 p-4 rounded-2xl border-l-4 border-purple-300">
                      "{selectedSession.lastMessage}"
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-6 border-t border-purple-100">
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      Close
                    </Button>
                    {selectedSession.status === "active" && (
                      <Button
                        onClick={() => {
                          continueSession(selectedSession.id, selectedSession.personaId);
                          setIsDialogOpen(false);
                        }}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Continue Session
                      </Button>
                    )}
                  </div>
                </div>
              </ScrollArea>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}