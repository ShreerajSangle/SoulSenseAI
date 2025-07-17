import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import PathwayExplorer from './components/PathwayExplorer';
import DailyLoopDashboard from './components/DailyLoopDashboard';
import DailyInsightsBanner from './components/DailyInsightsBanner';
import './App.css';

// Persona data
const PERSONAS = [
  {
    id: 'maya',
    name: 'Maya',
    role: 'Spiritual Guide & Breathwork Mentor',
    emoji: '🪷',
    description: 'Serene guidance through mindfulness, breathwork, and spiritual practices',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'sarah',
    name: 'Dr. Sarah',
    role: 'Clinical Psychologist',
    emoji: '🧠',
    description: 'Evidence-based therapy with CBT techniques and emotional processing',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'alex',
    name: 'Alex',
    role: 'Peer Support Companion',
    emoji: '😊',
    description: 'Relatable support with humor therapy and friendship dynamics',
    color: 'from-green-500 to-teal-500'
  },
  {
    id: 'marcus',
    name: 'Marcus',
    role: 'Life Coach',
    emoji: '⚡',
    description: 'Action-oriented coaching with goal setting and motivation',
    color: 'from-orange-500 to-red-500'
  }
];

// HomePage component with persona selection
const HomePage = ({ onPersonaSelect, onShowPathways, onShowDailyLoop, userId }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Daily Insights Banner */}
      <div className="container mx-auto px-4 pt-6">
        <DailyInsightsBanner 
          userId={userId}
          onPersonaRecommendation={onPersonaSelect}
        />
      </div>
      
      {/* Hero Section */}
      <div className="text-center py-16 px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-8 animate-pulse">
          <span className="text-3xl">🪷</span>
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Soul Sense
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Your digital emotional companion featuring four specialized AI personas with dynamic, 
          context-aware quick replies that adapt to your emotional state and conversation flow.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-8">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Dynamic Quick Replies System Active
        </div>
      </div>

      {/* Persona Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Choose Your Therapeutic Companion
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PERSONAS.map((persona) => (
            <div
              key={persona.id}
              onClick={() => onPersonaSelect(persona)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group overflow-hidden"
            >
              <div className={`bg-gradient-to-r ${persona.color} p-6 text-center`}>
                <span className="text-4xl block mb-3">{persona.emoji}</span>
                <h3 className="text-xl font-bold text-white mb-2">{persona.name}</h3>
                <p className="text-sm text-white opacity-90">{persona.role}</p>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {persona.description}
                </p>
                
                <div className="text-xs text-gray-500 mb-3">
                  Features dynamic suggestions for:
                </div>
                <div className="flex flex-wrap gap-1 text-xs">
                  {persona.id === 'maya' && (
                    <>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">Breathing</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">Mantras</span>
                    </>
                  )}
                  {persona.id === 'sarah' && (
                    <>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">CBT</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">Journaling</span>
                    </>
                  )}
                  {persona.id === 'alex' && (
                    <>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Support</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Comfort</span>
                    </>
                  )}
                  {persona.id === 'marcus' && (
                    <>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">Goals</span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">Planning</span>
                    </>
                  )}
                </div>
                
                <button className={`w-full mt-4 py-3 bg-gradient-to-r ${persona.color} text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200`}>
                  Start Conversation
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Replies Demo */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Intelligent Context-Aware Suggestions
          </h2>
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="text-center text-gray-600 mb-6">
              Example: When you say "I feel anxious", Maya might suggest:
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium border border-purple-200">
                🧘 3-min breathing pause?
              </div>
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium border border-purple-200">
                📿 Grounding mantra?
              </div>
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium border border-purple-200">
                💬 Share what triggered this?
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wellness Features */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Complete Wellness Ecosystem
          </h2>
          <p className="text-green-100 text-lg mb-8">
            Daily routines and structured healing journeys for comprehensive mental health support
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onShowDailyLoop}
              className="bg-white text-green-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              ✨ Daily SoulSense Loop
            </button>
            <button 
              onClick={onShowPathways}
              className="bg-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
            >
              🧭 Guided Pathways
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState({ id: 'demo_user', name: 'Demo User', sessionId: Date.now() });
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [showPathways, setShowPathways] = useState(false);
  const [showDailyLoop, setShowDailyLoop] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test backend connection
    const testBackend = async () => {
      try {
        const response = await fetch('/api/personas');
        if (response.ok) {
          console.log('Backend connection successful');
        }
      } catch (error) {
        console.error('Backend connection failed:', error);
      } finally {
        setLoading(false);
      }
    };

    testBackend();
  }, []);

  const handlePersonaSelect = (persona) => {
    setSelectedPersona(persona);
    setShowPathways(false);
    setShowDailyLoop(false);
  };

  const handleBackToHome = () => {
    setSelectedPersona(null);
    setShowPathways(false);
    setShowDailyLoop(false);
  };

  const handleShowPathways = () => {
    setShowPathways(true);
    setSelectedPersona(null);
    setShowDailyLoop(false);
  };

  const handleShowDailyLoop = () => {
    setShowDailyLoop(true);
    setSelectedPersona(null);
    setShowPathways(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading SoulSense...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing Dynamic Quick Replies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-gray-50">
      {selectedPersona ? (
        <div className="h-screen flex flex-col">
          {/* Back button */}
          <div className="bg-white border-b px-4 py-2">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>←</span>
              <span>Back to Home</span>
            </button>
          </div>
          
          {/* Chat Interface */}
          <div className="flex-1">
            <ChatInterface selectedPersona={selectedPersona} user={user} />
          </div>
        </div>
      ) : showPathways ? (
        <div className="min-h-screen">
          {/* Back button */}
          <div className="bg-white border-b px-4 py-2">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>←</span>
              <span>Back to Home</span>
            </button>
          </div>
          
          {/* Pathways Explorer */}
          <PathwayExplorer userId={user.id} />
        </div>
      ) : showDailyLoop ? (
        <div className="min-h-screen">
          {/* Back button */}
          <div className="bg-white border-b px-4 py-2">
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>←</span>
              <span>Back to Home</span>
            </button>
          </div>
          
          {/* Daily Loop Dashboard */}
          <DailyLoopDashboard userId={user.id} />
        </div>
      ) : (
        <HomePage 
          onPersonaSelect={handlePersonaSelect} 
          onShowPathways={handleShowPathways} 
          onShowDailyLoop={handleShowDailyLoop}
          userId={user.id}
        />
      )}
    </div>
  );
}

export default App;