import { useState } from "react";
import { Clock, MessageCircle, Calendar, Heart, Brain, Trophy, Leaf, ChevronRight, X, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface ChatSession {
  id: string;
  personaId: string;
  personaName: string;
  startTime: string;
  duration: number;
  messageCount: number;
  summary: string;
  emotionalTone: string;
  topics: string[];
  lastMessage: string;
  status: "active" | "completed";
}

interface IntegratedSessionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionSelect: (sessionId: string) => void;
  currentPersonaId?: string;
}

const personaIcons = {
  sarah: Brain,
  alex: Heart,
  marcus: Trophy,
  maya: Leaf,
};

const emotionColors = {
  positive: "bg-emerald-100 text-emerald-700 border-emerald-200",
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
  anxious: "bg-amber-100 text-amber-700 border-amber-200",
  sad: "bg-blue-100 text-blue-700 border-blue-200",
  happy: "bg-pink-100 text-pink-700 border-pink-200",
  stressed: "bg-red-100 text-red-700 border-red-200",
};

export function IntegratedSessionHistory({ 
  isOpen, 
  onClose, 
  onSessionSelect, 
  currentPersonaId 
}: IntegratedSessionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);

  // Mock session data - replace with actual API call
  const mockSessions: ChatSession[] = [
    {
      id: "1",
      personaId: "sarah",
      personaName: "Dr. Sarah",
      startTime: "2024-06-21T10:30:00Z",
      duration: 45,
      messageCount: 23,
      summary: "Discussed anxiety management techniques and breathing exercises for daily stress relief",
      emotionalTone: "anxious",
      topics: ["anxiety", "breathing", "mindfulness", "daily routine"],
      lastMessage: "Thank you for the breathing exercise suggestions, they really helped calm me down!",
      status: "completed"
    },
    {
      id: "2",
      personaId: "alex",
      personaName: "Alex",
      startTime: "2024-06-20T14:20:00Z",
      duration: 35,
      messageCount: 18,
      summary: "Explored relationship challenges and communication strategies with partner",
      emotionalTone: "neutral",
      topics: ["relationships", "communication", "conflict resolution"],
      lastMessage: "I'll try those communication techniques with my partner tonight.",
      status: "completed"
    },
    {
      id: "3",
      personaId: "marcus",
      personaName: "Marcus",
      startTime: "2024-06-19T09:15:00Z",
      duration: 50,
      messageCount: 25,
      summary: "Goal setting session focused on career advancement and motivation strategies",
      emotionalTone: "positive",
      topics: ["career", "goals", "motivation", "action plans"],
      lastMessage: "That action plan looks perfect! I'm excited to get started on these steps.",
      status: "completed"
    },
    {
      id: "4",
      personaId: "maya",
      personaName: "Maya",
      startTime: "2024-06-18T16:00:00Z",
      duration: 30,
      messageCount: 15,
      summary: "Mindfulness practice session with guided meditation and stress reduction",
      emotionalTone: "positive",
      topics: ["mindfulness", "meditation", "stress relief", "self-care"],
      lastMessage: "The guided meditation was exactly what I needed today. Feeling much calmer.",
      status: "completed"
    },
    {
      id: "5",
      personaId: "sarah",
      personaName: "Dr. Sarah",
      startTime: "2024-06-17T11:45:00Z",
      duration: 40,
      messageCount: 20,
      summary: "Follow-up session on coping strategies and progress check-in",
      emotionalTone: "happy",
      topics: ["progress", "coping strategies", "reflection"],
      lastMessage: "I'm proud of how much progress I've made this week!",
      status: "completed"
    }
  ];

  const filteredSessions = mockSessions.filter(session => {
    const matchesSearch = searchQuery === "" || 
      session.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      session.personaName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPersona = !currentPersonaId || session.personaId === currentPersonaId;
    
    return matchesSearch && matchesPersona;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return "Today";
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getPersonaIcon = (personaId: string) => {
    return personaIcons[personaId as keyof typeof personaIcons] || MessageCircle;
  };

  const openSessionDetail = (session: ChatSession) => {
    setSelectedSession(session);
    setIsDetailViewOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Timeline Side Panel */}
      <div className="fixed inset-y-0 right-0 w-96 bg-white/95 backdrop-blur-xl border-l border-purple-200/50 shadow-2xl z-40 transform transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-100/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-purple-900">Your Journey</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-purple-600 hover:bg-purple-50 rounded-xl"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-purple-100/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-purple-50/50 border-purple-200 rounded-xl focus:border-purple-400"
            />
          </div>
        </div>

        {/* Session Timeline */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {filteredSessions.map((session, index) => {
              const PersonaIcon = getPersonaIcon(session.personaId);
              const isCurrentPersona = session.personaId === currentPersonaId;
              
              return (
                <Card 
                  key={session.id}
                  className={`group cursor-pointer transition-all duration-200 hover:shadow-lg border-0 ${
                    isCurrentPersona 
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 ring-2 ring-purple-200' 
                      : 'bg-white/80 hover:bg-white/90'
                  }`}
                  onClick={() => openSessionDetail(session)}
                >
                  <CardContent className="p-4">
                    {/* Session Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isCurrentPersona ? 'bg-purple-200' : 'bg-purple-100'
                        }`}>
                          <PersonaIcon className="w-4 h-4 text-purple-700" />
                        </div>
                        <div>
                          <p className="font-medium text-purple-900 text-sm">{session.personaName}</p>
                          <p className="text-xs text-purple-600">{formatDate(session.startTime)}</p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${emotionColors[session.emotionalTone as keyof typeof emotionColors]}`}
                      >
                        {session.emotionalTone}
                      </Badge>
                    </div>

                    {/* Session Summary */}
                    <p className="text-sm text-purple-800 line-clamp-2 mb-3 leading-relaxed">
                      {session.summary}
                    </p>

                    {/* Session Stats */}
                    <div className="flex items-center justify-between text-xs text-purple-600">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(session.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {session.messageCount}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSessionSelect(session.id);
                        }}
                        className="text-purple-600 hover:bg-purple-100 h-6 px-2 text-xs"
                      >
                        Continue
                      </Button>
                    </div>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {session.topics.slice(0, 3).map((topic, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary" 
                          className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200"
                        >
                          {topic}
                        </Badge>
                      ))}
                      {session.topics.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                          +{session.topics.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredSessions.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-purple-600 text-sm">No conversations found</p>
                <p className="text-purple-500 text-xs mt-1">
                  {searchQuery ? "Try a different search term" : "Start chatting to see your history"}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Session Detail Modal */}
      <Dialog open={isDetailViewOpen} onOpenChange={setIsDetailViewOpen}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl border-0 shadow-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-purple-900">
              {selectedSession && (
                <>
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    {(() => {
                      const PersonaIcon = getPersonaIcon(selectedSession.personaId);
                      return <PersonaIcon className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  Session with {selectedSession.personaName}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-6">
              {/* Session Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50/50 rounded-2xl">
                <div>
                  <p className="text-sm font-medium text-purple-900">Duration</p>
                  <p className="text-purple-700">{formatDuration(selectedSession.duration)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-900">Messages</p>
                  <p className="text-purple-700">{selectedSession.messageCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-900">Date</p>
                  <p className="text-purple-700">{formatDate(selectedSession.startTime)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-900">Emotional Tone</p>
                  <Badge className={emotionColors[selectedSession.emotionalTone as keyof typeof emotionColors]}>
                    {selectedSession.emotionalTone}
                  </Badge>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 className="font-semibold text-purple-900 mb-2">Session Summary</h4>
                <p className="text-purple-800 bg-purple-50/50 p-4 rounded-2xl leading-relaxed">
                  {selectedSession.summary}
                </p>
              </div>

              {/* Topics */}
              <div>
                <h4 className="font-semibold text-purple-900 mb-2">Topics Discussed</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSession.topics.map((topic, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="border-purple-200 text-purple-700"
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Last Message */}
              <div>
                <h4 className="font-semibold text-purple-900 mb-2">How it ended</h4>
                <p className="text-purple-700 italic bg-purple-25 p-4 rounded-2xl border-l-4 border-purple-300">
                  "{selectedSession.lastMessage}"
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-purple-100">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailViewOpen(false)}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    onSessionSelect(selectedSession.id);
                    setIsDetailViewOpen(false);
                    onClose();
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Continue Session
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}