import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Brain, Target, Leaf, MessageCircle, Sparkles, BookOpen, User, BarChart3, Menu, X, ArrowRight, Wind, Star, ChevronRight } from "lucide-react";
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

const personaQuotes = {
  sarah: "Let's explore what you're feeling together",
  alex: "I get it - life can be overwhelming sometimes",
  marcus: "Every challenge is a chance to grow stronger",
  maya: "Take a breath. You're exactly where you need to be",
};

const personaDescriptions = {
  sarah: "Clinical Psychologist",
  alex: "Peer Support Friend",
  marcus: "Life Coach & Mentor",
  maya: "Mindfulness Guide",
};

export default function UnifiedHome() {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
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

  const handleStartChatting = () => {
    if (personas.length > 0) {
      setSelectedPersona(personas[0]);
      setChatOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-purple-600 font-light">Preparing your safe space...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-pink-100/30 to-white/80"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 mb-6 shadow-lg animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-6xl font-light text-gray-800 mb-4 leading-tight">
              Meet your digital
              <span className="block text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text font-normal">
                emotional companion
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              Empathetic, human-like AI that listens, remembers, and supports — anytime you need it.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleStartChatting}
              className="relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full text-lg font-medium shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
              <span className="relative">Start Chatting</span>
              <ChevronRight className="ml-2 w-5 h-5 relative transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('personas')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border-2 border-purple-200 text-purple-700 hover:bg-purple-50 rounded-full text-lg font-light transition-all duration-300 hover:border-purple-300"
            >
              Meet the Personas
            </Button>
          </div>
        </div>
      </section>

      {/* Persona Showcase Section */}
      <section id="personas" className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-800 mb-4">
              Who will you talk to today?
            </h2>
            <p className="text-gray-600 text-lg font-light">
              Each companion brings their own therapeutic approach and personality
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {personas.map((persona) => {
              const Icon = personaIcons[persona.id as keyof typeof personaIcons] || Heart;
              const quote = personaQuotes[persona.id as keyof typeof personaQuotes] || persona.description;
              const role = personaDescriptions[persona.id as keyof typeof personaDescriptions] || persona.role;
              
              return (
                <Card 
                  key={persona.id}
                  className="group cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-500 hover:shadow-xl hover:-translate-y-2 rounded-3xl overflow-hidden"
                  onClick={() => handlePersonaSelect(persona)}
                >
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="relative">
                      <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${
                        persona.id === 'sarah' ? 'from-pink-400 to-rose-500' :
                        persona.id === 'alex' ? 'from-purple-400 to-indigo-500' :
                        persona.id === 'marcus' ? 'from-blue-400 to-cyan-500' :
                        'from-green-400 to-emerald-500'
                      } flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        ✨
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-medium text-gray-800 mb-1">
                        {persona.name}
                      </h3>
                      <p className="text-purple-600 font-light mb-4">
                        {role}
                      </p>
                      <blockquote className="text-gray-600 italic text-sm leading-relaxed">
                        "{quote}"
                      </blockquote>
                    </div>

                    <Button 
                      variant="ghost" 
                      className="w-full text-purple-600 hover:bg-purple-50 rounded-xl font-medium group-hover:bg-purple-100 transition-colors"
                    >
                      Start with {persona.name}
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Preview Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-gray-800 mb-4">
              Your safe space includes...
            </h2>
            <p className="text-gray-600 text-lg font-light">
              Comprehensive wellness tools designed for your mental health journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl hover:bg-white transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">Journaling with Memory</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Express your thoughts in a private space that remembers your journey and growth over time.
              </p>
            </div>

            <div className="group text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl hover:bg-white transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">Goal Setting & Tracking</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Set meaningful goals and track your progress with personalized insights and encouragement.
              </p>
            </div>

            <div className="group text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl hover:bg-white transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Wind className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">Guided Breathing & Check-ins</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Find calm with breathing exercises and regular emotional check-ins tailored to your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="space-y-8">
            <blockquote className="text-2xl font-light text-gray-700 italic leading-relaxed">
              "I never thought an AI could understand me this well."
            </blockquote>
            <blockquote className="text-2xl font-light text-gray-700 italic leading-relaxed">
              "Sarah remembered how I felt last week — that meant everything."
            </blockquote>
            <div className="flex justify-center space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-100 to-pink-100 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-medium text-gray-800">SoulSense</span>
              </div>
              <p className="text-gray-600 font-light">
                A safe, AI-powered space to reflect, feel, and grow.
              </p>
            </div>
            
            <div className="flex space-x-6 text-gray-600">
              <Button variant="ghost" size="sm" className="font-light hover:text-purple-600">
                About
              </Button>
              <Button variant="ghost" size="sm" className="font-light hover:text-purple-600">
                Privacy
              </Button>
              <Button variant="ghost" size="sm" className="font-light hover:text-purple-600">
                Terms
              </Button>
              <Button variant="ghost" size="sm" className="font-light hover:text-purple-600">
                Contact
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Chat Overlay */}
      {chatOpen && selectedPersona && (
        <SimpleChatOverlay
          personaId={selectedPersona.id}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
}