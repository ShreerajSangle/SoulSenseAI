// SoulSense AI - Complete Application Server
import { spawn } from 'child_process';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

console.log('🚀 Starting SoulSense AI Application...');

// Start Python FastAPI backend on port 8000
const pythonProcess = spawn('python3', ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000'], {
  cwd: path.join(__dirname, '../backend'),
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

pythonProcess.on('error', (error) => {
  console.error('Python backend error:', error);
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// Proxy API requests to Python backend
app.use('/api/*', async (req, res) => {
  try {
    const response = await fetch(`http://localhost:8000${req.path}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Backend connection failed' });
  }
});

// Health and docs endpoints
app.get('/health', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8000/health');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ status: 'Backend unavailable' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SoulSense AI running on http://localhost:${PORT}`);
  console.log('🔗 API endpoints proxied to Python backend');
  console.log('📱 React frontend served from /client/dist');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  pythonProcess.kill();
  process.exit(0);
});