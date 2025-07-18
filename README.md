# SoulSense AI - Mental Health Therapy Application

## Overview
SoulSense is a comprehensive AI-driven mental health support platform that provides personalized, adaptive therapeutic experiences through intelligent interfaces and comprehensive wellness tracking. The application features four distinct therapeutic personas (Dr. Sarah, Marcus, Alex, Maya) powered by Claude 3 Haiku for natural, empathetic conversations.

## Architecture

### Backend (Python FastAPI)
- **FastAPI** framework with async/await patterns
- **Claude 3 Haiku** integration via OpenRouter API
- **SQLite** database with comprehensive schema
- **Four therapeutic personas** with specialized modules
- **Emotional intelligence engine** with real-time analysis
- **RESTful API** with automatic documentation

### Frontend (React)
- **React** application with modern JavaScript
- **Therapeutic UI design** with calming aesthetics
- **Real-time chat interface** with persona-specific styling
- **Comprehensive wellness tracking** (journaling, goals, analytics)
- **Responsive design** for all devices

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenRouter API key

### Environment Setup
1. Create `.env` file with required variables:
```bash
OPENROUTER_API_KEY=your_openrouter_api_key
NODE_ENV=development
PORT=5000
```

### Running the Application
```bash
# Start Python FastAPI backend
cd backend
python3 main.py

# Backend will be available at:
# - API: http://localhost:5000
# - Documentation: http://localhost:5000/docs
# - Interactive API: http://localhost:5000/redoc
```

## API Endpoints

### Core APIs
- `GET /health` - Health check
- `GET /api/personas` - List all therapeutic personas
- `POST /api/chat/{persona_id}` - Chat with specific persona
- `GET /api/profile` - User profile management
- `GET /api/goals` - Goal tracking
- `GET /api/diary` - Journal entries
- `GET /api/analytics` - User analytics and insights

### Therapeutic Personas
- **Dr. Sarah** - Clinical therapist with CBT focus
- **Maya** - Spiritual guide with mindfulness practices
- **Marcus** - Life coach with goal-oriented approach
- **Alex** - Peer support with humor and relatability

## Features

### Core Functionality
- 🤖 **AI-Powered Conversations** - Natural therapeutic dialogue
- 🎭 **Multiple Personas** - Four specialized therapeutic approaches
- 📊 **Emotional Intelligence** - Real-time emotion detection and analysis
- 📝 **Digital Journaling** - Mood tracking and reflection tools
- 🎯 **Goal Management** - Personal development tracking
- 📈 **Analytics Dashboard** - Comprehensive wellness insights

### Advanced Features
- 🧘 **Breathing Exercises** - Guided meditation and relaxation
- 💭 **Quick Replies** - Context-aware therapeutic suggestions
- 🔄 **Session Continuity** - Smart conversation resumption
- 📅 **Daily Wellness Loop** - Structured daily check-ins
- 🛤️ **Guided Pathways** - Therapeutic journey programs
- 📊 **Emotional Timeline** - Visual emotional progression tracking

## Development

### Project Structure
```
├── backend/               # Python FastAPI backend
│   ├── main.py           # FastAPI application entry point
│   ├── core/             # Core services (database, AI, personas)
│   ├── api/              # API route handlers
│   └── personas/         # Individual persona modules
├── client/               # React frontend application
├── .env                  # Environment variables
└── run_dev_server.sh     # Development server startup
```

### Database
- **SQLite** for local development and production
- **Comprehensive schema** for users, conversations, goals, analytics
- **Async operations** with aiosqlite
- **Automatic table creation** on startup

### API Integration
- **OpenRouter API** for Claude 3 Haiku access
- **Real-time emotion detection** and analysis
- **Context-aware responses** with therapeutic focus
- **Crisis detection** and appropriate response protocols

## Production Deployment
The application is designed for deployment on platforms like Replit, with:
- Single-port configuration (5000)
- Environment variable management
- Production-ready FastAPI setup
- Comprehensive error handling
- API documentation generation

## Contributing
This is a therapeutic AI application focused on mental health support. All contributions should prioritize user safety, therapeutic effectiveness, and ethical AI practices.

## License
This project is designed for mental health support and therapeutic applications.