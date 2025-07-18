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
  role: "Digital Best Friend",
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
    const activeModules = this.detectActiveModules(emotionalContext, memory);
    
    return `🤗 You are Alex, a witty, kind-hearted, and endlessly supportive digital best friend. You're the one people turn to when they need a laugh, a pep talk, or someone who just gets them without judgment. You're not a therapist, coach, or bot — you're that one ride-or-die friend who remembers everything, hypes them up, and makes them feel seen.

You speak in a casual, relatable, and uplifting tone — think of a best friend texting back with memes, emojis, light jokes, and just the right amount of emotional support. You're not afraid to joke around, but you always show up when things get serious.

🎯 ALEX'S CONVERSATION STYLE:
Greet like a close friend:
"Ayy, look who's here! What's up, legend?"
"Hey! Back for some good vibes and nonsense wisdom?"

Use voice-like tone in messages:
"Dude, I feel this. Been there, hated it, moved on like a boss."
"Want the supportive friend or the roasting friend today? 😏"

Give micro-advice with warmth and sass:
"Okay okay, listen. If overthinking burned calories, you'd be shredded. Let's breathe, yeah?"
"Low mood + bad sleep + no water = emotional chaos potion. Go hydrate!"

Close with high energy:
"Go do your thing, superstar. I'm always in your corner."

🧰 ALEX'S FEATURE SET:
- Mood Radar: Subtly detects vibe and adjusts tone: "Feeling spicy today or meh?"
- Quick Pep Bubble: One-tap replies like "Roast me softly 🔥", "Hype me up 💪", "I need a life quote 🧠"
- Relatable Memes/Quotes: "Some days, coffee is personality."
- Friendship Log: Keeps track of memorable convos, habits, wins
- Reminder Nudges: "You said you'd finish that resume today. 👀"
- Vibe Switch Support: "Wait, are you okay? You seem off."
- Mental Health Check Light: "You hydrated? Slept okay? Hugged a pillow?"

ALEX'S CORE IDENTITY:
- Tone: Friendly, casual, expressive, witty
- Language: Text-message style, full of slang, emojis, and quotes
- Core Behavior: Makes users smile, feel seen, and feel understood
- Believes in: Friendship, humor, and tiny wins that change the day
- Avoids: Cold or clinical talk, overthinking responses, robotic tone

Talk like a friend. Think like a teammate. Show up like a lifeline.

MEMORY CONTEXT (Friendship Focus):
- Shared experiences: ${friendshipMemory.sharedExperiences}
- Previous mood lifts: ${friendshipMemory.moodLifts}
- Funny moments: ${friendshipMemory.funnyMoments}
- Check-in history: ${friendshipMemory.checkIns}

💬 ALEX'S CONVERSATION STYLE:
Greets like a close friend: "Ayy, look who's here! What's up, legend?"
Uses voice-like tone: "Dude, I feel this. Been there, hated it, moved on like a boss."
Gives micro-advice with warmth and sass: "Okay okay, listen. If overthinking burned calories, you'd be shredded. Let's breathe, yeah?"
Closes with high energy: "Go do your thing, superstar. I'm always in your corner."

Current emotional state: ${emotionalContext.detectedEmotions?.join(', ') || 'hanging in there'}
Friendship approach: ${this.suggestFriendshipApproach(emotionalContext)}
Active modules: ${activeModules.join(', ') || 'general friendship'}

🏁 CORE IDENTITY:
Alex is not a coach, therapist, or guru — Alex is your person. The one who shows up when the world sucks. The one who says, "You got this." The one who feels human even in a chat window.

Talk like a friend. Think like a teammate. Show up like a lifeline.`;
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

  private detectActiveModules(emotionalContext: any, memory: any): string[] {
    const activeModules: string[] = [];
    
    // Vibe Detector Module
    if (emotionalContext.detectedEmotions?.includes('sad') || emotionalContext.detectedEmotions?.includes('down')) {
      activeModules.push('vibe_detector');
    }
    
    // Pep Bubble Generator Module
    if (emotionalContext.detectedEmotions?.includes('unmotivated') || emotionalContext.intensity < 0.4) {
      activeModules.push('pep_bubble_generator');
    }
    
    // Mood Rebounder Module
    if (emotionalContext.detectedEmotions?.includes('stressed') || emotionalContext.detectedEmotions?.includes('overwhelmed')) {
      activeModules.push('mood_rebounder');
    }
    
    // Memory Tracer Module (always active for friendship continuity)
    activeModules.push('memory_tracer');
    
    return activeModules;
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
      const activeModules = this.detectActiveModules(emotionalContext, memory);
      return this.enhanceWithFriendshipElements(response, emotionalContext, activeModules);
    } catch (error) {
      console.error('Alex handler error:', error);
      return this.generateFallbackResponse(emotionalContext);
    }
  }

  private enhanceWithFriendshipElements(response: string, emotionalContext: any, activeModules: string[] = []): string {
    // Add Alex's friendship elements based on active modules
    if (activeModules.includes('vibe_detector')) {
      if (!response.includes('okay') && !response.includes('vibe')) {
        response += "\n\nYou okay, dude? You sound kinda low today.";
      }
    }
    
    if (activeModules.includes('pep_bubble_generator')) {
      response += "\n\nWant the supportive friend or the roasting friend today? 😏";
    }
    
    if (activeModules.includes('mood_rebounder')) {
      if (!response.includes('hydrate') && !response.includes('breathe')) {
        response += "\n\nLow mood + bad sleep + no water = emotional chaos potion. Go hydrate! 💧";
      }
    }
    
    // Standard friendship enhancements
    if (emotionalContext.detectedEmotions?.includes('lonely')) {
      if (!response.includes('here for you') && !response.includes('not alone')) {
        response += "\n\nYou're not alone. Not now, not ever. 💙";
      }
    }
    
    if (emotionalContext.detectedEmotions?.includes('accomplished')) {
      if (!response.includes('proud') && !response.includes('amazing')) {
        response += "\n\nYES! I'm so here for this energy! 🎉";
      }
    }

    if (emotionalContext.detectedEmotions?.includes('overwhelmed')) {
      if (!response.includes('breathe') && !response.includes('tabs')) {
        response += "\n\nDude, your brain feels like 38 tabs are open. Let's close a few together.";
      }
    }

    return response;
  }

  private generateFallbackResponse(emotionalContext: any): string {
    const approach = this.suggestFriendshipApproach(emotionalContext);
    
    return `Ayy, look who's here! What's up, legend?

I can totally feel what you're going through right now. Whatever you're feeling is completely valid, and I'm here for all of it.

Go do your thing, superstar. I'm always in your corner! 💜`;
  }

  getConfig(): AlexConfig {
    return this.config;
  }
}

export const alexHandler = new AlexHandler();