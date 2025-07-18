# SoulSense AI - Quick Start Local Setup

## 🚀 3-Step Setup (2 minutes)

### Step 1: Download & Extract
- Download the project zip from Replit 
- Extract to your desired folder
- Open terminal/command prompt in that folder

### Step 2: Run Setup Script
```bash
# Option A: Automated script (recommended)
./run_local.sh

# Option B: Python script
python3 start_local.py

# Option C: Manual commands
npm install
npm run dev
```

### Step 3: Add API Key
1. Edit the `.env` file that gets created
2. Add your OpenRouter API key:
   ```env
   OPENROUTER_API_KEY=your_actual_key_here
   ```
3. Get free key from: https://openrouter.ai/

## ✅ Visit Your App
**http://localhost:5000**

You'll see the exact same SoulSense AI interface as in Replit!

## 🎯 What You Get

- **Identical UI/UX** - Pixel-perfect match to Replit
- **4 AI Personas** - Sarah, Alex, Marcus, Maya with full personalities
- **Complete Features** - Chat, journal, goals, breathing, analytics
- **Local Database** - SQLite (automatic setup)
- **Hot Reload** - Live updates during development

## 🛠️ Available Scripts

```bash
npm run dev          # Start full application
npm run setup        # Install all dependencies
npm run test-api     # Test API endpoints
npm run kill-port    # Fix port conflicts
./verify_local_setup.sh  # Test everything works
```

## 🔧 Troubleshooting

**Port 5000 in use?**
```bash
npm run kill-port
```

**Missing dependencies?**
```bash
npm run setup
```

**API not working?**
- Add OpenRouter API key to `.env`
- Restart: `npm run dev`

## 📁 Complete Package Includes

- ✅ All source code (React + TypeScript)
- ✅ Automated setup scripts
- ✅ Environment templates
- ✅ Documentation and guides
- ✅ Verification tools
- ✅ Troubleshooting helpers

The local version preserves 100% of Replit functionality while running on your machine!