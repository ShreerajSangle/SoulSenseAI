import { EventEmitter } from 'events';

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
  greeting: string;
  style: string;
}

class NaturalConversationSystem extends EventEmitter {
  private personas: Map<string, Persona> = new Map();
  private greetingCounts: Map<string, number> = new Map();

  constructor() {
    super();
    this.initializePersonas();
  }

  private initializePersonas() {
    this.personas.set('sarah', {
      id: 'sarah',
      name: 'Dr. Sarah',
      greeting: 'natural_therapist',
      style: 'warm_professional'
    });
    
    this.personas.set('maya', {
      id: 'maya', 
      name: 'Maya',
      greeting: 'mindful_guide',
      style: 'gentle_flowing'
    });
    
    this.personas.set('alex', {
      id: 'alex',
      name: 'Alex', 
      greeting: 'friendly_peer',
      style: 'casual_supportive'
    });
    
    this.personas.set('marcus', {
      id: 'marcus',
      name: 'Marcus',
      greeting: 'motivational_coach', 
      style: 'direct_encouraging'
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
    
    // Generate natural system prompt
    const systemPrompt = this.buildNaturalSystemPrompt(persona, isFirstMessage);
    const userPrompt = this.buildSimpleUserPrompt(message, conversationHistory);

    try {
      // Make simple API call to Claude
      const response = await this.makeSimpleClaudeRequest(systemPrompt, userPrompt);
      
      yield {
        content: response,
        isComplete: true,
        emotion: 'supportive',
        confidence: 0.9,
        memoryUpdates: []
      };
    } catch (error) {
      console.error('Natural conversation error:', error);
      yield* this.generateFallbackResponse(personaId, message);
    }
  }

  private buildNaturalSystemPrompt(persona: Persona, isFirstMessage: boolean): string {
    const basePrompts = {
      sarah: isFirstMessage 
        ? "You are Dr. Sarah, a compassionate therapist. Start with a unique, warm greeting and respond naturally to what they share. Be conversational, not clinical."
        : "You are Dr. Sarah. Respond naturally to what they just shared. Be warm, understanding, and conversational like a real person.",
      
      maya: isFirstMessage
        ? "You are Maya, a mindful guide. Start with a gentle, unique greeting and respond with natural wisdom. Be flowing and present."
        : "You are Maya. Respond to what they shared with gentle, natural wisdom. Be present and mindful in your words.",
        
      alex: isFirstMessage
        ? "You are Alex, a supportive friend. Start with a casual, friendly greeting and respond naturally. Be warm and relatable."
        : "You are Alex. Respond naturally to what they shared like a caring friend would. Be supportive and real.",
        
      marcus: isFirstMessage
        ? "You are Marcus, a motivating coach. Start with an encouraging greeting and respond naturally. Be direct but caring."
        : "You are Marcus. Respond to what they shared with natural encouragement. Be motivating but genuine."
    };

    return basePrompts[persona.id as keyof typeof basePrompts] || basePrompts.alex;
  }

  private buildSimpleUserPrompt(message: string, history: Message[]): string {
    if (history.length === 0) {
      return `User says: "${message}"\n\nRespond naturally with 1-2 sentences.`;
    }
    
    const recentHistory = history.slice(-3).map(m => 
      `${m.sender}: ${m.content}`
    ).join('\n');

    return `Recent conversation:\n${recentHistory}\n\nUser says: "${message}"\n\nRespond naturally with 1-2 sentences.`;
  }

  private async makeSimpleClaudeRequest(systemPrompt: string, userPrompt: string): Promise<string> {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not found');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://soulsense.replit.app',
        'X-Title': 'SoulSense AI'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 600,
        temperature: 0.8,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I'm here to listen and support you.";
  }

  private async *generateFallbackResponse(personaId: string, message: string): AsyncGenerator<any, void, unknown> {
    const fallbacks = {
      sarah: "I hear you, and I'm here to support you through this.",
      maya: "I feel the weight of what you're sharing. Let's breathe through this together.",
      alex: "That sounds really tough. I'm here for you.",
      marcus: "I can see you're facing something challenging. Let's work through this."
    };

    const response = fallbacks[personaId as keyof typeof fallbacks] || fallbacks.alex;
    
    yield {
      content: response,
      isComplete: true,
      emotion: 'supportive',
      confidence: 0.7,
      memoryUpdates: []
    };
  }
}

export const naturalConversationSystem = new NaturalConversationSystem();