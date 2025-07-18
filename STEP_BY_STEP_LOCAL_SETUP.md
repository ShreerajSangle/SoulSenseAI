# SoulSense AI - Complete Step-by-Step Local Setup

## 🎯 Goal: Run SoulSense AI locally with IDENTICAL UI and functionality

## Prerequisites Check
Before starting, verify you have:
- [ ] Node.js v18+ (`node --version`)
- [ ] npm (`npm --version`) 
- [ ] Git (`git --version`)
- [ ] Python 3.8+ (`python --version` or `python3 --version`)

## Step 1: Download the Project

### Option A: From GitHub (if available)
```bash
git clone <your-repository-url>
cd soulsense-ai
```

### Option B: Download from Replit
1. In Replit, click the three dots menu
2. Select "Download as zip"
3. Extract the zip file
4. Open terminal in the extracted folder

## Step 2: Install Node.js Dependencies
```bash
# Install all frontend and backend dependencies
npm install

# This installs all packages needed for:
# - React frontend with all UI components
# - Express TypeScript backend
# - Database integration (Drizzle ORM)
# - AI integration (OpenRouter)
```

## Step 3: Install Python Dependencies
```bash
# Install Python packages for the FastAPI backend
pip install fastapi uvicorn pydantic python-dotenv httpx asyncpg aiosqlite sqlalchemy passlib python-jose python-multipart

# Or if you have pip3:
pip3 install fastapi uvicorn pydantic python-dotenv httpx asyncpg aiosqlite sqlalchemy passlib python-jose python-multipart
```

## Step 4: Environment Configuration
Create a `.env` file in the root directory with these settings:

```env
# REQUIRED: OpenRouter API Key for AI responses
OPENROUTER_API_KEY=your_openrouter_api_key_here

# OPTIONAL: Database (SQLite used by default if not specified)
# DATABASE_URL=postgresql://user:password@localhost:5432/soulsense

# OPTIONAL: Session management
SESSION_SECRET=your_random_session_secret_here_make_it_long_and_random

# OPTIONAL: Development settings
NODE_ENV=development
```

### Getting Your OpenRouter API Key:
1. Visit https://openrouter.ai/
2. Sign up for a free account
3. Go to API Keys section
4. Create a new API key
5. Copy and paste it into your `.env` file

## Step 5: Database Setup (Automatic)
The app uses SQLite by default - no setup needed!
- Database file `soulsense.db` will be created automatically
- All tables and data will be initialized on first run
- If you prefer PostgreSQL, add your `DATABASE_URL` to `.env`

## Step 6: Start the Application

### Method 1: Full Stack (Identical to Replit)
```bash
npm run dev
```
- Starts both frontend and backend on **port 5000**
- Visit: http://localhost:5000
- This matches exactly how it runs in Replit

### Method 2: Python Backend Only (Alternative)
```bash
# If you want to run just the Python FastAPI backend
python start_python_backend.py
# OR
python3 start_python_backend.py

# Runs on port 8000, API docs at http://localhost:8000/docs
```

## Step 7: Verify Everything Works

### Check 1: Homepage Loads
- Visit http://localhost:5000
- You should see the beautiful SoulSense homepage
- All four personas should be visible: Sarah, Alex, Marcus, Maya

### Check 2: API is Working
```bash
# Test the personas endpoint
curl http://localhost:5000/api/personas
```
Should return JSON with all four personas.

### Check 3: Chat Functionality
1. Click on any persona card
2. Try sending a message
3. You should get AI responses (requires valid OpenRouter API key)

## Step 8: Features Available Locally

✅ **Exact Same UI**: All therapeutic design, colors, fonts preserved
✅ **Four Enhanced Personas**: Sarah, Alex, Marcus, Maya with full frameworks  
✅ **Real-time Chat**: AI conversations with emotional intelligence
✅ **Journal System**: Mood tracking and reflection tools
✅ **Goal Tracking**: Set and monitor personal goals
✅ **Breathing Exercises**: Guided wellness activities
✅ **Analytics Dashboard**: User insights and progress tracking
✅ **Database Persistence**: All data saved locally

## Troubleshooting

### Port 5000 Already in Use?
```bash
# Kill any process using port 5000
npx kill-port 5000

# Or change the port in package.json scripts
# Edit "dev" script to use different port
```

### OpenRouter API Not Working?
- Double-check your API key in `.env`
- Ensure you have credits/quota on OpenRouter
- Check console logs for specific error messages

### Database Issues?
```bash
# Reset SQLite database
rm soulsense.db
npm run dev  # Will recreate automatically
```

### Missing Dependencies?
```bash
# Reinstall Node dependencies
rm -rf node_modules package-lock.json
npm install

# Reinstall Python dependencies
pip install --upgrade fastapi uvicorn pydantic python-dotenv httpx
```

### TypeScript Errors?
```bash
# Check for type issues
npm run check
```

## Development Mode Features
- **Hot Reload**: Changes auto-refresh
- **Debug Logs**: Console shows detailed API calls
- **Database Sync**: Schema changes apply automatically
- **Error Display**: Clear error messages in browser

## Production Deployment
Once working locally, you can deploy to:
- Vercel (frontend) + Railway (backend)
- Netlify + Heroku
- Any VPS with Node.js and Python support

## File Structure (for reference)
```
soulsense-ai/
├── client/           # React frontend
├── server/           # Express TypeScript backend
├── backend/          # Python FastAPI backend  
├── shared/           # Shared types and schemas
├── package.json      # Node.js dependencies
├── .env             # Your environment variables
├── soulsense.db     # SQLite database (auto-created)
└── vite.config.ts   # Frontend build config
```

The local setup preserves 100% of the Replit functionality while giving you full control over the development environment.