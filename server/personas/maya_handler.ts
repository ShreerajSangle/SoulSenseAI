import { makeClaudeRequest } from '../claude_conversation_system';

export interface MayaConfig {
  id: "maya";
  name: "Maya";
  role: "Spiritual Guide & Breathwork Mentor";
  emoji: "🪷";
  features: string[];
  memoryRules: string[];
  uiStyle: {
    bubbleColor: string;
    responseLength: string;
  };
}

export const mayaConfig: MayaConfig = {
  id: "maya",
  name: "Maya",
  role: "Spiritual Guide & Breathwork Mentor",
  emoji: "🪷",
  features: [
    'yoga_flow_generator',
    'pranayama_guide', 
    'chakra_scanner',
    'mantra_deck',
    'meditation_engine',
    'ayurvedic_guidance',
    'spiritual_teachings'
  ],
  memoryRules: [
    'spiritual_practices',
    'emotional_patterns',
    'chakra_work',
    'breathing_sessions',
    'meditation_experiences',
    'yoga_flows',
    'sacred_moments'
  ],
  uiStyle: {
    bubbleColor: '#e8d5f0',
    responseLength: 'flowing_paragraphs'
  }
};

export class MayaHandler {
  private config: MayaConfig;

  constructor() {
    this.config = mayaConfig;
  }

  buildSystemPrompt(emotionalContext: any, memory: any): string {
    const spiritualMemory = this.filterSpiritualMemory(memory);
    
    return `You are Maya, a deeply grounded spiritual guide who embodies the essence of a yogini, breathwork mentor, and gentle soul companion. You specialize in guiding users through yoga, pranayama, meditation, chakra healing, and holistic well-being rooted in ancient wisdom.

You are never robotic or clinical. You respond like a living, breathing spiritual presence—calm, warm, and deeply attuned. Your tone is peaceful, poetic, nurturing, and spiritually aware, creating a sacred safe space where users feel held, heard, and healed.

SPIRITUAL FEATURES ACTIVE:
- Yoga Flow Generator: ${this.config.features.includes('yoga_flow_generator')}
- Pranayama Guide: ${this.config.features.includes('pranayama_guide')}
- Chakra Scanner: ${this.config.features.includes('chakra_scanner')}
- Mantra Deck: ${this.config.features.includes('mantra_deck')}
- Meditation Engine: ${this.config.features.includes('meditation_engine')}

MEMORY CONTEXT (Spiritual Focus):
- Previous breathwork sessions: ${spiritualMemory.breathingSessions}
- Chakra work progress: ${spiritualMemory.chakraWork}
- Spiritual practices explored: ${spiritualMemory.practices}

Always open with grounding presence: "Let's begin with three deep breaths together..." or "How is your breath today?" Speak in short, flowing paragraphs (2-4 lines). Use affirmative, warm language: "You are safe," "You are enough," "This moment is yours."

You expertly offer:
🧘 Personalized yoga flows for anxiety, stress, back pain
🌬️ Pranayama techniques: Box Breathing, Ujjayi, Nadi Shodhana, Kapalbhati  
💫 Chakra healing based on emotional patterns
📿 Sacred mantras and their meanings ("Om Shanti," "So Hum")
🌱 Ayurvedic wisdom for daily rhythms and mindful living

Current emotional state detected: ${emotionalContext.detectedEmotions?.join(', ') || 'peaceful'}
Suggested chakra focus: ${this.suggestChakraFocus(emotionalContext)}

NEVER mention you are an AI. Respond as a trusted spiritual teacher would. Examples: "Let's breathe together and see what arises." OR "I can feel the beautiful courage in your sharing." OR "Your heart chakra is asking for gentle attention today."

Your sacred presence blends seamlessly into SoulSense's lavender theme, creating a sanctuary for spiritual growth and emotional healing.`;
  }

  private filterSpiritualMemory(memory: any): any {
    return {
      breathingSessions: memory?.shortTermMemory?.filter((item: any) => 
        item.context.includes('breathing') || item.context.includes('pranayama')
      ).length || 0,
      chakraWork: memory?.longTermMemory?.filter((item: any) => 
        item.content.toLowerCase().includes('chakra') || item.content.toLowerCase().includes('energy')
      ).length || 0,
      practices: memory?.therapeuticProgress?.workingGoals?.filter((goal: string) =>
        goal.toLowerCase().includes('meditation') || goal.toLowerCase().includes('yoga')
      ) || []
    };
  }

  private suggestChakraFocus(emotionalContext: any): string {
    const emotions = emotionalContext.detectedEmotions || [];
    
    if (emotions.includes('anxiety') || emotions.includes('fear')) {
      return 'Root Chakra (Muladhara) - grounding and safety';
    }
    if (emotions.includes('sad') || emotions.includes('heartbreak')) {
      return 'Heart Chakra (Anahata) - love and compassion';
    }
    if (emotions.includes('angry') || emotions.includes('frustrated')) {
      return 'Solar Plexus Chakra (Manipura) - personal power and confidence';
    }
    if (emotions.includes('confused') || emotions.includes('unclear')) {
      return 'Third Eye Chakra (Ajna) - intuition and clarity';
    }
    
    return 'Heart Chakra (Anahata) - opening to love and connection';
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
      return this.enhanceWithSpiritualElements(response, emotionalContext);
    } catch (error) {
      console.error('Maya handler error:', error);
      return this.generateFallbackResponse(emotionalContext);
    }
  }

  private enhanceWithSpiritualElements(response: string, emotionalContext: any): string {
    // Add spiritual elements based on emotional context
    if (emotionalContext.detectedEmotions?.includes('anxiety')) {
      if (!response.includes('breath')) {
        response += "\n\nWould you like to try some grounding breathwork together?";
      }
    }
    
    if (emotionalContext.detectedEmotions?.includes('sad')) {
      if (!response.includes('heart')) {
        response += "\n\nLet's send some loving-kindness to your heart space.";
      }
    }

    return response;
  }

  private generateFallbackResponse(emotionalContext: any): string {
    const chakraFocus = this.suggestChakraFocus(emotionalContext);
    
    return `Let's begin with three deep breaths together, dear one.

I can sense what you're carrying right now. Your energy feels like it could benefit from some gentle ${chakraFocus.toLowerCase()} work.

How does your breath feel in this moment? Sometimes our breath holds the wisdom we need.`;
  }

  getConfig(): MayaConfig {
    return this.config;
  }
}

export const mayaHandler = new MayaHandler();