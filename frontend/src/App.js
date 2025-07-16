import React, { useState, useEffect } from 'react';
import './App.css';

// Simple HomePage component for testing
const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6 animate-pulse">
          <span className="text-2xl">🪷</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Soul Sense
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Your digital emotional companion - Four specialized AI personas designed to support your mental wellness journey.
        </p>
        <div className="space-y-4">
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Start Your Journey
          </button>
          <p className="text-sm text-gray-500">
            React + Python FastAPI Architecture Successfully Deployed
          </p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test backend connection
    const testBackend = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          console.log('Backend connection successful');
        }
      } catch (error) {
        console.error('Backend connection failed:', error);
      } finally {
        setLoading(false);
      }
    };

    testBackend();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading SoulSense...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <HomePage />
    </div>
  );
}

export default App;