import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BreathingExercise from '../components/BreathingExercise';

const HomePage = ({ user }) => {
  const [personas, setPersonas] = useState([]);
  const [showBreathing, setShowBreathing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const response = await fetch('/api/personas');
        if (response.ok) {
          const personasData = await response.json();
          setPersonas(personasData);
        }
      } catch (error) {
        console.error('Error fetching personas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonas();
  }, []);

  const handlePersonaClick = (personaId) => {
    navigate(`/chat/${personaId}`);
  };

  const testimonials = [
    {
      name: "Emma S.",
      text: "Maya's breathing exercises have transformed my daily stress management. I feel more centered and peaceful.",
      rating: 5,
      persona: "Maya"
    },
    {
      name: "Michael R.",
      text: "Dr. Sarah helped me understand my thought patterns and develop healthier coping strategies.",
      rating: 5,
      persona: "Dr. Sarah"
    },
    {
      name: "Lisa K.",
      text: "Alex feels like talking to a supportive friend who truly understands what I'm going through.",
      rating: 5,
      persona: "Alex"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">🪷</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Soul Sense
              </h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link to="/profile" className="text-gray-600 hover:text-purple-600 transition-colors">
                Profile
              </Link>
              <Link to="/journal" className="text-gray-600 hover:text-purple-600 transition-colors">
                Journal
              </Link>
              <Link to="/analytics" className="text-gray-600 hover:text-purple-600 transition-colors">
                Analytics
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-pink-100/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 animate-pulse">
              <span className="text-2xl">✨</span>
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Meet your digital
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                emotional companion
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Four specialized AI personas designed to support your mental wellness journey with personalized, empathetic guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/chat/sarah')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Chatting
              </button>
              <button
                onClick={() => setShowBreathing(true)}
                className="bg-white/80 backdrop-blur-sm text-purple-600 px-8 py-3 rounded-full text-lg font-semibold border-2 border-purple-200 hover:border-purple-300 transition-all duration-200 transform hover:scale-105"
              >
                Try Breathing Exercise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Personas Section */}
      <section id="personas" className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Meet Your Therapeutic Companions</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Each persona offers unique expertise and personality to support different aspects of your mental wellness journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {personas.map((persona) => (
              <div
                key={persona.id}
                onClick={() => handlePersonaClick(persona.id)}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-purple-100"
              >
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">{persona.emoji}</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{persona.name}</h4>
                  <p className="text-sm text-purple-600 font-semibold mb-3">{persona.role}</p>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="italic text-center leading-relaxed">
                    {persona.id === 'sarah' && '"I create a safe space for you to explore your thoughts and feelings with gentle, professional guidance."'}
                    {persona.id === 'maya' && '"Let us breathe together and find the sacred stillness within your beautiful soul."'}
                    {persona.id === 'alex' && '"I\'m here as your supportive friend who truly gets what you\'re going through."'}
                    {persona.id === 'marcus' && '"Together, we\'ll build the habits and mindset that will transform your life."'}
                  </p>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-1">
                  {persona.specializations?.slice(0, 3).map((spec) => (
                    <span
                      key={spec}
                      className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                    >
                      {spec.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Wellness Tools</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Beyond conversations, access a full suite of mental wellness tools designed to support your journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              to="/journal"
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-purple-100"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📝</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Reflective Journaling</h4>
                <p className="text-gray-600 leading-relaxed">
                  Guided journaling with personalized prompts to help you process emotions and track your growth.
                </p>
              </div>
            </Link>
            
            <Link
              to="/goals"
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-purple-100"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Goal Setting</h4>
                <p className="text-gray-600 leading-relaxed">
                  Set, track, and achieve your wellness goals with personalized coaching and progress insights.
                </p>
              </div>
            </Link>
            
            <button
              onClick={() => setShowBreathing(true)}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-purple-100 text-left"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌬️</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Breathing Exercises</h4>
                <p className="text-gray-600 leading-relaxed">
                  Guided breathing techniques to help you manage stress, anxiety, and find inner calm.
                </p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h3>
            <p className="text-lg text-gray-600">Real experiences from people on their wellness journey</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-gray-600 italic mb-4 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-purple-600">with {testimonial.persona}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🪷</span>
                </div>
                <h4 className="text-xl font-bold">Soul Sense</h4>
              </div>
              <p className="text-purple-100 leading-relaxed">
                A safe, AI-powered space to reflect, feel, and grow.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold text-lg mb-4">Navigation</h5>
              <div className="space-y-2">
                <Link to="/profile" className="block text-purple-100 hover:text-white transition-colors">
                  Profile
                </Link>
                <Link to="/journal" className="block text-purple-100 hover:text-white transition-colors">
                  Journal
                </Link>
                <Link to="/analytics" className="block text-purple-100 hover:text-white transition-colors">
                  Analytics
                </Link>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold text-lg mb-4">Support</h5>
              <div className="space-y-2">
                <a href="#" className="block text-purple-100 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="block text-purple-100 hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="block text-purple-100 hover:text-white transition-colors">
                  Contact Us
                </a>
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold text-lg mb-4">Connect</h5>
              <div className="space-y-2 text-purple-100">
                <p>Developer: Shreeraj Sangle</p>
                <a href="mailto:contact@soulsense.ai" className="block hover:text-white transition-colors">
                  contact@soulsense.ai
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-purple-400 text-center text-purple-100">
            <p>&copy; 2025 Soul Sense. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Breathing Exercise Modal */}
      {showBreathing && (
        <BreathingExercise onClose={() => setShowBreathing(false)} />
      )}
    </div>
  );
};

export default HomePage;