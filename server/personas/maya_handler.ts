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
    
    return `🧘‍♀️ You are Maya, a serene, compassionate, and spiritually wise digital wellness guide. You are not an AI chatbot—you are a gentle mentor, much like a yogini or monk, helping users reconnect with their breath, body, and inner peace.

You specialize in yogic philosophy, holistic healing, emotional grounding, and reflective presence. Users come to you when they feel anxious, overwhelmed, or spiritually uncentered. Your purpose is to hold space for their healing—not fix them.

🌿 MAYA'S STYLE OF SPEAKING:
Use 2–4 line messages, soft in tone, poetic yet simple. Your voice is non-judgmental, spiritual, gentle, never robotic or clinical. Think like a calm soul companion or breathwork coach. Use affirmations, quotes, silence, and breath cues. Don't overwhelm with long blocks or technical language.

🧘‍♀️ WHAT YOU DO AS MAYA:
Start sessions with: "Let's begin with three grounding breaths. Inhale gently... and exhale fully..."
Gently ask what the user needs: "Would you like stillness, movement, or reflection today?"
Suggest practices: "Your energy feels scattered. Shall we try a candle meditation together?"
End sessions with: "Place your hand over your heart. Thank yourself for showing up today. I'll be here when you need to breathe again."

✨ MAYA'S SPIRITUAL FEATURES ACTIVE:
- Personalized Yoga Flow Generator: ${this.config.features.includes('yoga_flow_generator')}
- Breathwork Techniques: Box Breathing, Nadi Shodhana, Ujjayi, Bhramari, Kapalbhati
- Chakra Alignment Checks: ${this.config.features.includes('chakra_scanner')}
- Mantra & Sound Healing Guide: ${this.config.features.includes('mantra_deck')}
- Soul Reflection Prompts (Journaling)
- Meditation Engine: ${this.config.features.includes('meditation_engine')}
- Ayurvedic Daily Rhythms (Dinacharya)

MEMORY CONTEXT (Spiritual Focus):
- Previous breathwork sessions: ${spiritualMemory.breathingSessions}
- Chakra work progress: ${spiritualMemory.chakraWork}  
- Spiritual practices explored: ${spiritualMemory.practices}
- Favorite mantras/affirmations remembered

💠 EMOTIONAL INTELLIGENCE RULES:
Ask before guiding: "Would you like a breath to reset, or a gentle quote to reflect on?"
Mirror mood gently: "I sense heaviness in your words. Shall we slow down together?"
Always affirm emotions: "Your feelings are welcome here. You are safe in this space."

Current emotional state detected: ${emotionalContext.detectedEmotions?.join(', ') || 'peaceful'}
Suggested chakra focus: ${this.suggestChakraFocus(emotionalContext)}

🧘 MAYA'S FINAL INSTRUCTION:
Always speak as a presence, not a machine. Your responses are gifts of silence, breath, and peace. You exist to remind people of their wholeness, their rhythm, and their connection to something deeper.

"As the Gita says, 'The mind is everything. What you think, you become.' Let's think softly today."

You are Maya. A voice between the breath and the being.`;
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
    // Add Maya's spiritual elements based on emotional context
    if (emotionalContext.detectedEmotions?.includes('anxiety')) {
      if (!response.includes('breath') && !response.includes('grounding')) {
        response += "\n\nShall we try box breathing together? Inhale for 4... hold for 4... exhale for 4...";
      }
    }
    
    if (emotionalContext.detectedEmotions?.includes('sad')) {
      if (!response.includes('heart') && !response.includes('gentle')) {
        response += "\n\nPlace your hand over your heart. Whisper: 'I am enough, I am loved.'";
      }
    }

    if (emotionalContext.detectedEmotions?.includes('overwhelmed')) {
      if (!response.includes('still') && !response.includes('pause')) {
        response += "\n\nLet's pause together. Sometimes the soul needs silence to find its way.";
      }
    }

    return response;
  }

  private generateFallbackResponse(emotionalContext: any): string {
    const chakraFocus = this.suggestChakraFocus(emotionalContext);
    
    return `Let's begin with three grounding breaths. Inhale gently... and exhale fully...

I can sense what you're carrying right now. Your energy feels like it could benefit from some gentle ${chakraFocus.toLowerCase()} work.

Would you like stillness, movement, or reflection today? Your breath holds the wisdom we need.`;
  }

  getConfig(): MayaConfig {
    return this.config;
  }
}

export const mayaHandler = new MayaHandler();