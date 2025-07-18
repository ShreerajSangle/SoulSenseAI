import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, BarChart3, TrendingUp, Heart, Target } from 'lucide-react'
import { sessionsAPI } from '../lib/api'

function AnalyticsPage({ user }) {
  const { data: analytics = {} } = useQuery({
    queryKey: ['analytics', user?.id || 'anonymous'],
    queryFn: () => sessionsAPI.getAnalytics(user?.id || 'anonymous')
  })

  const {
    total_sessions = 0,
    total_duration_minutes = 0,
    average_duration_minutes = 0,
    most_used_persona = null,
    sessions_this_week = 0,
    mood_trends = []
  } = analytics

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-lavender-100 px-4 py-3 flex items-center gap-4 gentle-shadow">
        <Link to="/" className="text-lavender-600 hover:text-lavender-700 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <BarChart3 className="w-6 h-6 text-lavender-600" />
        <h1 className="font-rosarivo text-xl text-lavender-900">Wellness Analytics</h1>
      </header>

      <div className="max-w-6xl mx-auto p-4 py-8">
        {/* Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 gentle-shadow border border-lavender-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-lavender-100 w-12 h-12 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-lavender-600" />
              </div>
              <div>
                <p className="font-nunito text-sm text-lavender-600">Total Sessions</p>
                <p className="font-nunito text-2xl font-bold text-lavender-900">{total_sessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 gentle-shadow border border-lavender-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-nunito text-sm text-green-600">This Week</p>
                <p className="font-nunito text-2xl font-bold text-green-900">{sessions_this_week}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 gentle-shadow border border-lavender-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-nunito text-sm text-blue-600">Avg Duration</p>
                <p className="font-nunito text-2xl font-bold text-blue-900">{average_duration_minutes}m</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 gentle-shadow border border-lavender-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-rose-100 w-12 h-12 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="font-nunito text-sm text-rose-600">Favorite Persona</p>
                <p className="font-nunito text-lg font-bold text-rose-900 capitalize">
                  {most_used_persona || 'None yet'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mood Trends */}
        <div className="bg-white rounded-2xl p-6 gentle-shadow border border-lavender-100 mb-8">
          <h2 className="font-rosarivo text-xl text-lavender-900 mb-6">Recent Mood Trends</h2>
          {mood_trends.length > 0 ? (
            <div className="space-y-4">
              {mood_trends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="font-nunito text-lavender-700">
                    {new Date(trend.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-4">
                    {trend.mood_before && (
                      <div className="text-sm">
                        <span className="font-nunito text-lavender-600">Before: </span>
                        <span className="font-nunito font-medium text-lavender-800">{trend.mood_before}</span>
                      </div>
                    )}
                    {trend.mood_after && (
                      <div className="text-sm">
                        <span className="font-nunito text-lavender-600">After: </span>
                        <span className="font-nunito font-medium text-green-700">{trend.mood_after}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="font-nunito text-lavender-600">
                Start chatting to see your mood trends over time
              </p>
            </div>
          )}
        </div>

        {/* Weekly Summary */}
        <div className="bg-white rounded-2xl p-6 gentle-shadow border border-lavender-100">
          <h2 className="font-rosarivo text-xl text-lavender-900 mb-6">Weekly Summary</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-lavender-50 rounded-xl p-4 mb-3">
                <div className="font-nunito text-3xl font-bold text-lavender-700 mb-1">
                  {Math.round(total_duration_minutes / 60)} hrs
                </div>
                <div className="font-nunito text-sm text-lavender-600">Total Time Invested</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-green-50 rounded-xl p-4 mb-3">
                <div className="font-nunito text-3xl font-bold text-green-700 mb-1">
                  {sessions_this_week}
                </div>
                <div className="font-nunito text-sm text-green-600">Sessions This Week</div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-50 rounded-xl p-4 mb-3">
                <div className="font-nunito text-3xl font-bold text-blue-700 mb-1">
                  {total_sessions > 0 ? Math.round((sessions_this_week / 7) * 100) : 0}%
                </div>
                <div className="font-nunito text-sm text-blue-600">Consistency Score</div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-lavender-50 rounded-xl">
            <h3 className="font-nunito font-semibold text-lavender-900 mb-2">Growth Insights</h3>
            <p className="font-nunito text-lavender-700 leading-relaxed">
              {total_sessions === 0 
                ? "Start your wellness journey by chatting with one of our therapeutic personas. Regular check-ins help build emotional awareness and resilience."
                : sessions_this_week > 3
                ? "Great consistency! You're building a strong wellness routine. Keep engaging with your emotions and you'll continue to see growth."
                : "Consider increasing your session frequency for better emotional awareness. Even 5-10 minutes daily can make a significant difference."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage