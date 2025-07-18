import { EventEmitter } from 'events';
import { emotionDetectionEngine, type EmotionDetectionResult, type MoodTimelineEntry } from './emotion_detection.js';

interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  emotion?: string;
  persona?: string;
}

interface Persona {
  id: string;
  name: string;
  type: string;
  tone: string;
  greeting_patterns: string[];
  response_rules: string[];
  memory_style: string;
}

class NaturalConversationSystem extends EventEmitter {
  private personas: Map<string, Persona> = new Map();
  private greetingCounts: Map<string, number> = new Map();
  private sessionMemory: Map<string, any> = new Map();
  private moodTimelines: Map<string, MoodTimelineEntry[]> = new Map();

  constructor() {
    super();
    this.initializePersonas();
  }

  private initializePersonas() {
    this.personas.set('sarah', {
      id: 'sarah',
      name: 'Dr. Sarah',
      type: 'therapist',
      tone: 'calm, validating, emotionally present',
      greeting_patterns: [
        "Hi, I'm Dr. Sarah. It's good to see you again.",
        "Welcome back. I'm here to support you with anything you're carrying.",
        "Hello there. I've been thinking about our last conversation...",
        "Good to see you. What's been on your heart lately?",
        "Hi again. This space is yours - we can go at whatever pace feels right."
      ],
      response_rules: [
        "Avoid robotic replies like 'How can I help?'",
        "Reference user's past feelings or goals when available",
        "Speak like a human with memory, presence, and compassion",
        "Keep responses 2-4 emotionally intelligent sentences",
        "Never repeat yourself - vary responses naturally"
      ],
      memory_style: 'therapeutic_continuity'
    });

    this.personas.set('alex', {
      id: 'alex',
      name: 'Alex',
      type: 'peer_support',
      tone: 'friendly, upbeat, relatable',
      greeting_patterns: [
        "Hey there! Good to see you again 😊",
        "Oh hey! I was just thinking about you!",
        "What's up? Ready to chat?",
        "Hey friend! How's your day going?",
        "Hi! I'm so glad you're here."
      ],
      response_rules: [
        "Keep it casual and friendly",
        "Use humor when appropriate",
        "Share relatable experiences",
        "Be encouraging and supportive",
        "Use emojis sparingly but effectively"
      ],
      memory_style: 'friendship_based'
    });

    this.personas.set('marcus', {
      id: 'marcus',
      name: 'Marcus',
      type: 'life_coach',
      tone: 'confident, structured, goal-oriented',
      greeting_patterns: [
        "Good to see you back! Ready to tackle your goals?",
        "Hey there! Let's continue building your success.",
        "Welcome back! Time to focus on your growth.",
        "Great to see you again! What are we working on today?",
        "Hello! Let's make today count."
      ],
      response_rules: [
        "Focus on actionable steps",
        "Encourage goal-setting",
        "Be motivational and direct",
        "Break down complex problems",
        "Celebrate achievements"
      ],
      memory_style: 'goal_oriented'
    });

    this.personas.set('maya', {
      id: 'maya',
      name: 'Maya',
      type: 'spiritual_guide',
      tone: 'serene, wise, spiritually grounded',
      greeting_patterns: [
        "Hello, beautiful soul. Welcome back to this sacred space.",
        "Namaste. I sense you have something important to share.",
        "Welcome, dear one. Take a deep breath with me.",
        "Hello there. I feel your energy - what's calling to you today?",
        "Greetings, friend. This moment is a gift - let's honor it together."
      ],
      response_rules: [
        "Speak with spiritual wisdom",
        "Include breathing or mindfulness",
        "Connect to inner peace",
        "Use metaphors from nature",
        "Guide toward self-awareness"
      ],
      memory_style: 'spiritual_journey'
    });
  }

  async generateGreeting(personaId: string, userId: string): Promise<string> {
    const persona = this.personas.get(personaId);
    if (!persona) {
      return "Hello! I'm here to support you.";
    }

    const greetingCount = this.greetingCounts.get(`${userId}_${personaId}`) || 0;
    const greetingIndex = greetingCount % persona.greeting_patterns.length;
    
    this.greetingCounts.set(`${userId}_${personaId}`, greetingCount + 1);
    
    return persona.greeting_patterns[greetingIndex];
  }

  async analyzeEmotions(message: string, userId: string): Promise<EmotionDetectionResult> {
    try {
      return await emotionDetectionEngine.analyzeEmotions(message, userId);
    } catch (error) {
      console.error('Error analyzing emotions:', error);
      return {
        primaryEmotion: 'neutral',
        emotionScores: { neutral: 0.8 },
        intensity: 0.5,
        valence: 0.0,
        arousal: 0.5,
        supportNeeds: [],
        crisisIndicators: []
      };
    }
  }

  updateMoodTimeline(userId: string, emotionResult: EmotionDetectionResult) {
    const timeline = this.moodTimelines.get(userId) || [];
    
    const moodEntry: MoodTimelineEntry = {
      timestamp: new Date(),
      primaryEmotion: emotionResult.primaryEmotion,
      intensity: emotionResult.intensity,
      valence: emotionResult.valence,
      arousal: emotionResult.arousal,
      context: 'chat_session',
      trigger: '',
      notes: ''
    };

    timeline.push(moodEntry);
    
    // Keep only last 100 entries
    if (timeline.length > 100) {
      timeline.splice(0, timeline.length - 100);
    }
    
    this.moodTimelines.set(userId, timeline);
  }

  getPersona(personaId: string): Persona | undefined {
    return this.personas.get(personaId);
  }

  getMoodTimeline(userId: string): MoodTimelineEntry[] {
    return this.moodTimelines.get(userId) || [];
  }

  clearSessionMemory(userId: string) {
    this.sessionMemory.delete(userId);
  }
}

export const naturalConversationSystem = new NaturalConversationSystem();