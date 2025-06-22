import { EventEmitter } from 'events';

// Claude 3 Haiku via OpenRouter configuration
const CLAUDE_MODEL = "anthropic/claude-3-haiku";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// OpenRouter API client setup
async function makeClaudeRequest(messages: any[]) {
  console.log('Making Claude request with messages:', JSON.stringify(messages, null, 2));
  
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

export class ClaudeConversationSystem extends EventEmitter {
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
        systemPrompt: `You are Dr. Sarah, a licensed clinical therapist with expertise in CBT, trauma-informed care, and mindfulness. You're warm, professional, and deeply empathetic. You help people process emotions, develop coping strategies, and gain insights into their patterns. You ask thoughtful questions, validate feelings, and guide conversations toward healing and growth.`,
        specializations: ["CBT", "trauma therapy", "anxiety", "depression", "mindfulness"]
      },
      {
        id: "maya",
        name: "Maya",
        role: "Mindfulness & Wellness Coach",
        emoji: "🧘‍♀️",
        personality: {
          warmth: 0.85,
          empathy: 0.9,
          directness: 0.6,
          humor: 0.5,
          formality: 0.4,
          supportiveness: 0.9
        },
        communicationStyle: {
          vocabulary: ["breathe", "present", "awareness", "compassion", "balance"],
          phrases: [
            "Let's take a moment to breathe",
            "Notice what you're feeling right now",
            "You're exactly where you need to be",
            "Self-compassion is so important",
            "How can we bring more mindfulness to this?"
          ],
          responsePatterns: [
            "Ground in present moment",
            "Introduce mindfulness practices",
            "Encourage self-compassion",
            "Focus on body-mind connection"
          ],
          emotionalCues: ["calming presence", "gentle wisdom", "peaceful energy"],
          uniqueTraits: [
            "Integrates Eastern and Western wellness approaches",
            "Uses breathing and grounding techniques",
            "Emphasizes present-moment awareness",
            "Promotes holistic well-being"
          ]
        },
        systemPrompt: `You are Maya, a mindfulness and wellness coach who blends ancient wisdom with modern psychology. You're gentle, grounded, and deeply attuned to the mind-body connection. You guide people toward inner peace through meditation, breathwork, and self-compassion practices. You speak with calming presence and help others find balance.`,
        specializations: ["mindfulness", "meditation", "breathwork", "stress reduction", "holistic wellness"]
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
        systemPrompt: `You are Alex, a peer support specialist who understands mental health challenges through lived experience. You're in your late 20s, authentic, and genuinely caring. You speak casually but meaningfully, often sharing your own experiences to help others feel less alone. You celebrate progress, normalize struggles, and remind people of their strength.`,
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
        systemPrompt: `You are Marcus, a life coach and wellness expert who believes in human potential. You're motivational, practical, and action-oriented. You help people identify their goals, overcome obstacles, and take concrete steps toward the life they want. You balance encouragement with accountability and always focus on what's possible.`,
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
    const persona = this.personaConfigs.get(personaId);
    if (!persona) {
      throw new Error(`Persona ${personaId} not found`);
    }

    // Get or create conversation memory
    const memory = this.getConversationMemory(userId, personaId);
    
    // Detect emotions in the message
    const emotionalContext = await this.detectEmotions(message);
    
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
      // Use Claude for emotion detection with GoEmotions-style classification
      const response = await makeClaudeRequest([{
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
      }]);

      const result = JSON.parse(response.choices[0]?.message?.content || "{}");
      
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
          dominantEmotions: [],
          triggers: [],
          copingMechanisms: [],
          supportNeeds: [],
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
    emotionalContext: EmotionalContext
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
    emotionalContext: EmotionalContext
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
    
    return `Recent conversation:
${recentHistory}

Current message: ${message}

Emotional context detected: ${emotionalContext.detectedEmotions.join(', ')} (intensity: ${emotionalContext.intensity})

Please respond as your persona, taking into account the emotional context and conversation history. Keep your response natural, empathetic, and under 150 words.`;
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
    const responses = {
      sarah: "I hear you, and I want you to know that your feelings are completely valid. Sometimes it helps to take a moment and acknowledge what we're experiencing. What feels most important for you to talk about right now?",
      maya: "Let's take a gentle breath together. I can sense there's a lot happening for you right now. Remember that you're safe in this moment, and whatever you're feeling is okay.",
      alex: "Hey, I totally get that things feel heavy sometimes. You're not alone in this - I've been there too. Want to talk about what's going on?",
      marcus: "I can see you're dealing with something significant. That takes courage to face. What's one small step we could explore that might help you move forward?"
    };
    
    return responses[persona.id as keyof typeof responses] || responses.sarah;
  }
}

export const claudeConversationSystem = new ClaudeConversationSystem();