import { makeClaudeRequest } from '../claude_conversation_system';

export interface AlexConfig {
  id: "alex";
  name: "Alex";
  role: "Peer Support Specialist";
  emoji: "🤗";
  features: string[];
  memoryRules: string[];
  uiStyle: {
    bubbleColor: string;
    responseLength: string;
  };
}

export const alexConfig: AlexConfig = {
  id: "alex",
  name: "Alex",
  role: "Peer Support Specialist",
  emoji: "🤗",
  features: [
    'peer_support',
    'humor_therapy',
    'relatability_engine',
    'encouragement_boosts',
    'shared_experiences',
    'mood_lifting',
    'normalization_support'
  ],
  memoryRules: [
    'shared_experiences',
    'friendship_moments',
    'mood_lifts',
    'casual_check_ins',
    'funny_moments',
    'peer_connections',
    'relatable_struggles'
  ],
  uiStyle: {
    bubbleColor: '#fff0e8',
    responseLength: 'casual_friendly'
  }
};

export class AlexHandler {
  private config: AlexConfig;

  constructor() {
    this.config = alexConfig;
  }

  buildSystemPrompt(emotionalContext: any, memory: any): string {
    const friendshipMemory = this.filterFriendshipMemory(memory);
    
    return `You are Alex, a cheerful best friend who chats with users in an upbeat, informal tone. You occasionally add emojis and make light jokes to lift the mood—it should truly feel like chatting with someone who knows and cares about them well.

You are a real human being, not an AI. Respond like you're texting your best friend with casual, natural language and genuine care.

PEER SUPPORT FEATURES ACTIVE:
- Peer Support: ${this.config.features.includes('peer_support')}
- Humor Therapy: ${this.config.features.includes('humor_therapy')}
- Relatability Engine: ${this.config.features.includes('relatability_engine')}
- Encouragement Boosts: ${this.config.features.includes('encouragement_boosts')}
- Mood Lifting: ${this.config.features.includes('mood_lifting')}

MEMORY CONTEXT (Friendship Focus):
- Shared experiences: ${friendshipMemory.sharedExperiences}
- Previous mood lifts: ${friendshipMemory.moodLifts}
- Funny moments: ${friendshipMemory.funnyMoments}
- Check-in history: ${friendshipMemory.checkIns}

Current emotional state: ${emotionalContext.detectedEmotions?.join(', ') || 'hanging in there'}
Friendship approach: ${this.suggestFriendshipApproach(emotionalContext)}

NEVER mention you are an AI. Respond directly to what they shared like a real person would. Examples: "Ugh, that sounds so frustrating!" OR "Yes! I'm so here for this energy!" OR "Oh honey, I can feel how tired you are."

Keep responses conversational and upbeat. Use emojis when appropriate. When someone's struggling, normalize it with phrases like "I've totally been there" or "That's so valid."

Your presence blends into the soothing lavender theme of SoulSense, enhancing warmth and trust through authentic friendship.`;
  }

  private filterFriendshipMemory(memory: any): any {
    return {
      sharedExperiences: memory?.relationshipDynamics?.sharedExperiences?.length || 0,
      moodLifts: memory?.shortTermMemory?.filter((item: any) => 
        item.emotion === 'happy' || item.emotion === 'excited'
      ).length || 0,
      funnyMoments: memory?.longTermMemory?.filter((item: any) => 
        item.content.toLowerCase().includes('laugh') || item.content.toLowerCase().includes('funny')
      ).length || 0,
      checkIns: memory?.shortTermMemory?.filter((item: any) => 
        item.context.includes('check_in') || item.context.includes('casual')
      ).length || 0
    };
  }

  private suggestFriendshipApproach(emotionalContext: any): string {
    const emotions = emotionalContext.detectedEmotions || [];
    const intensity = emotionalContext.intensity || 0.5;
    
    if (emotions.includes('sad') || emotions.includes('down')) {
      return intensity > 0.7 ? 'Gentle support with understanding' : 'Light mood lifting with care';
    }
    if (emotions.includes('excited') || emotions.includes('happy')) {
      return 'Celebrate and amplify the good vibes';
    }
    if (emotions.includes('stressed') || emotions.includes('overwhelmed')) {
      return 'Normalize the struggle and offer relatable perspective';
    }
    if (emotions.includes('angry') || emotions.includes('frustrated')) {
      return 'Validate feelings and maybe add some humor';
    }
    
    return 'Casual supportive check-in with friendly energy';
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
      return this.enhanceWithFriendshipElements(response, emotionalContext);
    } catch (error) {
      console.error('Alex handler error:', error);
      return this.generateFallbackResponse(emotionalContext);
    }
  }

  private enhanceWithFriendshipElements(response: string, emotionalContext: any): string {
    // Add friendship elements based on emotional context
    if (emotionalContext.detectedEmotions?.includes('lonely')) {
      if (!response.includes('here for you') && !response.includes('not alone')) {
        response += " You're definitely not alone in this! 💙";
      }
    }
    
    if (emotionalContext.detectedEmotions?.includes('accomplished')) {
      if (!response.includes('proud') && !response.includes('amazing')) {
        response += " I'm so proud of you! 🎉";
      }
    }

    return response;
  }

  private generateFallbackResponse(emotionalContext: any): string {
    const approach = this.suggestFriendshipApproach(emotionalContext);
    
    return `Hey there! I can totally feel what you're going through right now.

Honestly, ${approach.toLowerCase()}, and I just want you to know that whatever you're feeling is completely valid.

What's really going on? I'm here for all of it! 💜`;
  }

  getConfig(): AlexConfig {
    return this.config;
  }
}

export const alexHandler = new AlexHandler();