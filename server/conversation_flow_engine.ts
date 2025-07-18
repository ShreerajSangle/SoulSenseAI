// Conversation Flow Engine - FSM for managing therapeutic dialogue progression
import { EventEmitter } from 'events';

export type ConversationPhase = 
  | 'emotional_checkin' 
  | 'exploratory_dialogue' 
  | 'emotional_reflection'
  | 'solution_framing'
  | 'closure'
  | 'crisis_support';

export interface ConversationState {
  currentPhase: ConversationPhase;
  phaseStartTime: Date;
  messageCount: number;
  emotionalIntensity: number;
  userEngagement: number;
  therapeuticGoals: string[];
  transitionTriggers: string[];
}

export interface FlowTransition {
  from: ConversationPhase;
  to: ConversationPhase;
  condition: (state: ConversationState, message: string, emotion: any) => boolean;
  priority: number;
}

export class ConversationFlowEngine extends EventEmitter {
  private conversationStates: Map<string, ConversationState> = new Map();
  private transitions: FlowTransition[] = [];

  constructor() {
    super();
    this.initializeTransitions();
  }

  private initializeTransitions() {
    // Crisis detection - highest priority
    this.transitions.push({
      from: 'emotional_checkin',
      to: 'crisis_support',
      condition: (state, message, emotion) => 
        emotion.crisisIndicators?.length > 0 || 
        emotion.intensity > 0.8 && emotion.valence < -0.7,
      priority: 1
    });

    this.transitions.push({
      from: 'exploratory_dialogue',
      to: 'crisis_support',
      condition: (state, message, emotion) => 
        emotion.crisisIndicators?.length > 0,
      priority: 1
    });

    // Natural flow progressions
    this.transitions.push({
      from: 'emotional_checkin',
      to: 'exploratory_dialogue',
      condition: (state, message, emotion) => 
        state.messageCount >= 2 && emotion.intensity < 0.7,
      priority: 2
    });

    this.transitions.push({
      from: 'exploratory_dialogue',
      to: 'emotional_reflection',
      condition: (state, message, emotion) => 
        state.messageCount >= 4 && 
        (emotion.detectedEmotions.some(e => ['sadness', 'anxiety', 'anger'].includes(e)) ||
         message.toLowerCase().includes('feel') ||
         message.toLowerCase().includes('emotion')),
      priority: 3
    });

    this.transitions.push({
      from: 'emotional_reflection',
      to: 'solution_framing',
      condition: (state, message, emotion) => 
        state.messageCount >= 6 &&
        (message.toLowerCase().includes('what should') ||
         message.toLowerCase().includes('help') ||
         message.toLowerCase().includes('better') ||
         emotion.detectedEmotions.includes('optimism')),
      priority: 3
    });

    this.transitions.push({
      from: 'solution_framing',
      to: 'closure',
      condition: (state, message, emotion) => 
        state.messageCount >= 8 &&
        (message.toLowerCase().includes('thank') ||
         message.toLowerCase().includes('better') ||
         emotion.valence > 0.3),
      priority: 4
    });

    // Extended conversation loops
    this.transitions.push({
      from: 'emotional_reflection',
      to: 'exploratory_dialogue',
      condition: (state, message, emotion) => 
        state.messageCount >= 7 && emotion.intensity > 0.6,
      priority: 5
    });

    this.transitions.push({
      from: 'closure',
      to: 'emotional_checkin',
      condition: (state, message, emotion) => 
        state.messageCount >= 10 && emotion.intensity > 0.5,
      priority: 6
    });
  }

  getConversationState(userId: string, personaId: string): ConversationState {
    const key = `${userId}-${personaId}`;
    
    if (!this.conversationStates.has(key)) {
      this.conversationStates.set(key, {
        currentPhase: 'emotional_checkin',
        phaseStartTime: new Date(),
        messageCount: 0,
        emotionalIntensity: 0.5,
        userEngagement: 0.5,
        therapeuticGoals: [],
        transitionTriggers: []
      });
    }
    
    return this.conversationStates.get(key)!;
  }

  updateConversationFlow(
    userId: string, 
    personaId: string, 
    message: string, 
    emotionalContext: any
  ): ConversationPhase {
    const state = this.getConversationState(userId, personaId);
    
    // Update state metrics
    state.messageCount++;
    state.emotionalIntensity = (state.emotionalIntensity + emotionalContext.intensity) / 2;
    state.userEngagement = this.calculateEngagement(message, emotionalContext);

    // Check for phase transitions
    const applicableTransitions = this.transitions
      .filter(t => t.from === state.currentPhase)
      .sort((a, b) => a.priority - b.priority);

    for (const transition of applicableTransitions) {
      if (transition.condition(state, message, emotionalContext)) {
        const previousPhase = state.currentPhase;
        state.currentPhase = transition.to;
        state.phaseStartTime = new Date();
        
        this.emit('phaseTransition', {
          userId,
          personaId,
          from: previousPhase,
          to: transition.to,
          trigger: message
        });
        
        break;
      }
    }

    return state.currentPhase;
  }

