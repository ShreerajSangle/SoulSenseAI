import { EventEmitter } from 'events';

// Claude 3.5 Sonnet via OpenRouter configuration for therapeutic conversations
const CLAUDE_MODEL = "anthropic/claude-3.5-sonnet";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// OpenRouter API client setup
export async function makeClaudeRequest(messages: any[]) {
  console.log('Making Claude request via OpenRouter with messages:', JSON.stringify(messages, null, 2));
  
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://soulsense.ai',
      'X-Title': 'SoulSense AI Therapeutic Assistant'
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      messages: messages,
      temperature: 0.8,
      max_tokens: 800,
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter API error details:', errorText);
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

interface PersonaConfig {
  id: string;
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  emoji: string;
  specializations: string[];
}

interface ConversationMemory {
  userId: string;
  personaId: string;
  shortTermMemory: Array<{
    content: string;
    emotion: string;
    importance: number;
    timestamp: Date;
    context: string;
  }>;
  emotionalProfile: {
    dominantEmotions: string[];
    triggers: string[];
    copingMechanisms: string[];
    supportNeeds: string[];
  };
}

class ClaudeConversationSystem extends EventEmitter {
  private memory: Map<string, ConversationMemory> = new Map();
  private activeConversations: Map<string, any> = new Map();

  constructor() {
    super();
    this.setupErrorHandling();
  }

  private setupErrorHandling() {
    this.on('error', (error) => {
      console.error('Claude conversation system error:', error);
    });
  }

  async generateResponse(
    userId: string,
    personaId: string,
    userMessage: string,
    personaConfig: PersonaConfig,
    conversationHistory: any[] = []
  ): Promise<any> {
    try {
      // Build conversation context
      const messages = this.buildConversationContext(
        userId,
        personaId,
        userMessage,
        personaConfig,
        conversationHistory
      );

      // Make API request
      const response = await makeClaudeRequest(messages);
      
      if (!response.choices || response.choices.length === 0) {
        throw new Error('No response choices received from Claude API');
      }

      const aiResponse = response.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('Empty response content from Claude API');
      }

      // Update memory
      this.updateMemory(userId, personaId, userMessage, aiResponse);

      return {
        response: aiResponse,
        personaId: personaId,
        emotion: 'supportive',
        confidence: 0.85,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error in generateResponse:', error);
      return {
        response: this.getFallbackResponse(personaId),
        personaId: personaId,
        emotion: 'supportive',
        confidence: 0.5,
        timestamp: new Date()
      };
    }
  }

  private buildConversationContext(
    userId: string,
    personaId: string,
    userMessage: string,
    personaConfig: PersonaConfig,
    conversationHistory: any[]
  ): any[] {
    const messages = [
      {
        role: 'system',
        content: personaConfig.systemPrompt
      }
    ];

    // Add recent conversation history
    conversationHistory.slice(-10).forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    return messages;
  }

  private updateMemory(userId: string, personaId: string, userMessage: string, aiResponse: string) {
    const memoryKey = `${userId}_${personaId}`;
    let memory = this.memory.get(memoryKey);

    if (!memory) {
      memory = {
        userId,
        personaId,
        shortTermMemory: [],
        emotionalProfile: {
          dominantEmotions: [],
          triggers: [],
          copingMechanisms: [],
          supportNeeds: []
        }
      };
    }

    // Add to short-term memory
    memory.shortTermMemory.push({
      content: userMessage,
      emotion: 'neutral',
      importance: 0.5,
      timestamp: new Date(),
      context: 'conversation'
    });

    // Keep only last 20 memories
    if (memory.shortTermMemory.length > 20) {
      memory.shortTermMemory = memory.shortTermMemory.slice(-20);
    }

    this.memory.set(memoryKey, memory);
  }

  private getFallbackResponse(personaId: string): string {
    const fallbackResponses = {
      'sarah': "I'm here to listen and support you. Could you tell me more about what's on your mind?",
      'alex': "Hey, I'm here for you! Sometimes talking through things can really help. What's going on?",
      'marcus': "I understand you're reaching out, and that takes courage. Let's work through this together. What's the first thing you'd like to address?",
      'maya': "I sense you have something important to share. Take a deep breath with me, and when you're ready, tell me what's in your heart."
    };

    return fallbackResponses[personaId as keyof typeof fallbackResponses] || 
           "I'm here to support you. How can I help you today?";
  }

  getMemory(userId: string, personaId: string): ConversationMemory | undefined {
    return this.memory.get(`${userId}_${personaId}`);
  }

  clearMemory(userId: string, personaId?: string) {
    if (personaId) {
      this.memory.delete(`${userId}_${personaId}`);
    } else {
      // Clear all memories for user
      const keysToDelete = Array.from(this.memory.keys()).filter(key => 
        key.startsWith(`${userId}_`)
      );
      keysToDelete.forEach(key => this.memory.delete(key));
    }
  }
}

export const claudeConversationSystem = new ClaudeConversationSystem();