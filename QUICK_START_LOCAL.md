# SoulSense AI - Quick Start Local Setup

## 🚀 2-Minute Setup

### Prerequisites
- Python 3.9+ (`python3 --version`)
- Node.js 18+ (`node --version`)

### One-Command Setup
```bash
# Clone/download the project and run:
./complete_local_setup.sh

# Or use the Python backend specifically:
./run_python_backend.sh
```

### Manual Setup (if scripts don't work)
```bash
# 1. Fix database issues
python3 fix_database_local.py

# 2. Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Start backend
uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```

### Access Your App
- **Frontend**: http://localhost:5000
- **API Docs**: http://localhost:5000/docs
- **Health Check**: http://localhost:5000/health

### API Key Configuration
Your OpenRouter API key is already configured! If you need to change it:
```bash
# Edit backend/.env and update:
OPENROUTER_API_KEY=your_new_key_here
```

### Test Everything Works
```bash
# Quick test
curl http://localhost:5000/api/personas

# Comprehensive test
python3 test_local_setup.py
```

## ✅ Success Indicators
- Homepage loads with 4 persona cards
- Chat interface opens and responds
- No red errors in browser console
- API endpoints return JSON data

## 🔧 Common Issues
- **Port 5000 busy**: `npx kill-port 5000`
- **Python errors**: Check virtual environment is activated
- **Database errors**: Run `python3 fix_database_local.py`
- **API not working**: Verify .env file exists in backend/

## 📚 Full Documentation
- **TROUBLESHOOTING_LOCAL.md** - Detailed problem solving
- **LOCAL_SETUP_FINAL.md** - Complete setup guide