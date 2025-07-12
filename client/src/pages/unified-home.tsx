import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Brain, Target, Leaf, MessageCircle, Sparkles, BookOpen, User, BarChart3, Menu, X, ArrowRight, Wind, Star, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SimpleChatOverlay } from "@/components/simple-chat-overlay";
import { GentleBreathingGuide } from "@/components/gentle-breathing-guide";
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
  const [showBreathingGuide, setShowBreathingGuide] = useState(false);
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Soft Background with Gradient and Blur Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-lavender-100/40 via-transparent to-pink-100/40"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center space-y-12 animate-fade-in">
          {/* Main Headline */}
          <div className="space-y-10">
            <h1 className="text-8xl md:text-9xl font-rosalia font-normal text-transparent bg-gradient-to-r from-purple-600 via-lavender-500 to-pink-500 bg-clip-text tracking-wider leading-tight">
              Soul Sense
            </h1>
            
            {/* Subheadlines */}
            <div className="space-y-6 max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-sans font-light text-gray-700/90 tracking-wide">
                Meet your digital emotional companion
              </h2>
              <p className="text-lg md:text-xl font-sans text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
                Empathetic, human-like AI that listens, remembers, and supports — anytime you need it.
              </p>
            </div>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-12">
            <Button 
              onClick={handleStartChatting}
              className="relative group px-12 py-6 bg-gradient-to-r from-purple-400 to-lavender-400 hover:from-purple-500 hover:to-lavender-500 text-white rounded-full text-lg font-medium shadow-2xl transition-all duration-500 hover:shadow-purple-300/50 hover:scale-105 border-0"
            >
              {/* Enhanced Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-lavender-400 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500 blur-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-300 to-lavender-300 rounded-full opacity-30 animate-pulse"></div>
              
              <span className="relative flex items-center font-sans">
                Start Chatting
                <ChevronRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => document.getElementById('personas')?.scrollIntoView({ behavior: 'smooth' })}
              className="group px-12 py-6 border-2 border-lavender-300/60 text-purple-700 bg-white/40 backdrop-blur-md hover:bg-lavender-50/70 hover:border-lavender-400 rounded-full text-lg font-light transition-all duration-500 hover:shadow-lg shadow-lavender-200/30"
            >
              <span className="flex items-center font-sans">
                Meet the Personas
                <Sparkles className="ml-3 w-5 h-5 transition-transform group-hover:rotate-12" />
              </span>
            </Button>
          </div>
        </div>
        
        {/* Gentle Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-purple-300/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-purple-400 rounded-full mt-2 animate-pulse"></div>
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
            <div 
              className="group text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl hover:bg-white transition-all duration-500 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
              onClick={() => setLocation("/diary")}
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">Journaling with Memory</h3>
              <p className="text-gray-600 font-light leading-relaxed mb-4">
                Express your thoughts in a private space that remembers your journey and growth over time.
              </p>
              <Button 
                variant="ghost" 
                className="text-purple-600 hover:bg-purple-50 rounded-xl font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation("/diary");
                }}
              >
                Try Journaling
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            <div 
              className="group text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl hover:bg-white transition-all duration-500 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
              onClick={() => setLocation("/profile")}
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">Goal Setting & Tracking</h3>
              <p className="text-gray-600 font-light leading-relaxed mb-4">
                Set meaningful goals and track your progress with personalized insights and encouragement.
              </p>
              <Button 
                variant="ghost" 
                className="text-purple-600 hover:bg-purple-50 rounded-xl font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation("/profile");
                }}
              >
                Set Goals
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            <div 
              className="group text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl hover:bg-white transition-all duration-500 hover:shadow-xl hover:-translate-y-2 cursor-pointer"
              onClick={() => setShowBreathingGuide(true)}
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Wind className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">Guided Breathing & Check-ins</h3>
              <p className="text-gray-600 font-light leading-relaxed mb-4">
                Find calm with breathing exercises and regular emotional check-ins tailored to your needs.
              </p>
              <Button 
                variant="ghost" 
                className="text-purple-600 hover:bg-purple-50 rounded-xl font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBreathingGuide(true);
                }}
              >
                Try Breathing
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
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
      <footer className="bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            
            {/* About Section */}
            <div className="text-center lg:text-left space-y-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">About SoulSense</h3>
              <p className="text-gray-600 font-light leading-relaxed text-sm">
                SoulSense is a calm and intelligent AI-powered wellness companion designed to support your emotional journey. Talk to empathetic personas who listen, reflect, and grow with you.
              </p>
            </div>

            {/* Navigation Section */}
            <div className="text-center lg:text-left space-y-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Navigation</h3>
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-center lg:justify-start font-light text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 rounded-lg p-2"
                  onClick={() => window.open('/privacy', '_blank')}
                >
                  Privacy Policy
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-center lg:justify-start font-light text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 rounded-lg p-2"
                  onClick={() => window.open('/terms', '_blank')}
                >
                  Terms of Use
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-center lg:justify-start font-light text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 rounded-lg p-2"
                  onClick={() => document.getElementById('personas')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Meet the Personas
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="justify-center lg:justify-start font-light text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 rounded-lg p-2"
                  onClick={() => setLocation("/diary")}
                >
                  Journaling
                </Button>
              </div>
            </div>

            {/* Contact Section */}
            <div className="text-center lg:text-left space-y-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Contact</h3>
              <div className="space-y-3">
                <p className="text-gray-600 font-light text-sm">
                  Developer: <span className="font-medium">Shreeraj Sangle</span>
                </p>
                <a 
                  href="mailto:shreerajsangle0@gmail.com"
                  className="inline-block text-purple-600 hover:text-purple-700 font-light text-sm transition-all duration-300 hover:underline decoration-purple-300 underline-offset-4"
                >
                  shreerajsangle0@gmail.com
                </a>
              </div>
            </div>

            {/* Connect Section */}
            <div className="text-center lg:text-left space-y-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Connect</h3>
              <div className="flex justify-center lg:justify-start space-x-4">
                <a 
                  href="https://www.instagram.com/just.shree_/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-pink-500 hover:bg-white transition-all duration-300 hover:scale-110 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://x.com/Shreeraj__9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-blue-500 hover:bg-white transition-all duration-300 hover:scale-110 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/in/shreeraj-sangle/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-white transition-all duration-300 hover:scale-110 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a 
                  href="https://github.com/ShreerajSangle" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-white transition-all duration-300 hover:scale-110 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-purple-200/50 pt-8 text-center space-y-3">
            <p className="text-gray-600 font-light text-sm">
              SoulSense is a safe, AI-powered space to reflect, feel, and grow.
            </p>
            <p className="text-gray-500 font-light text-xs">
              © 2025 SoulSense by Shreeraj Sangle. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Chat Overlay */}
      {chatOpen && selectedPersona && (
        <SimpleChatOverlay
          persona={selectedPersona}
          isOpen={chatOpen}
          onClose={handleCloseChat}
        />
      )}

      {/* Breathing Guide Modal */}
      {showBreathingGuide && (
        <GentleBreathingGuide
          isOpen={showBreathingGuide}
          onClose={() => setShowBreathingGuide(false)}
          trigger="stress"
        />
      )}
    </div>
  );
}