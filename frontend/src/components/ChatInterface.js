import React, { useState, useEffect, useRef } from 'react';
import DynamicQuickReplies from './DynamicQuickReplies';

const ChatInterface = ({ selectedPersona, user }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Send message to persona
  const sendMessage = async (messageText, actionType = 'message', actionData = null) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      content: messageText,
      sender: 'user',
      timestamp: new Date().toISOString(),
      actionType,
      actionData
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Prepare conversation history
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await fetch(`/api/chat/${selectedPersona.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: messageText,
          conversation_history: conversationHistory,
          session_id: user?.sessionId || 'anonymous',
          user_id: user?.id || 'anonymous'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Create AI response message
      const aiMessage = {
        id: Date.now() + 1,
        content: data.content,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        persona: selectedPersona.id,
        emotion: data.emotion,
        confidence: data.confidence,
        features: data.features_activated || []
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update quick replies with new context-aware suggestions
      setQuickReplies(data.quick_replies || []);

      // Handle special action types
      if (actionType === 'breathing' && actionData) {
        handleBreathingAction(actionData);
      } else if (actionType === 'journal' && actionData) {
        handleJournalAction(actionData);
      } else if (actionType === 'goal' && actionData) {
        handleGoalAction(actionData);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 2,
        content: "I'm experiencing some difficulty right now. Please try again in a moment.",
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        persona: selectedPersona.id,
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Keep previous quick replies on error
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  // Handle special actions triggered by quick replies
  const handleBreathingAction = (actionData) => {
    // TODO: Integrate with BreathingExercise component
    console.log('Triggering breathing exercise:', actionData);
  };

  const handleJournalAction = (actionData) => {
    // TODO: Open journal modal with prompt
    console.log('Opening journal with prompt:', actionData);
  };

  const handleGoalAction = (actionData) => {
    // TODO: Open goal setting interface
    console.log('Opening goal interface:', actionData);
  };

  // Handle quick reply selection
  const handleQuickReplySelect = (replyText, actionType, actionData) => {
    sendMessage(replyText, actionType, actionData);
  };

  // Handle regular form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  // Get persona-specific styling
  const getPersonaColors = (persona) => {
    const colors = {
      maya: 'from-purple-500 to-pink-500',
      sarah: 'from-blue-500 to-indigo-500',
      alex: 'from-green-500 to-teal-500',
      marcus: 'from-orange-500 to-red-500'
    };
    return colors[persona] || colors.maya;
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getPersonaColors(selectedPersona.id)} text-white p-4 shadow-lg`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{selectedPersona.emoji}</span>
          <div>
            <h2 className="text-xl font-semibold">{selectedPersona.name}</h2>
            <p className="text-sm opacity-90">{selectedPersona.role}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <span className="text-4xl block mb-4">{selectedPersona.emoji}</span>
            <p className="text-lg font-medium">Hello! I'm {selectedPersona.name}</p>
            <p className="text-sm">{selectedPersona.role}</p>
            <p className="text-xs mt-2 text-gray-400">Share what's on your mind...</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-[75%] p-3 rounded-2xl shadow-sm
                ${message.sender === 'user'
                  ? 'bg-gray-200 text-gray-800 rounded-br-sm'
                  : `bg-gradient-to-r ${getPersonaColors(selectedPersona.id)} text-white rounded-bl-sm`
                }
                ${message.isError ? 'bg-red-100 text-red-800' : ''}
              `}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              
              {message.emotion && (
                <div className="text-xs opacity-75 mt-1">
                  Emotion: {message.emotion} • Confidence: {Math.round(message.confidence * 100)}%
                </div>
              )}
              
              <div className="text-xs opacity-60 mt-1">
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className={`bg-gradient-to-r ${getPersonaColors(selectedPersona.id)} text-white p-3 rounded-2xl rounded-bl-sm`}>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-2 border-t bg-white">
        <DynamicQuickReplies
          quickReplies={quickReplies}
          onReplySelect={handleQuickReplySelect}
          persona={selectedPersona.id}
          disabled={isLoading}
        />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Share what's on your mind..."
            disabled={isLoading}
            className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className={`
              px-6 py-3 rounded-full text-white font-medium
              bg-gradient-to-r ${getPersonaColors(selectedPersona.id)}
              hover:shadow-lg transition-all duration-200 transform hover:scale-105
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
            `}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Send'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;