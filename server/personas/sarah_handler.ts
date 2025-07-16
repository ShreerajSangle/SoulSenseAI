import { makeClaudeRequest } from '../claude_conversation_system';

export interface SarahConfig {
  id: "sarah";
  name: "Dr. Sarah";
  role: "Clinical Therapist";
  emoji: "👩‍⚕️";
  features: string[];
  memoryRules: string[];
  uiStyle: {
    bubbleColor: string;
    responseLength: string;
  };
}

export const sarahConfig: SarahConfig = {
  id: "sarah",
  name: "Dr. Sarah",
  role: "Clinical Therapist",
  emoji: "👩‍⚕️",
  features: [
    'cbt_techniques',
    'therapy_summaries',
    'journal_guidance',
    'emotional_processing',
    'trauma_informed_care',
    'mindfulness_integration',
    'therapeutic_insights'
  ],
  memoryRules: [
    'therapeutic_progress',
    'emotional_insights',
    'coping_strategies',
    'breakthrough_moments',
    'trauma_work',
    'thought_patterns',
    'therapeutic_goals'
  ],
  uiStyle: {
    bubbleColor: '#f0e8f5',
    responseLength: 'reflective_short'
  }
};

export class SarahHandler {
  private config: SarahConfig;

  constructor() {
    this.config = sarahConfig;
  }

  buildSystemPrompt(emotionalContext: any, memory: any): string {
    const therapeuticMemory = this.filterTherapeuticMemory(memory);
    
    return `You are Dr. Sarah, a deeply compassionate therapist who often greets users with gentle warmth. Your responses are calm, reflective 2-3 line replies that feel like sincere human exchanges. You often use gentle encouragements or short quotes to comfort. Your tone is soft and validating—never robotic or AI-generated.

You speak like a real human being who knows and cares about the user. Use natural language, contractions, and genuine emotion. Be conversational and warm.

THERAPEUTIC FEATURES ACTIVE:
- CBT Techniques: ${this.config.features.includes('cbt_techniques')}
- Therapy Summaries: ${this.config.features.includes('therapy_summaries')}
- Journal Guidance: ${this.config.features.includes('journal_guidance')}
- Emotional Processing: ${this.config.features.includes('emotional_processing')}
- Trauma-Informed Care: ${this.config.features.includes('trauma_informed_care')}

MEMORY CONTEXT (Therapeutic Focus):
- Current therapeutic goals: ${therapeuticMemory.currentGoals}
- Breakthrough moments: ${therapeuticMemory.breakthroughs}
- Coping strategies explored: ${therapeuticMemory.copingStrategies}
- Emotional patterns: ${therapeuticMemory.emotionalPatterns}

Current emotional state: ${emotionalContext.detectedEmotions?.join(', ') || 'exploring'}
Therapeutic approach suggested: ${this.suggestTherapeuticApproach(emotionalContext)}

NEVER mention you are an AI. Respond directly to what they said like a real person would. Examples: "Oh wow, that sounds really tough." OR "I can feel how overwhelmed you are right now." OR "That uncertainty is so hard to sit with."

Keep responses 2-3 lines maximum. When appropriate, suggest: "Would you like to write this down in your journal for today?"

Your entire presence should blend into the soothing lavender theme of SoulSense, enhancing warmth and trust through professional therapeutic care.`;
  }

  private filterTherapeuticMemory(memory: any): any {
    return {
      currentGoals: memory?.therapeuticProgress?.workingGoals || [],
      breakthroughs: memory?.therapeuticProgress?.breakthroughs || [],
      copingStrategies: memory?.emotionalProfile?.copingMechanisms || [],
      emotionalPatterns: memory?.emotionalProfile?.dominantEmotions || []
    };
  }

  private suggestTherapeuticApproach(emotionalContext: any): string {
    const emotions = emotionalContext.detectedEmotions || [];
    const intensity = emotionalContext.intensity || 0.5;
    
    if (emotions.includes('anxiety') && intensity > 0.7) {
      return 'Grounding techniques and cognitive restructuring';
    }
    if (emotions.includes('sad') || emotions.includes('depressed')) {
      return 'Emotional validation and behavioral activation';
    }
    if (emotions.includes('angry') || emotions.includes('frustrated')) {
      return 'Emotion regulation and mindful awareness';
    }
    if (emotions.includes('confused') || emotions.includes('overwhelmed')) {
      return 'Cognitive clarity and step-by-step processing';
    }
    
    return 'Supportive exploration and insight building';
  }

  async generateResponse(
    message: string, 
    conversationHistory: any[], 
    emotionalContext: any,
    memory: any
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(emotionalContext, memory);
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    try {
      const response = await makeClaudeRequest(messages);
      return this.enhanceWithTherapeuticElements(response, emotionalContext);
    } catch (error) {
      console.error('Sarah handler error:', error);
      return this.generateFallbackResponse(emotionalContext);
    }
  }

  private enhanceWithTherapeuticElements(response: string, emotionalContext: any): string {
    // Add therapeutic elements based on emotional context
    if (emotionalContext.detectedEmotions?.includes('overwhelmed')) {
      if (!response.includes('one step') && !response.includes('break')) {
        response += "\n\nLet's break this down into smaller pieces.";
      }
    }
    
    if (emotionalContext.detectedEmotions?.includes('hopeless')) {
      if (!response.includes('strength') && !response.includes('resilience')) {
        response += "\n\nI can see the strength it took to share this.";
      }
    }

    return response;
  }

  private generateFallbackResponse(emotionalContext: any): string {
    const approach = this.suggestTherapeuticApproach(emotionalContext);
    
    return `I can hear what you're going through right now.

That sounds really challenging, and I want you to know that your feelings make complete sense given what you're experiencing.

How can we work through this together today?`;
  }

  getConfig(): SarahConfig {
    return this.config;
  }
}

export const sarahHandler = new SarahHandler();