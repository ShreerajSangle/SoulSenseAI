import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Heart, Target, Brain } from 'lucide-react';

const AnalyticsPage = ({ user }) => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, selectedTimeframe]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/${user.user_id}?timeframe=${selectedTimeframe}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: 'bg-yellow-100 border-yellow-200 text-yellow-800',
      sad: 'bg-blue-100 border-blue-200 text-blue-800',
      anxious: 'bg-red-100 border-red-200 text-red-800',
      calm: 'bg-green-100 border-green-200 text-green-800',
      excited: 'bg-orange-100 border-orange-200 text-orange-800',
      frustrated: 'bg-purple-100 border-purple-200 text-purple-800',
      hopeful: 'bg-pink-100 border-pink-200 text-pink-800',
      overwhelmed: 'bg-gray-100 border-gray-200 text-gray-800',
      grateful: 'bg-emerald-100 border-emerald-200 text-emerald-800'
    };
    return colors[mood] || 'bg-gray-100 border-gray-200 text-gray-800';
  };

  const getPersonaIcon = (personaId) => {
    const icons = {
      sarah: '👩‍⚕️',
      maya: '🪷',
      alex: '🤗',
      marcus: '💪'
    };
    return icons[personaId] || '🤖';
  };

  const getPersonaColor = (personaId) => {
    const colors = {
      sarah: 'from-blue-400 to-indigo-500',
      maya: 'from-purple-400 to-pink-500',
      alex: 'from-orange-400 to-red-500',
      marcus: 'from-green-400 to-emerald-500'
    };
    return colors[personaId] || 'from-gray-400 to-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {analytics ? (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.total_sessions}</p>
                    <p className="text-xs text-green-600 mt-1">+12% from last period</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Breathing Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.breathing_sessions}</p>
                    <p className="text-xs text-green-600 mt-1">+8% from last period</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xl">🌬️</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Journal Entries</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.journal_entries}</p>
                    <p className="text-xs text-green-600 mt-1">+15% from last period</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-xl">📝</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Goal Progress</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(analytics.goal_completion_rate * 100)}%
                    </p>
                    <p className="text-xs text-green-600 mt-1">+5% from last period</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Target className="text-amber-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Persona Usage */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Persona Interaction</h2>
                <Brain className="text-purple-600" size={20} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(analytics.persona_usage).map(([personaId, count]) => (
                  <div key={personaId} className="relative">
                    <div className={`bg-gradient-to-br ${getPersonaColor(personaId)} rounded-lg p-4 text-white`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{getPersonaIcon(personaId)}</span>
                        <span className="text-lg font-bold">{count}</span>
                      </div>
                      <p className="text-sm opacity-90 capitalize">{personaId}</p>
                      <div className="mt-2 bg-white/20 rounded-full h-1">
                        <div
                          className="bg-white rounded-full h-1 transition-all duration-300"
                          style={{ width: `${(count / analytics.total_sessions) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emotional Patterns */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Emotional Patterns</h2>
                <Heart className="text-red-600" size={20} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analytics.emotional_patterns).map(([emotion, data]) => (
                  <div key={emotion} className={`rounded-lg p-4 border-2 ${getMoodColor(emotion)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium capitalize">{emotion}</h3>
                      <span className="text-sm font-semibold">{data.frequency}</span>
                    </div>
                    <p className="text-xs opacity-75 mb-2">
                      Avg intensity: {data.average_intensity.toFixed(1)}/10
                    </p>
                    <div className="bg-white/50 rounded-full h-1.5">
                      <div
                        className="bg-current rounded-full h-1.5 transition-all duration-300"
                        style={{ width: `${(data.average_intensity / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <Calendar className="text-indigo-600" size={20} />
              </div>
              
              <div className="space-y-4">
                {/* This would be populated with recent activity data */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">🪷</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Breathing session with Maya</p>
                    <p className="text-xs text-gray-500">2 hours ago • 10 minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">👩‍⚕️</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Therapy session with Dr. Sarah</p>
                    <p className="text-xs text-gray-500">Yesterday • 25 minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">💪</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Goal created with Marcus</p>
                    <p className="text-xs text-gray-500">3 days ago • "Daily meditation practice"</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights & Recommendations */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Insights & Recommendations</h2>
                <TrendingUp className="text-green-600" size={20} />
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-medium text-green-800">Positive Trend</p>
                  </div>
                  <p className="text-sm text-green-700">
                    Your breathing sessions have increased by 25% this month. This shows great commitment to your wellness routine.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm font-medium text-blue-800">Recommendation</p>
                  </div>
                  <p className="text-sm text-blue-700">
                    Consider exploring more sessions with Maya for spiritual guidance, as your anxiety levels seem to decrease after her sessions.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <p className="text-sm font-medium text-purple-800">Pattern Recognition</p>
                  </div>
                  <p className="text-sm text-purple-700">
                    Your journal entries show increased self-awareness. This is a strong indicator of emotional growth and healing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
            <p className="text-gray-600">
              Start using SoulSense to see your wellness insights and progress.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;