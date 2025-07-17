import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Minus, Eye, BarChart3 } from 'lucide-react';

const EmotionalTimeline = ({ userId, period = "week" }) => {
  const [timelineData, setTimelineData] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('timeline'); // timeline, insights

  useEffect(() => {
    fetchTimelineData();
    fetchMetrics();
  }, [userId, period]);

  const fetchTimelineData = async () => {
    try {
      const response = await fetch(`/api/emotional-timeline/${userId}?period=${period}`);
      const data = await response.json();
      setTimelineData(data);
    } catch (error) {
      console.error('Error fetching timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/emotional-timeline/${userId}/metrics?period=${period}`);
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchMoments = async (date) => {
    try {
      const response = await fetch(`/api/emotional-timeline/${userId}/moments/${date}`);
      const data = await response.json();
      setMoments(data);
    } catch (error) {
      console.error('Error fetching moments:', error);
    }
  };

  const handleDateClick = async (date) => {
    setSelectedDate(date);
    await fetchMoments(date);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getIntensityHeight = (intensity) => {
    return Math.max(intensity * 100, 20); // Minimum 20px height
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-medium text-gray-900">Emotional Journey</h2>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewType('timeline')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewType === 'timeline' 
                ? 'bg-purple-100 text-purple-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setViewType('insights')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewType === 'insights' 
                ? 'bg-purple-100 text-purple-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Insights
          </button>
        </div>
      </div>

      {viewType === 'timeline' && (
        <>
          {/* Metrics Summary */}
          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-medium">Sessions</div>
                <div className="text-2xl font-bold text-purple-900">{metrics.total_sessions}</div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">Trend</div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(metrics.emotional_trend)}
                  <span className="text-sm font-medium capitalize">{metrics.emotional_trend}</span>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium">Breakthroughs</div>
                <div className="text-2xl font-bold text-green-900">{metrics.breakthrough_moments}</div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-orange-600 font-medium">Top Emotion</div>
                <div className="text-sm font-medium capitalize">
                  {metrics.dominant_emotions[0] || 'Neutral'}
                </div>
              </div>
            </div>
          )}

          {/* Timeline Visualization */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Your Emotional Journey - {period === 'week' ? 'This Week' : 'This Month'}
            </h3>
            
            {timelineData.length > 0 ? (
              <div className="relative">
                {/* Timeline Background */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {/* Timeline Points */}
                <div className="space-y-6">
                  {timelineData.map((point, index) => (
                    <div key={index} className="relative flex items-start space-x-4">
                      {/* Timeline Dot */}
                      <div 
                        className="relative z-10 w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-125"
                        style={{ backgroundColor: point.mood_color }}
                        onClick={() => handleDateClick(point.date)}
                      />
                      
                      {/* Content */}
                      <div 
                        className="flex-1 bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleDateClick(point.date)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(point.date)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{point.session_type}</span>
                            <Eye className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm font-medium capitalize text-gray-700">
                            {point.primary_emotion}
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full"
                              style={{ 
                                backgroundColor: point.mood_color,
                                width: `${point.intensity * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(point.intensity * 100)}%
                          </span>
                        </div>
                        
                        {point.key_excerpt && (
                          <p className="text-sm text-gray-600 italic">
                            "{point.key_excerpt}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No emotional data available for this period.</p>
                <p className="text-sm">Start a conversation to begin tracking your journey!</p>
              </div>
            )}
          </div>

          {/* Selected Date Details Modal */}
          {selectedDate && moments.length > 0 && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                  <h3 className="text-lg font-medium mb-2">
                    {formatDate(selectedDate)}
                  </h3>
                  <p className="text-sm opacity-90">{moments.length} emotional moments</p>
                </div>
                
                <div className="p-6 max-h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {moments.map((moment, index) => (
                      <div key={index} className="border-l-4 pl-4" style={{ borderColor: moment.color }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">{moment.emotion}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(moment.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        {moment.excerpt && (
                          <p className="text-sm text-gray-600 mb-2">"{moment.excerpt}"</p>
                        )}
                        
                        <div className="text-xs text-gray-500">
                          {moment.persona && `With ${moment.persona}`} • {moment.source_type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50">
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {viewType === 'insights' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Weekly Insights</h3>
          </div>
          
          {metrics && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Emotional Pattern</h4>
                <p className="text-sm text-blue-700">
                  Your emotional trend is <strong>{metrics.emotional_trend}</strong> this {period}.
                  {metrics.dominant_emotions.length > 0 && (
                    <> You've been experiencing mostly <strong>{metrics.dominant_emotions.join(', ')}</strong>.</>
                  )}
                </p>
              </div>
              
              {metrics.breakthrough_moments > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Breakthrough Moments</h4>
                  <p className="text-sm text-green-700">
                    You had <strong>{metrics.breakthrough_moments}</strong> breakthrough moment{metrics.breakthrough_moments !== 1 ? 's' : ''} this {period}!
                  </p>
                </div>
              )}
              
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">Engagement</h4>
                <p className="text-sm text-purple-700">
                  You completed <strong>{metrics.total_sessions}</strong> wellness sessions this {period}.
                  {metrics.total_sessions >= 5 ? " Great consistency!" : " Consider more frequent check-ins for better insights."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmotionalTimeline;