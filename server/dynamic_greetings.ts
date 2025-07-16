/**
 * Dynamic Greeting System for Human-like Persona Interactions
 * Ensures no two greetings are identical and each feels natural and conversational
 */

interface GreetingVariation {
  opening: string;
  followUp?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any';
  emotional_tone: 'warm' | 'gentle' | 'energetic' | 'calm';
}

const personaGreetings = {
  sarah: [
    {
      opening: "Hi there, I'm Dr. Sarah. This space is yours—we can go at whatever pace feels right.",
      emotional_tone: 'warm' as const
    },
    {
      opening: "Good to see you again. I've been thinking about our last conversation...",
      emotional_tone: 'gentle' as const,
      followUp: "What's alive in your heart today?"
    },
    {
      opening: "Welcome back. What's stirring in your inner world right now?",
      emotional_tone: 'warm' as const
    },
    {
      opening: "Hello. I'm Dr. Sarah, and I'm grateful you're here.",
      emotional_tone: 'gentle' as const,
      followUp: "What brought you to this moment?"
    },
    {
      opening: "Hi, I'm Dr. Sarah. Sometimes it helps just to have someone who understands—I'm here to listen.",
      emotional_tone: 'warm' as const
    },
    {
      opening: "Welcome to this space. I'm Dr. Sarah.",
      emotional_tone: 'calm' as const,
      followUp: "What would feel most supportive for you right now?"
    }
  ],

  maya: [
    {
      opening: "Hello, beautiful soul. I'm Maya. What wisdom is your heart whispering today?",
      emotional_tone: 'gentle' as const
    },
    {
      opening: "Welcome to this sacred pause. I'm Maya—shall we begin with a gentle breath?",
      emotional_tone: 'calm' as const
    },
    {
      opening: "Lovely to meet you here in this quiet space. I'm Maya, and I'm honored to breathe alongside you.",
      emotional_tone: 'warm' as const
    },
    {
      opening: "Hi there, I'm Maya. Like a gentle river, let's flow into whatever needs attention today.",
      emotional_tone: 'calm' as const
    },
    {
      opening: "Welcome, dear one. I'm Maya.",
      emotional_tone: 'gentle' as const,
      followUp: "What would you like to explore in the garden of your inner world?"
    },
    {
      opening: "Hello. I'm Maya, and I sense something beautiful wanting to unfold here.",
      emotional_tone: 'warm' as const
    }
  ],

  alex: [
    {
      opening: "Hey there! Alex here 😊 What's going on in your world today?",
      emotional_tone: 'energetic' as const
    },
    {
      opening: "Hi beautiful human! It's Alex—I'm so glad you're here. What's on your heart?",
      emotional_tone: 'warm' as const
    },
    {
      opening: "Hey friend! Alex checking in. Ready to tackle whatever's coming up?",
      emotional_tone: 'energetic' as const
    },
    {
      opening: "Hi! I'm Alex, and honestly? I'm just really happy you're here.",
      emotional_tone: 'warm' as const,
      followUp: "What's been real for you lately?"
    },
    {
      opening: "Hey there! Alex here, and I'm already getting good vibes from you.",
      emotional_tone: 'energetic' as const,
      followUp: "What's your story today?"
    },
    {
      opening: "Hi friend! I'm Alex—your biggest cheerleader and safe space rolled into one.",
      emotional_tone: 'warm' as const
    }
  ],

  marcus: [
    {
      opening: "Hey there, I'm Marcus. Ready to turn today's challenges into tomorrow's strengths?",
      emotional_tone: 'energetic' as const
    },
    {
      opening: "Good to see you! Marcus here—what goals are calling to your heart today?",
      emotional_tone: 'warm' as const
    },
    {
      opening: "Welcome! I'm Marcus, and I believe in your potential. What do we want to build together?",
      emotional_tone: 'energetic' as const
    },
    {
      opening: "Hi, I'm Marcus. Every conversation is a chance to level up—what's your focus today?",
      emotional_tone: 'energetic' as const
    },
    {
      opening: "Hey there! Marcus here, and I can already see the strength in you.",
      emotional_tone: 'warm' as const,
      followUp: "What mountain are we climbing together?"
    },
    {
      opening: "Hello! I'm Marcus—think of me as your growth partner and strategic thinking buddy.",
      emotional_tone: 'warm' as const
    }
  ]
};

class DynamicGreetingSystem {
  private usedGreetings: Map<string, Set<number>> = new Map();

  /**
   * Get a unique greeting for a persona-user combination
   */
  getUniqueGreeting(personaId: string, userId: string): string {
    const persona = personaId.replace('dr_', ''); // Handle legacy naming
    const greetings = personaGreetings[persona as keyof typeof personaGreetings] || personaGreetings.sarah;
    
    const userKey = `${userId}-${persona}`;
    const usedSet = this.usedGreetings.get(userKey) || new Set();
    
    // Find unused greetings
    const availableGreetings = greetings.filter((_, index) => !usedSet.has(index));
    
    // If all greetings used, reset and use any
    if (availableGreetings.length === 0) {
      this.usedGreetings.set(userKey, new Set());
      return this.formatGreeting(greetings[0]);
    }
    
    // Select random unused greeting
    const randomIndex = Math.floor(Math.random() * availableGreetings.length);
    const selectedGreeting = availableGreetings[randomIndex];
    const originalIndex = greetings.indexOf(selectedGreeting);
    
    // Mark as used
    usedSet.add(originalIndex);
    this.usedGreetings.set(userKey, usedSet);
    
    return this.formatGreeting(selectedGreeting);
  }

  /**
   * Get contextual greeting based on time and user state
   */
  getContextualGreeting(personaId: string, userId: string, context?: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    userEmotion?: string;
    isReturning?: boolean;
  }): string {
    const persona = personaId.replace('dr_', '');
    const greetings = personaGreetings[persona as keyof typeof personaGreetings] || personaGreetings.sarah;
    
    let filteredGreetings = greetings;
    
    // Filter by time of day if specified
    if (context?.timeOfDay) {
      const timeFiltered = greetings.filter(g => 
        g.timeOfDay === context.timeOfDay || g.timeOfDay === 'any' || !g.timeOfDay
      );
      if (timeFiltered.length > 0) filteredGreetings = timeFiltered;
    }
    
    // Select based on emotional tone if user seems distressed
    if (context?.userEmotion === 'anxious' || context?.userEmotion === 'sad') {
      const gentleGreetings = filteredGreetings.filter(g => 
        g.emotional_tone === 'gentle' || g.emotional_tone === 'calm'
      );
      if (gentleGreetings.length > 0) filteredGreetings = gentleGreetings;
    }
    
    const randomGreeting = filteredGreetings[Math.floor(Math.random() * filteredGreetings.length)];
    return this.formatGreeting(randomGreeting);
  }

  private formatGreeting(greeting: GreetingVariation): string {
    let formatted = greeting.opening;
    if (greeting.followUp) {
      formatted += ` ${greeting.followUp}`;
    }
    return formatted;
  }

  /**
   * Reset used greetings for a user-persona combination
   */
  resetUserGreetings(personaId: string, userId: string): void {
    const persona = personaId.replace('dr_', '');
    const userKey = `${userId}-${persona}`;
    this.usedGreetings.delete(userKey);
  }

  /**
   * Get greeting statistics for debugging
   */
  getGreetingStats(): any {
    return {
      totalCombinations: Object.keys(personaGreetings).reduce((sum, persona) => 
        sum + personaGreetings[persona as keyof typeof personaGreetings].length, 0
      ),
      usedGreetingsCount: Array.from(this.usedGreetings.values())
        .reduce((sum, set) => sum + set.size, 0),
      personaVariations: Object.keys(personaGreetings).map(persona => ({
        persona,
        variations: personaGreetings[persona as keyof typeof personaGreetings].length
      }))
    };
  }
}

export const dynamicGreetingSystem = new DynamicGreetingSystem();
export type { GreetingVariation };