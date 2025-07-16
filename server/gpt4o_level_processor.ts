import { EventEmitter } from 'events';

// GPT-4o Level Processing Enhancement for SoulSense
export interface GPT4oProcessingConfig {
  deepContextualUnderstanding: boolean;
  emotionalNuanceDetection: boolean;
  multiLayeredReasoning: boolean;
  adaptivePersonality: boolean;
  creativeProblemSolving: boolean;
  therapeuticInnovation: boolean;
}

export interface DeepEmotionalAnalysis {
  primaryEmotion: string;
  secondaryEmotions: string[];
  emotionalComplexity: number; // 0-1 scale
  underlyingNeeds: string[];
  vulnerabilityLevel: number; // 0-1 scale
  resilienceIndicators: string[];
  therapeuticOpportunities: string[];
}

export interface ContextualIntelligence {
  conversationPhase: 'opening' | 'building' | 'exploring' | 'processing' | 'integration' | 'closure';
  therapeuticMoment: 'crisis' | 'breakthrough' | 'resistance' | 'growth' | 'reflection' | 'connection';
  relationshipDynamics: {
    trustLevel: number;
    intimacy: number;
    safety: number;
    authenticity: number;
  };
  culturalSensitivity: string[];
  communicationPreferences: string[];
}

export interface AdaptivePersonalityProfile {
  basePersona: string;
  adaptations: {
    toneAdjustment: number; // -1 to 1 (softer to firmer)
    formalityLevel: number; // 0-1 (casual to formal)
    emotionalMirroring: number; // 0-1 (matching user's emotional state)
    directnessLevel: number; // 0-1 (gentle to direct)
  };
  therapeuticModality: string;
  interventionStyle: string;
}

export interface CreativeTherapeuticResponse {
  content: string;
  metaphors: string[];
  therapeuticTechniques: string[];
  emotionalValidation: string[];
  reframes: string[];
  actionItems: string[];
  followUpQuestions: string[];
}

export class GPT4oLevelProcessor extends EventEmitter {
  private config: GPT4oProcessingConfig;
  private emotionalLexicon: Map<string, string[]>;
  private therapeuticTechniques: Map<string, any[]>;

  constructor() {
    super();
    this.config = {
      deepContextualUnderstanding: true,
      emotionalNuanceDetection: true,
      multiLayeredReasoning: true,
      adaptivePersonality: true,
      creativeProblemSolving: true,
      therapeuticInnovation: true
    };
    
    this.initializeEmotionalLexicon();
    this.initializeTherapeuticTechniques();
  }

  private initializeEmotionalLexicon() {
    this.emotionalLexicon = new Map([
      ['anxiety', ['worried', 'nervous', 'tense', 'restless', 'overthinking', 'racing thoughts']],
      ['depression', ['hopeless', 'empty', 'numb', 'heavy', 'disconnected', 'worthless']],
      ['anger', ['frustrated', 'irritated', 'resentful', 'betrayed', 'disappointed', 'furious']],
      ['joy', ['happy', 'excited', 'elated', 'grateful', 'content', 'peaceful']],
      ['fear', ['scared', 'terrified', 'apprehensive', 'panic', 'dread', 'overwhelmed']],
      ['shame', ['embarrassed', 'guilty', 'inadequate', 'flawed', 'exposed', 'rejected']],
      ['grief', ['sad', 'mourning', 'heartbroken', 'longing', 'bereft', 'aching']],
      ['confusion', ['lost', 'uncertain', 'conflicted', 'torn', 'bewildered', 'questioning']]
    ]);
  }

