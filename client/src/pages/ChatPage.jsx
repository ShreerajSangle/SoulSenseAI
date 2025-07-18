import React, { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, ArrowLeft, Heart, Sparkles } from 'lucide-react'
import { chatAPI, personasAPI } from '../lib/api'

function ChatPage({ user }) {
  const { personaId } = useParams()
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const queryClient = useQueryClient()

  // Get persona info
  const { data: persona } = useQuery({
    queryKey: ['persona', personaId],
    queryFn: () => personasAPI.getById(personaId)
  })

  // Get chat history
  const { data: chatHistory = { messages: [], conversation_id: null } } = useQuery({
    queryKey: ['chat-history', personaId],
    queryFn: () => chatAPI.getHistory(personaId, user?.id || 'anonymous')
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (messageText) => chatAPI.sendMessage(personaId, messageText, user?.id || 'anonymous'),
    onMutate: () => {
      setIsTyping(true)
    },
    onSuccess: (response) => {
      setIsTyping(false)
      // Invalidate and refetch chat history
      queryClient.invalidateQueries(['chat-history', personaId])
    },
    onError: (error) => {
      setIsTyping(false)
      console.error('Failed to send message:', error)
    }
  })

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || sendMessageMutation.isPending) return

    const messageText = message.trim()
    setMessage('')
    
    try {
      await sendMessageMutation.mutateAsync(messageText)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleQuickReply = (replyText) => {
    setMessage(replyText)
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory.messages, isTyping])

  if (!persona) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lavender-200 border-t-lavender-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lavender-700">Loading chat...</p>
        </div>
      </div>
    )
  }

  const getPersonaColor = (id) => {
    const colors = {
      sarah: '#8b5cf6',
      alex: '#f59e0b', 
      marcus: '#10b981',
      maya: '#06b6d4'
    }
    return colors[id] || '#8b5cf6'
  }

  const getPersonaQuickReplies = (id) => {
    const replies = {
      sarah: ["Help me reframe this", "I need emotional support", "Can we explore this deeper?", "I want to journal about this"],
      alex: ["Make me laugh 😄", "I need a pep talk", "Tell me something relatable", "Cheer me up"],
      marcus: ["Help me make a plan", "Set a goal with me", "I need motivation", "What should I do next?"],
      maya: ["Guide me in breathing", "Share a mantra", "Help me find peace", "Let's meditate together"]
    }
    return replies[id] || []
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-lavender-100 px-4 py-3 flex items-center gap-4 gentle-shadow">
        <Link to="/" className="text-lavender-600 hover:text-lavender-700 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: getPersonaColor(personaId) }}
        >
          {persona.name.charAt(0)}
        </div>
        <div>
          <h1 className="font-rosarivo text-xl text-lavender-900">{persona.name}</h1>
          <p className="font-nunito text-sm text-lavender-600">{persona.role}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-400" />
          <span className="font-nunito text-sm text-lavender-600">Online</span>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.messages.length === 0 ? (
          <div className="text-center py-12">
            <div 
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: getPersonaColor(personaId) }}
            >
              {persona.name.charAt(0)}
            </div>
            <h2 className="font-rosarivo text-2xl text-lavender-900 mb-2">
              Hello! I'm {persona.name}
            </h2>
            <p className="font-nunito text-lavender-600 max-w-md mx-auto leading-relaxed">
              {persona.description}
            </p>
            <p className="font-nunito text-sm text-lavender-500 mt-4">
              How are you feeling today? I'm here to listen and support you.
            </p>
          </div>
        ) : (
          chatHistory.messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-lavender-600 text-white'
                    : 'bg-white border border-lavender-100 text-lavender-900'
                } gentle-shadow`}
              >
                <p className="font-nunito leading-relaxed">{msg.content}</p>
                {msg.emotion_detected && (
                  <span className="text-xs opacity-75 mt-1 block">
                    {msg.emotion_detected}
                  </span>
                )}
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-lavender-100 px-4 py-3 rounded-2xl gentle-shadow">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-lavender-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-lavender-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-lavender-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-2">
        <div className="flex flex-wrap gap-2 mb-3">
          {getPersonaQuickReplies(personaId).map((reply, index) => (
            <button
              key={index}
              onClick={() => handleQuickReply(reply)}
              className="px-3 py-1 text-sm bg-lavender-100 text-lavender-700 rounded-full hover:bg-lavender-200 transition-colors font-nunito"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-lavender-100 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${persona.name}...`}
            className="flex-1 border border-lavender-200 rounded-full px-4 py-3 font-nunito focus:outline-none focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
            disabled={sendMessageMutation.isPending}
          />
          <button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-lavender-600 hover:bg-lavender-700 disabled:bg-lavender-300 text-white p-3 rounded-full transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatPage