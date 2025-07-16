/**
 * SoulSense AI - Full Stack Server
 * Starts both Python FastAPI backend and Vite frontend
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Starting SoulSense AI Full Stack...');

// Create Express proxy server on port 5000
const app = express();

// Proxy API requests to Python backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
  logLevel: 'silent'
}));

// Proxy health check to Python backend
app.use('/health', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
  logLevel: 'silent'
}));

// Proxy everything else to Vite frontend
app.use('/', createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  logLevel: 'silent',
  ws: true // Enable WebSocket proxying for HMR
}));

// Start the proxy server
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SoulSense AI Full Stack Server running on port ${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`🚀 API: http://localhost:${PORT}/api`);
  console.log(`📚 Docs: http://localhost:${PORT}/api/docs`);
  
  // Start Python backend after proxy server is running
  const backendPath = path.join(__dirname, '..', 'backend');
  const pythonProcess = spawn('python3', ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'], {
    cwd: backendPath,
    stdio: 'pipe'
  });

  // Start Vite frontend after proxy server is running
  const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
    cwd: __dirname + '/..',
    stdio: 'pipe'
  });
  
  // Forward logs from child processes
  pythonProcess.stdout?.on('data', (data) => {
    console.log(`[Backend] ${data}`);
  });
  
  pythonProcess.stderr?.on('data', (data) => {
    console.error(`[Backend] ${data}`);
  });
  
  viteProcess.stdout?.on('data', (data) => {
    console.log(`[Frontend] ${data}`);
  });
  
  viteProcess.stderr?.on('data', (data) => {
    console.error(`[Frontend] ${data}`);
  });
  
  // Handle process cleanup
  const cleanup = () => {
    console.log('\n🛑 Shutting down SoulSense AI...');
    pythonProcess.kill();
    viteProcess.kill();
    process.exit(0);
  };

  pythonProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
    cleanup();
  });

  viteProcess.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`);
    cleanup();
  });

  pythonProcess.on('error', (error) => {
    console.error('Failed to start backend:', error);
    cleanup();
  });

  viteProcess.on('error', (error) => {
    console.error('Failed to start frontend:', error);
    cleanup();
  });

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
});