import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'
import DiaryPage from './pages/DiaryPage'
import GoalsPage from './pages/GoalsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import NotFoundPage from './pages/NotFoundPage'
import { apiRequest } from './lib/api'

function App() {
  // Initialize user session
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', 'anonymous'],
    queryFn: () => apiRequest('/api/profile/anonymous'),
    retry: false,
    staleTime: 10 * 60 * 1000 // 10 minutes
  })

  if (isLoading) {
    return (
      <div className="min-h-screen therapeutic-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-lavender-200 border-t-lavender-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lavender-700 font-nunito">Loading SoulSense AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen therapeutic-gradient font-nunito">
      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/chat/:personaId" element={<ChatPage user={user} />} />
        <Route path="/profile" element={<ProfilePage user={user} />} />
        <Route path="/diary" element={<DiaryPage user={user} />} />
        <Route path="/goals" element={<GoalsPage user={user} />} />
        <Route path="/analytics" element={<AnalyticsPage user={user} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default App