import React, { useState, useEffect } from 'react';

const DynamicQuickReplies = ({ 
  quickReplies = [], 
  onReplySelect, 
  persona, 
  isVisible = true,
  disabled = false 
}) => {
  const [selectedReply, setSelectedReply] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate in new replies when they change
  useEffect(() => {
    if (quickReplies.length > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [quickReplies]);

  // Persona-specific styling
  const getPersonaStyle = (persona) => {
    const styles = {
      maya: {
        background: 'bg-gradient-to-r from-purple-100 to-pink-100',
        text: 'text-purple-800',
        hover: 'hover:from-purple-200 hover:to-pink-200',
        border: 'border-purple-200',
        accent: '#8B5CF6'
      },
      sarah: {
        background: 'bg-gradient-to-r from-blue-100 to-indigo-100',
        text: 'text-blue-800',
        hover: 'hover:from-blue-200 hover:to-indigo-200',
        border: 'border-blue-200',
        accent: '#3B82F6'
      },
      alex: {
        background: 'bg-gradient-to-r from-green-100 to-teal-100',
        text: 'text-green-800',
        hover: 'hover:from-green-200 hover:to-teal-200',
        border: 'border-green-200',
        accent: '#10B981'
      },
      marcus: {
        background: 'bg-gradient-to-r from-orange-100 to-red-100',
        text: 'text-orange-800',
        hover: 'hover:from-orange-200 hover:to-red-200',
        border: 'border-orange-200',
        accent: '#F59E0B'
      }
    };
    return styles[persona] || styles.maya;
  };

  const handleReplyClick = async (reply) => {
    if (disabled) return;
    
    setSelectedReply(reply);
    
    // Handle different action types
    switch (reply.action_type) {
      case 'message':
        // Send as regular message
        onReplySelect(reply.text, 'message');
        break;
      
      case 'breathing':
        // Trigger breathing exercise
        onReplySelect(reply.text, 'breathing', reply.action_data);
        break;
      
      case 'journal':
        // Open journal with prompt
        onReplySelect(reply.text, 'journal', reply.action_data);
        break;
      
      case 'goal':
        // Open goal setting
        onReplySelect(reply.text, 'goal', reply.action_data);
        break;
      
      case 'mantra':
        // Show mantra or send as message
        onReplySelect(reply.text, 'mantra', reply.action_data);
        break;
      
      default:
        onReplySelect(reply.text, 'message');
    }
    
    // Brief animation feedback
    setTimeout(() => setSelectedReply(null), 800);
  };

  const personaStyle = getPersonaStyle(persona);

  if (!isVisible || quickReplies.length === 0) {
    return null;
  }

  return (
    <div className={`
      transition-all duration-300 ease-in-out 
      ${isAnimating ? 'animate-fade-in' : ''}
      ${disabled ? 'opacity-50 pointer-events-none' : ''}
    `}>
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-2 font-medium">
          Quick suggestions for you:
        </p>
        
        <div className="flex flex-wrap gap-2 max-w-full">
          {quickReplies.map((reply, index) => (
            <button
              key={`${reply.text}-${index}`}
              onClick={() => handleReplyClick(reply)}
              disabled={disabled}
              className={`
                inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
                ${personaStyle.background} ${personaStyle.text} ${personaStyle.hover}
                border ${personaStyle.border}
                transition-all duration-200 ease-in-out
                transform hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-opacity-50
                disabled:cursor-not-allowed disabled:transform-none
                ${selectedReply?.text === reply.text ? 'scale-95 opacity-75' : ''}
                shadow-sm hover:shadow-md
              `}
              style={{
                focusRingColor: personaStyle.accent + '80'
              }}
            >
              {reply.emoji && (
                <span className="text-base leading-none">
                  {reply.emoji}
                </span>
              )}
              <span className="whitespace-nowrap">
                {reply.text}
              </span>
              
              {/* Priority indicator for high-priority suggestions */}
              {reply.priority >= 4 && (
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
              )}
            </button>
          ))}
        </div>
        
        {/* Action type indicators */}
        <div className="flex gap-1 mt-1.5 opacity-60">
          {quickReplies.some(r => r.action_type === 'breathing') && (
            <span className="text-xs text-gray-500">🧘</span>
          )}
          {quickReplies.some(r => r.action_type === 'journal') && (
            <span className="text-xs text-gray-500">📝</span>
          )}
          {quickReplies.some(r => r.action_type === 'goal') && (
            <span className="text-xs text-gray-500">🎯</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Add animation styles to the CSS
const styles = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
`;

// Inject styles into document head if not already present
if (typeof document !== 'undefined' && !document.getElementById('quick-replies-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'quick-replies-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default DynamicQuickReplies;