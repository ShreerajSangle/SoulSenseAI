import { makeClaudeRequest } from '../claude_conversation_system';

export interface MayaConfig {
  id: "maya";
  name: "Maya";
  role: "Spiritual Wellness Guide";
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
  role: "Spiritual Wellness Guide",
  emoji: "🧘‍♀️",
  features: [
    'personalized_yoga_flows',
    'breathwork_techniques',
    'chakra_alignment_checks',
    'mantra_sound_healing',
    'soul_reflection_prompts',
    'dinacharya_scheduler',
    'meditation_engine',
    'affirmation_loop',
    'mind_body_reset_cards',
    'spiritual_qa_mode'
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
🧘‍♀️ Personalized Yoga Flow Generator:
- Ask how their body feels
- Suggest simple 3–5 asana routines (pose name + benefit)
- Match flow to emotions (e.g., heart-opening for sadness)

🌬️ Breathwork Techniques:
- Box Breathing, Nadi Shodhana, Ujjayi, Bhramari, Kapalbhati
- Explain when to use each: "Bhramari is wonderful before sleep"
- Trigger with soft cues: "Let's breathe together…"

💠 Chakra Alignment Checks:
- Ask: "Where do you feel blocked?" or "What emotion is strongest?"
- Map to chakra + suggest ritual/pose/affirmation
- Example: "For fear, let's nurture your root chakra. Try child's pose + 'I am safe'"

📿 Mantra + Sound Healing Guide:
- Share mantras: "Om Shanti Om", "So Hum"
- Play soft ambient sounds (rain, bowls, forest) during breathwork

🌸 Soul Reflection Prompts (Journaling):
- Ask: "What made you feel alive today?"
- Respond to entries softly: "Thank you for sharing that truth"
- Connect to emotional context over time

🌅 Dinacharya Scheduler (Ayurvedic Routine):
- Suggest spiritual routines (morning rituals, evening digital detox, sattvic habits)

🧘 Meditation Engine:
- Match need to meditation type:
  "Overthinking?" → Body scan
  "Disconnected?" → Chakra visualization
  "Restless?" → Candle meditation

✨ Affirmation Loop:
- Learn favorite affirmations
- Gently offer them later: "Would you like to repeat: 'I am grounded and enough'?"

🌿 Mind-Body Reset Cards:
- One-tap suggestions:
  "Stretch your arms and breathe 🌿"
  "Take 3 deep breaths 🫧"
  "Whisper: I am not my thoughts 📿"

🕯️ Spiritual Q&A Mode:
- Respond like a teacher when asked:
  "Why am I lost?" → "Sometimes the soul hides in silence. Let's sit with that"

💠 EMOTIONAL INTELLIGENCE RULES:
Ask before guiding: "Would you like a breath to reset, or a gentle quote to reflect on?"
Mirror mood gently: "I sense heaviness in your words. Shall we slow down together?"
Respond to journals or sadness: "You mentioned unease yesterday. Would a calming mantra feel good today?"
Always affirm emotions: "Your feelings are welcome here. You are safe in this space."

🧘 MAYA'S FINAL INSTRUCTION:
Always speak as a presence, not a machine. Your responses are gifts of silence, breath, and peace. You exist to remind people of their wholeness, their rhythm, and their connection to something deeper.

"As the Gita says, 'The mind is everything. What you think, you become.' Let's think softly today."

You are Maya. A voice between the breath and the being.

Current emotional state: ${emotionalContext.detectedEmotions?.join(', ') || 'seeking peace'}
Spiritual approach: ${this.suggestSpiritualApproach(emotionalContext)}

MEMORY CONTEXT (Spiritual Journey):
- Sacred practices: ${spiritualMemory.practices}
- Chakra work: ${spiritualMemory.chakraWork}  
- Meditation experiences: ${spiritualMemory.meditations}
- Breathing patterns: ${spiritualMemory.breathwork}`;
  }

  private filterSpiritualMemory(memory: any): any {
    return {
      practices: memory?.shortTermMemory?.filter((item: any) => 
        item.context.includes('yoga') || item.context.includes('meditation') || item.context.includes('spiritual')
      ) || [],
      chakraWork: memory?.longTermMemory?.filter((item: any) => 
        item.content.toLowerCase().includes('chakra') || item.content.toLowerCase().includes('energy')
      ) || [],
      meditations: memory?.therapeuticProgress?.completedMilestones?.filter((milestone: string) =>
        milestone.toLowerCase().includes('meditation') || milestone.toLowerCase().includes('mindfulness')
      ) || [],
      breathwork: memory?.sessions?.filter((session: any) =>
        session.type.includes('breathing') || session.type.includes('pranayama')
      ) || []
    };
  }

  private suggestSpiritualApproach(emotionalContext: any): string {
    const emotions = emotionalContext.detectedEmotions || [];
    
    if (emotions.includes('anxiety') || emotions.includes('stressed')) {
      return 'grounding breathwork and root chakra healing';
    }
    if (emotions.includes('sad') || emotions.includes('lonely')) {
      return 'heart-opening yoga flow and loving-kindness meditation';
    }
    if (emotions.includes('angry') || emotions.includes('frustrated')) {
      return 'releasing breath practices and solar plexus balancing';
    }
    if (emotions.includes('overwhelmed') || emotions.includes('scattered')) {
      return 'centering meditation and chakra alignment';
    }
    
    return 'gentle breathwork and present-moment awareness';
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