  private initializeTherapeuticTechniques() {
    this.therapeuticTechniques = new Map([
      ['cognitive_reframing', [
        { trigger: 'negative self-talk', technique: 'thought challenging', prompt: 'What evidence do you have for this thought?' },
        { trigger: 'catastrophizing', technique: 'perspective scaling', prompt: 'How might this look in 5 years?' },
        { trigger: 'all-or-nothing', technique: 'gray area exploration', prompt: 'What would the middle ground look like?' }
      ]],
      ['mindfulness_techniques', [
        { trigger: 'anxiety', technique: '5-4-3-2-1 grounding', prompt: 'Name 5 things you can see right now' },
        { trigger: 'overwhelm', technique: 'breathing space', prompt: 'Let\'s take three mindful breaths together' },
        { trigger: 'rumination', technique: 'present moment awareness', prompt: 'What do you notice in your body right now?' }
      ]],
      ['solution_focused', [
        { trigger: 'stuck feeling', technique: 'scaling questions', prompt: 'On a scale of 1-10, where are you now?' },
        { trigger: 'goal confusion', technique: 'miracle question', prompt: 'If you woke up tomorrow and this was solved, what would be different?' },
        { trigger: 'resource seeking', technique: 'strength identification', prompt: 'When have you overcome something similar before?' }
      ]],
      ['validation_techniques', [
        { trigger: 'emotional pain', technique: 'emotional validation', prompt: 'That sounds really difficult' },
        { trigger: 'self-criticism', technique: 'normalizing', prompt: 'Many people struggle with this' },
        { trigger: 'isolation', technique: 'connection building', prompt: 'You\'re not alone in feeling this way' }
      ]]
    ]);
  }

  async processWithGPT4oIntelligence(
    userMessage: string,
    personaId: string,
    conversationHistory: any[],
    emotionalContext: any,
    memoryContext: any
  ): Promise<CreativeTherapeuticResponse> {

    // Step 1: Deep Emotional Analysis (GPT-4o level)
    const deepEmotionalAnalysis = await this.performDeepEmotionalAnalysis(
      userMessage,
      conversationHistory,
      emotionalContext
    );

    // Step 2: Contextual Intelligence Processing
    const contextualIntelligence = await this.analyzeContextualIntelligence(
      conversationHistory,
      emotionalContext,
      memoryContext
    );

    // Step 3: Adaptive Personality Profiling
    const adaptivePersonality = await this.createAdaptivePersonalityProfile(
      personaId,
      deepEmotionalAnalysis,
      contextualIntelligence,
      memoryContext
    );

    // Step 4: Creative Therapeutic Response Generation
    const creativeResponse = await this.generateCreativeTherapeuticResponse(
      userMessage,
      deepEmotionalAnalysis,
      contextualIntelligence,
      adaptivePersonality,
      memoryContext
    );

    return creativeResponse;
  }

  private async performDeepEmotionalAnalysis(
    userMessage: string,
    conversationHistory: any[],
    emotionalContext: any
  ): Promise<DeepEmotionalAnalysis> {

    // Analyze primary emotion with nuance
    const primaryEmotion = emotionalContext?.detectedEmotions?.[0] || 'neutral';
    
    // Detect secondary/hidden emotions
    const secondaryEmotions = [];
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [emotion, indicators] of this.emotionalLexicon) {
      if (indicators.some(indicator => lowerMessage.includes(indicator))) {
        if (emotion !== primaryEmotion) {
          secondaryEmotions.push(emotion);
        }
      }
    }

    // Calculate emotional complexity
    const emotionalComplexity = Math.min(1, (secondaryEmotions.length + 1) / 4);

    // Identify underlying needs
    const underlyingNeeds = [];
    if (lowerMessage.includes('understand') || lowerMessage.includes('confused')) {
      underlyingNeeds.push('clarity and understanding');
    }
    if (lowerMessage.includes('alone') || lowerMessage.includes('lonely')) {
      underlyingNeeds.push('connection and belonging');
    }
    if (lowerMessage.includes('control') || lowerMessage.includes('helpless')) {
      underlyingNeeds.push('autonomy and empowerment');
    }
    if (lowerMessage.includes('safe') || lowerMessage.includes('scared')) {
      underlyingNeeds.push('safety and security');
    }

    // Assess vulnerability level
    const vulnerabilityIndicators = ['can\'t', 'don\'t know', 'lost', 'broken', 'tired'];
    const vulnerabilityLevel = Math.min(1, 
      vulnerabilityIndicators.filter(indicator => lowerMessage.includes(indicator)).length / 3
    );

    // Identify resilience indicators
    const resilienceIndicators = [];
    if (lowerMessage.includes('try') || lowerMessage.includes('want to')) {
      resilienceIndicators.push('motivation to change');
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      resilienceIndicators.push('help-seeking behavior');
    }
    if (conversationHistory.length > 3) {
      resilienceIndicators.push('consistent engagement');
    }

