// SoulSense AI - Full Stack Development Server
import { spawn } from 'child_process';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';

const app = express();

console.log('🚀 Starting SoulSense AI Full Stack...');

// Start Python FastAPI backend
const pythonProcess = spawn('python3', ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000', '--reload'], {
  cwd: './backend',
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

// Start React development server
const reactProcess = spawn('npm', ['run', 'dev'], {
  cwd: './client',
  stdio: 'inherit',
  env: { ...process.env, PORT: '3000' }
});

// API proxy to Python backend
app.use('/api', createProxyMiddleware({
  target: 'http://127.0.0.1:8000',
  changeOrigin: true,
  timeout: 30000
}));

app.use('/health', createProxyMiddleware({
  target: 'http://127.0.0.1:8000',
  changeOrigin: true
}));

app.use('/docs', createProxyMiddleware({
  target: 'http://127.0.0.1:8000',
  changeOrigin: true
}));

// Frontend proxy to React dev server
app.use('/', createProxyMiddleware({
  target: 'http://127.0.0.1:3000',
  changeOrigin: true,
  ws: true // Enable websocket support for HMR
}));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ SoulSense AI proxy running on http://localhost:${PORT}`);
  console.log('🔗 API routed to Python backend (port 8000)');
  console.log('🌐 Frontend routed to React dev server (port 3000)');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  pythonProcess.kill();
  reactProcess.kill();
  process.exit(0);
});