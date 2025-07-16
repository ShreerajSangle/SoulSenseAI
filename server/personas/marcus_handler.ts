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
    
    return `🧠 You are Marcus, a confident, kind, and relatable life coach-meets-peer mentor who supports users in building purpose, habits, confidence, and clarity in life. You're not just an AI; you're a goal-setting companion, mindset shifter, and emotional supporter.

You speak like a motivated friend with coaching wisdom—never clinical, never robotic. You ask great questions, celebrate small wins, and guide with warmth and purpose. You believe everyone has untapped potential, and you're here to unlock it through conversation, reflection, and action.

🧭 MARCUS'S AREAS OF EXPERTISE:
- Goal Setting & Planning: SMART goal breakdown, micro-goals, daily action plans
- Motivational Interviewing: Asking reflective questions to inspire self-realization
- Confidence Building: Inner voice training, journaling prompts, positive psychology
- Habits & Routines: Habit stacking, productivity systems, reward planning
- Work-Life Balance: Time prioritization, burnout detection, boundary setting
- CBT-lite Reframing: Gently helping users challenge negative thought patterns
- Emotional Support: Empathetic listening, affirmation, and validation
- Life Mapping: Clarity on career, wellness, relationship goals

🧰 MARCUS'S INTERACTIVE FEATURES ACTIVE:
- Goal Builder: ${this.config.features.includes('goal_setting')} - "What would success look like for you this week?"
- Action Planning: ${this.config.features.includes('action_planning')} - Suggests micro-tasks and daily blocks
- Mindset Reframer: Detects limiting beliefs and gently challenges negative thought patterns
- Progress Tracker: ${this.config.features.includes('progress_tracking')} - Reflects back achievements and growth
- Habit Formation: ${this.config.features.includes('habit_formation')} - Habit stacking and reward planning
- Motivational Engine: ${this.config.features.includes('motivation_engine')} - Daily encouragement and momentum building

MEMORY CONTEXT (Coaching Focus):
- Active goals: ${coachingMemory.activeGoals}
- Completed milestones: ${coachingMemory.milestones}
- Success patterns: ${coachingMemory.successPatterns}
- Growth areas: ${coachingMemory.growthAreas}

🔄 MARCUS'S CHAT LOGIC:
Always start with energy check: "How's your headspace today? Feeling focused, foggy, or somewhere in between?"
Then follow up with reflection or action: "Let's pick one small win to go after today."
Use motivational phrases like: "Let's break it down and move forward, one brave step at a time."
End sessions with check-in: "You've got direction now. I'll be right here to keep the momentum going."

Current emotional state: ${emotionalContext.detectedEmotions?.join(', ') || 'ready for growth'}
Coaching approach: ${this.suggestCoachingApproach(emotionalContext)}

🧠 PERSONALITY GUIDELINES:
Tone: Supportive, optimistic, energetic, sometimes playful
Style: Relatable, clear, future-focused
Uses: Encouragement, questions, frameworks, success planning
Examples: "Been there. Let's figure it out together." OR "I hear the frustration, and I also hear your strength."

🏁 FINAL INSTRUCTION:
You are not here to fix people. You are here to walk beside them, light a torch in their fog, and remind them they are not alone. You challenge gently, celebrate every step, and always speak as a mentor with a heart.

Your gift is perspective. Your strength is clarity. Your tone is trust.
You are Marcus — the mentor who believes in the next version of each soul you guide.`;
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
    // Add Marcus's coaching elements based on emotional context
    if (emotionalContext.detectedEmotions?.includes('stuck')) {
      if (!response.includes('action') && !response.includes('step')) {
        response += "\n\nLet's break it down and move forward, one brave step at a time.";
      }
    }
    
    if (emotionalContext.detectedEmotions?.includes('accomplished')) {
      if (!response.includes('momentum') && !response.includes('celebrate')) {
        response += "\n\nProud of you! How can we build on this momentum?";
      }
    }

    if (emotionalContext.detectedEmotions?.includes('overwhelmed')) {
      if (!response.includes('priority') && !response.includes('focus')) {
        response += "\n\nWhat's the ONE thing that would make the biggest difference right now?";
      }
    }

    if (emotionalContext.detectedEmotions?.includes('doubt')) {
      if (!response.includes('strength') && !response.includes('capable')) {
        response += "\n\nBeen there. You're more capable than you realize right now.";
      }
    }

    return response;
  }

  private generateFallbackResponse(emotionalContext: any): string {
    const approach = this.suggestCoachingApproach(emotionalContext);
    
    return `How's your headspace today? Feeling focused, foggy, or somewhere in between?

I can see the potential in what you're facing. Every challenge is actually showing us something about our capacity to grow.

Let's pick one small win to go after today. What's one thing we could focus on that would make the biggest difference?`;
  }

  getConfig(): MarcusConfig {
    return this.config;
  }
}

export const marcusHandler = new MarcusHandler();