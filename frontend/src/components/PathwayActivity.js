import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Heart, 
  MessageCircle, 
  ArrowLeft, 
  ArrowRight,
  Star,
  Target,
  Sparkles
} from 'lucide-react';

const PathwayActivity = ({ pathwayId, userId, currentDay, onComplete, onBack }) => {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moodRating, setMoodRating] = useState(5);
  const [completionNotes, setCompletionNotes] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    fetchActivity();
    setStartTime(new Date());
  }, [pathwayId, currentDay]);

  const fetchActivity = async () => {
    try {
      const response = await fetch(`/api/pathways/${pathwayId}/activity/${currentDay}`);
      const data = await response.json();
      setActivity(data);
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    
    const endTime = new Date();
    const timeSpentMinutes = startTime ? Math.round((endTime - startTime) / (1000 * 60)) : null;
    
    try {
      const response = await fetch(`/api/pathways/${pathwayId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          day_number: currentDay,
          mood_rating: moodRating,
          completion_notes: completionNotes,
          time_spent_minutes: timeSpentMinutes
        }),
      });

      if (response.ok) {
        onComplete();
      } else {
        alert('Failed to complete activity');
      }
    } catch (error) {
      console.error('Error completing activity:', error);
      alert('Error completing activity');
    } finally {
      setIsCompleting(false);
    }
  };

  const getMeditationIcon = (type) => {
    switch (type) {
      case 'breathing': return '🫁';
      case 'body_scan': return '🧘';
      case 'loving_kindness': return '💚';
      case 'grounding': return '🌱';
      case 'gratitude': return '🙏';
      case 'visualization': return '🌈';
      case 'focus': return '🎯';
      case 'calming': return '😌';
      case 'self_appreciation': return '💝';
      default: return '🧘';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'reflection': return '💭';
      case 'journaling': return '📝';
      case 'meditation': return '🧘';
      case 'breathing': return '🫁';
      case 'planning': return '📋';
      default: return '⭐';
    }
  };

  const getMoodEmoji = (rating) => {
    if (rating >= 9) return '🌟';
    if (rating >= 7) return '😊';
    if (rating >= 5) return '😐';
    if (rating >= 3) return '😔';
    return '😞';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Activity Not Found</h2>
          <p className="text-gray-600">This day's activity isn't available yet.</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-purple-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Pathways</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">Day {currentDay}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-gray-600">{activity.estimated_duration} min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Activity Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start space-x-4">
            <div className="text-4xl">
              {getActivityIcon(activity.activity_type)}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{activity.title}</h1>
              <p className="text-gray-600 text-lg mb-4">{activity.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <span className="capitalize">{activity.activity_type}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>{getMeditationIcon(activity.meditation_type)}</span>
                  <span className="capitalize">{activity.meditation_type.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Prompt */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <MessageCircle className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Today's Guidance</h2>
          </div>
          <p className="text-lg leading-relaxed">{activity.prompt}</p>
        </div>

        {/* Reflection Questions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Reflection Questions</h2>
          </div>
          
          <div className="space-y-4">
            {activity.reflection_questions.map((question, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-medium">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700">{question}</p>
                  <textarea
                    className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                    rows="3"
                    placeholder="Take your time to reflect..."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center space-x-3 mb-6">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Complete Today's Activity</h2>
          </div>

          <div className="space-y-6">
            {/* Mood Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How are you feeling after this activity?
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{getMoodEmoji(moodRating)}</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodRating}
                  onChange={(e) => setMoodRating(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-600 w-8">{moodRating}/10</span>
              </div>
            </div>

            {/* Completion Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Any insights or thoughts to remember?
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                rows="4"
                placeholder="Share any insights, breakthroughs, or thoughts from today's activity..."
              />
            </div>

            {/* Completion Criteria */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-medium text-purple-900 mb-2">To complete this activity:</h3>
              <p className="text-purple-700 text-sm">{activity.completion_criteria}</p>
            </div>

            {/* Complete Button */}
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isCompleting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Completing...</span>
                </>
              ) : (
                <>
                  <Star className="w-5 h-5" />
                  <span>Complete Day {currentDay}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathwayActivity;