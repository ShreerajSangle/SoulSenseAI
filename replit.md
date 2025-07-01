# SoulSense AI - Mental Health Therapy Application

## Overview
SoulSense is a comprehensive AI-driven mental health support platform that provides personalized, adaptive therapeutic experiences through intelligent interfaces and comprehensive wellness tracking. The application features four distinct therapeutic personas (Dr. Sarah, Marcus, Alex, Maya) powered by Claude 3 Haiku for natural, empathetic conversations.

## Recent Changes

### Comprehensive Intelligence Upgrade (January 2025)
- ✓ **Conversation Flow Engine**: Finite state machine managing therapeutic dialogue progression through phases (emotional check-in → exploratory dialogue → emotional reflection → solution framing → closure)
- ✓ **Enhanced Persona System**: Four deeply developed personas with therapeutic techniques, phase-specific prompts, and emotion-specific guidance
  - Dr. Sarah: CBT-focused with cognitive reframing and thought record techniques
  - Maya: Mindfulness-based with breathing, body scan, and loving-kindness practices  
  - Marcus: Solution-focused coaching with goal setting and strength identification
  - Alex: Peer support with normalization, humor therapy, and relatability
- ✓ **Quality Evaluation System**: Real-time scoring of responses on empathy, relevance, persona consistency, emotional appropriateness, and therapeutic value
- ✓ **Dynamic Prompt Integration**: Context-aware prompt generation based on conversation phase, emotional state, memory, and persona specialization
- ✓ **Advanced Memory Architecture**: Enhanced pattern recognition, relationship dynamics tracking, and therapeutic progress monitoring

### Chat Interface Enhancements
- ✓ Mini-Journal Entry button (notebook icon) for quick emotional reflections with mood tagging
- ✓ Quick Reply Bubbles beneath persona responses ("That makes sense", "Tell me more", "Thank you")
- ✓ Session Recap modal generating warm summaries after 5+ messages with save/copy functionality
- ✓ Enhanced breathing exercises with 4 distinct techniques (4-7-8, 4-4-4, 5-5-5, 4-4-6-2)
- ✓ Context-aware conversation tracking capturing emotions, topics, and wellness tool usage

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

### Advanced Memory System
- **Short-term Memory:** Tracks recent conversation context, emotional states, and interaction patterns
- **Long-term Memory:** Stores significant breakthroughs, recurring themes, and therapeutic progress
- **Emotional Profiling:** Builds user emotional patterns using GoEmotions taxonomy
- **Relationship Dynamics:** Tracks trust levels, intimacy depth, and communication preferences

### Emotion Detection & Response Adaptation
- **Real-time Emotion Analysis:** Uses Claude 3 Haiku to detect emotions with intensity and valence scoring
- **Adaptive Response Tuning:** Automatically adjusts tone and content based on detected emotional states
- **Crisis Detection:** Identifies safety concerns and adjusts responses accordingly
- **Therapeutic Context:** Each persona uses specific therapeutic approaches (CBT for Dr. Sarah, mindfulness for Maya)

### Debug & Monitoring Dashboard
- **Prompt Logging:** Tracks user inputs, generated prompts, and AI responses
- **Performance Metrics:** Response times, confidence scores, emotion accuracy
- **Memory Analytics:** Conversation patterns, trust progression, therapeutic milestones

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