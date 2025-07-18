import React, { useState, useEffect } from 'react';
import { MapPin, Filter, Search, Heart, Brain, Target, Sparkles } from 'lucide-react';
import PathwayCard from './PathwayCard';

const PathwayExplorer = ({ userId }) => {
  const [pathways, setPathways] = useState([]);
  const [userPathways, setUserPathways] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [filteredPathways, setFilteredPathways] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('all');
  const [loading, setLoading] = useState(true);

  const personas = [
    { id: 'all', name: 'All Personas', icon: '🌟' },
    { id: 'sarah', name: 'Dr. Sarah', icon: '🧠', description: 'Clinical Therapy' },
    { id: 'maya', name: 'Maya', icon: '🔮', description: 'Spiritual Growth' },
    { id: 'alex', name: 'Alex', icon: '💪', description: 'Peer Support' },
    { id: 'marcus', name: 'Marcus', icon: '🎯', description: 'Life Coaching' }
  ];

  const themes = [
    { id: 'all', name: 'All Themes', icon: '🌈' },
    { id: 'anxiety_management', name: 'Anxiety Relief', icon: '😌' },
    { id: 'burnout_recovery', name: 'Burnout Recovery', icon: '🔋' },
    { id: 'confidence_building', name: 'Confidence', icon: '💪' },
    { id: 'goal_achievement', name: 'Goal Achievement', icon: '🎯' },
    { id: 'chakra_healing', name: 'Spiritual Growth', icon: '🔮' },
    { id: 'social_confidence', name: 'Social Skills', icon: '👥' },
    { id: 'productivity', name: 'Productivity', icon: '⚡' },
    { id: 'mindful_rituals', name: 'Mindfulness', icon: '🧘' }
  ];

  useEffect(() => {
    fetchPathways();
    fetchUserPathways();
    fetchRecommendations();
  }, [userId]);

  useEffect(() => {
    filterPathways();
  }, [pathways, selectedPersona, searchTerm, selectedTheme]);

  const fetchPathways = async () => {
    try {
      const response = await fetch('/api/pathways');
      const data = await response.json();
      setPathways(data);
    } catch (error) {
      console.error('Error fetching pathways:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPathways = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/pathways/user/${userId}`);
      const data = await response.json();
      setUserPathways(data);
    } catch (error) {
      console.error('Error fetching user pathways:', error);
    }
  };

  const fetchRecommendations = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/pathways/recommendations/${userId}`);
      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const filterPathways = () => {
    let filtered = [...pathways];

    // Filter by persona
    if (selectedPersona !== 'all') {
      filtered = filtered.filter(p => p.persona_id === selectedPersona);
    }

    // Filter by theme
    if (selectedTheme !== 'all') {
      filtered = filtered.filter(p => p.theme === selectedTheme);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPathways(filtered);
  };

  const handleEnrollment = async (pathwayId) => {
    try {
      const response = await fetch(`/api/pathways/${pathwayId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        // Refresh user pathways
        await fetchUserPathways();
        alert('Successfully enrolled in pathway!');
      } else {
        alert('Failed to enroll in pathway');
      }
    } catch (error) {
      console.error('Error enrolling in pathway:', error);
      alert('Error enrolling in pathway');
    }
  };

  const handleContinue = (pathwayId) => {
    // Navigate to pathway activity page
    window.location.href = `/pathway/${pathwayId}`;
  };

  const getUserProgress = (pathwayId) => {
    return userPathways.find(up => up.id === pathwayId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <MapPin className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Guided Pathways</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Embark on transformative journeys with your favorite personas. Each pathway is designed to guide you through specific challenges and growth opportunities.
        </p>
      </div>

      {/* Active Pathways */}
      {userPathways.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Heart className="w-6 h-6 text-red-500" />
            <span>Your Active Journeys</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userPathways.map(pathway => (
              <PathwayCard
                key={pathway.id}
                pathway={pathway}
                userProgress={pathway}
                onContinue={handleContinue}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <span>Recommended for You</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map(pathway => (
              <PathwayCard
                key={pathway.id}
                pathway={pathway}
                userProgress={getUserProgress(pathway.id)}
                onEnroll={handleEnrollment}
                onContinue={handleContinue}
              />
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Explore Pathways</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search pathways..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Persona Filter */}
          <select
            value={selectedPersona}
            onChange={(e) => setSelectedPersona(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {personas.map(persona => (
              <option key={persona.id} value={persona.id}>
                {persona.icon} {persona.name}
              </option>
            ))}
          </select>

          {/* Theme Filter */}
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {themes.map(theme => (
              <option key={theme.id} value={theme.id}>
                {theme.icon} {theme.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* All Pathways */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Brain className="w-6 h-6 text-purple-600" />
          <span>All Pathways</span>
        </h2>
        
        {filteredPathways.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pathways found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPathways.map(pathway => (
              <PathwayCard
                key={pathway.id}
                pathway={pathway}
                userProgress={getUserProgress(pathway.id)}
                onEnroll={handleEnrollment}
                onContinue={handleContinue}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PathwayExplorer;