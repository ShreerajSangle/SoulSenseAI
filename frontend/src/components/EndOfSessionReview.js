import React, { useState } from 'react';
import { Download, Mail, RotateCcw, BookOpen, Target, Heart } from 'lucide-react';

const EndOfSessionReview = ({ sessionId, sessionData, onClose, onContinue, onSaveSummary, onEmailSummary }) => {
  const [showFullSummary, setShowFullSummary] = useState(false);

  const achievements = sessionData?.achievements || [];
  const moodChange = sessionData?.mood_change || '';
  const nextSteps = sessionData?.next_steps || [];
  const duration = sessionData?.duration_minutes || 0;

  const handleSaveSummary = async () => {
    try {
      await onSaveSummary(sessionData);
      // Show success message
    } catch (error) {
      console.error('Error saving summary:', error);
    }
  };

  const handleEmailSummary = async () => {
    try {
      await onEmailSummary(sessionData);
      // Show success message
    } catch (error) {
      console.error('Error emailing summary:', error);
    }
  };

  const getAchievementIcon = (achievement) => {
    if (achievement.includes('goal')) return <Target className="w-4 h-4" />;
    if (achievement.includes('breathing')) return <Heart className="w-4 h-4" />;
    if (achievement.includes('journal')) return <BookOpen className="w-4 h-4" />;
    return <Heart className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
          <h2 className="text-xl font-medium mb-2">Session Complete</h2>
          <p className="opacity-90">You spent {duration} minutes in meaningful conversation</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Achievements */}
          {achievements.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Today you...</h3>
              <div className="space-y-2">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 text-sm">
                    <div className="flex-shrink-0 text-purple-500">
                      {getAchievementIcon(achievement)}
                    </div>
                    <span className="text-gray-700">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mood Change */}
          {moodChange && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">How you're feeling</h3>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                {moodChange}
              </p>
            </div>
          )}

          {/* Next Steps */}
          {nextSteps.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">For next time</h3>
              <div className="space-y-1">
                {nextSteps.map((step, index) => (
                  <div key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleSaveSummary}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Save Summary</span>
              </button>
              
              <button
                onClick={handleEmailSummary}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">Email to Self</span>
              </button>
            </div>

            <button
              onClick={onContinue}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="font-medium">Continue Conversation</span>
            </button>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Close for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EndOfSessionReview;