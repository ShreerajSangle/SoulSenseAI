import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Brain, Target, Leaf, MessageCircle, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ChatOverlay } from "@/components/chat-overlay";

interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  color: string;
  emoji: string;
}

const personaIcons = {
  sarah: Heart,
  alex: Brain,
  marcus: Target,
  maya: Leaf,
};

const personaGradients = {
  sarah: "from-rose-500 to-pink-500",
  alex: "from-blue-500 to-indigo-500", 
  marcus: "from-green-500 to-emerald-500",
  maya: "from-purple-500 to-violet-500",
};

const personaAccents = {
  sarah: "text-rose-600 bg-rose-50 border-rose-200",
  alex: "text-blue-600 bg-blue-50 border-blue-200",
  marcus: "text-green-600 bg-green-50 border-green-200", 
  maya: "text-purple-600 bg-purple-50 border-purple-200",
};

export default function UnifiedHome() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const { data: personas = [], isLoading } = useQuery({
    queryKey: ["/api/personas"],
  });

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setSelectedPersona(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your wellness companions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  SoulSense
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Your AI Wellness Companion</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                4 Personas Active
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50 dark:border-gray-700/50">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Ready to support you</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            Welcome to your
            <span className="block bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Personal Wellness Journey
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Choose from four specialized AI companions, each designed to provide personalized emotional support, 
            therapeutic guidance, and meaningful conversations tailored to your unique needs.
          </p>
        </div>

        {/* Persona Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {personas.map((persona: any) => {
            const IconComponent = personaIcons[persona.id as keyof typeof personaIcons] || Brain;
            const gradient = personaGradients[persona.id as keyof typeof personaGradients] || "from-slate-500 to-slate-600";
            const accent = personaAccents[persona.id as keyof typeof personaAccents] || "text-slate-600 bg-slate-50 border-slate-200";
            
            return (
              <Card
                key={persona.id}
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:scale-[1.02] cursor-pointer"
                onClick={() => handlePersonaSelect(persona)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <CardContent className="p-8 relative">
                  <div className="flex items-start gap-6">
                    {/* Avatar & Icon */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-20 h-20 ring-4 ring-white/50 shadow-lg">
                        <AvatarImage src={persona.avatar} alt={persona.name} />
                        <AvatarFallback className={`bg-gradient-to-br ${gradient} text-white font-bold text-xl`}>
                          {persona.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center shadow-lg`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {persona.name}
                          </h3>
                          <div className="text-3xl">{persona.emoji}</div>
                        </div>
                        <Badge variant="outline" className={`${accent} font-medium`}>
                          {persona.role}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {persona.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Available now
                        </div>
                        
                        <Button
                          className={`bg-gradient-to-r ${gradient} hover:shadow-lg transition-all duration-300 text-white font-medium px-6 rounded-full group-hover:scale-105`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePersonaSelect(persona);
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Start Conversation
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Features */}
        <div className="mt-20 text-center">
          <Card className="max-w-4xl mx-auto border-0 shadow-lg bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardContent className="p-12">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Designed for Your Well-being
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">AI-Powered Insights</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Real-time emotion detection and personalized responses</p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Empathetic Support</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Compassionate conversations that understand your needs</p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Goal-Oriented</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Structured guidance to help you achieve wellness goals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Overlay */}
      {selectedPersona && (
        <ChatOverlay
          persona={selectedPersona}
          isOpen={chatOpen}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
}