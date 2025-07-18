# SoulSense AI - Local Setup Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. Backend Won't Start

**Error: `ModuleNotFoundError: No module named 'fastapi'`**
```bash
# Solution: Install Python dependencies
cd backend
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

**Error: `Port 5000 is already in use`**
```bash
# Solution: Kill existing process
npx kill-port 5000
# Or find and kill manually
lsof -ti:5000 | xargs kill -9
```

**Error: `Database connection failed`**
```bash
# Solution: Initialize database
cd backend
python scripts/init_db.py
```

### 2. Frontend Issues

**Error: `Cannot connect to backend`**
```bash
# Check if backend is running on port 5000
curl http://localhost:5000/health

# If not running, start backend:
cd backend && uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```

**Error: `CORS policy blocked`**
- Backend CORS is configured for `localhost:3000` and `localhost:5000`
- Make sure frontend is running on correct port
- Check browser console for specific CORS errors

**Error: `API calls returning 404`**
```bash
# Verify backend endpoints
curl http://localhost:5000/api/personas
curl http://localhost:5000/health
```

### 3. Environment Configuration

**Error: `OpenRouter API key not working`**
```bash
# Check .env file exists and has correct key
cat .env | grep OPENROUTER_API_KEY

# Verify key format (should not have quotes)
OPENROUTER_API_KEY=sk-or-v1-abc123...
```

**Error: `Environment variables not loading`**
```bash
# Make sure .env file is in correct location
ls -la .env backend/.env

# Check file format (no spaces around =)
OPENROUTER_API_KEY=your_key_here
```

### 4. Database Issues

**Error: `Table doesn't exist`**
```bash
# Reinitialize database
cd backend
rm soulsense.db  # Remove corrupted database
python scripts/init_db.py  # Recreate with proper schema
```

**Error: `Database locked`**
```bash
# Solution: Close all connections and restart
pkill -f "uvicorn\|python.*main"
rm soulsense.db.lock  # If lock file exists
```

### 5. Dependencies Problems

**Error: `npm install fails`**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Error: `Python package conflicts`**
```bash
# Create fresh virtual environment
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 6. Port Conflicts

**Multiple services on same port:**
```bash
# Check what's using your ports
lsof -i :5000
lsof -i :3000

# Kill specific processes
npx kill-port 5000 3000

# Or change ports in configuration
# Edit backend/main.py: port = 5001
# Edit frontend proxy: "proxy": "http://localhost:5001"
```

### 7. System-Specific Issues

**Windows Issues:**
```powershell
# Use Windows equivalents
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**macOS Issues:**
```bash
# If Python 3 not found
brew install python@3.11
python3.11 -m venv venv
```

**Linux Issues:**
```bash
# Install missing dependencies
sudo apt update
sudo apt install python3-venv python3-pip nodejs npm

# For Ubuntu/Debian
sudo apt install python3.11-venv
```

## 🔧 Debugging Commands

### Check System Status
```bash
# Prerequisites
python3 --version
node --version
npm --version

# Services
curl http://localhost:5000/health
curl http://localhost:5000/api/personas

# Database
ls -la backend/soulsense.db
sqlite3 backend/soulsense.db ".tables"
```

### View Logs
```bash
# Backend logs (run backend with debug)
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 5000 --reload --log-level debug

# Frontend logs (check browser console)
# Press F12 in browser and check Console tab
```

### Test Everything
```bash
# Run comprehensive test
python3 test_local_setup.py

# Quick verification
./verify_local_setup.sh
```

## 🚀 Reset Everything

If all else fails, complete reset:

```bash
# 1. Kill all processes
npx kill-port 5000 3000
pkill -f "uvicorn\|python.*main\|npm.*start"

# 2. Clean everything
rm -rf node_modules backend/venv backend/soulsense.db
rm .env backend/.env

# 3. Fresh setup
./complete_local_setup.sh

# 4. Add API key to .env
echo "OPENROUTER_API_KEY=your_key_here" >> .env

# 5. Start fresh
npm run dev
```

## 📞 Getting Help

1. **Check logs first** - Look at console output for specific errors
2. **Test components separately** - Backend vs frontend issues
3. **Verify prerequisites** - Python 3.9+, Node 18+, npm
4. **Check environment** - API keys, ports, file permissions
5. **Review documentation** - QUICK_START_LOCAL.md, LOCAL_DEPLOYMENT_COMPLETE.md

## 🎯 Success Indicators

When everything works correctly:

- ✅ `http://localhost:5000` shows SoulSense homepage
- ✅ `http://localhost:5000/api/personas` returns 4 personas JSON
- ✅ `http://localhost:5000/health` returns status "healthy"
- ✅ Chat interface loads and can send messages
- ✅ No red errors in browser console
- ✅ Backend logs show successful API calls

## 🔍 Advanced Debugging

Enable detailed logging:

```bash
# Backend debug mode
cd backend
export DEBUG=true
export LOG_LEVEL=debug
uvicorn main:app --host 0.0.0.0 --port 5000 --reload --log-level debug

# Frontend debug mode
export NODE_ENV=development
export REACT_APP_DEBUG=true
npm run dev
```

Check network requests:
- Open browser Developer Tools (F12)
- Go to Network tab
- Try using the app and watch for failed requests
- Look for 404, 500, or CORS errors