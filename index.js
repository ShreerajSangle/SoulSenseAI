// SoulSense AI - Entry Point
// Redirects to client directory for React app

const { execSync } = require('child_process');
const path = require('path');

console.log('🧠 SoulSense AI - React + Python FastAPI Architecture');
console.log('🔄 Redirecting to React frontend...\n');

try {
    // Change to client directory and run dev
    process.chdir(path.join(__dirname, 'client'));
    execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
    console.error('❌ Error starting React frontend:', error.message);
    console.log('\n💡 Try running: cd client && npm run dev');
    process.exit(1);
}