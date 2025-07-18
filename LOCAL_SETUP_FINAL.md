# SoulSense AI - Final Local Setup Guide

## 🎯 Complete Local Development Environment

This guide ensures SoulSense AI runs locally without errors, with perfect sync between the Python FastAPI backend and React frontend.

## ✅ Prerequisites Verification

Before starting, ensure you have:

- **Python 3.9+** (`python3 --version`)
- **Node.js 18+** (`node --version`)  
- **npm** (`npm --version`)
- **pip3** (`pip3 --version`)
- **SQLite3** (included with Python)

## 🚀 One-Command Setup

```bash
# Complete automated setup
./complete_local_setup.sh
```

This script handles everything: virtual environment, dependencies, database, and configuration.

## 🐍 Backend Setup (Python FastAPI)

### Manual Backend Setup:
```bash
# 1. Navigate to backend
cd backend/

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create environment file
cp .env.example .env
# Edit .env and add your OpenRouter API key

# 5. Initialize database
python scripts/init_db.py

# 6. Start FastAPI server
uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```

### Backend Features:
- **CORS enabled** for frontend access (`localhost:3000`, `localhost:5000`)
- **Auto-reload** during development
- **SQLite database** with automatic table creation
- **API documentation** at `http://localhost:5000/docs`

## ⚛️ Frontend Setup (React)

### Current Architecture:
The project uses a **unified server approach** where the TypeScript backend serves both API and frontend. For separate React development:

```bash
# If using separate frontend (in frontend/ directory)
cd frontend/
npm install
npm start  # Runs on port 3000 with proxy to backend
```

### Frontend Configuration:
- **Proxy configured** in `frontend/package.json` to point to `localhost:5000`
- **CORS handling** managed by backend
- **API calls** automatically routed to backend

## 💾 Database & Storage

### SQLite Setup (Default):
```bash
# Database auto-created at: backend/soulsense.db
# Tables: users, personas, conversations, messages, goals, journal_entries, etc.

# Manual database reset:
cd backend
rm soulsense.db
python scripts/init_db.py
```

### Validation:
```bash
# Check database exists
ls -la backend/soulsense.db

# View tables
sqlite3 backend/soulsense.db ".tables"

# Check personas
sqlite3 backend/soulsense.db "SELECT * FROM personas;"
```

## 🔧 Environment Configuration

### Required Environment Variables:

**Main .env file:**
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
DATABASE_URL=sqlite:///soulsense.db
NODE_ENV=development
SESSION_SECRET=soulsense_local_development_secret
```

**Backend .env file:**
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
DATABASE_URL=sqlite:///soulsense.db
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
NODE_ENV=development
DEBUG=true
```

## 🚀 Startup Options

### Option 1: Unified Server (Recommended)
```bash
npm run dev
# Visit: http://localhost:5000
# Serves both API and frontend
```

### Option 2: Separate Backend + Frontend
```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 5000 --reload

# Terminal 2: Frontend (if separate)
cd frontend
npm start
# Visit: http://localhost:3000
```

### Option 3: Development Script
```bash
./start_local_development.sh --separate
# Starts both backend and frontend automatically
```

## 🧪 Testing & Verification

### Automated Testing:
```bash
# Comprehensive test suite
python3 test_local_setup.py

# Quick verification
./verify_local_setup.sh

# Manual API test
curl http://localhost:5000/api/personas
```

### Visual Verification:
1. **Homepage loads**: `http://localhost:5000`
2. **Four personas visible**: Sarah, Alex, Marcus, Maya
3. **Chat functionality**: Click persona → send message → receive AI response
4. **No console errors**: Press F12, check Console tab
5. **Database persistence**: Create goal/journal entry, restart app, data persists

## 🐛 Debugging Tips

### Frontend Connection Issues:
```bash
# Check CORS configuration
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:5000/api/personas

# Verify proxy configuration
grep -n "proxy" frontend/package.json
```

### Backend API Issues:
```bash
# Test with verbose logging
cd backend
uvicorn main:app --host 0.0.0.0 --port 5000 --reload --log-level debug

# Check specific endpoints
curl http://localhost:5000/health
curl http://localhost:5000/api/personas
curl http://localhost:5000/docs
```

### Database Problems:
```bash
# Recreate database
cd backend
rm soulsense.db
python scripts/init_db.py

# Check database integrity
sqlite3 soulsense.db "PRAGMA integrity_check;"
```

## 🎯 Final Validation

### Complete System Check:
1. ✅ **Backend responds**: `curl http://localhost:5000/health`
2. ✅ **Personas API**: `curl http://localhost:5000/api/personas`
3. ✅ **Frontend loads**: Visit `http://localhost:5000`
4. ✅ **Chat works**: Send message to any persona
5. ✅ **Database updates**: Check `backend/soulsense.db` size increases
6. ✅ **No errors**: Browser console clean

### Success Indicators:
- Homepage displays therapeutic interface
- All four persona cards visible and clickable  
- Chat interface opens and AI responds to messages
- Journal, goals, and breathing exercises functional
- Data persists between sessions
- No red errors in browser console

## 📚 Documentation Reference

- **QUICK_START_LOCAL.md** - 2-minute setup
- **TROUBLESHOOTING_LOCAL.md** - Common issues and fixes  
- **LOCAL_DEPLOYMENT_COMPLETE.md** - Comprehensive guide
- **Backend API docs** - `http://localhost:5000/docs`

## 🎉 End Result

A fully functional local SoulSense AI system featuring:

- ✅ **React frontend** with therapeutic UI
- ✅ **Python FastAPI backend** with AI integration
- ✅ **SQLite database** with complete tracking
- ✅ **OpenRouter integration** for Claude AI responses
- ✅ **Four enhanced personas** with emotional intelligence
- ✅ **Real-time data persistence** and analytics
- ✅ **Hot reload development** environment
- ✅ **Perfect UI/UX preservation** from Replit

The local setup maintains 100% feature parity with the Replit version while providing full development control.