# SoulSense AI - Local Development

## Quick Start

### 1. Download Project
- Download zip from Replit or clone repository
- Extract to your desired folder

### 2. One-Command Setup
```bash
./local-start.sh
```

### 3. Add API Key
Edit `.env` file and add your OpenRouter API key:
```env
OPENROUTER_API_KEY=your_actual_api_key_here
```

### 4. Start Application
```bash
npm run dev
```

Visit: **http://localhost:5000**

## Manual Setup (Alternative)

```bash
# 1. Install Node dependencies
npm install

# 2. Install Python dependencies  
npm run install-python

# 3. Create environment file
cp .env.example .env
# Edit .env with your OpenRouter API key

# 4. Start application
npm start
```

## Features

✅ **Identical UI/UX** - Matches Replit exactly
✅ **Four AI Personas** - Sarah, Alex, Marcus, Maya
✅ **Real-time Chat** - AI conversations with emotion detection
✅ **Wellness Tools** - Journal, goals, breathing exercises
✅ **Local Database** - SQLite (automatic setup)
✅ **Hot Reload** - Live updates during development

## API Key Setup

1. Visit https://openrouter.ai/
2. Create free account
3. Generate API key
4. Add to `.env` file

## Troubleshooting

**Port 5000 in use?**
```bash
npx kill-port 5000
```

**Dependencies missing?**
```bash
npm install
npm run install-python
```

**Database issues?**
```bash
rm soulsense.db
npm run dev
```

## Production Deployment

The local setup can be deployed to:
- Vercel + Railway
- Netlify + Heroku  
- Any VPS with Node.js + Python

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── backend/         # Python FastAPI (optional)
├── shared/          # Shared types
├── .env            # Environment variables
├── soulsense.db    # SQLite database
└── package.json    # Dependencies
```

## Support

Check `STEP_BY_STEP_LOCAL_SETUP.md` for detailed instructions.

The application preserves 100% of Replit functionality while running locally.