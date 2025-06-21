import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, User, Trophy, Leaf, Sparkles, Brain, MessageCircle, Calendar, BookOpen, Settings, ChevronRight, Star, Activity, Target } from "lucide-react";
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
  "sarah": "from-purple-500 to-purple-700",
  "alex": "from-pink-500 to-pink-600",
  "marcus": "from-purple-600 to-purple-800",
  "maya": "from-pink-400 to-purple-600",
};

const personaAccents = {
  "sarah": "text-purple-700 bg-purple-50 border-purple-100",
  "alex": "text-pink-600 bg-pink-50 border-pink-100",
  "marcus": "text-purple-800 bg-purple-50 border-purple-100",
  "maya": "text-purple-600 bg-pink-50 border-pink-100",
};

export default function PersonaSelector() {
  const { data: personas = [], isLoading } = usePersonas();
  const [, setLocation] = useLocation();

  const handlePersonaSelect = (persona: Persona) => {
    setLocation(`/chat/${persona.id}`);
  };

  const handleAdvancedChat = (persona: Persona) => {
    setLocation(`/advanced-chat/${persona.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-300 via-purple-200 to-purple-400 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 rounded-3xl flex items-center justify-center mb-8 shadow-2xl animate-pulse">
            <Sparkles className="text-white text-4xl" />
          </div>
          <h2 className="text-4xl font-bold text-purple-900 mb-4">SoulSense AI</h2>
          <p className="text-xl text-purple-800">Loading your therapeutic companions...</p>
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

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold text-purple-900">SoulSense AI</span>
          </div>
          <div className="flex items-center gap-4">
          </div>
        </div>

        {/* Hero Section - Centered and Compact */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform hover:scale-105 transition-all duration-300">
            <Sparkles className="text-white text-3xl animate-pulse" />
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 bg-clip-text text-transparent mb-4">
            SoulSense AI
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Your personalized mental wellness companion with advanced clinical intelligence
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-purple-800">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-pink-500" />
              <span>24/7 Available</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-600" />
              <span>Empathetic AI</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-pink-500" />
              <span>Evidence-Based</span>
            </div>
          </div>
        </div>

        {/* AI Therapists Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Choose Your AI Therapist</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Each persona offers unique therapeutic approaches tailored to different needs and preferences
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {personas.map((persona) => {
              const IconComponent = personaIcons[persona.id as keyof typeof personaIcons] || Brain;
              const gradient = personaGradients[persona.id as keyof typeof personaGradients] || "from-slate-500 to-slate-600";
              const accent = personaAccents[persona.id as keyof typeof personaAccents] || "text-slate-600 bg-slate-50 border-slate-200";
              
              return (
                <Card
                  key={persona.id}
                  className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/90 backdrop-blur-sm hover:bg-white/95"
                  onClick={() => handlePersonaSelect(persona)}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center mr-5 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                        <IconComponent className="text-white text-2xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-slate-900">{persona.name}</h3>
                        <Badge className={`${accent} border font-medium text-sm px-3 py-1`}>
                          {persona.role}
                        </Badge>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    
                    <p className="text-base text-slate-600 mb-6 leading-relaxed line-clamp-3">{persona.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mb-4">
                      <div className="flex items-center text-sm text-slate-500">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        <span>{persona.specialty}</span>
                      </div>
                      <div className="flex items-center text-sm text-slate-400">
                        <Activity className="w-4 h-4 mr-1" />
                        <span>Available now</span>
                      </div>
                    </div>
                    
                    <Button 
                      className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 text-white border-0 shadow-sm group-hover:shadow-md transition-all duration-300 text-sm`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePersonaSelect(persona);
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Start Chat
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Clinical Intelligence Section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Clinical Intelligence</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Evidence-based assessments and therapeutic journeys powered by clinical reasoning
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:bg-white/95 transform hover:-translate-y-1"
              onClick={() => setLocation('/clinical-assessment')}
            >
              <CardContent className="p-6">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                    <Activity className="text-white text-lg" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-1">Clinical Assessment</h3>
                    <Badge className="text-purple-700 bg-purple-50 border-purple-100 border font-medium text-xs px-2 py-1">
                      PHQ-9 • GAD-7
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Validated mental health screenings with detailed clinical reasoning and personalized intervention recommendations
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">5-10 minutes</span>
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white px-4 py-1.5 text-xs">
                    Start Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:bg-white/95 transform hover:-translate-y-1"
              onClick={() => setLocation('/therapeutic-journey')}
            >
              <CardContent className="p-6">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                    <Target className="text-white text-lg" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-1">Therapeutic Journey</h3>
                    <Badge className="text-pink-700 bg-pink-50 border-pink-100 border font-medium text-xs px-2 py-1">
                      Goal Tracking
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Personalized therapeutic goals with milestone tracking, progress analytics, and evidence-based interventions
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500">6-12 weeks</span>
                  <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 text-white px-4 py-1.5 text-xs">
                    Start Journey
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Wellness Tools */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Wellness Tools</h2>
            <p className="text-base text-slate-600">Additional resources to support your mental health journey</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:bg-white/95 transform hover:-translate-y-1"
              onClick={() => setLocation('/diary')}
            >
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 mx-auto bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3">
                  <BookOpen className="text-white text-lg" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Daily Journal</h3>
                <p className="text-sm text-slate-600">Track thoughts and emotions with guided reflection</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:bg-white/95 transform hover:-translate-y-1"
              onClick={() => setLocation('/memory')}
            >
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 mx-auto bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-3">
                  <Calendar className="text-white text-lg" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Session History</h3>
                <p className="text-sm text-slate-600">Review conversations and track your progress</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:bg-white/95 transform hover:-translate-y-1"
              onClick={() => setLocation('/profile')}
            >
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 mx-auto bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mb-3">
                  <Settings className="text-white text-lg" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Profile Settings</h3>
                <p className="text-sm text-slate-600">Customize your wellness journey and preferences</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
