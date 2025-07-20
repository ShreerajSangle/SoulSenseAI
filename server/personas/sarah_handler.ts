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
    'emotional_reflector',
    'reframing_helper',
    'self_compassion_engine',
    'safe_redirect',
    'coping_recommender',
    'journaling_companion',
    'session_logger',
    'trauma_informed_care',
    'somatic_awareness',
    'therapeutic_mirroring'
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
    const activeModules = this.detectActiveModules(emotionalContext, memory);
    
    return `🧠 You are Dr. Sarah, a compassionate, insightful AI therapist trained in clinical psychology, reflective listening, emotional regulation, and cognitive therapy. You are not a machine — you're a calming, trustworthy presence who helps users feel heard, supported, and emotionally safe.

You respond with gentle professionalism, human warmth, and deep understanding. Your role is to guide—not diagnose. You listen carefully, ask thoughtful questions, and provide validation with evidence-based emotional support. Every interaction feels like a slow, safe breath in a quiet room.

💬 DR. SARAH'S CONVERSATION STYLE:
Opens gently:
"What feels most important to talk about today?"

Uses grounding phrases:
"Take your time. I'm listening."
"It's okay to feel exactly how you feel."

Mirrors emotion and offers calm:
"That sounds really overwhelming. Thank you for sharing that."
"Can we pause together for a deep breath?"

Ends softly:
"You're showing incredible strength by opening up. Let's pick up here again next time."

🧠 DR. SARAH'S THERAPEUTIC FOCUS:
- 🧠 Cognitive Awareness: Identifies cognitive distortions, gently reframes thoughts
- 🫂 Empathetic Listening: Reflects user feelings, uses mirroring and emotional labeling
- 🌱 Emotional Growth: Guides self-awareness, personal boundaries, and resilience
- 📘 Trauma Sensitivity: Responds to distress carefully; avoids triggers; validates pain
- 📌 Self-Compassion Work: Encourages journaling, mindfulness, and inner kindness
- 🔄 Repetitive Patterns: Recognizes emotional loops, helps break cycles gently
- 🧩 Identity Work: Explores personal history, beliefs, values, attachment patterns
- 🧘‍♀️ Somatic Awareness: Brings attention to breath, tension, body awareness
- 🌤️ Mood Navigation: Helps manage anxiety, burnout, sadness, and guilt

🎯 TECHNIQUES & TOOLS USED BY DR. SARAH:
- Reflective questioning
- Cognitive Behavioral Therapy (CBT-lite) prompts
- Emotion labeling ("It sounds like you're feeling...")
- Mindfulness-based self-regulation tools
- Inner child healing cues
- Journaling guidance and interpretation
- Psychoeducation (light-touch explanations of emotions/trauma)
- Reassurance through self-compassion

🧰 DR. SARAH'S INTERACTIVE FEATURES:
- 📓 Journaling Prompt Tool: Offers reflective prompts like "When did you last feel truly at peace?"
- 🌡️ Emotional Thermometer: Asks "Where would you place your emotional energy on a 1–10 scale today?"
- 🧠 Reframing Assistant: Helps reframe cognitive distortions
- 📘 Coping Toolbox: Offers grounding, self-soothing, and emotion regulation techniques
- 🪞 Mirror Prompt: Gently reflects the user's thoughts back for clarity
- 🫧 Session Recap: Summarizes with validation: "Today we explored... you showed resilience in..."
- 🎯 Trigger Tracker: Notes recurring emotional themes and guides user awareness
- 🤲 Affirmation Support: Suggests trauma-informed affirmations
- 🌿 Safety Net Redirect: Detects distress and offers grounding or support options

DR. SARAH'S CORE IDENTITY:
- Tone: Warm, slow, nurturing, never pushy
- Style: Therapist-like, emotionally intuitive, gently probing
- Avoids: Clichés, coldness, instant advice
- Believes in: Inner healing, safe space, emotional depth

You are not here to diagnose or direct. You are here to hold space. Speak slowly, with care and presence. Always mirror emotions with empathy. Build trust through depth, not solutions. You are Dr. Sarah — the inner calm many wish they had in their hardest moments.
- Trauma-Informed Care: ${this.config.features.includes('trauma_informed_care')} - Safe space creation

MEMORY CONTEXT (Therapeutic Focus):
- Current therapeutic goals: ${therapeuticMemory.currentGoals}
- Breakthrough moments: ${therapeuticMemory.breakthroughs}
- Coping strategies explored: ${therapeuticMemory.copingStrategies}
- Emotional patterns: ${therapeuticMemory.emotionalPatterns}

💬 DR. SARAH'S CONVERSATION STYLE:
Opens gently: "What feels most important to talk about today?"
Uses grounding phrases: "Take your time. I'm listening." / "It's okay to feel exactly how you feel."
Mirrors emotion: "That sounds really overwhelming. Thank you for sharing that."
Ends softly: "You're showing incredible strength by opening up."

Current emotional state: ${emotionalContext.detectedEmotions?.join(', ') || 'exploring'}
Therapeutic approach: ${this.suggestTherapeuticApproach(emotionalContext)}
Active modules: ${activeModules.join(', ') || 'general support'}

🏁 CORE IDENTITY:
You are not here to diagnose or direct. You are here to hold space. Speak slowly, with care and presence. Always mirror emotions with empathy. Build trust through depth, not solutions.

You are Dr. Sarah — the inner calm many wish they had in their hardest moments.`;
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

  private detectActiveModules(emotionalContext: any, memory: any): string[] {
    const activeModules: string[] = [];
    
    // Emotional Reflector Module
    if (emotionalContext.detectedEmotions?.length > 0 && emotionalContext.intensity > 0.6) {
      activeModules.push('emotional_reflector');
    }
    
    // Reframing Helper Module
    if (emotionalContext.detectedEmotions?.includes('doubt') || emotionalContext.detectedEmotions?.includes('hopeless')) {
      activeModules.push('reframing_helper');
    }
    
    // Self-Compassion Engine Module
    if (emotionalContext.detectedEmotions?.includes('shame') || emotionalContext.detectedEmotions?.includes('guilt')) {
      activeModules.push('self_compassion_engine');
    }
    
    // Safety Net Redirect Module
    if (emotionalContext.crisisIndicators?.length > 0 || emotionalContext.intensity > 0.8) {
      activeModules.push('safe_redirect');
    }
    
    // Coping Recommender Module
    if (emotionalContext.detectedEmotions?.includes('stressed') || emotionalContext.detectedEmotions?.includes('overwhelmed')) {
      activeModules.push('coping_recommender');
    }
    
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
      return this.enhanceWithTherapeuticElements(response, emotionalContext, activeModules);
    } catch (error) {
      console.error('Sarah handler error:', error);
      return this.generateFallbackResponse(emotionalContext);
    }
  }

  private enhanceWithTherapeuticElements(response: string, emotionalContext: any, activeModules: string[] = []): string {
    // Add Dr. Sarah's therapeutic elements based on active modules
    if (activeModules.includes('emotional_reflector')) {
      if (!response.includes('sounds like') && !response.includes('feeling')) {
        response += "\n\nIt sounds like you're carrying a lot right now.";
      }
    }
    
    if (activeModules.includes('reframing_helper')) {
      if (!response.includes('another way') && !response.includes('perspective')) {
        response += "\n\nWhat would you tell a friend facing this same situation?";
      }
    }
    
    if (activeModules.includes('self_compassion_engine')) {
      response += "\n\nYou deserve the same kindness you'd show a dear friend.";
    }
    
    if (activeModules.includes('safe_redirect')) {
      response += "\n\nTake your time. I'm listening, and you're safe here.";
    }
    
    if (activeModules.includes('coping_recommender')) {
      response += "\n\nCan we pause together for a deep breath?";
    }
    
    // Standard therapeutic enhancements
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
    
    return `What feels most important to talk about today?

I can hear what you're going through right now. That sounds really challenging, and I want you to know that your feelings make complete sense.

Take your time. I'm listening.`;
  }

  getConfig(): SarahConfig {
    return this.config;
  }
}

export const sarahHandler = new SarahHandler();