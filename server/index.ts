/**
 * SoulSense AI - Compatibility Bridge
 * Redirects to Python FastAPI backend
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 Starting SoulSense AI Python Backend...');

const backendPath = path.join(__dirname, '..', 'backend');
const pythonProcess = spawn('python3', ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000', '--reload'], {
  cwd: backendPath,
  stdio: 'inherit'
});

pythonProcess.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
  process.exit(code);
});

pythonProcess.on('error', (error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down SoulSense AI...');
  pythonProcess.kill();
  process.exit(0);
});

console.log('✅ SoulSense AI Backend Starting...');
console.log('🌐 API: http://localhost:8000');
console.log('📚 Docs: http://localhost:8000/docs');