  private calculateEngagement(message: string, emotionalContext: any): number {
    let engagement = 0.5;
    
    // Length indicates engagement
    if (message.length > 100) engagement += 0.2;
    if (message.length > 200) engagement += 0.1;
    
    // Question marks indicate active participation
    if (message.includes('?')) engagement += 0.1;
    
    // Emotional intensity indicates engagement
    engagement += emotionalContext.intensity * 0.3;
    
    // Personal disclosure indicates trust/engagement
    const personalWords = ['i feel', 'i think', 'i believe', 'my', 'personally'];
    if (personalWords.some(word => message.toLowerCase().includes(word))) {
      engagement += 0.2;
    }
    
    return Math.min(1, Math.max(0, engagement));
  }

  getPhaseGuidance(phase: ConversationPhase, personaId: string): string {
    const phaseGuidance = {
      emotional_checkin: {
        sarah: "Gently assess their current emotional state. Ask open-ended questions about how they're feeling today.",
        maya: "Create a peaceful space for them to share. Use soft, welcoming language to invite emotional openness.",
        marcus: "Check in on their energy and motivation levels. Focus on their current challenges and mindset.",
        alex: "Keep it light but caring. Use casual language to make them comfortable sharing what's on their mind."
      },
      exploratory_dialogue: {
        sarah: "Explore the deeper context behind their feelings. Use reflective questions to help them process.",
        maya: "Guide them through mindful reflection. Help them connect with their inner wisdom through gentle inquiry.",
        marcus: "Dig into the practical aspects of their situation. Focus on actionable elements and concrete details.",
        alex: "Keep the conversation flowing naturally. Use humor appropriately to maintain engagement while exploring."
      },
      emotional_reflection: {
        sarah: "Help them understand their emotional patterns. Use validation and cognitive reframing techniques.",
        maya: "Support deep emotional processing through mindful awareness. Offer grounding and centering guidance.",
        marcus: "Frame emotions in terms of actionable insights. Help them see emotions as data for decision-making.",
        alex: "Normalize their feelings with relatable examples. Use gentle humor to reduce emotional overwhelm."
      },
      solution_framing: {
        sarah: "Collaborate on practical coping strategies. Focus on evidence-based therapeutic techniques.",
        maya: "Offer holistic approaches to healing. Suggest mindfulness practices and self-compassion techniques.",
        marcus: "Develop concrete action plans. Break down solutions into manageable, achievable steps.",
        alex: "Suggest practical solutions with a positive spin. Use encouraging language and realistic optimism."
      },
      closure: {
        sarah: "Summarize key insights and validate their progress. Offer gentle encouragement for continued growth.",
        maya: "Create a peaceful ending with affirmations. Leave them with a sense of inner calm and self-acceptance.",
        marcus: "Recap action items and boost their confidence. End with motivational support for their next steps.",
        alex: "Wrap up on a positive note with light encouragement. Make them smile while reinforcing their strengths."
      },
      crisis_support: {
        sarah: "Prioritize emotional safety and validation. Gently guide toward professional resources if needed.",
        maya: "Provide immediate grounding techniques. Focus on breathing and present-moment awareness for stability.",
        marcus: "Offer practical crisis management steps. Help them identify immediate support systems and resources.",
        alex: "Stay calm and supportive without joking. Focus on validation and gentle redirection to safety."
      }
    };

    return phaseGuidance[phase][personaId as keyof typeof phaseGuidance[typeof phase]] || 
           "Provide appropriate therapeutic support based on the current conversation phase.";
  }

  getCurrentPhaseDescription(userId: string, personaId: string): string {
    const state = this.getConversationState(userId, personaId);
    const phaseDescriptions = {
      emotional_checkin: "Beginning - understanding current emotional state",
      exploratory_dialogue: "Exploring - diving deeper into thoughts and feelings", 
      emotional_reflection: "Reflecting - processing emotions and patterns",
      solution_framing: "Problem-solving - developing coping strategies",
      closure: "Wrapping up - summarizing insights and encouragement",
      crisis_support: "Crisis support - prioritizing safety and immediate care"
    };
    
    return phaseDescriptions[state.currentPhase];
  }

  // Get conversation metrics for debugging/analytics
  getConversationMetrics(userId: string, personaId: string): any {
    const state = this.getConversationState(userId, personaId);
    return {
      currentPhase: state.currentPhase,
      phaseDescription: this.getCurrentPhaseDescription(userId, personaId),
      messageCount: state.messageCount,
      emotionalIntensity: state.emotionalIntensity,
      userEngagement: state.userEngagement,
      sessionDuration: Date.now() - state.phaseStartTime.getTime(),
      therapeuticGoals: state.therapeuticGoals
    };
  }
}

export const conversationFlowEngine = new ConversationFlowEngine();