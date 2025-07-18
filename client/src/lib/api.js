/**
 * API client for SoulSense AI
 * Handles communication with Python FastAPI backend
 */

import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens or headers here
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error(`Not found: ${error.config.url}`)
    }
    
    if (error.response?.status === 500) {
      throw new Error('Server error occurred. Please try again.')
    }
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to server. Please check if the backend is running.')
    }
    
    throw new Error(error.response?.data?.detail || error.message || 'An unexpected error occurred')
  }
)

// Generic API request function
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await api({
      url,
      method: options.method || 'GET',
      data: options.data,
      params: options.params,
      ...options
    })
    return response.data
  } catch (error) {
    throw error
  }
}

// Specific API methods
export const personasAPI = {
  getAll: () => apiRequest('/api/personas'),
  getById: (id) => apiRequest(`/api/personas/${id}`)
}

export const chatAPI = {
  sendMessage: (personaId, message, userId = 'anonymous') => 
    apiRequest(`/api/chat/${personaId}?user_id=${userId}`, {
      method: 'POST',
      data: { content: message, persona_id: personaId }
    }),
  
  getHistory: (personaId, userId = 'anonymous', limit = 50) =>
    apiRequest(`/api/chat/history/${personaId}?user_id=${userId}&limit=${limit}`)
}

export const userAPI = {
  getProfile: (userId) => apiRequest(`/api/profile/${userId}`),
  updateProfile: (userId, data) => 
    apiRequest(`/api/profile/${userId}`, {
      method: 'PUT',
      data
    }),
  createUser: (userData) =>
    apiRequest('/api/users', {
      method: 'POST',
      data: userData
    })
}

export const goalsAPI = {
  getUserGoals: (userId) => apiRequest(`/api/goals/${userId}`),
  createGoal: (goalData) =>
    apiRequest('/api/goals', {
      method: 'POST',
      data: goalData
    }),
  updateGoal: (goalId, data) =>
    apiRequest(`/api/goals/${goalId}`, {
      method: 'PUT',
      data
    }),
  deleteGoal: (goalId) =>
    apiRequest(`/api/goals/${goalId}`, {
      method: 'DELETE'
    })
}

export const diaryAPI = {
  getEntries: (userId, limit = 50, offset = 0) =>
    apiRequest(`/api/diary/${userId}?limit=${limit}&offset=${offset}`),
  createEntry: (entryData) =>
    apiRequest('/api/diary', {
      method: 'POST',
      data: entryData
    }),
  updateEntry: (entryId, data) =>
    apiRequest(`/api/diary/${entryId}`, {
      method: 'PUT',
      data
    }),
  deleteEntry: (entryId) =>
    apiRequest(`/api/diary/${entryId}`, {
      method: 'DELETE'
    }),
  searchEntries: (userId, query) =>
    apiRequest(`/api/diary/${userId}/search?query=${encodeURIComponent(query)}`)
}

export const sessionsAPI = {
  getUserSessions: (userId, limit = 20, offset = 0) =>
    apiRequest(`/api/sessions/${userId}?limit=${limit}&offset=${offset}`),
  createSummary: (summaryData) =>
    apiRequest('/api/sessions/summary', {
      method: 'POST',
      data: summaryData
    }),
  getAnalytics: (userId, days = 30) =>
    apiRequest(`/api/sessions/${userId}/analytics?days=${days}`),
  trackAnalytics: (analyticsData) =>
    apiRequest('/api/sessions/analytics', {
      method: 'POST',
      data: analyticsData
    })
}

export default api