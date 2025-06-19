import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, User, Trophy, Leaf, Sparkles, Brain, MessageCircle, Calendar, BookOpen, Settings, ChevronRight, Star } from "lucide-react";
import { usePersonas } from "@/hooks/use-chat";
import { useLocation } from "wouter";
import type { Persona } from "@shared/schema";

const personaIcons = {
  "sarah": Brain,
  "alex": Heart,
  "marcus": Trophy,
  "maya": Leaf,
};

const personaGradients = {
  "sarah": "from-purple-400 to-lavender-500",
  "alex": "from-rose-300 to-pink-400",
  "marcus": "from-indigo-400 to-purple-500",
  "maya": "from-emerald-400 to-teal-500",
};

const personaAccents = {
  "sarah": "text-purple-600 bg-purple-50 border-purple-100",
  "alex": "text-rose-600 bg-rose-50 border-rose-100",
  "marcus": "text-indigo-600 bg-indigo-50 border-indigo-100",
  "maya": "text-emerald-600 bg-emerald-50 border-emerald-100",
};

export default function PersonaSelector() {
  const { data: personas = [], isLoading } = usePersonas();
  const [, setLocation] = useLocation();

  const handlePersonaSelect = (persona: Persona) => {
    setLocation(`/chat/${persona.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-purple-50 to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-lavender-400 via-purple-500 to-violet-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl animate-pulse">
            <Sparkles className="text-white text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">SoulSense AI</h2>
          <p className="text-slate-600">Loading your therapeutic companions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-purple-50 to-violet-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-lavender-200 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-24 h-24 bg-gradient-to-r from-violet-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-gradient-to-r from-rose-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-lavender-400 via-purple-500 to-violet-500 rounded-2xl flex items-center justify-center mb-6 shadow-2xl transform hover:scale-105 transition-all duration-300">
              <Sparkles className="text-white text-3xl animate-pulse" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-700 via-lavender-600 to-violet-700 bg-clip-text text-transparent mb-4">
              SoulSense AI
            </h1>
            <p className="text-xl text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              Your personalized mental wellness companion. Choose an AI therapist that resonates with your needs today.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-violet-400" />
                <span>24/7 Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Empathetic AI</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Scientifically Backed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Personas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {personas.map((persona) => {
            const IconComponent = personaIcons[persona.id as keyof typeof personaIcons] || Brain;
            const gradient = personaGradients[persona.id as keyof typeof personaGradients] || "from-slate-500 to-slate-600";
            const accent = personaAccents[persona.id as keyof typeof personaAccents] || "text-slate-600 bg-slate-50 border-slate-200";
            
            return (
              <Card
                key={persona.id}
                className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm"
                onClick={() => handlePersonaSelect(persona)}
              >
                <CardContent className="p-8">
                  <div className="flex items-start mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="text-white text-2xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-slate-800 mb-1 group-hover:text-slate-900">{persona.name}</h3>
                      <Badge className={`${accent} border font-medium mb-2`}>
                        {persona.role}
                      </Badge>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  
                  <p className="text-slate-600 mb-4 leading-relaxed">{persona.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center text-sm text-slate-500">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      <span>{persona.specialty}</span>
                    </div>
                    <Button 
                      className={`bg-gradient-to-r ${gradient} hover:opacity-90 text-white border-0 shadow-md group-hover:shadow-lg transition-all duration-300`}
                      size="sm"
                    >
                      Start Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Access Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white/80"
            onClick={() => setLocation('/diary')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto bg-gradient-to-r from-lavender-400 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="text-white text-xl" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Daily Journal</h3>
              <p className="text-sm text-slate-600">Track your thoughts and emotions</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white/80"
            onClick={() => setLocation('/memory')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto bg-gradient-to-r from-violet-400 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="text-white text-xl" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Session History</h3>
              <p className="text-sm text-slate-600">Review past conversations</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white/80"
            onClick={() => setLocation('/profile')}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto bg-gradient-to-r from-rose-400 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <Settings className="text-white text-xl" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">Profile Settings</h3>
              <p className="text-sm text-slate-600">Customize your experience</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
