import React from 'react';
import { Calendar, Clock, Target, Star, ArrowRight } from 'lucide-react';

const PathwayCard = ({ pathway, onEnroll, onContinue, userProgress = null }) => {
  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPersonaColor = (personaId) => {
    switch (personaId) {
      case 'sarah': return 'bg-blue-50 border-blue-200';
      case 'maya': return 'bg-purple-50 border-purple-200';
      case 'alex': return 'bg-green-50 border-green-200';
      case 'marcus': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getPersonaName = (personaId) => {
    switch (personaId) {
      case 'sarah': return 'Dr. Sarah';
      case 'maya': return 'Maya';
      case 'alex': return 'Alex';
      case 'marcus': return 'Marcus';
      default: return 'Unknown';
    }
  };

  const getProgressVisualization = (type) => {
    switch (type) {
      case 'path': return '🛤️';
      case 'bloom': return '🌸';
      case 'chakra': return '🔮';
      case 'tree': return '🌳';
      default: return '⭐';
    }
  };

  const isEnrolled = !!userProgress;

  return (
    <div className={`rounded-2xl border-2 ${getPersonaColor(pathway.persona_id)} p-6 hover:shadow-lg transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">
            {getProgressVisualization(pathway.progress_visualization)}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{pathway.title}</h3>
            <p className="text-sm text-gray-600">with {getPersonaName(pathway.persona_id)}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(pathway.difficulty_level)}`}>
          {pathway.difficulty_level}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-4 line-clamp-3">{pathway.description}</p>

      {/* Progress Bar (if enrolled) */}
      {isEnrolled && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">
              {userProgress.days_completed}/{userProgress.total_days} days
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${userProgress.progress_percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Pathway Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{pathway.duration_days} days</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{pathway.estimated_time_per_day}min/day</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {pathway.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-white/60 text-xs text-gray-600 rounded-full"
          >
            {tag}
          </span>
        ))}
        {pathway.tags.length > 3 && (
          <span className="px-2 py-1 bg-white/60 text-xs text-gray-500 rounded-full">
            +{pathway.tags.length - 3} more
          </span>
        )}
      </div>

      {/* Completion Reward */}
      <div className="mb-4 p-3 bg-white/80 rounded-lg">
        <div className="flex items-center space-x-2 mb-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium text-gray-700">Completion Reward</span>
        </div>
        <p className="text-sm text-gray-600">{pathway.completion_reward}</p>
      </div>

      {/* Action Button */}
      <div className="flex space-x-2">
        {isEnrolled ? (
          <button
            onClick={() => onContinue(pathway.id)}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <span>Continue Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => onEnroll(pathway.id)}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>Start Journey</span>
            <Target className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Current Day (if enrolled) */}
      {isEnrolled && (
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-600">
            Current: Day {userProgress.current_day} • {userProgress.status}
          </span>
        </div>
      )}
    </div>
  );
};

export default PathwayCard;