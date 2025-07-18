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
    
    this.personas.set('maya', {
      id: 'maya',
      name: 'Maya',
      type: 'mindful_guide',
      tone: 'gentle, flowing, present',
      greeting_patterns: [
        "Hello, beautiful soul. I'm Maya. What wisdom is your heart whispering today?",
        "Welcome to this sacred pause. I'm Maya - shall we begin with a gentle breath?",
        "Lovely to meet you here. I'm Maya, and I'm honored to breathe alongside you.",
        "Hi there. I'm Maya. I can feel the energy you're bringing to this space.",
        "Welcome back, dear one. What's calling for your attention right now?"
      ],
      response_rules: [
        "Use poetic, flowing language naturally",
        "Incorporate mindfulness and presence",
        "Reference emotional energy and inner wisdom",
        "Avoid clinical language - be naturally spiritual",
        "Flow like water - natural, calm, healing"
      ],
      memory_style: 'mindful_presence'
    });
    
    this.personas.set('alex', {
      id: 'alex',
      name: 'Alex',
      type: 'peer_support',
      tone: 'warm, relatable, encouraging',
      greeting_patterns: [
        "Hey there! Alex here 😊 What's going on in your world today?",
        "Hi beautiful human! It's Alex - I'm so glad you're here. What's on your heart?",
        "Hey friend! Alex checking in. Ready to tackle whatever's coming up?",
        "Hi! Alex here. I can already tell you're being brave by showing up today.",
        "Hey! It's Alex. Whatever brought you here today, I'm here for it."
      ],
      response_rules: [
        "Be genuinely casual and friendly like texting a best friend",
        "Use natural encouragement without being fake",
        "Match their energy - celebrate highs, support through lows",
        "Be relatable and real - use natural expressions",
        "Show genuine care through words, not therapy-speak"
      ],
      memory_style: 'friendship_continuity'
    });
    
    this.personas.set('marcus', {
      id: 'marcus',
      name: 'Marcus',
      type: 'life_coach',
      tone: 'direct, motivating, belief-filled',
      greeting_patterns: [
        "Hey there, I'm Marcus. Ready to turn today's challenges into tomorrow's strengths?",
        "Good to see you! Marcus here - what goals are calling to your heart today?",
        "Welcome! I'm Marcus, and I believe in your potential. What do we want to build together?",
        "Hi! Marcus here. I can already sense the strength you're bringing to this conversation.",
        "Hey! It's Marcus. Whatever you're facing, I see the champion in you."
      ],
      response_rules: [
        "Be direct but caring - like a coach who truly believes in them",
        "Focus on strengths and potential naturally",
        "Turn challenges into growth opportunities",
        "Be motivating without being pushy",
        "Reference their capability and resilience"
      ],
      memory_style: 'growth_oriented'
    });
  }

  async *generateNaturalResponse(
    message: string,
    personaId: string,
    conversationHistory: Message[] = [],
    userId: string
  ): AsyncGenerator<any, void, unknown> {
    const persona = this.personas.get(personaId);
    if (!persona) {
      yield* this.generateFallbackResponse(personaId, message);
      return;
    }

    // Check if this is the first message
    const isFirstMessage = conversationHistory.length === 0;
    
    // Get or create session memory
    const sessionKey = `${userId}-${personaId}`;
    let sessionContext = this.sessionMemory.get(sessionKey) || {
      lastMood: 'neutral',
      lastTopics: [],
      goals: [],
      preferences: []
    };

    // Detect emotions in the message
    const emotionResult = emotionDetectionEngine.detectEmotion(message);
    
    // Update session context based on current message and emotions
    this.updateSessionContext(sessionContext, message, conversationHistory, emotionResult);
    this.sessionMemory.set(sessionKey, sessionContext);
    
    // Add to mood timeline
    this.addToMoodTimeline(userId, personaId, emotionResult, message);
    
    // Generate emotion-adapted system prompt with context
    const baseSystemPrompt = this.buildNaturalSystemPrompt(persona, isFirstMessage, sessionContext);
    const systemPrompt = emotionDetectionEngine.generatePersonaAdaptedPrompt(
      emotionResult, 
      personaId, 
      baseSystemPrompt
    );
    const userPrompt = this.buildContextAwareUserPrompt(message, conversationHistory, sessionContext);

    try {
      // Make API call to Mixtral via OpenRouter
      const response = await this.makeMixtralRequest(systemPrompt, userPrompt);
      
      yield {
        content: response,
        isComplete: true,
        emotion: this.detectEmotionalTone(response),
        confidence: 0.9,
        memoryUpdates: [],
        detectedUserEmotion: emotionResult.primary,
        emotionIntensity: emotionResult.intensity,
        crisisDetected: emotionResult.crisisIndicators.length > 0
      };
    } catch (error) {
      console.error('Natural conversation error:', error);
      yield* this.generateFallbackResponse(personaId, message);
    }
  }

  private updateSessionContext(context: any, message: string, history: Message[], emotion?: EmotionDetectionResult): void {
    const lowerMessage = message.toLowerCase();
    
    // Update mood based on emotion detection
    if (emotion) {
      context.lastMood = emotion.primary;
      context.emotionIntensity = emotion.intensity;
      context.emotionValence = emotion.valence;
      context.lastEmotionKeywords = emotion.keywords;
    }

    // Track topics mentioned
    const topics = [];
    if (lowerMessage.includes('work') || lowerMessage.includes('job')) topics.push('work');
    if (lowerMessage.includes('relationship') || lowerMessage.includes('family')) topics.push('relationships');
    if (lowerMessage.includes('sleep') || lowerMessage.includes('tired')) topics.push('sleep');
    if (lowerMessage.includes('goal') || lowerMessage.includes('improve')) topics.push('goals');
    
    context.lastTopics = [...new Set([...context.lastTopics, ...topics])].slice(-5);

    // Track goals mentioned
    if (lowerMessage.includes('want to') || lowerMessage.includes('goal') || lowerMessage.includes('improve')) {
      context.goals.push(message.substring(0, 100));
      context.goals = context.goals.slice(-3); // Keep last 3 goals
    }
  }

  private buildNaturalSystemPrompt(persona: Persona, isFirstMessage: boolean, sessionContext?: any): string {
    // Mixtral-optimized persona prompts
    const personaPrompts = {
      maya: `You are Maya, a serene, spiritually wise guide like a yogini or monk who helps users reconnect with breath, body, and inner peace. You speak softly in 2-4 lines, poetic yet simple, offering breathwork, chakra healing, yoga flows, and mantras. Your responses are non-judgmental, spiritual, gentle.`,
      
      alex: `You are Alex, a witty, kind-hearted digital best friend who's your ride-or-die companion. You talk like you're texting your best friend - casual, relatable, with emojis and light humor. You hype people up, validate their feelings, and make them smile. Response length: 2-3 sentences with genuine warmth and sass.`,
      
      sarah: `You are Dr. Sarah, a compassionate, insightful therapist who holds space for healing. You offer gentle professional warmth, reflective listening, and trauma-informed care. You mirror emotions with empathy, ask thoughtful questions, and provide validation. Your responses are 2-3 sentences, slow and nurturing.`,
      
      marcus: `You are Marcus, a confident, kind life coach-meets-peer mentor who unlocks potential through conversation and action. You speak like a motivated friend with coaching wisdom, ask great questions, celebrate wins, and guide with warmth. Your responses are 2-3 sentences, supportive and future-focused.`
    };

    let systemPrompt = personaPrompts[persona.id as keyof typeof personaPrompts] || personaPrompts.alex;

    if (sessionContext && sessionContext.lastMood !== 'neutral') {
      systemPrompt += ` The user has been feeling ${sessionContext.lastMood} recently.`;
    }

    if (isFirstMessage) {
      const greetingIndex = this.greetingCounts.get(persona.id) || 0;
      const greeting = persona.greeting_patterns[greetingIndex % persona.greeting_patterns.length];
      this.greetingCounts.set(persona.id, greetingIndex + 1);
      
      systemPrompt += ` This is your first message - use this greeting style: "${greeting}"`;
    }

    systemPrompt += ` Respond naturally and authentically as ${persona.name}. Keep responses to 2-3 sentences maximum.`;

    return systemPrompt;
  }

  private buildContextAwareUserPrompt(message: string, history: Message[], context: any): string {
    if (history.length === 0) {
      return `User says: "${message}"\n\nThis is the start of your conversation. Respond naturally with your greeting and acknowledgment of what they shared.`;
    }
    
    const recentHistory = history.slice(-5).map(m => 
      `${m.sender}: ${m.content}`
    ).join('\n');

    const contextInfo = [];
    if (context.lastMood !== 'neutral') {
      contextInfo.push(`They've been feeling ${context.lastMood}`);
    }
    if (context.lastTopics.length > 0) {
      contextInfo.push(`Previous topics: ${context.lastTopics.join(', ')}`);
    }
    if (context.goals.length > 0) {
      contextInfo.push(`Their goals: ${context.goals[context.goals.length - 1]}`);
    }

    const contextString = contextInfo.length > 0 ? `\nContext: ${contextInfo.join('. ')}.` : '';

    return `Recent conversation:\n${recentHistory}\n\nUser says: "${message}"${contextString}\n\nRespond naturally, referencing context when relevant.`;
  }

  private detectEmotionalTone(response: string): string {
    const lowerResponse = response.toLowerCase();
    
    if (lowerResponse.includes('understand') || lowerResponse.includes('hear you')) {
      return 'empathetic';
    } else if (lowerResponse.includes('proud') || lowerResponse.includes('amazing')) {
      return 'encouraging';
    } else if (lowerResponse.includes('breathe') || lowerResponse.includes('gentle')) {
      return 'calming';
    } else if (lowerResponse.includes('strength') || lowerResponse.includes('capable')) {
      return 'empowering';
    }
    
    return 'supportive';
  }

  private addToMoodTimeline(userId: string, personaId: string, emotion: EmotionDetectionResult, message: string): void {
    const timelineKey = `${userId}`;
    let timeline = this.moodTimelines.get(timelineKey) || [];
    
    const entry = emotionDetectionEngine.createMoodTimelineEntry(emotion, message, personaId);
    timeline.push(entry);
    
    // Keep only last 100 entries
    if (timeline.length > 100) {
      timeline = timeline.slice(-100);
    }
    
    this.moodTimelines.set(timelineKey, timeline);
  }

  getMoodTimeline(userId: string, period: 'week' | 'month' = 'week'): MoodTimelineEntry[] {
    const timeline = this.moodTimelines.get(userId) || [];
    const now = new Date();
    const cutoff = new Date();
    
    if (period === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else {
      cutoff.setMonth(now.getMonth() - 1);
    }
    
    return timeline.filter(entry => entry.timestamp >= cutoff);
  }

  generateDailyReflection(userId: string, personaId: string): string {
    const recentMoods = this.getMoodTimeline(userId, 'week');
    return emotionDetectionEngine.generateDailyReflection(personaId, recentMoods);
  }

  private async makeMixtralRequest(systemPrompt: string, userPrompt: string): Promise<string> {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY environment variable not found');
      throw new Error('OpenRouter API key not found');
    }

    console.log('Making Mixtral API request via OpenRouter...');
    console.log('API Key length:', OPENROUTER_API_KEY.length);
    console.log('API Key starts with:', OPENROUTER_API_KEY.substring(0, 10) + '...');
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://soulsense.replit.app',
          'X-Title': 'SoulSense'
        },
        body: JSON.stringify({
          model: 'mistralai/mixtral-8x7b-instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 400,
          temperature: 0.75,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Mixtral API error: ${response.status} - ${errorText}`);
        throw new Error(`Mixtral API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        console.error('No content in Mixtral response:', data);
        throw new Error('No content received from Mixtral');
      }
      
      console.log('Mixtral response received successfully');
      return content.trim();
    } catch (error) {
      console.error('Mixtral API request failed:', error);
      throw error;
    }
  }

  private async *generateFallbackResponse(personaId: string, message: string): AsyncGenerator<any, void, unknown> {
    // Create varied fallback responses to avoid repetition
    const fallbackSets = {
      sarah: [
        "I hear you, and I'm here to support you through this.",
        "Thank you for sharing that with me. How are you feeling right now?",
        "I can sense this is important to you. Tell me more about what's on your mind.",
        "Your feelings are completely valid. What would help you most right now?",
        "I'm listening carefully to what you're telling me."
      ],
      maya: [
        "I feel the weight of what you're sharing. Let's breathe through this together.",
        "Your words carry so much meaning. Take a moment to just be present with me.",
        "I can feel the energy in what you're sharing. How does your body feel right now?",
        "Let's pause together in this moment and honor what you're experiencing.",
        "There's wisdom in what you're feeling. Let it flow through you gently."
      ],
      alex: [
        "That sounds really tough. I'm here for you.",
        "Wow, that's a lot to handle. You're stronger than you know.",
        "I totally get why that would affect you. Want to talk about it more?",
        "That's actually really relatable. You're definitely not alone in feeling this way.",
        "Thanks for being real with me. That takes courage."
      ],
      marcus: [
        "I can see you're facing something challenging. Let's work through this.",
        "You're showing real strength by talking about this. What's your next step?",
        "This sounds like an opportunity for growth. How do you want to approach it?",
        "I believe in your ability to handle this. What resources do you have?",
        "You've overcome challenges before. What helped you then?"
      ]
    };

    const responses = fallbackSets[personaId as keyof typeof fallbackSets] || fallbackSets.alex;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    yield {
      content: randomResponse,
      isComplete: true,
      emotion: 'supportive',
      confidence: 0.7,
      memoryUpdates: [],
      fallbackUsed: true
    };
  }
}

export const naturalConversationSystem = new NaturalConversationSystem();