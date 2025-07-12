# SoulSense AI - Mental Health Therapy Application

## Overview
SoulSense is a comprehensive AI-driven mental health support platform that provides personalized, adaptive therapeutic experiences through intelligent interfaces and comprehensive wellness tracking. The application features four distinct therapeutic personas (Dr. Sarah, Marcus, Alex, Maya) powered by Claude 3 Haiku for natural, empathetic conversations.

## Recent Changes

### Critical Bug Fixes & API Integration (July 2025)
- ✓ **Fixed Infinite Loop Bug**: Resolved circular dependency between conversation systems that was causing server crashes
- ✓ **Claude 3.5 Sonnet Integration**: Successfully configured Claude AI via OpenRouter API for natural therapeutic conversations
- ✓ **Enhanced Fallback System**: Created 36+ varied, persona-specific responses (4 personas × 4 emotions × 3 variations) to eliminate robotic repetition
- ✓ **Optimized Token Usage**: Reduced max tokens from 2048 to 1500 to work within API credit limits
- ✓ **Database Setup**: Established PostgreSQL database with proper migrations and environment variables
- ✓ **Conversation Quality**: Achieved natural, empathetic responses that adapt to user emotional states

### GPT-4o Level Intelligence Upgrade (January 2025)
- ✓ **Advanced Intelligence Engine**: Multi-step reasoning with contextual awareness, emotional nuance detection, and adaptive personality profiling
- ✓ **GPT-4o Level Processor**: Deep emotional analysis with vulnerability assessment, resilience indicators, and therapeutic opportunity identification
- ✓ **Enhanced Emotional Intelligence**: Secondary emotion detection, emotional complexity scoring, underlying needs analysis, and cultural sensitivity
- ✓ **Creative Therapeutic Response Generation**: Metaphor integration, therapeutic technique selection, emotional validation, and cognitive reframing
- ✓ **Conversation Flow Engine**: Finite state machine managing therapeutic dialogue progression through phases (emotional check-in → exploratory dialogue → emotional reflection → solution framing → closure)
- ✓ **Enhanced Persona System**: Four deeply developed personas with therapeutic techniques, phase-specific prompts, and emotion-specific guidance
  - Dr. Sarah: CBT-focused with cognitive reframing and thought record techniques
  - Maya: Mindfulness-based with breathing, body scan, and loving-kindness practices  
  - Marcus: Solution-focused coaching with goal setting and strength identification
  - Alex: Peer support with normalization, humor therapy, and relatability
- ✓ **Quality Evaluation System**: Real-time scoring of responses on empathy, relevance, persona consistency, emotional appropriateness, and therapeutic value
- ✓ **Dynamic Prompt Integration**: Context-aware prompt generation based on conversation phase, emotional state, memory, and persona specialization
- ✓ **Advanced Memory Architecture**: Enhanced pattern recognition, relationship dynamics tracking, and therapeutic progress monitoring

### Chat Interface & UX Enhancements
- ✓ **Persona-Specific Quick Replies**: Dynamically tailored response options based on active persona
  - Dr. Sarah: "Can you reframe that for me?", "I need to process this"
  - Maya: "Say that in a softer way", "Help me breathe through this"
  - Marcus: "Give me a plan", "What's the next step?"
  - Alex: "Say that with a joke 😄", "That's so relatable"
- ✓ **Emotion Detection & Visual Feedback**: Real-time emotion indicators with color-coded badges showing detected emotional states
- ✓ **Improved Timestamp Display**: Clean timestamps that appear only on hover, grouped per message block
- ✓ **Conversation Navigation**: Full session history with expandable chat threads, message editing, and session summary access
- ✓ **Enhanced Message Experience**: Group-based hover states, emotion tags for user messages, and smoother visual transitions
- ✓ **Mini-Journal Entry**: Quick emotional reflections with mood tagging
- ✓ **Session Recap Modal**: Warm therapeutic summaries with save/copy functionality
- ✓ **Enhanced Breathing Exercises**: Four distinct techniques for different stress levels

## Project Architecture

### Frontend (React/TypeScript)
- **Main Components:**
  - `simple-chat-overlay.tsx` - Core chat interface with persona selection
  - `mini-journal-modal.tsx` - Quick reflection entry with mood tagging
  - `quick-reply-bubbles.tsx` - One-tap response options
  - `session-recap-modal.tsx` - Conversation summary with therapeutic insights
  - `breathing-exercise.tsx` - Four breathing techniques for stress management
  - `goal-creation-modal.tsx` - Wellness goal setting interface

### Backend (Express.js/PostgreSQL)
- **Core Systems:**
  - `claude_conversation_system.ts` - Advanced conversation engine with memory architecture
  - `storage.ts` - Database abstraction layer with PostgreSQL integration
  - `routes-clean.ts` - API endpoints for all application features
  - `replitAuth.ts` - Authentication system

### Database Schema
- **Key Tables:**
  - Users, Personas, Conversations, Messages, Sessions
  - Diary entries, Mood tracking, Goals, User profiles
  - Memory storage for conversation context and emotional patterns

## Technical Features

### Conversation Flow Engine (Finite State Machine)
- **Phase Management:** Automatic progression through therapeutic dialogue stages
- **Crisis Detection:** Immediate transition to crisis support when safety indicators detected
- **Engagement Tracking:** Real-time monitoring of user engagement and emotional intensity
- **Phase-Specific Guidance:** Each conversation phase has tailored therapeutic approaches

### Enhanced Persona Intelligence
- **Therapeutic Specializations:** Each persona equipped with specific techniques and interventions
- **Dynamic Prompt Generation:** Context-aware prompts based on conversation phase and emotional state
- **Persona Consistency:** Quality evaluation ensures responses match persona characteristics
- **Crisis Protocols:** Specialized safety responses for each persona type

### Quality Evaluation & Continuous Improvement
- **Real-time Scoring:** Evaluates responses on empathy, relevance, therapeutic value, and safety
- **Automatic Retry:** Low-quality responses are automatically regenerated
- **Performance Analytics:** Tracks conversation quality trends and identifies improvement areas
- **Therapeutic Effectiveness:** Monitors technique usage and emotional progression

### Advanced Memory & Context System
- **Conversation Memory:** Enhanced pattern recognition for therapeutic progress tracking
- **Emotional Profiling:** Builds comprehensive emotional patterns using GoEmotions taxonomy
- **Relationship Dynamics:** Trust levels, intimacy depth, and therapeutic rapport tracking
- **Context Integration:** Memory context automatically injected into dynamic prompts

## User Preferences
- **Communication Style:** Warm, conversational, friend-like responses (2-4 sentences)
- **UI Aesthetic:** Calming lavender-pink gradient design with solid (non-translucent) elements
- **Therapeutic Approach:** Reduce interaction friction, provide therapeutic closure, natural conversation flow
- **Technical Preference:** Claude 3 Haiku via OpenRouter for empathetic, fluid dialogue

## API Integration
- **Primary AI:** Claude 3 Haiku via OpenRouter API for all conversational interactions
- **Database:** PostgreSQL with Drizzle ORM for data persistence
- **Authentication:** Replit Auth system for user management
- **Cloud Sync:** Optional Supabase integration for data backup

## Deployment Status
- **Environment:** Replit development environment
- **Status:** Fully functional with enhanced memory and emotion detection
- **Performance:** Real-time conversation processing with context-aware responses
- **Monitoring:** Debug dashboard available at `/api/debug/conversation-logs`

## Next Steps
- Monitor user interactions and fine-tune emotional intelligence algorithms
- Expand therapeutic tool integration based on user feedback
- Implement vector database for enhanced memory retrieval
- Add clinical assessment tools (PHQ-9 integration) for mood tracking