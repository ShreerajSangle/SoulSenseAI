import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, Heart, Zap, Target } from 'lucide-react';

const ChatPage = ({ user }) => {
  const { personaId } = useParams();
  const navigate = useNavigate();
  const [persona, setPersona] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);

  // Persona-specific configurations
  const personaStyles = {
    maya: {
      background: 'bg-gradient-to-br from-purple-100 via-pink-100 to-lavender-100',
      headerBg: 'bg-gradient-to-r from-purple-400 to-pink-400',
      bubbleColor: 'bg-purple-50 border-purple-200',
      userBubbleColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
      accentColor: 'text-purple-600',
      icon: '🪷',
      tagline: 'Spiritual Guide & Breathwork Mentor'
    },
    sarah: {
      background: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
      headerBg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      bubbleColor: 'bg-blue-50 border-blue-200',
      userBubbleColor: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      accentColor: 'text-blue-600',
      icon: '👩‍⚕️',
      tagline: 'Clinical Therapist'
    },
    alex: {
      background: 'bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50',
      headerBg: 'bg-gradient-to-r from-orange-400 to-red-400',
      bubbleColor: 'bg-orange-50 border-orange-200',
      userBubbleColor: 'bg-gradient-to-r from-orange-500 to-red-500',
      accentColor: 'text-orange-600',
      icon: '🤗',
      tagline: 'Peer Support Friend'
    },
    marcus: {
      background: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
      headerBg: 'bg-gradient-to-r from-green-500 to-emerald-500',
      bubbleColor: 'bg-green-50 border-green-200',
      userBubbleColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
      accentColor: 'text-green-600',
      icon: '💪',
      tagline: 'Life Coach & Wellness Expert'
    }
  };

  const currentStyle = personaStyles[personaId] || personaStyles.sarah;

  useEffect(() => {
    const fetchPersona = async () => {
      try {
        const response = await fetch(`/api/personas/${personaId}`);
        if (response.ok) {
          const personaData = await response.json();
          setPersona(personaData);
          
          // Set initial welcome message
          const welcomeMessage = {
            id: Date.now(),
            role: 'assistant',
            content: getWelcomeMessage(personaData),
            timestamp: new Date(),
            persona_id: personaId
          };
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Error fetching persona:', error);
      }
    };

    fetchPersona();
  }, [personaId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getWelcomeMessage = (persona) => {
    const welcomeMessages = {
      maya: "🪷 Welcome, beautiful soul. I'm Maya, your spiritual guide and breathwork mentor. Take a deep breath with me... How is your heart feeling today?",
      sarah: "Hello, I'm Dr. Sarah. I'm here to provide you with a safe, supportive space to explore your thoughts and feelings. What's on your mind today?",
      alex: "Hey there! 🤗 I'm Alex, your peer support friend. I'm here to chat, listen, and maybe share a laugh or two. What's going on with you today?",
      marcus: "💪 I'm Marcus, your life coach and wellness expert. I'm here to help you set goals, build habits, and unlock your potential. What do you want to achieve today?"
    };
    return welcomeMessages[persona.id] || "Hello! How can I support you today?";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch(`/api/chat/${personaId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: inputMessage,
          conversation_history: messages.slice(-6).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          session_id: sessionId,
          user_id: user?.user_id || 'anonymous'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.content,
          timestamp: new Date(),
          persona_id: personaId,
          emotion: data.emotion,
          features_activated: data.features_activated
        };

        setMessages(prev => [...prev, aiMessage]);
        setSuggestions(data.suggestions || []);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: getErrorMessage(personaId),
        timestamp: new Date(),
        persona_id: personaId,
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getErrorMessage = (personaId) => {
    const errorMessages = {
      maya: "I sense some turbulence in our connection, dear soul. Let's try again when the energy feels clearer. 🪷",
      sarah: "I'm experiencing a brief connection issue, but I'm here to support you. Could you try again?",
      alex: "Oops! Something weird happened on my end, but I'm still here for you! 😅 Want to try that again?",
      marcus: "Temporary setback - but that's just an opportunity to come back stronger! 💪 Let's try again."
    };
    return errorMessages[personaId] || "I'm having trouble connecting right now. Please try again.";
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!persona) {
    return (
      <div className={`min-h-screen ${currentStyle.background} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Connecting with {personaId}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentStyle.background} flex flex-col`}>
      {/* Header */}
      <header className={`${currentStyle.headerBg} text-white p-4 shadow-lg`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">{currentStyle.icon}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">{persona.name}</h1>
                <p className="text-sm opacity-90">{currentStyle.tagline}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Online</span>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? `${currentStyle.userBubbleColor} text-white`
                    : `${currentStyle.bubbleColor} border text-gray-800`
                } shadow-sm`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                  <span>{formatTime(message.timestamp)}</span>
                  {message.emotion && (
                    <span className="capitalize">{message.emotion}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className={`${currentStyle.bubbleColor} border px-4 py-3 rounded-2xl shadow-sm`}>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-gray-600">{persona.name} is typing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="p-4 bg-white/50 border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-600 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`px-3 py-1 rounded-full text-sm border hover:bg-white/80 transition-colors ${currentStyle.accentColor}`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Share your thoughts with ${persona.name}...`}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:border-purple-500 focus:outline-none resize-none"
                rows="1"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className={`${currentStyle.headerBg} text-white p-3 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;