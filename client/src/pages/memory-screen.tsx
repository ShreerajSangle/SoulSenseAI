import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { 
  MessageCircle, 
  TrendingUp, 
  Brain, 
  Sparkles, 
  ArrowLeft,
  Home,
  User,
  BookOpen,
  BarChart3,
  Clock,
  Heart
} from "lucide-react";

export default function MemoryScreen() {
  const [, setLocation] = useLocation();
  const { data: conversations = [], isLoading } = useConversations("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-24 h-24 bg-gradient-to-r from-pink-300 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Navigation Header */}
      <div className="relative z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-purple-100/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="text-purple-700 hover:bg-purple-50 rounded-2xl">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Home
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Memory & Progress
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">Your conversations and growth insights</p>
                </div>
              </div>
            </div>
            
            {/* Simple Navigation Links */}
            <div className="flex items-center gap-2">
              <Link href="/session-history">
                <Button variant="ghost" size="sm" className="text-purple-700 hover:bg-purple-50 rounded-xl">
                  <Clock className="w-4 h-4 mr-2" />
                  History
                </Button>
              </Link>
              <Link href="/diary">
                <Button variant="ghost" size="sm" className="text-purple-700 hover:bg-purple-50 rounded-xl">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Journal
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="text-purple-700 hover:bg-purple-50 rounded-xl">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link href="/therapeutic-journey">
                <Button variant="ghost" size="sm" className="text-purple-700 hover:bg-purple-50 rounded-xl">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Insights
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Progress Insights Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                  {(conversations as any[]).length}
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Total Sessions</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Conversations completed</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
                  {(conversations as any[]).length > 0 ? Math.min(95, 60 + (conversations as any[]).length * 5) : 0}%
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Engagement Level</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active participation</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-2">
                  {Math.floor((conversations as any[]).length * 2.8) || 0}
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Insights Gained</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Personal discoveries</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Conversations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Recent Conversations</h3>
                  <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300">
                    Last 7 days
                  </Badge>
                </div>
                
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center space-x-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-2xl animate-pulse"
                      >
                        <div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-purple-200 dark:bg-purple-800 rounded w-3/4"></div>
                          <div className="h-3 bg-purple-200 dark:bg-purple-800 rounded w-1/2"></div>
                          <div className="h-3 bg-purple-200 dark:bg-purple-800 rounded w-1/4"></div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (conversations as any[]).length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No conversations yet</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">Start chatting to build your memory timeline!</p>
                    <Link href="/">
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl px-6 py-3">
                        Start Your First Conversation
                      </Button>
                    </Link>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {(conversations as any[]).map((conversation: any, index) => (
                      <motion.div
                        key={conversation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-2xl hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 cursor-pointer border border-purple-100/30 dark:border-purple-800/30"
                        onClick={() => setLocation(`/chat/${conversation.personaId}`)}
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-xl">
                            {conversation.personaId === 'sarah' ? '👩‍⚕️' : 
                             conversation.personaId === 'alex' ? '🤝' :
                             conversation.personaId === 'marcus' ? '💪' :
                             conversation.personaId === 'maya' ? '🧘‍♀️' : '🤖'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {conversation.title || `Conversation with ${conversation.persona?.name || 'AI Companion'}`}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {conversation.persona?.name || 'AI Companion'} • Therapeutic conversation
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {format(new Date(conversation.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-0">
                          Active
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}