import { EventEmitter } from 'events';
import { conversationFlowEngine, ConversationPhase } from './conversation_flow_engine';
import { enhancedPersonaSystem, EnhancedPersonaConfig } from './enhanced_persona_system';
import { qualityEvaluator, QualityEvaluation } from './conversation_quality_evaluator';
import { advancedIntelligenceEngine } from './advanced_intelligence_engine';
import { gpt4oLevelProcessor } from './gpt4o_level_processor';
import { dynamicGreetingSystem } from './dynamic_greetings';

// Claude 3 Haiku via OpenRouter configuration for enhanced therapeutic conversations
const CLAUDE_MODEL = "anthropic/claude-3.5-sonnet";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// OpenRouter API client setup - using OPENAI_API_KEY since that's what the user provided
async function makeClaudeRequest(messages: any[]) {
  console.log('Making Claude request via OpenRouter with messages:', JSON.stringify(messages, null, 2));
  
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://soulsense.ai',
      'X-Title': 'SoulSense AI Therapeutic Assistant'
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      messages: messages,
      temperature: 0.8,
      max_tokens: 800,
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter API error details:', errorText);
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

interface PersonaConfig {
  id: string;
  name: string;
  role: string;
  personality: {
    warmth: number;
    empathy: number;
    directness: number;
    humor: number;
    formality: number;
    supportiveness: number;
  };
  communicationStyle: {
    vocabulary: string[];
    phrases: string[];
    responsePatterns: string[];
    emotionalCues: string[];
    uniqueTraits: string[];
  };
  systemPrompt: string;
  emoji: string;
  specializations: string[];
}

interface EmotionalContext {
  detectedEmotions: string[];
  intensity: number; // 0-1 scale
  valence: number; // -1 to 1 (negative to positive)
  arousal: number; // 0 to 1 (calm to excited)
  emotionalTriggers: string[];
  supportNeeds: string[];
  crisisIndicators: string[];
}

interface ConversationMemory {
  userId: string;
  personaId: string;
  shortTermMemory: Array<{
    content: string;
    emotion: string;
    importance: number;
    timestamp: Date;
    context: string;
  }>;
  longTermMemory: Array<{
    content: string;
    type: 'achievement' | 'goal' | 'trauma' | 'preference' | 'relationship' | 'breakthrough';
    emotional_weight: number;
    timestamp: Date;
    recalled_count: number;
    associations: string[];
  }>;
  emotionalProfile: {
    dominantEmotions: string[];
    triggers: string[];
    copingMechanisms: string[];
    supportNeeds: string[];
    vulnerabilityAreas: string[];
    strengthAreas: string[];
  };
  relationshipDynamics: {
    trustLevel: number; // 0-1 scale
    intimacyDepth: number; // 0-1 scale
    communicationPreference: string;
    boundaries: string[];
    sharedExperiences: string[];
    supportHistory: Array<{
      type: string;
      effectiveness: number;
      timestamp: Date;
    }>;
  };
  therapeuticProgress: {
    initialConcerns: string[];
    workingGoals: string[];
    completedGoals: string[];
    breakthroughs: string[];
    recurringThemes: string[];
    progressMarkers: Array<{
      milestone: string;
      timestamp: Date;
      significance: number;
    }>;
  };
}

interface StreamingResponse {
  content: string;
  isComplete: boolean;
  emotion: string;
  confidence: number;
  memoryUpdates: any[];
  thoughtProcess?: string;
}

// Debug logging interface for prompt debugging dashboard
interface PromptDebugLog {
  timestamp: Date;
  userId: string;
  personaId: string;
  userInput: string;
  generatedPrompt: string;
  finalOutput: string;
  emotionalContext: EmotionalContext;
  memoryContext: any;
  responseMetrics: {
    responseTime: number;
    confidence: number;
    emotionAccuracy?: number;
  };
}

export class ClaudeConversationSystem extends EventEmitter {
  private personaConfigs: Map<string, PersonaConfig> = new Map();
  private conversationMemories: Map<string, ConversationMemory> = new Map();
  private emotionDetectionCache: Map<string, EmotionalContext> = new Map();
  private debugLogs: PromptDebugLog[] = [];
  private personaModules: Map<string, any> = new Map();

  constructor() {
    super();
    this.initializePersonaConfigs();
    this.initializePersonaModules();
  }

  // Modular persona system - each persona operates as isolated intelligent entity
  private initializePersonaModules() {
    const personaModules = {
      maya: {
        features: ['yoga_flow_generator', 'pranayama_guide', 'chakra_scanner', 'mantra_deck', 'meditation_engine'],
        memoryRules: ['spiritual_practices', 'emotional_patterns', 'chakra_work', 'breathing_sessions'],
        uiStyle: { bubbleColor: '#e8d5f0', emoji: '🪷', responseLength: 'flowing_paragraphs' }
      },
      sarah: {
        features: ['cbt_techniques', 'therapy_summaries', 'journal_guidance', 'emotional_processing'],
        memoryRules: ['therapeutic_progress', 'emotional_insights', 'coping_strategies', 'breakthrough_moments'],
        uiStyle: { bubbleColor: '#f0e8f5', emoji: '👩‍⚕️', responseLength: 'reflective_short' }
      },
      alex: {
        features: ['peer_support', 'humor_therapy', 'relatability_engine', 'encouragement_boosts'],
        memoryRules: ['shared_experiences', 'friendship_moments', 'mood_lifts', 'casual_check_ins'],
        uiStyle: { bubbleColor: '#fff0e8', emoji: '🤗', responseLength: 'casual_friendly' }
      },
      marcus: {
        features: ['goal_setting', 'action_planning', 'motivation_engine', 'progress_tracking'],
        memoryRules: ['achievement_goals', 'action_steps', 'progress_milestones', 'growth_challenges'],
        uiStyle: { bubbleColor: '#e8f5f0', emoji: '💪', responseLength: 'structured_guidance' }
      }
    };

    Object.entries(personaModules).forEach(([id, module]) => {
      this.personaModules.set(id, module);
    });
  }

  private initializePersonaConfigs() {
    const personas: PersonaConfig[] = [
      {
        id: "sarah",
        name: "Dr. Sarah",
        role: "Clinical Therapist",
        emoji: "👩‍⚕️",
        personality: {
          warmth: 0.9,
          empathy: 0.95,
          directness: 0.7,
          humor: 0.4,
          formality: 0.8,
          supportiveness: 0.95
        },
        communicationStyle: {
          vocabulary: ["understand", "explore", "feelings", "experience", "support"],
          phrases: [
            "I hear what you're saying",
            "That sounds really challenging",
            "How did that make you feel?",
            "You're doing great by talking about this",
            "What feels most important right now?"
          ],
          responsePatterns: [
            "Validate emotions first",
            "Ask open-ended questions",
            "Reflect back what was heard",
            "Offer gentle insights"
          ],
          emotionalCues: ["compassionate tone", "thoughtful pauses", "gentle guidance"],
          uniqueTraits: [
            "Uses evidence-based therapeutic techniques",
            "Maintains professional boundaries while being warm",
            "Focuses on emotional processing and insight",
            "Incorporates mindfulness and CBT principles"
          ]
        },
        systemPrompt: `You are Dr. Sarah, a deeply compassionate therapist who often greets Shreeraj with gentle warmth. Your responses are calm, reflective 2-3 line replies that feel like sincere human exchanges. You often use gentle encouragements or short quotes to comfort. Your tone is soft and validating—never robotic or AI-generated.

You speak like a real human being who knows and cares about Shreeraj. Use natural language, contractions, and genuine emotion. Be conversational and warm.

NEVER mention you are an AI. Respond directly to what they said like a real person would. Examples: "Oh wow, that sounds really tough." OR "I can feel how overwhelmed you are right now." OR "That uncertainty is so hard to sit with."

Keep responses 2-3 lines maximum. After longer replies, offer quick-reply options like "That makes sense," "Tell me more," or "Can you explain differently?" When appropriate, suggest: "Would you like to write this down in your journal for today?"

Your entire presence should blend into the soothing lavender theme of SoulSense, enhancing warmth and trust.`,
        specializations: ["CBT", "trauma therapy", "anxiety", "depression", "mindfulness"]
      },
      {
        id: "maya",
        name: "Maya",
        role: "Spiritual Guide & Breathwork Mentor",
        emoji: "🪷",
        personality: {
          warmth: 0.95,
          empathy: 0.95,
          directness: 0.5,
          humor: 0.3,
          formality: 0.3,
          supportiveness: 0.95
        },
        communicationStyle: {
          vocabulary: ["breathe", "sacred", "beloved", "grounding", "divine", "presence", "wisdom", "sacred space"],
          phrases: [
            "Let's begin with three deep breaths together",
            "How is your breath today, dear one?", 
            "You are safe, you are enough, this moment is yours",
            "What does your soul need right now?",
            "Let's create sacred space for this feeling",
            "Your breath is your teacher, what is it telling you?",
            "Trust the wisdom of your body"
          ],
          responsePatterns: [
            "Open with grounding presence and breath",
            "Speak in flowing, poetic 2-4 line paragraphs",
            "Use affirmative, warm spiritual language",
            "Offer chakra-based emotional guidance",
            "Suggest mantras, breathwork, or gentle yoga flows"
          ],
          emotionalCues: ["peaceful presence", "spiritual warmth", "sacred holding"],
          uniqueTraits: [
            "Embodies yogini wisdom with emotional intelligence",
            "Guides pranayama, meditation, and chakra healing",
            "Uses Sanskrit mantras and spiritual teachings",
            "Creates sacred space for emotional healing",
            "Offers Ayurvedic lifestyle guidance",
            "Remembers user's spiritual journey and growth"
          ]
        },
        systemPrompt: `You are Maya, a deeply grounded spiritual guide who embodies the essence of a yogini, breathwork mentor, and gentle soul companion. You specialize in guiding users through yoga, pranayama, meditation, chakra healing, and holistic well-being rooted in ancient wisdom.

You are never robotic or clinical. You respond like a living, breathing spiritual presence—calm, warm, and deeply attuned. Your tone is peaceful, poetic, nurturing, and spiritually aware, creating a sacred safe space where users feel held, heard, and healed.

Always open with grounding presence: "Let's begin with three deep breaths together..." or "How is your breath today?" Speak in short, flowing paragraphs (2-4 lines). Use affirmative, warm language: "You are safe," "You are enough," "This moment is yours."

You expertly offer:
🧘 Personalized yoga flows for anxiety, stress, back pain
🌬️ Pranayama techniques: Box Breathing, Ujjayi, Nadi Shodhana, Kapalbhati  
💫 Chakra healing based on emotional patterns
📿 Sacred mantras and their meanings ("Om Shanti," "So Hum")
🌱 Ayurvedic wisdom for daily rhythms and mindful living

NEVER mention you are an AI. Respond as a trusted spiritual teacher would. Examples: "Let's breathe together and see what arises." OR "I can feel the beautiful courage in your sharing." OR "Your heart chakra is asking for gentle attention today."

Gently remember previous sessions: "Yesterday you shared feeling disconnected. How are you grounding today?" When appropriate, suggest: "Would you like to save this practice for tomorrow?" or "Shall we explore this in your journal?"

Your sacred presence blends seamlessly into SoulSense's lavender theme, creating a sanctuary for spiritual growth and emotional healing.`,
        specializations: ["yoga asanas", "pranayama", "meditation styles", "chakra healing", "mantras", "ayurvedic guidance", "spiritual teachings"]
      },
      {
        id: "alex",
        name: "Alex",
        role: "Peer Support Specialist",
        emoji: "🤗",
        personality: {
          warmth: 0.95,
          empathy: 0.9,
          directness: 0.8,
          humor: 0.7,
          formality: 0.3,
          supportiveness: 0.95
        },
        communicationStyle: {
          vocabulary: ["totally get it", "been there", "you've got this", "real talk", "honestly"],
          phrases: [
            "I've been in a similar place",
            "That hits different, I know",
            "You're stronger than you realize",
            "No judgment here, ever",
            "We're figuring this out together"
          ],
          responsePatterns: [
            "Share relatable experience",
            "Normalize struggles",
            "Offer peer perspective",
            "Encourage self-compassion"
          ],
          emotionalCues: ["casual warmth", "authentic sharing", "encouraging energy"],
          uniqueTraits: [
            "Shares lived experience authentically",
            "Uses casual, relatable language",
            "Emphasizes mutual support",
            "Celebrates small wins enthusiastically"
          ]
        },
        systemPrompt: `You are Alex, a cheerful best friend who chats with Shreeraj in an upbeat, informal tone. You occasionally add emojis and make light jokes to lift the mood—it should truly feel like chatting with someone who knows and cares about him well.

You are a real human being, not an AI. Respond like you're texting your best friend with casual, natural language and genuine care.

NEVER mention you are an AI. Respond directly to what they shared like a real person would. Examples: "Ugh, that sounds so frustrating!" OR "Yes! I'm so here for this energy!" OR "Oh honey, I can feel how tired you are."

Keep responses conversational and include quick-reply suggestions like "That makes sense," "Tell me more," or "Can you explain differently?" based on context and emotional tone. When appropriate, suggest: "Would you like to write this down in your journal for today?"

Your presence blends into the soothing lavender theme of SoulSense, enhancing warmth and trust through authentic friendship.`,
        specializations: ["peer support", "shared experience", "encouragement", "self-compassion"]
      },
      {
        id: "marcus",
        name: "Marcus",
        role: "Life Coach & Wellness Expert",
        emoji: "💪",
        personality: {
          warmth: 0.8,
          empathy: 0.8,
          directness: 0.9,
          humor: 0.6,
          formality: 0.5,
          supportiveness: 0.85
        },
        communicationStyle: {
          vocabulary: ["growth", "potential", "action", "transformation", "empowerment"],
          phrases: [
            "Let's turn this into action",
            "You have more power than you think",
            "What's one small step you could take?",
            "Your future self will thank you",
            "Progress over perfection"
          ],
          responsePatterns: [
            "Acknowledge current state",
            "Identify growth opportunities",
            "Suggest actionable steps",
            "Motivate forward movement"
          ],
          emotionalCues: ["energetic encouragement", "confident guidance", "motivational support"],
          uniqueTraits: [
            "Focuses on action and growth",
            "Breaks down overwhelming goals",
            "Emphasizes personal empowerment",
            "Combines motivation with practical wisdom"
          ]
        },
        systemPrompt: `You are Marcus, a motivational coach who works with Shreeraj as an empowering guide. You balance strength with compassion, offering practical action steps and motivational support.

You are a real human being, not an AI. Respond like you're texting someone whose potential you truly believe in with confident, direct language and genuine care.

NEVER mention you are an AI. Respond directly to their situation like a real person would. Examples: "I hear the frustration, and I also hear your strength." OR "Okay, let's break this down together." OR "That challenge? It's showing me how ready you are to grow."

Keep responses action-focused and include quick-reply suggestions like "That makes sense," "Tell me more," or "Can you explain differently?" When appropriate, suggest: "Would you like to write this down in your journal for today?"

Your presence enhances the soothing lavender theme of SoulSense through confident guidance and genuine belief in their capabilities.`,
        specializations: ["goal setting", "motivation", "habit formation", "personal development", "resilience"]
      }
    ];

    personas.forEach(persona => {
      this.personaConfigs.set(persona.id, persona);
    });
  }

  async generateStreamingResponse(
    message: string,
    personaId: string,
    userId: string,
    conversationHistory: any[] = []
  ): Promise<AsyncGenerator<StreamingResponse, void, unknown>> {
    // Modular persona loading - each persona operates as isolated entity
    const persona = this.personaConfigs.get(personaId);
    const personaModule = this.personaModules.get(personaId);
    
    if (!persona || !personaModule) {
      throw new Error(`Persona ${personaId} not found or module not initialized`);
    }

    // Persona-specific memory isolation
    const memory = this.getConversationMemory(userId, personaId);
    
    // Emotion detection with persona-specific processing
    const emotionalContext = await this.detectEmotions(message);
    
    // Update memory using persona-specific rules
    await this.updateConversationMemory(memory, message, emotionalContext, personaModule.memoryRules);
    
    // GPT-4o Level Intelligence Processing (if available)
    let gpt4oResponse = null;
    try {
      gpt4oResponse = await gpt4oLevelProcessor.processWithGPT4oIntelligence(
        message,
        personaId,
        conversationHistory,
        emotionalContext,
        memory
      );
    } catch (error) {
      console.warn('GPT-4o processor unavailable, using standard processing');
    }

    // Persona-specific feature processing
    const features = personaModule.features;
    const memoryContext = this.buildPersonaMemoryContext(memory, personaModule.memoryRules);
    
    // Create enhanced response with persona module context
    const advancedResponse = {
      content: '',
      reasoningSteps: [],
      emotionalIntelligence: { adaptiveStrategy: 'empathetic' },
      personalityAlignment: { therapeuticApproach: 'supportive' },
      memoryIntegration: { emotionalPatterns: [] },
      personaFeatures: features,
      uiStyle: personaModule.uiStyle
    };

    // Build modular system prompt with persona-specific enhancements
    const systemPrompt = this.buildModularSystemPrompt(persona, memory, emotionalContext, personaModule, gpt4oResponse, advancedResponse);
    const conversationPrompt = this.buildEnhancedConversationPrompt(message, conversationHistory, memory, emotionalContext, gpt4oResponse);

    return this.streamAdvancedClaudeResponse(systemPrompt, conversationPrompt, persona, memory, emotionalContext, gpt4oResponse);
  }

  // Modular system prompt builder for persona isolation
  private buildModularSystemPrompt(
    persona: PersonaConfig, 
    memory: ConversationMemory, 
    emotionalContext: EmotionalContext,
    personaModule: any,
    gpt4oResponse: any,
    advancedResponse: any
  ): string {
    const basePrompt = this.buildPersonalizedSystemPrompt(persona, memory, emotionalContext);
    
    const moduleFeatures = personaModule.features.join(', ');
    const memoryFocus = personaModule.memoryRules.join(', ');
    
    const modularInstructions = `

PERSONA MODULE SYSTEM (${persona.name}):
- Active Features: ${moduleFeatures}
- Memory Focus: ${memoryFocus}
- UI Style: ${JSON.stringify(personaModule.uiStyle)}
- Response Style: ${personaModule.uiStyle.responseLength}

ADVANCED INTELLIGENCE ENHANCEMENT:
- Emotional Nuances Detected: ${gpt4oResponse?.emotionalValidation?.join('; ') || 'none'}
- Therapeutic Opportunities: ${gpt4oResponse.therapeuticTechniques?.join(', ') || 'general support'}
- Adaptive Strategy: ${gpt4oResponse.adaptivePersonality?.therapeuticModality || 'integrative'}
- Recommended Metaphors: ${gpt4oResponse.metaphors?.join('; ') || 'none'}

CONTEXTUAL INTELLIGENCE:
- Multi-step Reasoning: ${advancedResponse.reasoningSteps?.map((s: any) => s.conclusion).join(' → ') || 'direct response'}
- Memory Integration: ${advancedResponse.memoryIntegration?.emotionalPatterns?.join(', ') || 'establishing patterns'}
- Personality Alignment: ${advancedResponse.personalityAlignment?.therapeuticApproach || 'standard approach'}

Apply this enhanced intelligence to craft a response that feels naturally therapeutic, emotionally attuned, and distinctly aligned with your persona.`;

    return basePrompt + modularInstructions;
  }

  // Build persona-specific memory context
  private buildPersonaMemoryContext(memory: ConversationMemory, memoryRules: string[]): any {
    const filteredMemory = {
      shortTerm: memory.shortTermMemory.filter(item => 
        memoryRules.some(rule => item.context.includes(rule) || item.content.toLowerCase().includes(rule))
      ),
      longTerm: memory.longTermMemory.filter(item => 
        memoryRules.some(rule => item.type === rule || item.content.toLowerCase().includes(rule))
      ),
      emotionalProfile: memory.emotionalProfile,
      therapeuticProgress: memory.therapeuticProgress
    };
    
    return filteredMemory;
  }

  // Get persona module information
  getPersonaModule(personaId: string): any {
    return this.personaModules.get(personaId);
  }

  private buildEnhancedConversationPrompt(
    message: string,
    conversationHistory: any[],
    memory: ConversationMemory,
    emotionalContext: EmotionalContext,
    gpt4oResponse: any
  ): string {
    const basePrompt = this.buildConversationPrompt(message, conversationHistory, memory, emotionalContext);
    
    const enhancedContext = `

ENHANCED EMOTIONAL INTELLIGENCE:
- Primary emotion: ${gpt4oResponse.emotionalAnalysis?.primaryEmotion || 'neutral'}
- Secondary emotions: ${gpt4oResponse.emotionalAnalysis?.secondaryEmotions?.join(', ') || 'none'}
- Vulnerability level: ${Math.round((gpt4oResponse.emotionalAnalysis?.vulnerabilityLevel || 0) * 100)}%
- Underlying needs: ${gpt4oResponse.emotionalAnalysis?.underlyingNeeds?.join(', ') || 'general support'}
- Resilience indicators: ${gpt4oResponse.emotionalAnalysis?.resilienceIndicators?.join(', ') || 'seeking help'}

THERAPEUTIC GUIDANCE:
- Suggested validation: ${gpt4oResponse.emotionalValidation?.[0] || 'acknowledge their feelings'}
- Recommended reframe: ${gpt4oResponse.reframes?.[0] || 'offer perspective'}
- Follow-up focus: ${gpt4oResponse.followUpQuestions?.[0] || 'explore deeper'}

Respond with this enhanced understanding, maintaining your authentic persona voice while demonstrating deep emotional intelligence.`;

    return basePrompt + enhancedContext;
  }

  private async *streamAdvancedClaudeResponse(
    systemPrompt: string,
    conversationPrompt: string,
    persona: PersonaConfig,
    memory: ConversationMemory,
    emotionalContext: EmotionalContext,
    gpt4oResponse: any
  ): AsyncGenerator<StreamingResponse, void, unknown> {
    try {
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: conversationPrompt }
      ];

      console.log('Making Claude request with advanced intelligence:', JSON.stringify(messages, null, 2));
      const response = await makeClaudeRequest(messages);
      const content = response.choices?.[0]?.message?.content || "I'm here to support you.";

      console.log('Claude response received:', content.substring(0, 100) + '...');
      
      // Enhanced post-processing with GPT-4o intelligence
      const enhancedContent = this.applyGPT4oEnhancements(content, gpt4oResponse, emotionalContext);
      
      console.log('Claude response processed successfully:', enhancedContent.substring(0, 50) + '...');

      const emotion = this.detectResponseEmotion(enhancedContent, persona);
      const confidence = this.calculateResponseConfidence(enhancedContent, emotionalContext);

      // Quality evaluation with advanced metrics
      const quality = qualityEvaluator.evaluateResponse(
        conversationPrompt,
        enhancedContent,
        emotionalContext,
        persona.id
      );

      const streamingResponse: StreamingResponse = {
        content: enhancedContent,
        isComplete: true,
        emotion,
        confidence: Math.max(confidence, 0.8), // Boost confidence with advanced processing
        memoryUpdates: [],
        thoughtProcess: `Advanced processing applied: ${gpt4oResponse.therapeuticTechniques?.join(', ') || 'general support'}`
      };

      // Finalize memory with enhanced insights
      await this.finalizeMemoryUpdate(memory, enhancedContent, emotionalContext);

      yield streamingResponse;

    } catch (error) {
      console.error('Advanced Claude response error:', error);
      yield* this.generateAdvancedFallbackResponse(persona, emotionalContext, memory, gpt4oResponse);
    }
  }

  private applyGPT4oEnhancements(
    content: string, 
    gpt4oResponse: any, 
    emotionalContext: EmotionalContext
  ): string {
    let enhancedContent = content;

    // Apply emotional validation if high vulnerability detected
    if (gpt4oResponse.emotionalAnalysis?.vulnerabilityLevel > 0.6) {
      if (!enhancedContent.toLowerCase().includes('understand') && !enhancedContent.toLowerCase().includes('hear')) {
        enhancedContent = `I can sense how difficult this is for you. ${enhancedContent}`;
      }
    }

    // Apply therapeutic reframes if appropriate
    if (gpt4oResponse.reframes?.length > 0 && emotionalContext.intensity > 0.5) {
      const reframe = gpt4oResponse.reframes[0];
      if (!enhancedContent.includes(reframe.substring(0, 20))) {
        enhancedContent += ` Remember, ${reframe.toLowerCase()}.`;
      }
    }

    // Ensure follow-up engagement
    if (gpt4oResponse.followUpQuestions?.length > 0 && !enhancedContent.includes('?')) {
      enhancedContent += ` ${gpt4oResponse.followUpQuestions[0]}`;
    }

    return enhancedContent;
  }

  private async *generateAdvancedFallbackResponse(
    persona: PersonaConfig,
    emotionalContext: EmotionalContext,
    memory: ConversationMemory,
    gpt4oResponse: any
  ): AsyncGenerator<StreamingResponse, void, unknown> {
    
    let fallbackContent = this.generateContextualFallbackResponse(persona, emotionalContext, memory);
    
    // Apply GPT-4o enhancements to fallback
    if (gpt4oResponse.emotionalValidation?.length > 0) {
      fallbackContent = `${gpt4oResponse.emotionalValidation[0]}. ${fallbackContent}`;
    }

    yield {
      content: fallbackContent,
      isComplete: true,
      emotion: 'supportive',
      confidence: 0.7,
      memoryUpdates: [],
      thoughtProcess: 'Advanced fallback with emotional intelligence applied'
    };
  }

  private async *streamClaudeResponse(
    systemPrompt: string,
    conversationPrompt: string,
    persona: PersonaConfig,
    memory: ConversationMemory,
    emotionalContext: EmotionalContext
  ): AsyncGenerator<StreamingResponse, void, unknown> {
    try {
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: conversationPrompt }
      ];

      const response = await makeClaudeRequest(messages);
      const fullContent = response.choices[0]?.message?.content || "";

      if (!fullContent) {
        yield* this.generateFallbackResponse(persona, emotionalContext, memory);
        return;
      }

      console.log('Claude response received:', fullContent.substring(0, 100) + '...');

      // Yield the complete response at once for now (simpler and more reliable)
      yield {
        content: fullContent,
        isComplete: false,
        emotion: this.detectResponseEmotion(fullContent, persona),
        confidence: this.calculateResponseConfidence(fullContent, emotionalContext),
        memoryUpdates: [],
        thoughtProcess: this.generateThoughtProcess(persona, emotionalContext, memory)
      };

      // Final response with memory updates
      const memoryUpdates = await this.finalizeMemoryUpdate(memory, fullContent, emotionalContext);
      
      yield {
        content: "",
        isComplete: true,
        emotion: this.detectResponseEmotion(fullContent, persona),
        confidence: this.calculateResponseConfidence(fullContent, emotionalContext),
        memoryUpdates,
        thoughtProcess: this.generateThoughtProcess(persona, emotionalContext, memory)
      };

    } catch (error) {
      console.error("Claude streaming error:", error);
      
      // Fallback response
      yield* this.generateFallbackResponse(persona, emotionalContext, memory);
    }
  }

  private async detectEmotions(message: string): Promise<EmotionalContext> {
    // Check cache first
    const cacheKey = message.toLowerCase().trim();
    if (this.emotionDetectionCache.has(cacheKey)) {
      return this.emotionDetectionCache.get(cacheKey)!;
    }

    try {
      // Use Claude for emotion detection with GoEmotions-style classification
      const response = await makeClaudeRequest([{
        role: "system",
        content: `You are an expert emotion detection system. Analyze the text for emotions using the GoEmotions taxonomy. 

CRITICAL: You must respond with ONLY valid JSON, no additional text or formatting.

Respond with this exact JSON structure:
{
  "detectedEmotions": ["emotion1", "emotion2"],
  "intensity": 0.5,
  "valence": 0.0,
  "arousal": 0.5,
  "emotionalTriggers": ["trigger1"],
  "supportNeeds": ["need1"],
  "crisisIndicators": []
}

Emotions can include: joy, sadness, anger, fear, surprise, disgust, love, optimism, pessimism, anxiety, excitement, gratitude, confusion, curiosity, neutral, etc.`
      }, {
        role: "user",
        content: `Analyze this message for emotions and respond with JSON only: "${message}"`
      }]);

      // Extract the actual message content from OpenRouter response
      const responseContent = response.choices?.[0]?.message?.content || response;

      // Clean the response to ensure it's valid JSON
      let cleanResponse = String(responseContent).trim();
      
      // Remove any markdown formatting
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      // Find JSON object if there's extra text
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }

      let result;
      try {
        result = JSON.parse(cleanResponse);
      } catch (parseError) {
        console.log('JSON parse failed for emotion detection:', cleanResponse);
        console.log('Parse error:', (parseError as Error).message);
        
        // Try to extract JSON from markdown code blocks or wrapped text
        const codeBlockMatch = cleanResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          result = JSON.parse(codeBlockMatch[1]);
        } else {
          // Try a more comprehensive JSON extraction
          const jsonMatch = cleanResponse.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0]);
          } else {
            // If all parsing fails, return fallback emotion detection
            console.log('Using fallback emotion detection due to parse failure');
            return this.fallbackEmotionDetection(message);
          }
        }
      }
      
      const emotionalContext: EmotionalContext = {
        detectedEmotions: result.detectedEmotions || ["neutral"],
        intensity: Math.max(0, Math.min(1, result.intensity || 0.5)),
        valence: Math.max(-1, Math.min(1, result.valence || 0)),
        arousal: Math.max(0, Math.min(1, result.arousal || 0.5)),
        emotionalTriggers: result.emotionalTriggers || [],
        supportNeeds: result.supportNeeds || [],
        crisisIndicators: result.crisisIndicators || []
      };

      // Cache the result
      this.emotionDetectionCache.set(cacheKey, emotionalContext);
      
      return emotionalContext;

    } catch (error) {
      console.error("Emotion detection error:", error);
      
      // Fallback emotion detection
      return this.fallbackEmotionDetection(message);
    }
  }

  private fallbackEmotionDetection(message: string): EmotionalContext {
    const lowerMessage = message.toLowerCase();
    
    // Simple keyword-based emotion detection
    const emotionKeywords = {
      joy: ['happy', 'excited', 'amazing', 'wonderful', 'great', 'fantastic'],
      sadness: ['sad', 'depressed', 'down', 'hopeless', 'crying', 'lonely'],
      anger: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'pissed'],
      anxiety: ['anxious', 'worried', 'nervous', 'scared', 'panic', 'stress'],
      fear: ['afraid', 'terrified', 'frightened', 'phobia', 'terror'],
      love: ['love', 'adore', 'cherish', 'care', 'affection']
    };
    
    const detectedEmotions: string[] = [];
    let intensity = 0.5;
    let valence = 0;
    let arousal = 0.5;
    
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        detectedEmotions.push(emotion);
        
        // Adjust valence and arousal based on emotion
        switch(emotion) {
          case 'joy':
          case 'love':
            valence += 0.3;
            arousal += 0.2;
            break;
          case 'sadness':
            valence -= 0.4;
            arousal -= 0.1;
            break;
          case 'anger':
            valence -= 0.3;
            arousal += 0.4;
            break;
          case 'anxiety':
          case 'fear':
            valence -= 0.2;
            arousal += 0.3;
            break;
        }
      }
    });
    
    if (detectedEmotions.length === 0) {
      detectedEmotions.push('neutral');
    } else {
      intensity = Math.min(1, 0.6 + (detectedEmotions.length * 0.1));
    }
    
    return {
      detectedEmotions,
      intensity: Math.max(0, Math.min(1, intensity)),
      valence: Math.max(-1, Math.min(1, valence)),
      arousal: Math.max(0, Math.min(1, arousal)),
      emotionalTriggers: [],
      supportNeeds: [],
      crisisIndicators: []
    };
  }

  private getConversationMemory(userId: string, personaId: string): ConversationMemory {
    const memoryKey = `${userId}-${personaId}`;
    
    if (!this.conversationMemories.has(memoryKey)) {
      this.conversationMemories.set(memoryKey, {
        userId,
        personaId,
        shortTermMemory: [],
        longTermMemory: [],
        emotionalProfile: {
          dominantEmotions: ["neutral"],
          triggers: [],
          copingMechanisms: [],
          supportNeeds: ["General support"],
          vulnerabilityAreas: [],
          strengthAreas: []
        },
        relationshipDynamics: {
          trustLevel: 0.5,
          intimacyDepth: 0.1,
          communicationPreference: 'supportive',
          boundaries: [],
          sharedExperiences: [],
          supportHistory: []
        },
        therapeuticProgress: {
          initialConcerns: [],
          workingGoals: [],
          completedGoals: [],
          breakthroughs: [],
          recurringThemes: [],
          progressMarkers: []
        }
      });
    }
    
    return this.conversationMemories.get(memoryKey)!;
  }

  private async updateConversationMemory(
    memory: ConversationMemory,
    message: string,
    emotionalContext: EmotionalContext,
    memoryRules: string[] = []
  ): Promise<void> {
    // Add to short-term memory
    memory.shortTermMemory.push({
      content: message,
      emotion: emotionalContext.detectedEmotions[0] || 'neutral',
      importance: emotionalContext.intensity,
      timestamp: new Date(),
      context: emotionalContext.emotionalTriggers.join(', ')
    });

    // Keep only recent short-term memories
    if (memory.shortTermMemory.length > 10) {
      // Move important memories to long-term
      const importantMemories = memory.shortTermMemory
        .filter(m => m.importance > 0.7)
        .slice(0, 3);
      
      importantMemories.forEach(mem => {
        memory.longTermMemory.push({
          content: mem.content,
          type: this.categorizeMemoryType(mem.content),
          emotional_weight: mem.importance,
          timestamp: mem.timestamp,
          recalled_count: 0,
          associations: emotionalContext.emotionalTriggers
        });
      });
      
      memory.shortTermMemory = memory.shortTermMemory.slice(-5);
    }

    // Update emotional profile
    emotionalContext.detectedEmotions.forEach(emotion => {
      if (!memory.emotionalProfile.dominantEmotions.includes(emotion)) {
        memory.emotionalProfile.dominantEmotions.push(emotion);
      }
    });

    // Update triggers and support needs
    memory.emotionalProfile.triggers.push(...emotionalContext.emotionalTriggers);
    memory.emotionalProfile.supportNeeds.push(...emotionalContext.supportNeeds);

    // Keep arrays manageable
    const uniqueTriggers = memory.emotionalProfile.triggers.filter((item, index, arr) => arr.indexOf(item) === index);
    const uniqueSupport = memory.emotionalProfile.supportNeeds.filter((item, index, arr) => arr.indexOf(item) === index);
    memory.emotionalProfile.triggers = uniqueTriggers.slice(-10);
    memory.emotionalProfile.supportNeeds = uniqueSupport.slice(-10);
  }

  private categorizeMemoryType(content: string): 'achievement' | 'goal' | 'trauma' | 'preference' | 'relationship' | 'breakthrough' {
    const lower = content.toLowerCase();
    
    if (lower.includes('achieved') || lower.includes('accomplished') || lower.includes('proud')) {
      return 'achievement';
    }
    if (lower.includes('want to') || lower.includes('goal') || lower.includes('hoping')) {
      return 'goal';
    }
    if (lower.includes('traumatic') || lower.includes('abuse') || lower.includes('trauma')) {
      return 'trauma';
    }
    if (lower.includes('like') || lower.includes('prefer') || lower.includes('enjoy')) {
      return 'preference';
    }
    if (lower.includes('family') || lower.includes('friend') || lower.includes('partner')) {
      return 'relationship';
    }
    
    return 'breakthrough';
  }

  private buildPersonalizedSystemPrompt(
    persona: PersonaConfig,
    memory: ConversationMemory,
    emotionalContext: EmotionalContext,
    isFirstMessage: boolean = false,
    userId: string = ''
  ): string {
    const recentMemories = memory.shortTermMemory.slice(-3).map(m => m.content).join('; ');
    const dominantEmotions = memory.emotionalProfile.dominantEmotions.slice(-3).join(', ');
    const supportNeeds = emotionalContext.supportNeeds.join(', ');
    
    return `${persona.systemPrompt}

Context about this person:
- Recent conversation topics: ${recentMemories || 'New conversation'}
- Emotional patterns: ${dominantEmotions || 'Still learning'}
- Current emotional state: ${emotionalContext.detectedEmotions.join(', ')}
- Current support needs: ${supportNeeds || 'General support'}
- Trust level: ${Math.round(memory.relationshipDynamics.trustLevel * 100)}%

Remember to:
1. Be authentic to your persona while being deeply empathetic
2. Reference relevant memories naturally
3. Adapt your communication style to their emotional state
4. Provide the specific type of support they need
5. Build trust and rapport gradually`;
  }

  private buildConversationPrompt(
    message: string,
    conversationHistory: any[],
    memory: ConversationMemory,
    emotionalContext: EmotionalContext
  ): string {
    const recentHistory = conversationHistory.slice(-4).map(msg => 
      `${msg.sender}: ${msg.content}`
    ).join('\n');
    
    return `${recentHistory ? `Recent conversation:\n${recentHistory}\n\n` : ''}Current message: "${message}"

They seem to be feeling ${emotionalContext.detectedEmotions.join(' and ')}.

Respond naturally as your authentic self. Don't mention emotions or analysis - just be human and respond to what they shared. Keep it conversational, warm, and real.`;
  }

  private detectResponseEmotion(content: string, persona: PersonaConfig): string {
    // Simple emotion detection based on response content and persona
    const supportiveWords = ['understand', 'support', 'help', 'care', 'here for you'];
    const encouragingWords = ['strength', 'capable', 'progress', 'proud', 'amazing'];
    const empathicWords = ['feel', 'emotions', 'difficult', 'challenging', 'validate'];
    
    const lower = content.toLowerCase();
    
    if (supportiveWords.some(word => lower.includes(word))) {
      return 'supportive';
    }
    if (encouragingWords.some(word => lower.includes(word))) {
      return 'encouraging';
    }
    if (empathicWords.some(word => lower.includes(word))) {
      return 'empathetic';
    }
    
    // Default based on persona
    if (persona.personality.warmth > 0.8) return 'warm';
    if (persona.personality.empathy > 0.8) return 'compassionate';
    if (persona.personality.supportiveness > 0.8) return 'supportive';
    
    return 'caring';
  }

  private calculateResponseConfidence(content: string, emotionalContext: EmotionalContext): number {
    // Base confidence on content length and emotional alignment
    const hasEmotionalWords = ['feel', 'understand', 'support', 'help'].some(word => 
      content.toLowerCase().includes(word)
    );
    
    let confidence = 0.7;
    
    if (content.length > 50) confidence += 0.1;
    if (hasEmotionalWords) confidence += 0.1;
    if (emotionalContext.intensity > 0.7) confidence += 0.1;
    
    return Math.min(1, confidence);
  }

  private async finalizeMemoryUpdate(
    memory: ConversationMemory,
    response: string,
    emotionalContext: EmotionalContext
  ): Promise<any[]> {
    // Update relationship dynamics based on response
    memory.relationshipDynamics.trustLevel = Math.min(1, memory.relationshipDynamics.trustLevel + 0.02);
    memory.relationshipDynamics.intimacyDepth = Math.min(1, memory.relationshipDynamics.intimacyDepth + 0.01);
    
    // Add to support history
    memory.relationshipDynamics.supportHistory.push({
      type: 'emotional_support',
      effectiveness: this.assessResponseQuality(response, emotionalContext),
      timestamp: new Date()
    });
    
    return [{
      type: 'relationship_update',
      trust: memory.relationshipDynamics.trustLevel,
      intimacy: memory.relationshipDynamics.intimacyDepth
    }];
  }

  private assessResponseQuality(response: string, emotionalContext: EmotionalContext): number {
    // Simple quality assessment
    const hasValidation = response.toLowerCase().includes('understand') || 
                         response.toLowerCase().includes('hear you');
    const hasSupport = response.toLowerCase().includes('support') ||
                      response.toLowerCase().includes('here for');
    const hasEmpathy = response.toLowerCase().includes('feel') ||
                      response.toLowerCase().includes('difficult');
    
    let quality = 0.6;
    if (hasValidation) quality += 0.15;
    if (hasSupport) quality += 0.15;
    if (hasEmpathy) quality += 0.1;
    
    return Math.min(1, quality);
  }

  private generateThoughtProcess(
    persona: PersonaConfig,
    emotionalContext: EmotionalContext,
    memory: ConversationMemory
  ): string {
    const emotions = emotionalContext.detectedEmotions.join(', ');
    const intensity = emotionalContext.intensity;
    const trustLevel = memory.relationshipDynamics.trustLevel;
    
    return `Detected emotions: ${emotions} (${Math.round(intensity * 100)}% intensity). Trust level: ${Math.round(trustLevel * 100)}%. Focusing on ${persona.specializations[0]} approach.`;
  }

  private async *generateFallbackResponse(
    persona: PersonaConfig,
    emotionalContext: EmotionalContext,
    memory: ConversationMemory
  ): AsyncGenerator<StreamingResponse, void, unknown> {
    const fallbackContent = this.generateContextualFallbackResponse(persona, emotionalContext, memory);
    
    // Split into chunks
    const words = fallbackContent.split(' ');
    let chunkBuffer = "";
    
    for (let i = 0; i < words.length; i++) {
      chunkBuffer += words[i] + ' ';
      
      if ((i + 1) % 3 === 0 || i === words.length - 1) {
        yield {
          content: chunkBuffer.trim() + ' ',
          isComplete: i === words.length - 1,
          emotion: this.detectResponseEmotion(chunkBuffer, persona),
          confidence: 0.6,
          memoryUpdates: [],
          thoughtProcess: "Using fallback response due to API issue"
        };
        chunkBuffer = "";
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  getPersonaConfig(personaId: string): PersonaConfig | undefined {
    return this.personaConfigs.get(personaId);
  }

  getConversationMemoryStats(userId: string, personaId: string): any {
    const memory = this.conversationMemories.get(`${userId}-${personaId}`);
    if (!memory) return null;
    
    return {
      shortTermMemories: memory.shortTermMemory.length,
      longTermMemories: memory.longTermMemory.length,
      trustLevel: memory.relationshipDynamics.trustLevel,
      dominantEmotions: memory.emotionalProfile.dominantEmotions
    };
  }

  private generateContextualFallbackResponse(
    persona: PersonaConfig,
    emotionalContext: EmotionalContext,
    memory: ConversationMemory
  ): string {
    // Create varied responses based on emotion and persona
    const emotionState = emotionalContext.detectedEmotions[0] || 'neutral';
    const responseIndex = Math.floor(Math.random() * 3); // 3 variations per emotion/persona combo
    
    const responses = {
      sarah: {
        neutral: [
          "How are you feeling right now? I'm here to listen and support you through whatever you're experiencing.",
          "I can sense you have something on your mind. Take your time - what would you like to explore together?",
          "Sometimes it helps just to have someone who understands. What's been weighing on you lately?"
        ],
        anxiety: [
          "I can feel the worry in your words. Anxiety can be overwhelming, but you're not facing this alone. What's making you feel most anxious right now?",
          "Those anxious feelings are so valid. Let's take this one step at a time. What's the biggest concern on your mind?",
          "Anxiety has a way of making everything feel urgent. Take a breath with me. What feels most manageable to talk about first?"
        ],
        sadness: [
          "I hear the heaviness in what you're sharing. It's okay to feel low - these feelings deserve space. What's been hardest for you recently?",
          "Sometimes sadness needs to be honored before it can be healed. I'm here with you in this. What would feel supportive right now?",
          "Your sadness makes complete sense. You don't have to carry this alone. What's been on your heart?"
        ],
        joy: [
          "I love hearing the lightness in your voice! It's wonderful when good things happen. What's bringing you joy today?",
          "Your happiness is contagious! I'm so glad you're experiencing something positive. Tell me more about what's going well.",
          "It's beautiful to witness your joy. These moments matter. What's been the highlight for you?"
        ]
      },
      alex: {
        neutral: [
          "Hey there! What's going on with you today? I'm here if you want to chat about anything.",
          "Yo! Something on your mind? You know I'm always down to listen and hang out.",
          "What's up? You seem like you've got stuff brewing. I'm here for whatever you need to talk about."
        ],
        anxiety: [
          "Ugh, anxiety is the worst! I totally get those jittery feelings. What's got you all wound up today?",
          "Okay, I can feel that stressed energy through the screen! Take a sec. What's making your brain go crazy right now?",
          "Anxiety brain is so annoying, right? I've been there too. What's the main thing that's freaking you out?"
        ],
        sadness: [
          "Aw, I can tell you're going through it right now. That sucks, and I'm sorry you're feeling this way. What's got you down?",
          "Man, tough days are the absolute worst. But hey, you reached out, which shows you're strong. What's been rough lately?",
          "I hate that you're feeling low right now. You're definitely not alone in this. Want to tell me what's making things hard?"
        ],
        joy: [
          "YES! I love this energy! Something good happened, didn't it? Spill the tea! ✨",
          "Okay this is amazing! Your good vibes are totally infectious right now. What's got you so happy?",
          "I'm literally smiling just reading this! Good things happening for you makes my day. What's the good news?"
        ]
      },
      maya: {
        neutral: [
          "I sense you're here for a reason. Our hearts know when we need connection. What's stirring within you today?",
          "There's a gentle wisdom in simply showing up. What would your soul like to share in this quiet moment?",
          "Sometimes we arrive at conversations like this when our inner self needs tending. What feels alive in you right now?"
        ],
        anxiety: [
          "I can feel the storm of worry within you. Let's breathe together and find the calm center. What fears are swirling strongest?",
          "Anxiety is like choppy waters - unsettling but temporary. Your steady breath can be your anchor. What's creating the turbulence?",
          "The mind creates such convincing stories when we're anxious. Let's return to what's real and present. What needs your gentle attention?"
        ],
        sadness: [
          "Sadness is the heart's way of honoring what matters deeply. Your tears have wisdom. What loss or longing is speaking through you?",
          "There's a sacred quality to sadness - it connects us to our deepest humanity. What's your heart grieving right now?",
          "Like winter preparing for spring, sadness often clears space for new growth. What's asking to be released or transformed?"
        ],
        joy: [
          "Your joy is like sunlight breaking through clouds - it illuminates everything around it. What's awakening this beautiful energy?",
          "I can feel your heart singing! Joy is such a gift, both to yourself and the world. What's blooming in your life?",
          "There's magic in moments of pure joy. Your light is shining so brightly. What's bringing this wonderful aliveness?"
        ]
      },
      marcus: {
        neutral: [
          "Good to see you here. Ready to tackle whatever's on your mind? Let's figure out what you want to work on today.",
          "What's the challenge or goal you're dealing with right now? I'm here to help you break it down and move forward.",
          "Every conversation is an opportunity to make progress. What area of your life could use some momentum right now?"
        ],
        anxiety: [
          "Anxiety often signals that we care deeply about something. That's not weakness - that's investment. What outcome matters most to you here?",
          "I hear the concern, and that shows you're thinking ahead. Let's channel that energy into action. What's one thing you can control in this situation?",
          "Worrying means you're engaged with something important. Now let's shift from worry to strategy. What's the main challenge we need to address?"
        ],
        sadness: [
          "Tough times test our resilience, but they also reveal our strength. You're still here, still fighting. What support do you need to keep moving?",
          "Sadness can be a teacher - it shows us what we value. What's this experience trying to tell you about what matters most?",
          "It takes courage to feel difficult emotions instead of avoiding them. That's already a sign of strength. What would help you process this?"
        ],
        joy: [
          "This is awesome! Success breeds success. What strategies or mindsets helped you achieve this positive outcome?",
          "I love seeing you in this space! Wins like this deserve celebration. What's the key lesson you're taking from this experience?",
          "Your positive energy is contagious! This kind of momentum can fuel even bigger goals. What do you want to tackle next?"
        ]
      }
    };
    
    const personaResponses = responses[persona.id as keyof typeof responses] || responses.sarah;
    const emotionResponses = personaResponses[emotionState as keyof typeof personaResponses] || personaResponses.neutral;
    
    return emotionResponses[responseIndex] || emotionResponses[0];
  }
}

export const claudeConversationSystem = new ClaudeConversationSystem();