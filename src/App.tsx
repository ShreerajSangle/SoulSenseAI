import React, { useState, useEffect } from 'react'
import { Badge } from './components/ui/badge'

// Simple HomePage component for testing
const HomePage = () => {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'connected' | 'failed'>('loading')

  useEffect(() => {
    // Test backend connection
    const testBackend = async () => {
      try {
        const response = await fetch('/health')
        if (response.ok) {
          console.log('Backend connection successful')
          setBackendStatus('connected')
        } else {
          setBackendStatus('failed')
        }
      } catch (error) {
        console.error('Backend connection failed:', error)
        setBackendStatus('failed')
      }
    }

    testBackend()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-rose-50 to-blue-50 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-lavender-500 to-rose-500 rounded-full mb-6 animate-pulse-gentle">
          <span className="text-2xl">🪷</span>
        </div>
        
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight font-rosarivo">
          Soul Sense
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed font-nunito">
          Your digital emotional companion - Four specialized AI personas designed to support your mental wellness journey.
        </p>
        
        <div className="flex flex-col items-center space-y-4">
          <button className="bg-gradient-to-r from-lavender-500 to-rose-500 hover:from-lavender-600 hover:to-rose-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-gentle hover:shadow-therapeutic">
            Start Your Journey
          </button>
          
          <div className="flex items-center space-x-2">
            <Badge variant={backendStatus === 'connected' ? 'success' : backendStatus === 'failed' ? 'destructive' : 'secondary'}>
              {backendStatus === 'connected' ? '✅ Backend Connected' : 
               backendStatus === 'failed' ? '❌ Backend Disconnected' : 
               '🔄 Connecting...'}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-500 font-quicksand">
            React + Python FastAPI Architecture Successfully Deployed
          </p>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <div className="App">
      <HomePage />
    </div>
  )
}

export default App