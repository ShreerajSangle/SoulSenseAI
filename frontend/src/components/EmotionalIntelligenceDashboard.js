import React, { useState, useEffect } from 'react';

const EmotionalIntelligenceDashboard = ({ userId, onClose }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [emotionalProfile, setEmotionalProfile] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [insights, setInsights] = useState(null);
  const [personaMatches, setPersonaMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchEmotionalData();
    }
  }, [userId, activeTab]);

  const fetchEmotionalData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch different data based on active tab
      switch (activeTab) {
        case 'profile':
          await fetchEmotionalProfile();
          break;
        case 'opportunities':
          await fetchTherapeuticOpportunities();
          break;
        case 'insights':
          await fetchEmotionalInsights();
          break;
        case 'persona-match':
          await fetchPersonaMatches();
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error fetching emotional data:', err);
      setError('Failed to load emotional intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmotionalProfile = async () => {
    const response = await fetch(`/api/emotional-intelligence/profile/${userId}`);
    if (response.ok) {
      const data = await response.json();
      setEmotionalProfile(data);
    }
  };

  const fetchTherapeuticOpportunities = async () => {
    const response = await fetch(`/api/emotional-intelligence/opportunities/${userId}`);
    if (response.ok) {
      const data = await response.json();
      setOpportunities(data.opportunities || []);
    }
  };

  const fetchEmotionalInsights = async () => {
    const response = await fetch(`/api/emotional-intelligence/insights/${userId}?period=week`);
    if (response.ok) {
      const data = await response.json();
      setInsights(data);
    }
  };

  const fetchPersonaMatches = async () => {
    const response = await fetch(`/api/emotional-intelligence/persona-match/${userId}`);
    if (response.ok) {
      const data = await response.json();
      setPersonaMatches(data.persona_matches || []);
    }
  };

  const triggerAnalysis = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/emotional-intelligence/profile/${userId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days_back: 30 })
      });
      
      if (response.ok) {
        await fetchEmotionalProfile();
      }
    } catch (err) {
      setError('Failed to analyze emotional patterns');
    } finally {
      setLoading(false);
    }
  };

  const getEmotionEmoji = (emotion) => {
    const emojiMap = {
      'anxious': '😰',
      'sad': '😢',
      'happy': '😊',
      'angry': '😠',
      'excited': '🎉',
      'overwhelmed': '🤯',
      'peaceful': '😌',
      'motivated': '💪',
      'confident': '😎',
      'grateful': '🙏',
      'high_stress': '🚨',
      'low_mood': '📉',
      'positive_mood': '📈'
    };
    return emojiMap[emotion] || '😐';
  };

  const getVolatilityColor = (volatility) => {
    if (volatility < 0.3) return 'text-green-600 bg-green-100';
    if (volatility < 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getVolatilityLabel = (volatility) => {
    if (volatility < 0.3) return 'Stable';
    if (volatility < 0.6) return 'Moderate';
    return 'High Volatility';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPersonaEmoji = (persona) => {
    const emojiMap = {
      'sarah': '👩‍⚕️',
      'maya': '🪷',
      'alex': '😊',
      'marcus': '💪'
    };
    return emojiMap[persona] || '✨';
  };

  const getPersonaName = (persona) => {
    const nameMap = {
      'sarah': 'Dr. Sarah',
      'maya': 'Maya',
      'alex': 'Alex',
      'marcus': 'Marcus'
    };
    return nameMap[persona] || persona;
  };

  const tabs = [
    { id: 'profile', label: 'Emotional Profile', icon: '🧠' },
    { id: 'opportunities', label: 'Therapeutic Opportunities', icon: '🎯' },
    { id: 'insights', label: 'Insights & Trends', icon: '📊' },
    { id: 'persona-match', label: 'Persona Matching', icon: '🎭' }
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-purple-700">Analyzing emotional patterns...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 rounded-full p-3">
              <span className="text-2xl">🧠</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Emotional Intelligence Dashboard</h2>
              <p className="text-gray-600">Advanced emotional analysis and therapeutic insights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Emotional Profile Tab */}
          {activeTab === 'profile' && emotionalProfile && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Your Emotional Profile</h3>
                <button
                  onClick={triggerAnalysis}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Refresh Analysis
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dominant Emotions */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">Dominant Emotions</h4>
                  <div className="flex flex-wrap gap-2">
                    {emotionalProfile.emotional_profile.dominant_emotions.map((emotion, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        <span className="mr-1">{getEmotionEmoji(emotion)}</span>
                        {emotion.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Emotional Volatility */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-purple-900 mb-4">Emotional Stability</h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${getVolatilityColor(emotionalProfile.emotional_profile.emotional_volatility).split(' ')[1]}`}
                          style={{ width: `${emotionalProfile.emotional_profile.emotional_volatility * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getVolatilityColor(emotionalProfile.emotional_profile.emotional_volatility)}`}>
                      {getVolatilityLabel(emotionalProfile.emotional_profile.emotional_volatility)}
                    </span>
                  </div>
                </div>

                {/* Stress Triggers */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-red-900 mb-4">Stress Triggers</h4>
                  <div className="space-y-2">
                    {emotionalProfile.emotional_profile.stress_triggers.length > 0 ? (
                      emotionalProfile.emotional_profile.stress_triggers.map((trigger, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-red-600">⚠️</span>
                          <span className="text-red-800">{trigger.replace('_', ' ')}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-red-600">No significant stress triggers identified</p>
                    )}
                  </div>
                </div>

                {/* Positive Patterns */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-green-900 mb-4">Positive Patterns</h4>
                  <div className="space-y-2">
                    {emotionalProfile.emotional_profile.positive_patterns.length > 0 ? (
                      emotionalProfile.emotional_profile.positive_patterns.map((pattern, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-green-600">✨</span>
                          <span className="text-green-800">{pattern.replace('_', ' ')}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-green-600">Building positive patterns...</p>
                    )}
                  </div>
                </div>

                {/* Support Preferences */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-yellow-900 mb-4">Support Preferences</h4>
                  <div className="space-y-2">
                    {emotionalProfile.emotional_profile.support_preferences.map((preference, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-yellow-600">🤝</span>
                        <span className="text-yellow-800">{preference.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resilience Factors */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-teal-900 mb-4">Resilience Factors</h4>
                  <div className="space-y-2">
                    {emotionalProfile.emotional_profile.resilience_factors.length > 0 ? (
                      emotionalProfile.emotional_profile.resilience_factors.map((factor, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-teal-600">💪</span>
                          <span className="text-teal-800">{factor.replace('_', ' ')}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-teal-600">Developing resilience strategies...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Therapeutic Opportunities Tab */}
          {activeTab === 'opportunities' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Current Therapeutic Opportunities</h3>
              
              {opportunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {opportunities.map((opportunity, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {opportunity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(opportunity.priority)}`}>
                          {opportunity.priority}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <span>{getPersonaEmoji(opportunity.recommended_persona)}</span>
                          <span className="text-sm text-gray-600">
                            Recommended: {getPersonaName(opportunity.recommended_persona)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-purple-600">⏰</span>
                          <span className="text-sm text-gray-600">
                            Timing: {opportunity.intervention_timing.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600">🎯</span>
                          <span className="text-sm text-gray-600">
                            Expected: {opportunity.expected_outcome.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600">📊</span>
                          <span className="text-sm text-gray-600">
                            Confidence: {Math.round(opportunity.confidence * 100)}%
                          </span>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3 mt-4">
                          <p className="text-sm text-gray-700 font-medium mb-2">Techniques:</p>
                          <div className="flex flex-wrap gap-1">
                            {opportunity.therapeutic_techniques.map((technique, techIndex) => (
                              <span
                                key={techIndex}
                                className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded"
                              >
                                {technique.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-6xl">🌟</span>
                  <h4 className="text-xl font-semibold text-gray-700 mt-4">No Active Opportunities</h4>
                  <p className="text-gray-500 mt-2">Continue your wellness journey to unlock new therapeutic opportunities</p>
                </div>
              )}
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && insights && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Emotional Insights & Trends</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Emotional Stability */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">Emotional Stability</h4>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-800">
                      {insights.emotional_stability.stability_rating.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="text-sm text-blue-600 mt-2">
                      Volatility: {Math.round(insights.emotional_stability.volatility_score * 100)}%
                    </div>
                  </div>
                </div>

                {/* Stress Management */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-red-900 mb-4">Stress Management</h4>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-800">
                      {insights.stress_management.risk_level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="text-sm text-red-600 mt-2">
                      {insights.stress_management.trigger_count} triggers identified
                    </div>
                  </div>
                </div>

                {/* Growth Indicators */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-green-900 mb-4">Growth Indicators</h4>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-800">
                      {insights.growth_indicators.strength_areas}
                    </div>
                    <div className="text-sm text-green-600 mt-2">
                      strength areas identified
                    </div>
                  </div>
                </div>
              </div>

              {/* Therapeutic Effectiveness */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Therapeutic Effectiveness</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Most Responsive Persona:</span>
                    <div className="flex items-center space-x-2">
                      <span>{getPersonaEmoji(insights.therapeutic_effectiveness.most_responsive_persona)}</span>
                      <span className="font-medium">{getPersonaName(insights.therapeutic_effectiveness.most_responsive_persona)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-gray-700 font-medium">Responsiveness Scores:</span>
                    {Object.entries(insights.therapeutic_effectiveness.responsiveness_scores || {}).map(([persona, score]) => (
                      <div key={persona} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span>{getPersonaEmoji(persona)}</span>
                          <span className="text-sm">{getPersonaName(persona)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${score * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-10 text-right">{Math.round(score * 100)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {insights.recommendations && insights.recommendations.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-purple-900 mb-4">Personalized Recommendations</h4>
                  <div className="space-y-3">
                    {insights.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <span className="text-purple-600 mt-1">💡</span>
                        <span className="text-purple-800">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Persona Matching Tab */}
          {activeTab === 'persona-match' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Persona Compatibility Analysis</h3>
              
              {personaMatches.length > 0 ? (
                <div className="space-y-4">
                  {personaMatches.map((match, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-3xl">{getPersonaEmoji(match.persona)}</span>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{getPersonaName(match.persona)}</h4>
                            <p className="text-sm text-gray-600">{match.rationale}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-800">{match.match_percentage}</div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            match.recommendation === 'highly_recommended' ? 'bg-green-100 text-green-800' :
                            match.recommendation === 'recommended' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {match.recommendation.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${match.match_score * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-6xl">🎭</span>
                  <h4 className="text-xl font-semibold text-gray-700 mt-4">Generating Persona Matches</h4>
                  <p className="text-gray-500 mt-2">Complete more wellness activities to improve persona matching accuracy</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmotionalIntelligenceDashboard;