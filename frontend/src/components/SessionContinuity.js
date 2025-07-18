import React, { useState, useEffect } from 'react';

const SessionContinuity = ({ userId, personaId, onContinueSession, onStartNew }) => {
  const [unfinishedSession, setUnfinishedSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkForUnfinishedSession();
  }, [userId, personaId]);

  const checkForUnfinishedSession = async () => {
    if (!userId || !personaId) return;
    
    try {
      const response = await fetch(`/api/session/last-unfinished/${userId}/${personaId}`);
      const data = await response.json();
      
      if (data.has_unfinished) {
        setUnfinishedSession(data);
      }
    } catch (error) {
      console.error('Error checking for unfinished session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (unfinishedSession) {
      onContinueSession(unfinishedSession.session_id, unfinishedSession.continuation_prompt);
      setUnfinishedSession(null);
    }
  };

  const handleStartNew = () => {
    onStartNew();
    setUnfinishedSession(null);
  };

  if (loading || !unfinishedSession) {
    return null;
  }

  const getTimeAgo = (lastActivity) => {
    const now = new Date();
    const activity = new Date(lastActivity);
    const diffMs = now - activity;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-purple-200 rounded-2xl p-6 mb-6 shadow-lg">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Welcome back! 
          </h3>
          
          <p className="text-gray-600 mb-4 leading-relaxed">
            {unfinishedSession.continuation_prompt}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <span>• {unfinishedSession.message_count} messages</span>
            <span>• {getTimeAgo(unfinishedSession.last_activity)}</span>
            {unfinishedSession.key_topics.length > 0 && (
              <span>• Topic: {unfinishedSession.key_topics[0]}</span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleContinue}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Continue where we left off
            </button>
            
            <button
              onClick={handleStartNew}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Start fresh conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionContinuity;