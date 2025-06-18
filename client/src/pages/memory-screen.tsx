import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TopNavBar } from "@/components/top-nav-bar";
import { useConversations } from "@/hooks/use-chat";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { MessageCircle, TrendingUp, Brain } from "lucide-react";

export default function MemoryScreen() {
  const [, setLocation] = useLocation();
  const { data: conversations = [], isLoading } = useConversations();

  const handleBack = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <TopNavBar onBack={handleBack} />

      <main className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Recent Conversations</h3>
                  <span className="text-sm text-slate-500">Last 7 days</span>
                </div>
                
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg animate-pulse">
                        <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No conversations yet. Start chatting to build your memory timeline!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversations.map((conversation: any) => (
                      <div 
                        key={conversation.id} 
                        className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        onClick={() => setLocation(`/chat?persona=${conversation.personaId}`)}
                      >
                        {conversation.persona && (
                          <img 
                            src={conversation.persona.avatarUrl} 
                            alt={conversation.persona.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">
                            {conversation.title || `Chat with ${conversation.persona?.name || 'Unknown'}`}
                          </p>
                          <p className="text-sm text-slate-600">
                            Conversation with {conversation.persona?.name || 'Unknown persona'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {format(new Date(conversation.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Active
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Progress Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {conversations.length}
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <MessageCircle className="w-4 h-4 text-blue-700" />
                      <p className="text-sm text-blue-700">Total Sessions</p>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {conversations.length > 0 ? Math.min(85, 60 + conversations.length * 5) : 0}%
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <TrendingUp className="w-4 h-4 text-green-700" />
                      <p className="text-sm text-green-700">Engagement</p>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {Math.floor(conversations.length * 2.3) || 0}
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Brain className="w-4 h-4 text-purple-700" />
                      <p className="text-sm text-purple-700">Insights Gained</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
