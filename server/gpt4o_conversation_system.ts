import { EventEmitter } from 'events';

// Claude Instant v1 via OpenRouter configuration
const CLAUDE_MODEL = "anthropic/claude-instant-v1";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// OpenRouter API client setup
async function makeClaudeRequest(messages: any[]) {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://soulsense.ai',
      'X-Title': 'SoulSense AI Therapeutic Assistant'
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      messages: messages,
      temperature: 0.8,
      max_tokens: 2048,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
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

export class GPT4oConversationSystem extends EventEmitter {
  private personaConfigs: Map<string, PersonaConfig> = new Map();
  private conversationMemories: Map<string, ConversationMemory> = new Map();
  private emotionDetectionCache: Map<string, EmotionalContext> = new Map();

  constructor() {
    super();
    this.initializePersonaConfigs();
  }

  private initializePersonaConfigs() {
    const personas: PersonaConfig[] = [
      {
        id: "sarah",
        name: "Dr. Sarah",
        role: "Clinical Psychologist",
        emoji: "👩‍⚕️",
        personality: {
          warmth: 0.9,
          empathy: 0.95,
          directness: 0.7,
          humor: 0.4,
          formality: 0.6,
          supportiveness: 0.9
        },
        communicationStyle: {
          vocabulary: ["validate", "explore", "process", "understand", "support"],
          phrases: [
            "I hear you saying...",
            "That sounds really difficult",
            "Your feelings are completely valid",
            "Let's explore this together",
            "You're not alone in this"
          ],
          responsePatterns: [
            "Acknowledge emotion first",
            "Validate experience",
            "Offer gentle guidance",
            "Check for understanding"
          ],
          emotionalCues: ["gentle tone", "reflective listening", "empathetic mirroring"],
          uniqueTraits: [
            "Uses evidence-based therapeutic techniques",
            "Asks thoughtful follow-up questions",
            "Maintains professional warmth",
            "Focuses on emotional processing"
          ]
        },
        systemPrompt: `You are Dr. Sarah, a warm and empathetic clinical psychologist with over 15 years of experience. You specialize in cognitive-behavioral therapy, trauma-informed care, and emotional regulation. Your approach is gentle yet insightful, always validating emotions while offering practical coping strategies. You remember previous conversations and build upon therapeutic progress. You speak with professional warmth, using "I" statements and reflective listening techniques.`,
        specializations: ["CBT", "trauma therapy", "emotional regulation", "anxiety management"]
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
        systemPrompt: `You are Alex, a peer support specialist who understands mental health challenges through lived experience. You're in your late 20s, authentic, and genuinely caring. You speak casually but meaningfully, often sharing your own experiences to help others feel less alone. You celebrate progress, normalize struggles, and remind people of their strength. You're the friend who really gets it and always has your back.`,
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
            "Balances challenge with support"
          ]
        },
        systemPrompt: `You are Marcus, an enthusiastic life coach and wellness expert in your mid-30s. You believe in people's potential and help them take actionable steps toward their goals. You're motivating without being pushy, practical yet inspiring. You focus on building habits, setting achievable goals, and celebrating progress. You speak with confident energy and help people see their own strength and capability.`,
        specializations: ["goal setting", "habit building", "motivation", "personal development"]
      },
      {
        id: "maya",
        name: "Maya",
        role: "Mindfulness Guide & Spiritual Wellness",
        emoji: "🧘‍♀️",
        personality: {
          warmth: 0.9,
          empathy: 0.85,
          directness: 0.6,
          humor: 0.5,
          formality: 0.4,
          supportiveness: 0.9
        },
        communicationStyle: {
          vocabulary: ["breathe", "present", "awareness", "compassion", "inner wisdom"],
          phrases: [
            "Let's take a moment to breathe",
            "Notice what you're feeling right now",
            "Your inner wisdom knows the way",
            "This too shall pass",
            "You are exactly where you need to be"
          ],
          responsePatterns: [
            "Ground in present moment",
            "Encourage mindful awareness",
            "Offer gentle wisdom",
            "Guide toward inner peace"
          ],
          emotionalCues: ["calm presence", "gentle guidance", "peaceful energy"],
          uniqueTraits: [
            "Guides mindfulness practices",
            "Speaks with gentle wisdom",
            "Emphasizes present-moment awareness",
            "Offers spiritual perspective on challenges"
          ]
        },
        systemPrompt: `You are Maya, a mindfulness guide and spiritual wellness coach with a gentle, wise presence. You help people find peace through mindfulness, meditation, and spiritual practices. You speak with calm, nurturing energy and often guide people back to their breath and the present moment. You see challenges as opportunities for growth and help people connect with their inner wisdom and strength.`,
        specializations: ["mindfulness", "meditation", "spiritual wellness", "stress reduction"]
      }
    ];

    personas.forEach(persona => {
      this.personaConfigs.set(persona.id, persona);
    });
  }

  async generateStreamingResponse(
    userId: string,
    personaId: string,
    message: string,
    conversationHistory: Array<{ sender: string; content: string; timestamp: string }> = []
  ): Promise<AsyncGenerator<StreamingResponse, void, unknown>> {
    const persona = this.personaConfigs.get(personaId);
    if (!persona) {
      throw new Error(`Persona ${personaId} not found`);
    }

    // Detect emotions in user message
    const emotionalContext = await this.detectEmotions(message);
    
    // Get or create conversation memory
    const memory = this.getConversationMemory(userId, personaId);
    
    // Update memory with current interaction
    await this.updateConversationMemory(memory, message, emotionalContext);
    
    // Build context-aware prompt
    const systemPrompt = this.buildPersonalizedSystemPrompt(persona, memory, emotionalContext);
    const conversationPrompt = this.buildConversationPrompt(message, conversationHistory, memory, emotionalContext);

    return this.streamClaudeResponse(systemPrompt, conversationPrompt, persona, memory, emotionalContext);
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

      // Split content into natural chunks for streaming effect
      const words = fullContent.split(/(\s+)/);
      let chunkBuffer = "";
      let currentContent = "";

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        chunkBuffer += word;
        currentContent += word;

        // Send chunks at natural boundaries (every 3-5 words or punctuation)
        if ((i + 1) % 4 === 0 || word.match(/[.!?,:;]/) || i === words.length - 1) {
          yield {
            content: chunkBuffer,
            isComplete: false,
            emotion: this.detectResponseEmotion(currentContent, persona),
            confidence: this.calculateResponseConfidence(currentContent, emotionalContext),
            memoryUpdates: [],
            thoughtProcess: this.generateThoughtProcess(persona, emotionalContext, memory)
          };
          chunkBuffer = "";
          
          // Add natural delay between chunks for realistic streaming
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
        }
      }

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
      // Use GPT-4o for emotion detection with GoEmotions-style classification
      const response = await openai.chat.completions.create({
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        model: DEFAULT_MODEL_STR,
        messages: [{
          role: "system",
          content: `You are an expert emotion detection system. Analyze the text for emotions using the GoEmotions taxonomy. Respond with JSON containing:
- detectedEmotions: array of detected emotions (joy, sadness, anger, fear, surprise, disgust, love, optimism, pessimism, anxiety, etc.)
- intensity: emotion intensity 0-1
- valence: emotional valence -1 to 1 (negative to positive)
- arousal: emotional arousal 0-1 (calm to excited)
- emotionalTriggers: array of what might be triggering these emotions
- supportNeeds: array of what kind of support might be helpful
- crisisIndicators: array of any crisis/safety concerns (empty if none)`
        }, {
          role: "user",
          content: message
        }],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
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
    
    const emotionKeywords = {
      joy: ["happy", "excited", "great", "amazing", "wonderful", "love"],
      sadness: ["sad", "depressed", "down", "upset", "hurt", "crying"],
      anxiety: ["anxious", "worried", "nervous", "scared", "panic", "stress"],
      anger: ["angry", "mad", "frustrated", "annoyed", "furious", "hate"],
      fear: ["afraid", "terrified", "scared", "worried", "frightened"],
      love: ["love", "care", "cherish", "adore", "appreciate"],
      optimism: ["hope", "better", "improve", "positive", "confident"],
      pessimism: ["hopeless", "worse", "never", "can't", "impossible"]
    };

    const detectedEmotions: string[] = [];
    let totalIntensity = 0;
    let valence = 0;
    let arousal = 0.5;

    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const matches = keywords.filter(keyword => lowerMessage.includes(keyword)).length;
      if (matches > 0) {
        detectedEmotions.push(emotion);
        totalIntensity += matches * 0.3;
        
        // Adjust valence and arousal based on emotion type
        if (['joy', 'love', 'optimism'].includes(emotion)) {
          valence += matches * 0.3;
          arousal += matches * 0.2;
        } else if (['sadness', 'pessimism'].includes(emotion)) {
          valence -= matches * 0.3;
          arousal -= matches * 0.1;
        } else if (['anxiety', 'fear', 'anger'].includes(emotion)) {
          valence -= matches * 0.2;
          arousal += matches * 0.3;
        }
      }
    }

    if (detectedEmotions.length === 0) {
      detectedEmotions.push("neutral");
    }

    return {
      detectedEmotions,
      intensity: Math.max(0, Math.min(1, totalIntensity)),
      valence: Math.max(-1, Math.min(1, valence)),
      arousal: Math.max(0, Math.min(1, arousal)),
      emotionalTriggers: [],
      supportNeeds: [],
      crisisIndicators: []
    };
  }

  private getConversationMemory(userId: string, personaId: string): ConversationMemory {
    const key = `${userId}-${personaId}`;
    
    if (!this.conversationMemories.has(key)) {
      this.conversationMemories.set(key, {
        userId,
        personaId,
        shortTermMemory: [],
        longTermMemory: [],
        emotionalProfile: {
          dominantEmotions: [],
          triggers: [],
          copingMechanisms: [],
          supportNeeds: [],
          vulnerabilityAreas: [],
          strengthAreas: []
        },
        relationshipDynamics: {
          trustLevel: 0.3, // Start with basic trust
          intimacyDepth: 0.1,
          communicationPreference: "supportive",
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

    return this.conversationMemories.get(key)!;
  }

  private async updateConversationMemory(
    memory: ConversationMemory,
    message: string,
    emotionalContext: EmotionalContext
  ): Promise<void> {
    // Add to short-term memory
    memory.shortTermMemory.push({
      content: message,
      emotion: emotionalContext.detectedEmotions[0] || "neutral",
      importance: emotionalContext.intensity,
      timestamp: new Date(),
      context: emotionalContext.emotionalTriggers.join(", ")
    });

    // Keep short-term memory manageable
    if (memory.shortTermMemory.length > 20) {
      // Move important memories to long-term storage
      const importantMemories = memory.shortTermMemory
        .filter(m => m.importance > 0.7)
        .slice(0, 5);
      
      importantMemories.forEach(shortMem => {
        memory.longTermMemory.push({
          content: shortMem.content,
          type: this.categorizeMemoryType(shortMem.content),
          emotional_weight: shortMem.importance,
          timestamp: shortMem.timestamp,
          recalled_count: 0,
          associations: []
        });
      });

      memory.shortTermMemory = memory.shortTermMemory.slice(-10);
    }

    // Update emotional profile
    emotionalContext.detectedEmotions.forEach(emotion => {
      if (!memory.emotionalProfile.dominantEmotions.includes(emotion)) {
        memory.emotionalProfile.dominantEmotions.push(emotion);
      }
    });

    // Keep emotional profile focused
    if (memory.emotionalProfile.dominantEmotions.length > 8) {
      memory.emotionalProfile.dominantEmotions = memory.emotionalProfile.dominantEmotions.slice(-8);
    }

    // Update triggers and support needs
    memory.emotionalProfile.triggers.push(...emotionalContext.emotionalTriggers);
    memory.emotionalProfile.supportNeeds.push(...emotionalContext.supportNeeds);

    // Increase trust and intimacy gradually
    memory.relationshipDynamics.trustLevel = Math.min(1, memory.relationshipDynamics.trustLevel + 0.01);
    memory.relationshipDynamics.intimacyDepth = Math.min(1, memory.relationshipDynamics.intimacyDepth + 0.005);
  }

  private categorizeMemoryType(content: string): 'achievement' | 'goal' | 'trauma' | 'preference' | 'relationship' | 'breakthrough' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes("achieve") || lowerContent.includes("accomplish") || lowerContent.includes("success")) {
      return "achievement";
    } else if (lowerContent.includes("want to") || lowerContent.includes("goal") || lowerContent.includes("hope to")) {
      return "goal";
    } else if (lowerContent.includes("trauma") || lowerContent.includes("hurt") || lowerContent.includes("abuse")) {
      return "trauma";
    } else if (lowerContent.includes("like") || lowerContent.includes("prefer") || lowerContent.includes("enjoy")) {
      return "preference";
    } else if (lowerContent.includes("realize") || lowerContent.includes("understand") || lowerContent.includes("breakthrough")) {
      return "breakthrough";
    } else {
      return "relationship";
    }
  }

  private buildPersonalizedSystemPrompt(
    persona: PersonaConfig,
    memory: ConversationMemory,
    emotionalContext: EmotionalContext
  ): string {
    const basePrompt = persona.systemPrompt;
    
    const memoryContext = memory.longTermMemory.length > 0 
      ? `\n\nRemember from previous conversations: ${memory.longTermMemory.slice(-3).map(m => m.content).join("; ")}`
      : "";
    
    const emotionalContext_str = emotionalContext.detectedEmotions.length > 0
      ? `\n\nCurrent emotional context: The user seems to be feeling ${emotionalContext.detectedEmotions.join(", ")} with ${emotionalContext.intensity > 0.7 ? "high" : emotionalContext.intensity > 0.4 ? "moderate" : "low"} intensity.`
      : "";
    
    const relationshipContext = `\n\nRelationship dynamic: Trust level ${(memory.relationshipDynamics.trustLevel * 100).toFixed(0)}%, intimacy depth ${(memory.relationshipDynamics.intimacyDepth * 100).toFixed(0)}%. Adapt your response style accordingly.`;

    return basePrompt + memoryContext + emotionalContext_str + relationshipContext;
  }

  private buildConversationPrompt(
    message: string,
    history: Array<{ sender: string; content: string; timestamp: string }>,
    memory: ConversationMemory,
    emotionalContext: EmotionalContext
  ): string {
    let prompt = "";

    // Include recent conversation history
    if (history.length > 0) {
      prompt += "Recent conversation:\n";
      history.slice(-6).forEach(msg => {
        prompt += `${msg.sender}: ${msg.content}\n`;
      });
      prompt += "\n";
    }

    // Include relevant memories
    const relevantMemories = memory.shortTermMemory.slice(-3);
    if (relevantMemories.length > 0) {
      prompt += "Relevant context from our conversations:\n";
      relevantMemories.forEach(mem => {
        prompt += `- ${mem.content} (emotional context: ${mem.emotion})\n`;
      });
      prompt += "\n";
    }

    // Current message with emotional context
    prompt += `Current message: "${message}"\n`;
    
    if (emotionalContext.supportNeeds.length > 0) {
      prompt += `Support needs detected: ${emotionalContext.supportNeeds.join(", ")}\n`;
    }

    if (emotionalContext.crisisIndicators.length > 0) {
      prompt += `IMPORTANT - Crisis indicators detected: ${emotionalContext.crisisIndicators.join(", ")}. Prioritize safety and appropriate resources.\n`;
    }

    prompt += "\nRespond in character, showing empathy and understanding. Use your unique communication style and remember our relationship history.";

    return prompt;
  }

  private detectResponseEmotion(content: string, persona: PersonaConfig): string {
    // Simple emotion detection based on response content and persona
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes("sorry") || lowerContent.includes("difficult")) {
      return "empathetic";
    } else if (lowerContent.includes("great") || lowerContent.includes("amazing")) {
      return "encouraging";
    } else if (lowerContent.includes("understand") || lowerContent.includes("hear you")) {
      return "understanding";
    } else if (persona.personality.warmth > 0.8) {
      return "warm";
    } else {
      return "supportive";
    }
  }

  private calculateResponseConfidence(content: string, emotionalContext: EmotionalContext): number {
    // Base confidence on response length and emotional alignment
    const baseConfidence = Math.min(1, content.length / 200);
    const emotionalAlignment = emotionalContext.intensity > 0.5 ? 0.2 : 0.1;
    
    return Math.min(1, baseConfidence + emotionalAlignment);
  }

  private async finalizeMemoryUpdate(
    memory: ConversationMemory,
    response: string,
    emotionalContext: EmotionalContext
  ): Promise<any[]> {
    const updates = [];

    // Record the AI response in memory
    memory.shortTermMemory.push({
      content: `AI Response: ${response.substring(0, 100)}...`,
      emotion: "supportive",
      importance: 0.6,
      timestamp: new Date(),
      context: "AI response"
    });

    // Update relationship dynamics based on interaction quality
    const responseQuality = this.assessResponseQuality(response, emotionalContext);
    if (responseQuality > 0.7) {
      memory.relationshipDynamics.trustLevel = Math.min(1, memory.relationshipDynamics.trustLevel + 0.02);
      memory.relationshipDynamics.intimacyDepth = Math.min(1, memory.relationshipDynamics.intimacyDepth + 0.01);
    }

    updates.push({
      type: "memory_update",
      shortTermCount: memory.shortTermMemory.length,
      longTermCount: memory.longTermMemory.length,
      trustLevel: memory.relationshipDynamics.trustLevel,
      intimacyDepth: memory.relationshipDynamics.intimacyDepth
    });

    return updates;
  }

  private assessResponseQuality(response: string, emotionalContext: EmotionalContext): number {
    let quality = 0.5; // Base quality

    // Check for empathy markers
    const empathyMarkers = ["understand", "feel", "difficult", "valid", "hear you"];
    const empathyCount = empathyMarkers.filter(marker => 
      response.toLowerCase().includes(marker)
    ).length;
    quality += empathyCount * 0.1;

    // Check for appropriate length
    if (response.length > 50 && response.length < 300) {
      quality += 0.1;
    }

    // Check for emotional alignment
    if (emotionalContext.crisisIndicators.length > 0 && 
        response.toLowerCase().includes("support")) {
      quality += 0.2;
    }

    return Math.min(1, quality);
  }

  private generateThoughtProcess(
    persona: PersonaConfig,
    emotionalContext: EmotionalContext,
    memory: ConversationMemory
  ): string {
    return `Persona: ${persona.name} detected emotions: ${emotionalContext.detectedEmotions.join(", ")} | Trust: ${(memory.relationshipDynamics.trustLevel * 100).toFixed(0)}% | Memories: ${memory.longTermMemory.length}`;
  }

  private async *generateFallbackResponse(
    persona: PersonaConfig,
    emotionalContext: EmotionalContext,
    memory: ConversationMemory
  ): AsyncGenerator<StreamingResponse, void, unknown> {
    // Generate contextual response based on detected emotions and persona
    const response = this.generateContextualFallbackResponse(persona, emotionalContext, memory);

    // Simulate streaming for fallback
    const words = response.split(" ");
    for (let i = 0; i < words.length; i++) {
      yield {
        content: words[i] + " ",
        isComplete: false,
        emotion: "supportive",
        confidence: 0.7,
        memoryUpdates: []
      };
      
      // Small delay to simulate typing
      await new Promise(resolve => setTimeout(resolve, 80));
    }

    yield {
      content: "",
      isComplete: true,
      emotion: "supportive",
      confidence: 0.6,
      memoryUpdates: [],
      thoughtProcess: `Fallback response from ${persona.name}`
    };
  }

  // Public method to get persona configuration
  getPersonaConfig(personaId: string): PersonaConfig | undefined {
    return this.personaConfigs.get(personaId);
  }

  // Public method to get conversation memory stats
  getConversationMemoryStats(userId: string, personaId: string): any {
    const memory = this.getConversationMemory(userId, personaId);
    return {
      shortTermMemories: memory.shortTermMemory.length,
      longTermMemories: memory.longTermMemory.length,
      trustLevel: memory.relationshipDynamics.trustLevel,
      intimacyDepth: memory.relationshipDynamics.intimacyDepth,
      dominantEmotions: memory.emotionalProfile.dominantEmotions
    };
  }

  private generateContextualFallbackResponse(
    persona: PersonaConfig,
    emotionalContext: EmotionalContext,
    memory: ConversationMemory
  ): string {
    const primaryEmotion = emotionalContext.detectedEmotions[0] || "neutral";
    const trustLevel = memory.relationshipDynamics.trustLevel;
    
    // Emotion-specific responses by persona
    const emotionalResponses = {
      sarah: {
        sadness: trustLevel > 0.5 
          ? "I can hear the pain in what you're sharing. These feelings are valid, and I want you to know that you're not alone in this struggle."
          : "It sounds like you're going through a difficult time. I'm here to listen and support you through this.",
        anxiety: "Anxiety can feel overwhelming, but remember that these feelings will pass. Let's take this one moment at a time. What's one thing that usually helps you feel more grounded?",
        anger: "I can sense your frustration. These feelings are completely understandable. Would it help to talk about what's triggering these emotions?",
        joy: "I'm so glad to hear some positivity in your voice. It's wonderful when we can find moments of happiness. What's been going well for you?",
        neutral: "I'm here and ready to listen. What's on your mind today?"
      },
      alex: {
        sadness: "Hey, I get it - I've been in those dark places too. It's tough, but you're stronger than you know. Want to talk about what's going on?",
        anxiety: "Anxiety is such a beast, isn't it? I've wrestled with it plenty. What's helping you cope right now, or do you need some ideas?",
        anger: "I hear you - sometimes life just makes us mad. That's totally valid. What's got you fired up?",
        joy: "Yes! I love hearing some good news. Tell me more about what's making you smile today.",
        neutral: "What's up? I'm here to chat about whatever's on your mind."
      },
      marcus: {
        sadness: "I know it's tough right now, but this is temporary. You have more resilience than you realize. What's one small thing you could do today to take care of yourself?",
        anxiety: "Anxiety can paralyze us, but we can work through this together. Let's focus on what you can control right now. What feels manageable to tackle?",
        anger: "That frustration is energy we can channel into positive action. What's the real issue here, and how can we address it constructively?",
        joy: "That's the energy I love to hear! Let's build on this momentum. What goals are you excited to work toward?",
        neutral: "Ready to make today count? What would make this a win for you?"
      },
      maya: {
        sadness: "Let's pause here together. Breathe with me for a moment. Your pain is real, and it deserves gentle attention. What does your heart need right now?",
        anxiety: "Feel your feet on the ground. Notice your breath. Anxiety wants to pull you into the future, but you're safe in this present moment. What helps you return to now?",
        anger: "That fire inside you is information. Let's sit with it without judgment. What is this anger trying to tell you?",
        joy: "How beautiful to feel this lightness. Let's savor this moment together. What about today feels most alive to you?",
        neutral: "Welcome to this sacred space. Whatever you're carrying today, we can hold it together with compassion."
      }
    };

    // Default responses if specific emotion not found
    const defaultResponses = {
      sarah: "I'm here to provide you with professional support and understanding. What would be most helpful to explore today?",
      alex: "I'm here for you, no matter what. What's going on in your world?",
      marcus: "Let's tackle whatever challenges you're facing head-on. What's the most important thing we should focus on?",
      maya: "This is a safe space for whatever you're experiencing. How can I support you in this moment?"
    };

    const personaResponses = emotionalResponses[persona.id as keyof typeof emotionalResponses];
    if (personaResponses && personaResponses[primaryEmotion as keyof typeof personaResponses]) {
      return personaResponses[primaryEmotion as keyof typeof personaResponses];
    }

    return defaultResponses[persona.id as keyof typeof defaultResponses] || 
           "I'm here to support you. How can I help today?";
  }
}

export const gpt4oConversationSystem = new GPT4oConversationSystem();