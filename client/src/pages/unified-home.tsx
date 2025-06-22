import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Brain, Target, Leaf, MessageCircle, Sparkles, BookOpen, User, BarChart3, Menu, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SimpleChatOverlay } from "@/components/simple-chat-overlay";
import { useLocation } from "wouter";

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
  sarah: "from-[#EC4899] to-[#F472B6]",
  alex: "from-[#B794D1] to-[#9B7CB8]", 
  marcus: "from-[#C8A2E8] to-[#B794D1]",
  maya: "from-[#7A5A95] to-[#5A3F70]",
};

const personaAccents = {
  sarah: "text-[#DB2777] bg-[#FCE7F3] border-[#F9A8D4]",
  alex: "text-[#7A5A95] bg-[#F3EFFF] border-[#D8C2F5]",
  marcus: "text-[#9B7CB8] bg-[#F8F6FF] border-[#E6E6FA]", 
  maya: "text-[#5A3F70] bg-[#FBCFE8] border-[#F9A8D4]",
};

export default function UnifiedHome() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const { data: personas = [], isLoading } = useQuery<Persona[]>({
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
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6FF] via-[#E6E6FA] to-[#FBCFE8] dark:from-[#2A2035] dark:via-[#352843] dark:to-[#453354] particles-bg">
      {/* Header */}
      <div className="bg-white/60 dark:bg-[#2A2035]/80 backdrop-blur-sm border-b border-[#D8C2F5]/50 dark:border-[#5A4267]/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#B794D1] to-[#EC4899] rounded-3xl flex items-center justify-center animate-float shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#7A5A95] to-[#DB2777] bg-clip-text text-transparent">
                  SoulSense
                </h1>
                <p className="text-xs text-[#78716C] dark:text-[#A678AB]">Your AI Wellness Companion</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Navigation Menu */}
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/memory")}
                  className="text-[#78716C] hover:text-[#7A5A95] hover:bg-[#F3EFFF] dark:text-[#A678AB] dark:hover:text-[#DEB4DE] dark:hover:bg-[#453354] rounded-2xl transition-all duration-300"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Memory & Insights
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/diary")}
                  className="text-[#78716C] hover:text-[#7A5A95] hover:bg-[#F3EFFF] dark:text-[#A678AB] dark:hover:text-[#DEB4DE] dark:hover:bg-[#453354] rounded-2xl transition-all duration-300"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Diary
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/profile")}
                  className="text-[#78716C] hover:text-[#7A5A95] hover:bg-[#F3EFFF] dark:text-[#A678AB] dark:hover:text-[#DEB4DE] dark:hover:bg-[#453354] rounded-2xl transition-all duration-300"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </div>
              
              <Badge variant="outline" className="bg-[#FCE7F3] text-[#DB2777] border-[#F9A8D4] animate-pulse-gentle">
                4 Personas Active
              </Badge>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-600 hover:text-purple-600"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm">
              <div className="px-6 py-4 space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLocation("/memory");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Memory & Insights
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLocation("/diary");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Diary
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLocation("/profile");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-16 space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/40 dark:bg-[#352843]/60 backdrop-blur-sm px-6 py-3 rounded-full border border-[#D8C2F5]/30 dark:border-[#5A4267]/50 shadow-lg">
            <div className="w-3 h-3 bg-gradient-to-r from-[#B794D1] to-[#EC4899] rounded-full animate-pulse-gentle"></div>
            <span className="text-sm text-[#5A3F70] dark:text-[#C294C4] font-medium">Ready to support you with care</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-[#3A2548] dark:text-[#F2D4F2] leading-tight">
            Welcome to your
            <span className="block bg-gradient-to-r from-[#7A5A95] via-[#B794D1] to-[#DB2777] bg-clip-text text-transparent animate-shimmer">
              Personal Wellness Journey
            </span>
          </h2>
          
          <p className="text-lg text-[#5A3F70] dark:text-[#A678AB] max-w-2xl mx-auto leading-relaxed">
            Choose from four specialized AI companions, each designed to provide personalized emotional support, 
            therapeutic guidance, and meaningful conversations in a safe, nurturing environment.
          </p>
        </div>

        {/* Persona Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {personas.map((persona) => {
            const IconComponent = personaIcons[persona.id as keyof typeof personaIcons] || Brain;
            const gradient = personaGradients[persona.id as keyof typeof personaGradients] || "from-slate-500 to-slate-600";
            const accent = personaAccents[persona.id as keyof typeof personaAccents] || "text-slate-600 bg-slate-50 border-slate-200";
            
            return (
              <Card
                key={persona.id}
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/40 dark:bg-[#352843]/60 backdrop-blur-sm hover:scale-[1.03] cursor-pointer animate-fade-in"
                onClick={() => handlePersonaSelect(persona)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
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

        {/* Quick Access Features */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-8">
            All Your Wellness Tools in One Place
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card 
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:scale-105"
              onClick={() => setLocation("/memory")}
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Memory & Insights</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your emotional patterns and conversation insights</p>
                <Button variant="outline" size="sm" className="w-full">
                  View Insights
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:scale-105"
              onClick={() => setLocation("/diary")}
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Personal Diary</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Write, edit, and reflect on your daily thoughts and experiences</p>
                <Button variant="outline" size="sm" className="w-full">
                  Open Diary
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:scale-105"
              onClick={() => setLocation("/profile")}
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <User className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Your Profile</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage settings, goals, and personalize your experience</p>
                <Button variant="outline" size="sm" className="w-full">
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Core Features Overview */}
        <div className="mt-20 text-center">
          <Card className="max-w-4xl mx-auto border-0 shadow-lg bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardContent className="p-12">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Comprehensive Wellness Platform
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
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Complete Toolkit</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Diary, memory tracking, profiles, and therapeutic conversations</p>
                </div>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Text-Focused Design</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Clean, distraction-free interface optimized for meaningful conversations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Overlay */}
      {selectedPersona && (
        <SimpleChatOverlay
          persona={selectedPersona}
          isOpen={chatOpen}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
}