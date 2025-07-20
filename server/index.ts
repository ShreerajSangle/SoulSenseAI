import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn } from 'child_process';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Start Python backend
console.log('🪷 Starting SoulSense AI - React + Python FastAPI Architecture');
console.log('====================================================');

// Start the Python FastAPI backend
const pythonBackend = spawn('python3', ['main.py'], {
  cwd: path.join(process.cwd(), 'backend'),
  stdio: 'inherit'
});

pythonBackend.on('error', (error) => {
  console.error('Failed to start Python backend:', error);
  process.exit(1);
});

pythonBackend.on('close', (code) => {
  console.log(`Python backend process exited with code ${code}`);
  if (code !== 0) {
    process.exit(1);
  }
});

// Wait for backend to start
setTimeout(() => {
  console.log('🚀 Python FastAPI backend started on port 5000');
  console.log('📚 API documentation: http://localhost:5000/docs');
  console.log('🌐 Frontend proxy running on port', PORT);
  console.log('====================================================');
}, 2000);

// Proxy API requests to Python backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  logLevel: 'info'
}));

// Proxy health endpoint
app.use('/health', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true
}));

// Serve React frontend for all other routes
app.use(express.static(path.join(process.cwd(), 'client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'client/dist/index.html'));
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  pythonBackend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down servers...');
  pythonBackend.kill('SIGTERM');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`✅ SoulSense AI running on http://localhost:${PORT}`);
});