# SoulSense AI - Local Setup Guide

## Prerequisites
- Node.js v18+ 
- Python 3.8+
- Git

## Quick Start

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <your-repo-url>
cd soulsense-ai

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
# or if using uv:
uv sync
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
# Required for AI responses
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Database (choose one)
DATABASE_URL=your_postgresql_url  # For PostgreSQL
# OR leave empty to use SQLite (default)

# Optional: Session management
SESSION_SECRET=your_random_session_secret
```

### 3. Database Setup
The app works with both SQLite (default) and PostgreSQL:

**For SQLite (easiest):**
- No setup needed - database will be created automatically

**For PostgreSQL:**
- Set your `DATABASE_URL` in `.env`
- Database tables will be created automatically on first run

### 4. Start the Application

**Option A: Full Stack (Recommended)**
```bash
npm run dev
```
This starts both frontend (React) and backend (Express/TypeScript) on port 5000.

**Option B: Separate Servers**
```bash
# Terminal 1: Start Python FastAPI backend
python start_python_backend.py
# Runs on port 8000

# Terminal 2: Start React frontend  
npm run client:dev
# Runs on port 3000
```

### 5. Access the Application
- **Full Stack**: http://localhost:5000
- **Separate**: http://localhost:3000 (frontend) + http://localhost:8000 (backend)

## API Configuration

### Getting OpenRouter API Key
1. Visit https://openrouter.ai/
2. Sign up and create an API key
3. Add it to your `.env` file as `OPENROUTER_API_KEY`

### Testing the Setup
```bash
# Test if backend is running
curl http://localhost:5000/api/personas

# Should return the four personas: Sarah, Alex, Marcus, Maya
```

## Features Available Locally
- ✅ Four therapeutic personas with enhanced frameworks
- ✅ Real-time chat with emotional intelligence
- ✅ Journal entries and goal tracking
- ✅ Breathing exercises and wellness tools
- ✅ User analytics and session tracking
- ✅ PostgreSQL or SQLite database support

## Troubleshooting

**Port conflicts:**
- Change ports in `package.json` scripts if needed
- Default: Frontend+Backend on 5000, or separate on 3000+8000

**Database issues:**
- For SQLite: Delete `soulsense.db` file and restart
- For PostgreSQL: Check your `DATABASE_URL` format

**Missing API responses:**
- Verify `OPENROUTER_API_KEY` is set correctly
- Check console logs for API errors

**Dependencies:**
```bash
# Reinstall if needed
rm -rf node_modules package-lock.json
npm install

# Python dependencies
pip install --upgrade -r requirements.txt
```

## Development Mode
- Hot reload enabled for both frontend and backend
- Database changes auto-sync in development
- Console logs show detailed API interactions
- Interactive API docs at http://localhost:8000/docs (if using Python backend)

The application includes comprehensive therapeutic features with four distinct AI personas, each specialized for different types of emotional support and guidance.