/**
 * SoulSense AI - Full Stack Development Server
 * Runs both Python FastAPI backend and React frontend
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Starting SoulSense AI Full Stack...');

// Start Python FastAPI backend
const backendPath = path.join(__dirname, '..', 'backend');
const pythonProcess = spawn('python3', ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'], {
  cwd: backendPath,
  stdio: ['ignore', 'pipe', 'pipe']
});

// Set up Express server for frontend
const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Proxy API requests to Python backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8000/api',
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''
  }
}));

// Serve React app - create a simple HTML that includes the React components
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#673ab7" />
      <meta name="description" content="SoulSense AI - A compassionate AI-powered mental wellness platform with personalized therapeutic support through four specialized personas." />
      <title>SoulSense AI - Your Digital Emotional Companion</title>
      <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      <script src="https://unpkg.com/lucide-react@latest/dist/esm/lucide-react.js" type="module"></script>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      </style>
    </head>
    <body>
      <div id="root"></div>
      <script type="text/babel">
        const { useState, useEffect } = React;
        
        const HomePage = () => {
          const [showPersonas, setShowPersonas] = useState(false);
          const [personas, setPersonas] = useState([]);
          const [selectedPersona, setSelectedPersona] = useState(null);

          const handleStartJourney = async () => {
            try {
              console.log('Starting journey - fetching personas...');
              const response = await fetch('/api/personas');
              if (!response.ok) {
                throw new Error('Failed to fetch personas');
              }
              const data = await response.json();
              console.log('Personas fetched:', data);
              console.log('Array check:', Array.isArray(data), 'Length:', data.length);
              if (Array.isArray(data) && data.length > 0) {
                setPersonas(data);
                setShowPersonas(true);
                console.log('Personas set, showing persona page');
              } else {
                console.error('Expected array but got:', data);
                setPersonas([]);
              }
            } catch (error) {
              console.error('Error fetching personas:', error);
              setPersonas([]);
            }
          };

          const handlePersonaSelect = (persona) => {
            setSelectedPersona(persona);
            alert('You selected ' + persona.name + ' - ' + persona.role + '! Chat functionality coming soon.');
          };

          if (showPersonas) {
            return (
              <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-12">
                    <button 
                      onClick={() => setShowPersonas(false)}
                      className="mb-4 text-purple-600 hover:text-purple-800 font-semibold"
                    >
                      ← Back to Home
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Companion</h1>
                    <p className="text-lg text-gray-600">Select the persona that resonates with you most</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {personas && personas.length > 0 ? personas.map((persona) => (
                      <div 
                        key={persona.id}
                        onClick={() => handlePersonaSelect(persona)}
                        className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-purple-200"
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-4">{persona.emoji}</div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{persona.name}</h3>
                          <p className="text-sm text-gray-600 mb-4">{persona.role}</p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {persona.specializations && persona.specializations.length > 0 ? persona.specializations.slice(0, 3).map((spec, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                              >
                                {spec}
                              </span>
                            )) : null}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full text-center py-8">
                        <p className="text-gray-500">Loading personas...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

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
                  <button 
                    onClick={handleStartJourney}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                  >
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

        const App = () => {
          const [user, setUser] = useState(null);
          const [loading, setLoading] = useState(true);

          useEffect(() => {
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
                <div className="animate-pulse">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                    <span className="text-2xl">🪷</span>
                  </div>
                  <p className="text-gray-600">Loading SoulSense AI...</p>
                </div>
              </div>
            );
          }

          return <HomePage />;
        };

        ReactDOM.render(<App />, document.getElementById('root'));
      </script>
    </body>
    </html>
  `);
});

// Start Express server
app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ SoulSense AI Full Stack Server Running!');
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log('🔗 API: http://localhost:8000');
  console.log('📚 Docs: http://localhost:8000/docs');
});

// Handle Python backend output
pythonProcess.stdout?.on('data', (data) => {
  console.log('Backend:', data.toString());
});

pythonProcess.stderr?.on('data', (data) => {
  console.error('Backend Error:', data.toString());
});

pythonProcess.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
  if (code !== 0) {
    process.exit(code);
  }
});

pythonProcess.on('error', (error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down SoulSense AI...');
  pythonProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down SoulSense AI...');
  pythonProcess.kill();
  process.exit(0);
});