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
  "sarah": "from-pink-500 to-purple-600",
  "alex": "from-purple-400 to-pink-500",
  "marcus": "from-pink-600 to-purple-700",
  "maya": "from-purple-500 to-pink-600",
};

const personaAccents = {
  "sarah": "text-purple-600 bg-pink-50 border-pink-100",
  "alex": "text-pink-600 bg-purple-50 border-purple-100",
  "marcus": "text-purple-700 bg-pink-50 border-pink-100",
  "maya": "text-pink-700 bg-purple-50 border-purple-100",
};

export default function PersonaSelector() {
  const { data: personas = [], isLoading } = usePersonas();
  const [, setLocation] = useLocation();

  const handlePersonaSelect = (persona: Persona) => {
    setLocation(`/chat/${persona.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lavender-100 via-lavender-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-pulse">
            <Sparkles className="text-white text-4xl" />
          </div>
          <h2 className="text-4xl font-bold text-slate-800 mb-4">SoulSense AI</h2>
          <p className="text-xl text-slate-600">Loading your therapeutic companions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-purple-200 to-purple-400 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-24 h-24 bg-gradient-to-r from-pink-300 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-28 h-28 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-gradient-to-r from-pink-200 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-3000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-8 py-16 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="mb-12">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 rounded-3xl flex items-center justify-center mb-8 shadow-2xl transform hover:scale-105 transition-all duration-300">
              <Sparkles className="text-white text-4xl animate-pulse" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 bg-clip-text text-transparent mb-6">
              SoulSense AI
            </h1>
            <p className="text-2xl text-slate-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Your personalized mental wellness companion. Choose an AI therapist that resonates with your needs today.
            </p>
            <div className="flex items-center justify-center gap-12 text-base text-purple-800">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-pink-500" />
                <span>24/7 Available</span>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-pink-600" />
                <span>Empathetic AI</span>
              </div>
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-pink-500" />
                <span>Scientifically Backed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Personas Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {personas.map((persona) => {
            const IconComponent = personaIcons[persona.id as keyof typeof personaIcons] || Brain;
            const gradient = personaGradients[persona.id as keyof typeof personaGradients] || "from-slate-500 to-slate-600";
            const accent = personaAccents[persona.id as keyof typeof personaAccents] || "text-slate-600 bg-slate-50 border-slate-200";
            
            return (
              <Card
                key={persona.id}
                className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 bg-white/85 backdrop-blur-sm"
                onClick={() => handlePersonaSelect(persona)}
              >
                <CardContent className="p-10">
                  <div className="flex items-start mb-8">
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${gradient} flex items-center justify-center mr-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="text-white text-3xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold text-slate-800 mb-2 group-hover:text-slate-900">{persona.name}</h3>
                      <Badge className={`${accent} border font-medium text-base px-3 py-1`}>
                        {persona.role}
                      </Badge>
                    </div>
                    <ChevronRight className="w-7 h-7 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  
                  <p className="text-lg text-slate-600 mb-6 leading-relaxed">{persona.description}</p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                    <div className="flex items-center text-base text-slate-500">
                      <MessageCircle className="w-5 h-5 mr-3" />
                      <span>{persona.specialty}</span>
                    </div>
                    <Button 
                      className={`bg-gradient-to-r ${gradient} hover:opacity-90 text-white border-0 shadow-md group-hover:shadow-lg transition-all duration-300 px-6 py-2.5 text-base`}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:bg-white/95 transform hover:-translate-y-2"
            onClick={() => setLocation('/diary')}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Daily Journal</h3>
              <p className="text-base text-slate-600 leading-relaxed">Track your thoughts and emotions with guided reflection</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:bg-white/95 transform hover:-translate-y-2"
            onClick={() => setLocation('/memory')}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Session History</h3>
              <p className="text-base text-slate-600 leading-relaxed">Review past conversations and track your progress</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:bg-white/95 transform hover:-translate-y-2"
            onClick={() => setLocation('/profile')}
          >
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-pink-600 to-purple-700 rounded-2xl flex items-center justify-center mb-6">
                <Settings className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Profile Settings</h3>
              <p className="text-base text-slate-600 leading-relaxed">Customize your wellness journey and preferences</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
