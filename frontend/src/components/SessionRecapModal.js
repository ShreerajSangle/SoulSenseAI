import React, { useState } from 'react';

const SessionRecapModal = ({ isOpen, onClose, sessionRecap, personaName }) => {
  const [activeTab, setActiveTab] = useState('summary');

  if (!isOpen || !sessionRecap) return null;

  const tabs = [
    { id: 'summary', label: 'Summary', icon: '📝' },
    { id: 'insights', label: 'Insights', icon: '💡' },
    { id: 'progress', label: 'Progress', icon: '📊' },
    { id: 'next', label: 'Next Steps', icon: '➡️' }
  ];

  const formatRating = (rating) => {
    const stars = Math.round(rating / 2);
    return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Session Recap</h2>
              <p className="text-purple-100">
                Session with {personaName} • {sessionRecap.duration_minutes} minutes
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-purple-200">Session Rating:</span>
                <span className="text-lg">{formatRating(sessionRecap.session_rating)}</span>
                <span className="text-sm text-purple-200">({sessionRecap.session_rating.toFixed(1)}/10)</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Conversation Summary</h3>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{sessionRecap.conversation_summary}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {sessionRecap.key_topics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Emotional Journey</h3>
                <div className="bg-pink-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{sessionRecap.emotional_journey}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Insights Gained</h3>
                <div className="space-y-3">
                  {sessionRecap.insights_gained.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-600 mt-1">💡</span>
                      <p className="text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Therapeutic Techniques Used</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sessionRecap.therapeutic_techniques_used.map((technique, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <span className="text-green-600">🛠️</span>
                      <span className="text-gray-700 font-medium">{technique}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Progress Notes</h3>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{sessionRecap.progress_notes}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Mood Change</h3>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{sessionRecap.mood_change}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{sessionRecap.message_count}</div>
                  <div className="text-sm text-gray-600">Messages Exchanged</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{sessionRecap.duration_minutes}</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'next' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Next Session Suggestions</h3>
                <div className="space-y-3">
                  {sessionRecap.next_session_suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <span className="text-green-600 mt-1">➡️</span>
                      <p className="text-gray-700">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-gray-800 mb-2">Continue Your Journey</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Your session with {personaName} was meaningful and productive. Consider continuing
                  this work in your next conversation.
                </p>
                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium"
                >
                  Continue Chatting with {personaName}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Generated: {new Date(sessionRecap.generated_at).toLocaleString()}</span>
            <span>Session ID: {sessionRecap.session_id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionRecapModal;