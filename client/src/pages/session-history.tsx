import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, MessageCircle, User, Calendar, Filter, Search, ChevronRight, Heart, Brain, Trophy, Leaf } from "lucide-react";
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

const emotionColors = {
  "positive": "bg-green-100 text-green-800",
  "neutral": "bg-gray-100 text-gray-800",
  "anxious": "bg-yellow-100 text-yellow-800",
  "sad": "bg-blue-100 text-blue-800",
  "angry": "bg-red-100 text-red-800",
};

export default function SessionHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPersona, setFilterPersona] = useState<string>("");
  const [filterEmotion, setFilterEmotion] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [, setLocation] = useLocation();

  // Fetch chat sessions
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["/api/chat-sessions"],
    queryFn: async () => {
      const response = await apiRequest("/api/chat-sessions", "GET");
      return await response.json();
    }
  });

  // Fetch messages for selected session
  const { data: sessionMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/chat-messages", selectedSession?.id],
    queryFn: async () => {
      if (!selectedSession?.id) return [];
      const response = await apiRequest(`/api/chat-messages/${selectedSession.id}`, "GET");
      return await response.json();
    },
    enabled: !!selectedSession?.id
  });

  const filteredSessions = sessions.filter((session: ChatSession) => {
    const matchesSearch = session.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.personaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPersona = !filterPersona || session.personaId === filterPersona;
    const matchesEmotion = !filterEmotion || session.emotionalTone === filterEmotion;
    
    return matchesSearch && matchesPersona && matchesEmotion;
  });

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const continueSession = (session: ChatSession) => {
    setLocation(`/chat/${session.personaId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your conversation history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-800 to-pink-600 bg-clip-text text-transparent mb-2">
            Session History
          </h1>
          <p className="text-lg text-slate-600">
            Review your past conversations and continue where you left off
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterPersona} onValueChange={setFilterPersona}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Filter by persona" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 z-50">
                  <SelectItem value="" className="hover:bg-slate-100 dark:hover:bg-slate-700">All personas</SelectItem>
                  <SelectItem value="sarah" className="hover:bg-slate-100 dark:hover:bg-slate-700">Dr. Sarah</SelectItem>
                  <SelectItem value="alex" className="hover:bg-slate-100 dark:hover:bg-slate-700">Alex</SelectItem>
                  <SelectItem value="marcus" className="hover:bg-slate-100 dark:hover:bg-slate-700">Marcus</SelectItem>
                  <SelectItem value="maya" className="hover:bg-slate-100 dark:hover:bg-slate-700">Maya</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterEmotion} onValueChange={setFilterEmotion}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Filter by mood" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 z-50">
                  <SelectItem value="" className="hover:bg-slate-100 dark:hover:bg-slate-700">All moods</SelectItem>
                  <SelectItem value="positive" className="hover:bg-slate-100 dark:hover:bg-slate-700">Positive</SelectItem>
                  <SelectItem value="neutral" className="hover:bg-slate-100 dark:hover:bg-slate-700">Neutral</SelectItem>
                  <SelectItem value="anxious" className="hover:bg-slate-100 dark:hover:bg-slate-700">Anxious</SelectItem>
                  <SelectItem value="sad" className="hover:bg-slate-100 dark:hover:bg-slate-700">Sad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <div className="grid gap-4">
          {filteredSessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">No conversations found</h3>
                <p className="text-slate-500">
                  {searchQuery || filterPersona || filterEmotion 
                    ? "Try adjusting your filters to see more results"
                    : "Start a conversation with one of our AI companions to see your history here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSessions.map((session: ChatSession) => {
              const IconComponent = personaIcons[session.personaId as keyof typeof personaIcons] || MessageCircle;
              const emotionStyle = emotionColors[session.emotionalTone as keyof typeof emotionColors] || "bg-gray-100 text-gray-800";
              
              return (
                <Card key={session.id} className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">
                            {session.personaName}
                          </h3>
                          <p className="text-sm text-slate-500 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(session.startTime)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={emotionStyle}>
                          {session.emotionalTone}
                        </Badge>
                        <Badge variant="outline">
                          {session.messageCount} messages
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDuration(session.duration)}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-slate-600 mb-4 line-clamp-2">{session.summary}</p>

                    {session.topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {session.topics.slice(0, 3).map((topic, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                        {session.topics.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{session.topics.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-500 italic">
                        "{session.lastMessage.substring(0, 100)}..."
                      </p>
                      
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedSession(session)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <IconComponent className="w-5 h-5" />
                                <span>Conversation with {session.personaName}</span>
                              </DialogTitle>
                            </DialogHeader>
                            
                            <ScrollArea className="h-[60vh] pr-4">
                              {messagesLoading ? (
                                <div className="text-center py-8">
                                  <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                                  <p className="text-slate-600">Loading messages...</p>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {sessionMessages.map((message: ChatMessage) => (
                                    <div
                                      key={message.id}
                                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                      <div
                                        className={`max-w-[70%] rounded-lg p-3 ${
                                          message.sender === 'user'
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-slate-100 text-slate-800'
                                        }`}
                                      >
                                        <p className="text-sm">{message.content}</p>
                                        <p className={`text-xs mt-1 ${
                                          message.sender === 'user' ? 'text-purple-200' : 'text-slate-500'
                                        }`}>
                                          {new Date(message.timestamp).toLocaleTimeString()}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          size="sm"
                          onClick={() => continueSession(session)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          Continue
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}