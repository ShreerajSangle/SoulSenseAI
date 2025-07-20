import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Clock, 
  Heart, 
  Sparkles, 
  CheckCircle,
  ArrowRight,
  Star,
  Sunrise,
  Sunset
} from 'lucide-react';

const DailyLoopActivity = ({ userId, loopType, onComplete, onCancel }) => {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({});
  const [moodRating, setMoodRating] = useState(7);
  const [energyLevel, setEnergyLevel] = useState(7);
  const [stressLevel, setStressLevel] = useState(4);
  const [gratitudeNotes, setGratitudeNotes] = useState('');
  const [challengesFaced, setChallengesFaced] = useState('');
  const [accomplishments, setAccomplishments] = useState('');
  const [goalsForDay, setGoalsForDay] = useState('');
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  const loopTypeConfig = {
    'morning_checkin': {
      title: 'Morning Check-In',
      icon: Sun,
      color: 'from-orange-400 to-yellow-400',
      bgColor: 'from-orange-50 to-yellow-50',
      textColor: 'text-orange-800',
      time: 'Start your day with intention'
    },
    'evening_reflection': {
      title: 'Evening Reflection',
      icon: Moon,
      color: 'from-purple-400 to-indigo-400',
      bgColor: 'from-purple-50 to-indigo-50',
      textColor: 'text-purple-800',
      time: 'End your day with gratitude'
    },
    'midday_pulse': {
      title: 'Midday Pulse Check',
      icon: Clock,
      color: 'from-blue-400 to-teal-400',
      bgColor: 'from-blue-50 to-teal-50',
      textColor: 'text-blue-800',
      time: 'Reconnect with yourself'
    }
  };

  const config = loopTypeConfig[loopType] || loopTypeConfig['morning_checkin'];

  useEffect(() => {
    fetchActivity();
  }, [userId, loopType]);

  const fetchActivity = async () => {
    try {
      const endpoint = loopType === 'morning_checkin' ? 'morning' : 
                     loopType === 'evening_reflection' ? 'evening' : 'midday';
      
      const response = await fetch(`/api/daily-loop/${endpoint}/${userId}`);
      const data = await response.json();
      
      if (data.already_completed) {
        setActivity({ alreadyCompleted: true, entry: data.entry });
      } else {
        setActivity(data.activity);
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionResponse = (questionIndex, response) => {
    setResponses(prev => ({
      ...prev,
      [questionIndex]: response
    }));
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    
    try {
      const response = await fetch('/api/daily-loop/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          loop_type: loopType,
          mood_rating: moodRating,
          energy_level: energyLevel,
          stress_level: stressLevel,
          gratitude_notes: gratitudeNotes,
          challenges_faced: challengesFaced,
          accomplishments: accomplishments,
          goals_for_day: goalsForDay,
          reflection_notes: reflectionNotes,
          selected_persona: selectedPersona
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

  const getMoodEmoji = (rating) => {
    if (rating >= 9) return '🌟';
    if (rating >= 7) return '😊';
    if (rating >= 5) return '😐';
    if (rating >= 3) return '😔';
    return '😞';
  };

  const getEnergyEmoji = (level) => {
    if (level >= 8) return '⚡';
    if (level >= 6) return '🔋';
    if (level >= 4) return '🪫';
    return '😴';
  };

  const getStressEmoji = (level) => {
    if (level >= 8) return '😰';
    if (level >= 6) return '😟';
    if (level >= 4) return '😐';
    return '😌';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (activity?.alreadyCompleted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">Already Completed!</h3>
          <p className="text-green-700">You've already completed your {config.title.toLowerCase()} for today.</p>
          <button
            onClick={onCancel}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Activity Not Available</h3>
          <p className="text-gray-600">This daily loop activity isn't available right now.</p>
          <button
            onClick={onCancel}
            className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const IconComponent = config.icon;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className={`bg-gradient-to-r ${config.color} rounded-2xl p-8 text-white mb-8`}>
        <div className="flex items-center space-x-4 mb-4">
          <IconComponent className="w-12 h-12" />
          <div>
            <h1 className="text-3xl font-bold">{activity.title}</h1>
            <p className="text-white/90">{config.time}</p>
          </div>
        </div>
        <p className="text-lg text-white/90">{activity.description}</p>
      </div>

      {/* Affirmation */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Today's Affirmation</h2>
        </div>
        <p className="text-lg text-gray-700 italic leading-relaxed">"{activity.affirmation}"</p>
      </div>

      {/* Reflection Questions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <Heart className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900">Reflection Questions</h2>
        </div>
        
        <div className="space-y-6">
          {activity.questions.map((question, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {index + 1}. {question}
              </label>
              <textarea
                value={responses[index] || ''}
                onChange={(e) => handleQuestionResponse(index, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                rows="3"
                placeholder="Take your time to reflect..."
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mood & Energy Assessment */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">How Are You Feeling?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mood Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mood {getMoodEmoji(moodRating)}
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Low</span>
              <input
                type="range"
                min="1"
                max="10"
                value={moodRating}
                onChange={(e) => setMoodRating(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-500">High</span>
            </div>
            <div className="text-center mt-2 text-sm font-medium text-gray-600">{moodRating}/10</div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Energy {getEnergyEmoji(energyLevel)}
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Low</span>
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-500">High</span>
            </div>
            <div className="text-center mt-2 text-sm font-medium text-gray-600">{energyLevel}/10</div>
          </div>

          {/* Stress Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Stress {getStressEmoji(stressLevel)}
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Low</span>
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-500">High</span>
            </div>
            <div className="text-center mt-2 text-sm font-medium text-gray-600">{stressLevel}/10</div>
          </div>
        </div>
      </div>

      {/* Additional Fields */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Reflection</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are you grateful for today?
            </label>
            <textarea
              value={gratitudeNotes}
              onChange={(e) => setGratitudeNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              rows="2"
              placeholder="Share your gratitude..."
            />
          </div>

          {loopType === 'evening_reflection' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What challenges did you face today?
                </label>
                <textarea
                  value={challengesFaced}
                  onChange={(e) => setChallengesFaced(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  rows="2"
                  placeholder="Reflect on challenges..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What did you accomplish today?
                </label>
                <textarea
                  value={accomplishments}
                  onChange={(e) => setAccomplishments(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  rows="2"
                  placeholder="Celebrate your accomplishments..."
                />
              </div>
            </>
          )}

          {loopType === 'morning_checkin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What goals do you have for today?
              </label>
              <textarea
                value={goalsForDay}
                onChange={(e) => setGoalsForDay(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                rows="2"
                placeholder="Set your intentions for the day..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Any additional thoughts or reflections?
            </label>
            <textarea
              value={reflectionNotes}
              onChange={(e) => setReflectionNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              rows="3"
              placeholder="Share your thoughts..."
            />
          </div>
        </div>
      </div>

      {/* Suggested Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Suggested Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activity.suggested_actions.map((action, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <span className="text-gray-700">{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Button */}
      <div className="flex space-x-4 justify-end">
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleComplete}
          disabled={isCompleting}
          className={`px-8 py-3 bg-gradient-to-r ${config.color} text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center space-x-2`}
        >
          {isCompleting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Completing...</span>
            </>
          ) : (
            <>
              <span>Complete {config.title}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DailyLoopActivity;