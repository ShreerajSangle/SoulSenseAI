import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, User, Settings, BarChart3, Heart } from 'lucide-react'

function ProfilePage({ user }) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-lavender-100 px-4 py-3 flex items-center gap-4 gentle-shadow">
        <Link to="/" className="text-lavender-600 hover:text-lavender-700 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-rosarivo text-xl text-lavender-900">Profile</h1>
      </header>

      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 gentle-shadow border border-lavender-100 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-lavender-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <h2 className="font-rosarivo text-2xl text-lavender-900 mb-1">
                {user?.name || 'Anonymous User'}
              </h2>
              <p className="font-nunito text-lavender-600">
                Welcome back to your wellness journey
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-lavender-50 rounded-xl p-4 text-center">
              <div className="font-nunito text-2xl font-bold text-lavender-700 mb-1">12</div>
              <div className="font-nunito text-sm text-lavender-600">Total Sessions</div>
            </div>
            <div className="bg-rose-50 rounded-xl p-4 text-center">
              <div className="font-nunito text-2xl font-bold text-rose-700 mb-1">5</div>
              <div className="font-nunito text-sm text-rose-600">Day Streak</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="font-nunito text-2xl font-bold text-green-700 mb-1">3</div>
              <div className="font-nunito text-sm text-green-600">Goals Active</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/chat/sarah"
            className="bg-white rounded-xl p-6 gentle-shadow border border-lavender-100 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-nunito font-semibold text-lavender-900 mb-2">Start Chat</h3>
            <p className="font-nunito text-sm text-lavender-600">Connect with a therapeutic companion</p>
          </Link>

          <Link
            to="/diary"
            className="bg-white rounded-xl p-6 gentle-shadow border border-lavender-100 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="bg-rose-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <User className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="font-nunito font-semibold text-lavender-900 mb-2">Journal</h3>
            <p className="font-nunito text-sm text-lavender-600">Write about your thoughts and feelings</p>
          </Link>

          <Link
            to="/goals"
            className="bg-white rounded-xl p-6 gentle-shadow border border-lavender-100 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-nunito font-semibold text-lavender-900 mb-2">Goals</h3>
            <p className="font-nunito text-sm text-lavender-600">Track your personal growth</p>
          </Link>

          <Link
            to="/analytics"
            className="bg-white rounded-xl p-6 gentle-shadow border border-lavender-100 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-nunito font-semibold text-lavender-900 mb-2">Analytics</h3>
            <p className="font-nunito text-sm text-lavender-600">View your wellness insights</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage