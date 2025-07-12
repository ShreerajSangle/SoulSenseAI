# SoulSense AI - Mental Health Therapy Application

## Overview
SoulSense is a comprehensive AI-driven mental health support platform that provides personalized, adaptive therapeutic experiences through intelligent interfaces and comprehensive wellness tracking. The application features four distinct therapeutic personas (Dr. Sarah, Marcus, Alex, Maya) powered by Claude 3 Haiku for natural, empathetic conversations.

## Recent Changes

### UX Responsiveness & Interaction Enhancements (July 2025)
- ✓ **Mobile-First Responsive Design**: All wellness features now fully responsive across desktop, tablet, and mobile devices
- ✓ **Smooth Animation System**: Added smooth fade-in, zoom-in, and slide-in animations for all modals and components
- ✓ **Enhanced Button Interactions**: Implemented hover, active, and focus states with scale effects and ring focus indicators
- ✓ **Improved Touch Targets**: Increased button sizes on mobile (8x8 to 10x10 on desktop, proper touch sizing)
- ✓ **Auto-Focus & Flow**: Quick reply selection auto-focuses textarea, journal modal auto-focuses input field
- ✓ **Visual Feedback System**: All clickable elements provide clear visual feedback (opacity shifts, scale transforms, color changes)
- ✓ **Graceful Error Handling**: Added fallback text for all persona-specific content to prevent crashes
- ✓ **Optimized Layout**: Flexible layouts with proper flex-shrink and min-width handling for mobile compatibility

### Human-Like Conversation Architecture Implementation (July 2025)
- ✓ **Expert-Guided Redesign**: Implemented conversational architecture following expert recommendations for human-like AI
- ✓ **Natural Conversation System**: Built multi-layered conversation engine with session memory, context tracking, and persona-specific response rules
- ✓ **Dynamic Greeting Patterns**: Each persona has 5 unique greeting variations that cycle naturally, never repeating
- ✓ **Session Memory Layer**: Tracks mood, topics, goals, and preferences across conversation turns for contextual continuity
- ✓ **Context-Aware Prompting**: References user's emotional state, past topics, and goals naturally in responses
- ✓ **Simplified API Integration**: Streamlined Claude 3.5 calls with 500 tokens and 0.9 temperature for natural, varied responses
- ✓ **Eliminated Robotic Responses**: Removed complex intelligence systems that were causing artificial, scripted-sounding replies
- ✓ **Human Response Rules**: Each persona follows specific guidelines to sound like real humans, not therapeutic AIs

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
  - `natural_conversation_system.ts` - Human-like conversation engine with session memory and context tracking
  - `claude_conversation_system.ts` - Legacy advanced conversation engine (deprecated)
  - `storage.ts` - Database abstraction layer with PostgreSQL integration  
  - `routes-clean.ts` - API endpoints using natural conversation system
  - `replitAuth.ts` - Authentication system

### Database Schema
- **Key Tables:**
  - Users, Personas, Conversations, Messages, Sessions
  - Diary entries, Mood tracking, Goals, User profiles
  - Memory storage for conversation context and emotional patterns

## Technical Features

### Natural Conversation Engine
- **Session Memory System:** Tracks user mood, topics, goals, and preferences across conversation turns
- **Dynamic Greeting Patterns:** 5 unique greetings per persona that cycle naturally without repetition
- **Context-Aware Responses:** References past conversations, emotional states, and goals naturally
- **Human Response Rules:** Persona-specific guidelines ensuring natural, non-robotic communication

### Enhanced Persona Architecture
- **Detailed Persona Profiles:** Each persona has defined type, tone, greeting patterns, and response rules
- **Memory-Style Adaptation:** Therapeutic continuity (Sarah), mindful presence (Maya), friendship continuity (Alex), growth-oriented (Marcus)
- **Emotional Tone Detection:** Responses categorized as empathetic, encouraging, calming, or empowering
- **Natural Language Processing:** Simplified prompting focused on human-like conversation over complex analysis

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