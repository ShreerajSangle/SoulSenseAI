import React, { useState, useEffect } from 'react';

const DailyInsightsBanner = ({ userId, onPersonaRecommendation }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDailyInsights();
  }, [userId]);

  const fetchDailyInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/daily-loop-integration/weekly-insights/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      } else {
        setInsights(null);
      }
    } catch (err) {
      console.error('Error fetching daily insights:', err);
      setError('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const getPersonaEmoji = (persona) => {
    const emojis = {
      maya: '🪷',
      sarah: '👩‍⚕️',
      alex: '😊',
      marcus: '💪'
    };
    return emojis[persona] || '✨';
  };

  const getPersonaName = (persona) => {
    const names = {
      maya: 'Maya',
      sarah: 'Dr. Sarah',
      alex: 'Alex',
      marcus: 'Marcus'
    };
    return names[persona] || persona;
  };

  const getMoodTrendColor = (trend) => {
    const colors = {
      improving: 'text-green-600',
      declining: 'text-red-500',
      stable: 'text-blue-600'
    };
    return colors[trend] || 'text-gray-600';
  };

  const getMoodTrendIcon = (trend) => {
    const icons = {
      improving: '📈',
      declining: '📉',
      stable: '➡️'
    };
    return icons[trend] || '📊';
  };

  const getTopPersonaRecommendation = () => {
    if (!insights?.persona_priority) return null;
    
    const sortedPersonas = Object.entries(insights.persona_priority)
      .sort(([,a], [,b]) => b - a);
    
    return sortedPersonas[0];
  };

  const handlePersonaClick = (persona) => {
    if (onPersonaRecommendation) {
      onPersonaRecommendation(persona);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-purple-700">Loading your daily insights...</span>
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return null; // Don't show banner if no insights available
  }

  const topPersona = getTopPersonaRecommendation();

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            ✨ Your Daily Wellness Insights
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Mood Trend */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getMoodTrendIcon(insights.mood_trend)}</span>
              <div>
                <p className="text-sm text-gray-600">Mood Trend</p>
                <p className={`font-medium ${getMoodTrendColor(insights.mood_trend)}`}>
                  {insights.mood_trend || 'Stable'}
                </p>
              </div>
            </div>

            {/* Energy Trend */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getMoodTrendIcon(insights.energy_trend)}</span>
              <div>
                <p className="text-sm text-gray-600">Energy Pattern</p>
                <p className={`font-medium ${getMoodTrendColor(insights.energy_trend)}`}>
                  {insights.energy_trend || 'Stable'}
                </p>
              </div>
            </div>

            {/* Recommended Focus */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-sm text-gray-600">Focus Area</p>
                <p className="font-medium text-purple-700">
                  {insights.recommended_focus?.[0]?.replace('_', ' ') || 'Maintenance'}
                </p>
              </div>
            </div>
          </div>

          {/* Top Persona Recommendation */}
          {topPersona && (
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getPersonaEmoji(topPersona[0])}</span>
                  <div>
                    <p className="text-sm text-gray-600">Recommended for you today</p>
                    <p className="font-semibold text-purple-900">
                      {getPersonaName(topPersona[0])}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.round(topPersona[1] * 100)}% match based on your wellness patterns
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handlePersonaClick(topPersona[0])}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Chat Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Persona Priority Indicators */}
        <div className="ml-6 flex flex-col space-y-2">
          <p className="text-xs text-gray-600 text-center">Today's Match</p>
          {insights.persona_priority && Object.entries(insights.persona_priority)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 4)
            .map(([persona, priority]) => (
              <div
                key={persona}
                className="flex items-center space-x-2 cursor-pointer hover:bg-purple-100 rounded-lg p-2 transition-colors"
                onClick={() => handlePersonaClick(persona)}
              >
                <span className="text-lg">{getPersonaEmoji(persona)}</span>
                <div className="flex-1">
                  <div className="w-12 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${priority * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">
                  {Math.round(priority * 100)}%
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DailyInsightsBanner;