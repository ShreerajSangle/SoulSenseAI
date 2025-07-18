import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Heart } from 'lucide-react'

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="mb-8">
          <Heart className="w-24 h-24 text-lavender-300 mx-auto mb-6" />
          <h1 className="font-rosarivo text-6xl text-lavender-900 mb-4">404</h1>
          <h2 className="font-rosarivo text-2xl text-lavender-700 mb-4">
            This page doesn't exist
          </h2>
          <p className="font-nunito text-lavender-600 leading-relaxed mb-8">
            The page you're looking for might have been moved or doesn't exist. 
            Let's get you back to your wellness journey.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-lavender-600 hover:bg-lavender-700 text-white px-6 py-3 rounded-xl font-nunito font-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            Return Home
          </Link>
          
          <div className="text-center">
            <Link
              to="/chat/sarah"
              className="font-nunito text-lavender-600 hover:text-lavender-700 transition-colors"
            >
              Or start a conversation with Dr. Sarah
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage