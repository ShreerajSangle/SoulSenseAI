// SoulSense AI - Python Backend Launcher
import { spawn } from 'child_process';
import { createServer } from 'http';

console.log('🔄 Starting SoulSense AI Python Backend...');

// Start Python FastAPI backend
const pythonProcess = spawn('python3', ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '5000', '--reload'], {
  cwd: './backend',
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

pythonProcess.on('error', (error) => {
  console.error('Python backend error:', error);
});

// Keep the Node process alive
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('SoulSense AI Python Backend Active');
});

server.listen(3000, () => {
  console.log('✅ Workflow bridge active on port 3000');
  console.log('✅ Python backend starting on port 5000');
});