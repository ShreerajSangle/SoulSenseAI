import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { 
  MessageCircle, 
  TrendingUp, 
  Brain, 
  ArrowLeft,
  Clock,
  Heart,
  Sparkles,
  BarChart3,
  Calendar,
  Users,
  Target
} from "lucide-react";

interface Conversation {
  id: number;
  title: string;
  personaId: string;
  createdAt: string;
  persona?: {
    name: string;
    emoji: string;
  };
}

const personaColors = {
  sarah: "from-rose-500 to-pink-500",
  alex: "from-blue-500 to-indigo-500", 
  marcus: "from-green-500 to-emerald-500",
  maya: "from-purple-500 to-violet-500",
};

const personaAccents = {
  sarah: "bg-rose-50 text-rose-700 border-rose-200",
  alex: "bg-blue-50 text-blue-700 border-blue-200",
  marcus: "bg-green-50 text-green-700 border-green-200", 
  maya: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function EnhancedMemoryScreen() {
  const [, setLocation] = useLocation();
  
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const response = await fetch("/api/conversations?userId=anonymous");
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your memories and insights...</p>
        </div>
      </div>
    );
  }

  // Calculate insights
  const totalConversations = conversations.length;
  const personaCounts = conversations.reduce((acc: any, conv: any) => {
    acc[conv.personaId] = (acc[conv.personaId] || 0) + 1;
    return acc;
  }, {});
  const favoritePersona = Object.keys(personaCounts).reduce((a, b) => 
    personaCounts[a] > personaCounts[b] ? a : b, 'sarah'
  );
  const recentActivity = conversations.filter((conv: any) => 
    new Date(conv.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Memory & Insights
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Your emotional journey and conversation patterns</p>
                </div>
              </div>
            </div>
            
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {totalConversations} Conversations
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            Your Wellness
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Journey Insights
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Track your emotional patterns, conversation themes, and personal growth through AI-powered analysis.
          </p>
        </div>

        {/* Insights Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalConversations}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Sessions</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{recentActivity}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">This Week</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 capitalize">{favoritePersona}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Favorite Persona</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">85%</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Engagement</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Conversations */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Recent Conversations
            </h3>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              Last 30 days
            </Badge>
          </div>

          {conversations.length === 0 ? (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-10 w-10 text-purple-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Start Your Journey
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  Begin conversations with our AI personas to start tracking your emotional patterns and insights.
                </p>
                <Button
                  onClick={() => setLocation("/")}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-3 rounded-2xl font-medium"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Conversation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {conversations.slice(0, 6).map((conversation: any) => {
                const gradient = personaColors[conversation.personaId as keyof typeof personaColors] || "from-gray-500 to-gray-600";
                const accent = personaAccents[conversation.personaId as keyof typeof personaAccents] || "bg-gray-50 text-gray-700 border-gray-200";
                
                return (
                  <Card
                    key={conversation.id}
                    className="group border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                    onClick={() => setLocation(`/chat/${conversation.personaId}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg group-hover:scale-110 transition-transform`}>
                          {conversation.persona?.emoji || conversation.personaId[0].toUpperCase()}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {conversation.title || `Session with ${conversation.persona?.name || conversation.personaId}`}
                            </h4>
                            <Badge variant="outline" className={accent}>
                              {conversation.persona?.name || conversation.personaId}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(conversation.createdAt), 'MMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(conversation.createdAt), 'h:mm a')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {conversations.length > 6 && (
            <div className="text-center pt-6">
              <Button
                variant="outline"
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-300 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
              >
                View All Conversations ({conversations.length})
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}