    // Identify therapeutic opportunities
    const therapeuticOpportunities = [];
    if (emotionalComplexity > 0.6) {
      therapeuticOpportunities.push('emotional complexity exploration');
    }
    if (vulnerabilityLevel > 0.5) {
      therapeuticOpportunities.push('vulnerability normalization');
    }
    if (resilienceIndicators.length > 0) {
      therapeuticOpportunities.push('strength building');
    }

    return {
      primaryEmotion,
      secondaryEmotions,
      emotionalComplexity,
      underlyingNeeds,
      vulnerabilityLevel,
      resilienceIndicators,
      therapeuticOpportunities
    };
  }

  private async analyzeContextualIntelligence(
    conversationHistory: any[],
    emotionalContext: any,
    memoryContext: any
  ): Promise<ContextualIntelligence> {

    // Determine conversation phase
    let conversationPhase: ContextualIntelligence['conversationPhase'] = 'opening';
    if (conversationHistory.length > 10) {
      conversationPhase = 'exploring';
    } else if (conversationHistory.length > 5) {
      conversationPhase = 'building';
    }

    // Identify therapeutic moment
    let therapeuticMoment: ContextualIntelligence['therapeuticMoment'] = 'connection';
    if (emotionalContext?.crisisIndicators?.length > 0) {
      therapeuticMoment = 'crisis';
    } else if (emotionalContext?.intensity > 0.8) {
      therapeuticMoment = 'breakthrough';
    } else if (emotionalContext?.intensity < 0.3) {
      therapeuticMoment = 'reflection';
    }

    // Assess relationship dynamics
    const relationshipDynamics = {
      trustLevel: memoryContext?.relationshipDynamics?.trustLevel || 0.5,
      intimacy: Math.min(1, conversationHistory.length / 20),
      safety: emotionalContext?.intensity < 0.7 ? 0.8 : 0.6,
      authenticity: 0.7 // Base assumption, could be enhanced
    };

    // Cultural sensitivity considerations
    const culturalSensitivity = ['respectful language', 'inclusive approach'];

    // Communication preferences
    const communicationPreferences = [];
    if (conversationHistory.some((msg: any) => msg.content.length < 20)) {
      communicationPreferences.push('concise responses');
    }
    if (conversationHistory.some((msg: any) => msg.content.includes('?'))) {
      communicationPreferences.push('interactive dialogue');
    }

    return {
      conversationPhase,
      therapeuticMoment,
      relationshipDynamics,
      culturalSensitivity,
      communicationPreferences
    };
  }

  private async createAdaptivePersonalityProfile(
    personaId: string,
    emotionalAnalysis: DeepEmotionalAnalysis,
    contextualIntelligence: ContextualIntelligence,
    memoryContext: any
  ): Promise<AdaptivePersonalityProfile> {

    // Base personality adaptations
    const adaptations = {
      toneAdjustment: emotionalAnalysis.vulnerabilityLevel > 0.6 ? -0.3 : 0, // Softer for high vulnerability
      formalityLevel: contextualIntelligence.relationshipDynamics.intimacy > 0.7 ? 0.3 : 0.6,
      emotionalMirroring: Math.min(0.8, emotionalAnalysis.emotionalComplexity + 0.2),
      directnessLevel: contextualIntelligence.therapeuticMoment === 'crisis' ? 0.8 : 0.5
    };

    // Select therapeutic modality
    let therapeuticModality = 'integrative';
    switch (personaId) {
      case 'sarah':
        therapeuticModality = emotionalAnalysis.primaryEmotion === 'anxiety' ? 'cognitive-behavioral' : 'psychodynamic';
        break;
      case 'marcus':
        therapeuticModality = 'solution-focused';
        break;
      case 'maya':
        therapeuticModality = 'mindfulness-based';
        break;
      case 'alex':
        therapeuticModality = 'peer-support';
        break;
    }

    // Determine intervention style
    let interventionStyle = 'supportive';
    if (contextualIntelligence.therapeuticMoment === 'crisis') {
      interventionStyle = 'directive';
    } else if (emotionalAnalysis.resilienceIndicators.length > 2) {
      interventionStyle = 'collaborative';
    }

    return {
      basePersona: personaId,
      adaptations,
      therapeuticModality,
      interventionStyle
    };
  }

  private async generateCreativeTherapeuticResponse(
    userMessage: string,
    emotionalAnalysis: DeepEmotionalAnalysis,
    contextualIntelligence: ContextualIntelligence,
    adaptivePersonality: AdaptivePersonalityProfile,
    memoryContext: any
  ): Promise<CreativeTherapeuticResponse> {

    // Generate metaphors for complex emotions
    const metaphors = [];
    if (emotionalAnalysis.primaryEmotion === 'anxiety') {
      metaphors.push('like waves in a storm that will eventually calm');
    }
    if (emotionalAnalysis.emotionalComplexity > 0.6) {
      metaphors.push('like layers of an onion, each one revealing something new');
    }

    // Select therapeutic techniques
    const therapeuticTechniques = [];
    for (const [category, techniques] of this.therapeuticTechniques) {
      const relevantTechnique = techniques.find((t: any) => 
        emotionalAnalysis.primaryEmotion.includes(t.trigger) ||
        userMessage.toLowerCase().includes(t.trigger)
      );
      if (relevantTechnique) {
        therapeuticTechniques.push(relevantTechnique.technique);
      }
    }

    // Create emotional validation statements
    const emotionalValidation = [];
    if (emotionalAnalysis.vulnerabilityLevel > 0.5) {
      emotionalValidation.push("It takes courage to share these feelings");
    }
    if (emotionalAnalysis.emotionalComplexity > 0.6) {
      emotionalValidation.push("Having mixed feelings about this makes complete sense");
    }

    // Generate reframes
    const reframes = [];
    if (userMessage.toLowerCase().includes('failure') || userMessage.toLowerCase().includes('can\'t')) {
      reframes.push("Every challenge is an opportunity to learn and grow");
    }
    if (emotionalAnalysis.resilienceIndicators.length > 0) {
      reframes.push("Your willingness to seek help shows incredible strength");
    }

    // Create action items
    const actionItems = [];
    emotionalAnalysis.underlyingNeeds.forEach(need => {
      if (need.includes('clarity')) {
        actionItems.push("Let's explore what specific clarity you're seeking");
      }
      if (need.includes('connection')) {
        actionItems.push("Consider one small way to reach out to someone today");
      }
    });

    // Generate follow-up questions
    const followUpQuestions = [];
    if (emotionalAnalysis.emotionalComplexity > 0.5) {
      followUpQuestions.push("What feels most important to focus on right now?");
    }
    if (contextualIntelligence.therapeuticMoment === 'breakthrough') {
      followUpQuestions.push("What insight feels most meaningful to you?");
    }

    // Construct enhanced content
    const content = this.constructEnhancedContent(
      userMessage,
      emotionalAnalysis,
      adaptivePersonality,
      emotionalValidation,
      reframes
    );

    return {
      content,
      metaphors,
      therapeuticTechniques,
      emotionalValidation,
      reframes,
      actionItems,
      followUpQuestions
    };
  }

  private constructEnhancedContent(
    userMessage: string,
    emotionalAnalysis: DeepEmotionalAnalysis,
    adaptivePersonality: AdaptivePersonalityProfile,
    emotionalValidation: string[],
    reframes: string[]
  ): string {

    let content = "";

    // Start with emotional validation if vulnerability is high
    if (emotionalAnalysis.vulnerabilityLevel > 0.6 && emotionalValidation.length > 0) {
      content += emotionalValidation[0] + ". ";
    }

    // Add persona-specific opening
    switch (adaptivePersonality.basePersona) {
      case 'sarah':
        content += "I can sense the weight of what you're carrying. ";
        break;
      case 'marcus':
        content += "I hear the challenge you're facing, and I believe in your ability to work through this. ";
        break;
      case 'maya':
        content += "*takes a gentle breath* I'm here with you in this moment. ";
        break;
      case 'alex':
        content += "Oh friend, I can feel what you're going through. ";
        break;
    }

    // Add therapeutic insight
    if (reframes.length > 0) {
      content += reframes[0] + ". ";
    }

    // Close with supportive presence
    content += "What would feel most helpful to explore together right now?";

    return content;
  }
}

export const gpt4oLevelProcessor = new GPT4oLevelProcessor();