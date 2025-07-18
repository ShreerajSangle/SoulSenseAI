import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Clock, 
  Calendar,
  TrendingUp,
  Target,
  CheckCircle,
  AlertCircle,
  Sparkles,
  BarChart3,
  Flame
} from 'lucide-react';
import DailyLoopActivity from './DailyLoopActivity';

const DailyLoopDashboard = ({ userId }) => {
  const [dailySummary, setDailySummary] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [showActivity, setShowActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailySummary();
    fetchWeeklySummary();
  }, [userId]);

  const fetchDailySummary = async () => {
    try {
      const response = await fetch(`/api/daily-loop/summary/${userId}`);
      const data = await response.json();
      setDailySummary(data);
    } catch (error) {
      console.error('Error fetching daily summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklySummary = async () => {
    try {
      const response = await fetch(`/api/daily-loop/weekly/${userId}`);
      const data = await response.json();
      setWeeklySummary(data);
    } catch (error) {
      console.error('Error fetching weekly summary:', error);
    }
  };

  const handleActivityComplete = () => {
    setShowActivity(null);
    fetchDailySummary();
    fetchWeeklySummary();
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning!";
    if (hour < 17) return "Good afternoon!";
    return "Good evening!";
  };

  const getNextSuggestedActivity = () => {
    if (!dailySummary) return null;
    
    const { completion_status, next_suggested_activity } = dailySummary;
    const currentHour = new Date().getHours();
    
    if (currentHour < 12 && !completion_status.morning_completed) {
      return {
        type: 'morning_checkin',
        title: 'Morning Check-In',
        description: 'Start your day with intention and mindfulness',
        icon: Sun,
        color: 'from-orange-400 to-yellow-400',
        urgent: true
      };
    } else if (currentHour >= 12 && currentHour < 15 && !completion_status.midday_completed) {
      return {
        type: 'midday_pulse',
        title: 'Midday Pulse Check',
        description: 'Quick reset to recalibrate your energy',
        icon: Clock,
        color: 'from-blue-400 to-teal-400',
        urgent: false
      };
    } else if (currentHour >= 18 && !completion_status.evening_completed) {
      return {
        type: 'evening_reflection',
        title: 'Evening Reflection',
        description: 'End your day with gratitude and processing',
        icon: Moon,
        color: 'from-purple-400 to-indigo-400',
        urgent: true
      };
    }
    
    return null;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (showActivity) {
    return (
      <DailyLoopActivity
        userId={userId}
        loopType={showActivity}
        onComplete={handleActivityComplete}
        onCancel={() => setShowActivity(null)}
      />
    );
  }

  const nextActivity = getNextSuggestedActivity();
  const NextIcon = nextActivity?.icon || Target;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Daily SoulSense Loop</h1>
        </div>
        <p className="text-gray-600 text-lg">{getTimeGreeting()} Let's nurture your daily wellness routine.</p>
        <p className="text-gray-500 mt-2">{formatDate(dailySummary?.date)}</p>
      </div>

      {/* Today's Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Morning Check-In */}
        <div className={`rounded-2xl p-6 border-2 ${dailySummary?.completion_status.morning_completed ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Sun className={`w-8 h-8 ${dailySummary?.completion_status.morning_completed ? 'text-green-600' : 'text-orange-600'}`} />
              <div>
                <h3 className="font-semibold text-gray-900">Morning Check-In</h3>
                <p className="text-sm text-gray-600">Set your daily intention</p>
              </div>
            </div>
            {dailySummary?.completion_status.morning_completed ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-orange-600" />
            )}
          </div>
          <div className="text-center">
            {dailySummary?.completion_status.morning_completed ? (
              <span className="text-green-700 font-medium">Completed ✓</span>
            ) : (
              <button
                onClick={() => setShowActivity('morning_checkin')}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-2 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-yellow-600 transition-all duration-300"
              >
                Start Morning Check-In
              </button>
            )}
          </div>
        </div>

        {/* Midday Pulse */}
        <div className={`rounded-2xl p-6 border-2 ${dailySummary?.completion_status.midday_completed ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Clock className={`w-8 h-8 ${dailySummary?.completion_status.midday_completed ? 'text-green-600' : 'text-blue-600'}`} />
              <div>
                <h3 className="font-semibold text-gray-900">Midday Pulse</h3>
                <p className="text-sm text-gray-600">Quick energy reset</p>
              </div>
            </div>
            {dailySummary?.completion_status.midday_completed ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div className="text-center">
            {dailySummary?.completion_status.midday_completed ? (
              <span className="text-green-700 font-medium">Completed ✓</span>
            ) : (
              <button
                onClick={() => setShowActivity('midday_pulse')}
                className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 transition-all duration-300"
              >
                Start Midday Pulse
              </button>
            )}
          </div>
        </div>

        {/* Evening Reflection */}
        <div className={`rounded-2xl p-6 border-2 ${dailySummary?.completion_status.evening_completed ? 'border-green-200 bg-green-50' : 'border-purple-200 bg-purple-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Moon className={`w-8 h-8 ${dailySummary?.completion_status.evening_completed ? 'text-green-600' : 'text-purple-600'}`} />
              <div>
                <h3 className="font-semibold text-gray-900">Evening Reflection</h3>
                <p className="text-sm text-gray-600">Process your day</p>
              </div>
            </div>
            {dailySummary?.completion_status.evening_completed ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-purple-600" />
            )}
          </div>
          <div className="text-center">
            {dailySummary?.completion_status.evening_completed ? (
              <span className="text-green-700 font-medium">Completed ✓</span>
            ) : (
              <button
                onClick={() => setShowActivity('evening_reflection')}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 transition-all duration-300"
              >
                Start Evening Reflection
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Next Suggested Activity */}
      {nextActivity && (
        <div className="mb-8">
          <div className={`bg-gradient-to-r ${nextActivity.color} rounded-2xl p-8 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <NextIcon className="w-12 h-12" />
                <div>
                  <h2 className="text-2xl font-bold">{nextActivity.title}</h2>
                  <p className="text-white/90">{nextActivity.description}</p>
                </div>
              </div>
              <button
                onClick={() => setShowActivity(nextActivity.type)}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors backdrop-blur-sm"
              >
                Start Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Streak & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Current Streak */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Flame className="w-6 h-6 text-orange-500" />
              <h3 className="font-semibold text-gray-900">Current Streak</h3>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {dailySummary?.streak.current || 0}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Longest: {dailySummary?.streak.longest || 0} days
          </p>
        </div>

        {/* Weekly Completion */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Weekly Rate</h3>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {weeklySummary ? Math.round(weeklySummary.completion_rate * 100) : 0}%
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {weeklySummary?.total_entries || 0} entries this week
          </p>
        </div>

        {/* Mood Average */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h3 className="font-semibold text-gray-900">Mood Average</h3>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {weeklySummary?.mood_average ? weeklySummary.mood_average.toFixed(1) : 'N/A'}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Energy: {weeklySummary?.energy_average ? weeklySummary.energy_average.toFixed(1) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Recent Entries */}
      {dailySummary?.entries.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Today's Entries</h2>
          </div>
          
          <div className="space-y-4">
            {dailySummary.entries.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div>
                    <h4 className="font-medium text-gray-900 capitalize">
                      {entry.loop_type.replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Completed at {new Date(entry.completed_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-600">
                    Mood: {entry.mood_rating}/10
                  </span>
                  <span className="text-gray-600">
                    Energy: {entry.energy_level}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Insights */}
      {weeklySummary?.insights && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Weekly Insights</h2>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-purple-800 mb-2">
              <strong>Consistency Level:</strong> {weeklySummary.insights.consistency_level}
            </p>
            <p className="text-purple-700 mb-2">
              <strong>Recommended Focus:</strong> {weeklySummary.insights.recommended_focus}
            </p>
            <p className="text-purple-600">
              <strong>Celebration:</strong> {weeklySummary.insights.celebration}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyLoopDashboard;