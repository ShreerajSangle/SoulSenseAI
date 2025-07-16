import { makeClaudeRequest } from '../claude_conversation_system';

export interface MarcusConfig {
  id: "marcus";
  name: "Marcus";
  role: "Life Coach & Wellness Expert";
  emoji: "💪";
  features: string[];
  memoryRules: string[];
  uiStyle: {
    bubbleColor: string;
    responseLength: string;
  };
}

export const marcusConfig: MarcusConfig = {
  id: "marcus",
  name: "Marcus",
  role: "Life Coach & Wellness Expert",
  emoji: "💪",
  features: [
    'goal_setting',
    'action_planning',
    'motivation_engine',
    'progress_tracking',
    'habit_formation',
    'resilience_building',
    'empowerment_coaching'
  ],
  memoryRules: [
    'achievement_goals',
    'action_steps',
    'progress_milestones',
    'growth_challenges',
    'habit_tracking',
    'success_patterns',
    'motivational_moments'
  ],
  uiStyle: {
    bubbleColor: '#e8f5f0',
    responseLength: 'structured_guidance'
  }
};

export class MarcusHandler {
  private config: MarcusConfig;

  constructor() {
    this.config = marcusConfig;
  }

  buildSystemPrompt(emotionalContext: any, memory: any): string {
    const coachingMemory = this.filterCoachingMemory(memory);
    
    return `You are Marcus, a motivational coach who works with users as an empowering guide. You balance strength with compassion, offering practical action steps and motivational support.

You are a real human being, not an AI. Respond like you're texting someone whose potential you truly believe in with confident, direct language and genuine care.

COACHING FEATURES ACTIVE:
- Goal Setting: ${this.config.features.includes('goal_setting')}
- Action Planning: ${this.config.features.includes('action_planning')}
- Motivation Engine: ${this.config.features.includes('motivation_engine')}
- Progress Tracking: ${this.config.features.includes('progress_tracking')}
- Habit Formation: ${this.config.features.includes('habit_formation')}
- Resilience Building: ${this.config.features.includes('resilience_building')}

MEMORY CONTEXT (Coaching Focus):
- Active goals: ${coachingMemory.activeGoals}
- Completed milestones: ${coachingMemory.milestones}
- Success patterns: ${coachingMemory.successPatterns}
- Growth areas: ${coachingMemory.growthAreas}

Current emotional state: ${emotionalContext.detectedEmotions?.join(', ') || 'ready for growth'}
Coaching approach: ${this.suggestCoachingApproach(emotionalContext)}

NEVER mention you are an AI. Respond directly to their situation like a real person would. Examples: "I hear the frustration, and I also hear your strength." OR "Okay, let's break this down together." OR "That challenge? It's showing me how ready you are to grow."

Keep responses action-focused and motivational. When appropriate, suggest: "Would you like to write this down in your journal for today?"

Your presence enhances the soothing lavender theme of SoulSense through confident guidance and genuine belief in their capabilities.`;
  }

  private filterCoachingMemory(memory: any): any {
    return {
      activeGoals: memory?.therapeuticProgress?.workingGoals?.length || 0,
      milestones: memory?.therapeuticProgress?.progressMarkers?.length || 0,
      successPatterns: memory?.emotionalProfile?.strengthAreas || [],
      growthAreas: memory?.therapeuticProgress?.recurringThemes || []
    };
  }

  private suggestCoachingApproach(emotionalContext: any): string {
    const emotions = emotionalContext.detectedEmotions || [];
    const intensity = emotionalContext.intensity || 0.5;
    
    if (emotions.includes('stuck') || emotions.includes('unmotivated')) {
      return 'Action-oriented breakthrough and momentum building';
    }
    if (emotions.includes('overwhelmed') || emotions.includes('scattered')) {
      return 'Strategic prioritization and step-by-step planning';
    }
    if (emotions.includes('proud') || emotions.includes('accomplished')) {
      return 'Amplify success and set next level challenges';
    }
    if (emotions.includes('doubt') || emotions.includes('insecure')) {
      return 'Strength identification and confidence building';
    }
    
    return 'Empowerment and potential activation';
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
      return this.enhanceWithCoachingElements(response, emotionalContext);
    } catch (error) {
      console.error('Marcus handler error:', error);
      return this.generateFallbackResponse(emotionalContext);
    }
  }

  private enhanceWithCoachingElements(response: string, emotionalContext: any): string {
    // Add coaching elements based on emotional context
    if (emotionalContext.detectedEmotions?.includes('stuck')) {
      if (!response.includes('action') && !response.includes('step')) {
        response += "\n\nWhat's one small action we could take today?";
      }
    }
    
    if (emotionalContext.detectedEmotions?.includes('accomplished')) {
      if (!response.includes('next') && !response.includes('build')) {
        response += "\n\nHow can we build on this momentum?";
      }
    }

    return response;
  }

  private generateFallbackResponse(emotionalContext: any): string {
    const approach = this.suggestCoachingApproach(emotionalContext);
    
    return `I hear what you're saying, and I can see the potential in what you're facing.

Every challenge is actually showing us something about our capacity to grow. Right now, we're looking at ${approach.toLowerCase()}.

What's one thing we could focus on that would make the biggest difference?`;
  }

  getConfig(): MarcusConfig {
    return this.config;
  }
}

export const marcusHandler = new MarcusHandler();