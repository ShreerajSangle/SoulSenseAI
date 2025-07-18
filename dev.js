#!/usr/bin/env node

// SoulSense AI Development Server Launcher
// Launches both React frontend and Python backend

const { spawn } = require('child_process');
const path = require('path');

console.log('\n🧠 SoulSense AI - Starting Development Environment');
console.log('🔄 Complete React + Python FastAPI Architecture');
console.log('======================================================\n');

// Start Python backend
console.log('🐍 Starting Python FastAPI backend on port 5000...');
const backend = spawn('python', ['simple_main.py'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit'
});

// Wait a moment for backend to start
setTimeout(() => {
    console.log('⚛️  Starting React frontend on port 3000...');
    
    // Start React frontend
    const frontend = spawn('npm', ['run', 'dev'], {
        cwd: path.join(__dirname, 'client'),
        stdio: 'inherit'
    });

    frontend.on('error', (err) => {
        console.error('Frontend error:', err);
    });

}, 2000);

backend.on('error', (err) => {
    console.error('Backend error:', err);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down SoulSense AI development servers...');
    backend.kill();
    process.exit(0);
});

console.log('\n✅ SoulSense AI development environment starting...');
console.log('🌐 Frontend: http://localhost:3000');
console.log('🔗 Backend API: http://localhost:5000');
console.log('📚 API Docs: http://localhost:5000/docs\n');