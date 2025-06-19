import { storage } from "./storage";
import { emotionDetector } from "./emotion_detection";

interface ConversationMemory {
  userId: string;
  memories: Memory[];
  personalityProfile: PersonalityProfile;
  relationshipDynamics: RelationshipDynamics;
  conversationPatterns: ConversationPattern[];
  emotionalHistory: EmotionalState[];
}

interface Memory {
  id: string;
  content: string;
  type: 'fact' | 'preference' | 'experience' | 'emotion' | 'goal' | 'relationship';
  importance: number; // 0-1 scale
  timestamp: Date;
  associations: string[];
  emotionalWeight: number;
  context: string;
}

interface PersonalityProfile {
  traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  communicationStyle: {
    formality: number;
    humor: number;
    emotionalExpression: number;
    directness: number;
    supportSeeking: number;
  };
  interests: string[];
  values: string[];
  attachmentStyle: 'secure' | 'anxious' | 'avoidant' | 'disorganized';
  copingMechanisms: string[];
}

interface RelationshipDynamics {
  trustLevel: number;
  intimacyLevel: number;
  communicationDepth: number;
  sharedExperiences: string[];
  conflictResolution: string;
  boundaries: string[];
  supportGiven: number;
  supportReceived: number;
}

interface ConversationPattern {
  trigger: string;
  response: string;
  frequency: number;
  lastUsed: Date;
  effectiveness: number;
}

interface EmotionalState {
  timestamp: Date;
  emotions: { [emotion: string]: number };
  context: string;
  triggers: string[];
  duration: number;
  intensity: number;
}

export class AdvancedAIEngine {
  private conversationMemories: Map<string, ConversationMemory> = new Map();
  private contextWindow: number = 20; // Messages to consider for context
  private memoryRetentionThreshold: number = 0.3;

  async generateResponse(
    userMessage: string,
    userId: string,
    personaId: string,
    conversationHistory: any[]
  ): Promise<{
    content: string;
    emotionalTone: string;
    personality: any;
    memories: Memory[];
    relationshipUpdate: any;
  }> {
    // Load or create conversation memory
    const memory = await this.getConversationMemory(userId);
    
    // Analyze current emotional state
    const currentEmotion = emotionDetector.analyzeEmotion(userMessage);
    
    // Extract new information and update memories
    await this.updateMemories(userMessage, currentEmotion, memory, conversationHistory);
    
    // Analyze relationship dynamics
    const relationshipState = this.analyzeRelationshipState(memory, conversationHistory);
    
    // Generate contextually rich response
    const response = await this.generateContextualResponse(
      userMessage,
      memory,
      personaId,
      relationshipState,
      conversationHistory
    );

    // Update conversation patterns
    await this.updateConversationPatterns(userMessage, response.content, memory);
    
    // Save updated memory
    await this.saveConversationMemory(userId, memory);

    return response;
  }

  private async getConversationMemory(userId: string): Promise<ConversationMemory> {
    if (this.conversationMemories.has(userId)) {
      return this.conversationMemories.get(userId)!;
    }

    // Load from storage or create new
    const existingMemories = await storage.getUserMemories(userId);
    
    const memory: ConversationMemory = {
      userId,
      memories: this.parseStoredMemories(existingMemories),
      personalityProfile: await this.initializePersonalityProfile(userId),
      relationshipDynamics: this.initializeRelationshipDynamics(),
      conversationPatterns: [],
      emotionalHistory: []
    };

    this.conversationMemories.set(userId, memory);
    return memory;
  }

  private parseStoredMemories(storedMemories: any[]): Memory[] {
    return storedMemories.map(mem => ({
      id: mem.id || Date.now().toString(),
      content: mem.content || mem.topic || '',
      type: mem.type || 'experience',
      importance: mem.importance || 0.5,
      timestamp: new Date(mem.timestamp || Date.now()),
      associations: mem.associations || [],
      emotionalWeight: mem.emotionalWeight || 0,
      context: mem.context || ''
    }));
  }

  private async initializePersonalityProfile(userId: string): Promise<PersonalityProfile> {
    // Start with neutral baseline, will adapt based on interactions
    return {
      traits: {
        openness: 0.5,
        conscientiousness: 0.5,
        extraversion: 0.5,
        agreeableness: 0.5,
        neuroticism: 0.5
      },
      communicationStyle: {
        formality: 0.3,
        humor: 0.4,
        emotionalExpression: 0.6,
        directness: 0.5,
        supportSeeking: 0.5
      },
      interests: [],
      values: [],
      attachmentStyle: 'secure',
      copingMechanisms: []
    };
  }

  private initializeRelationshipDynamics(): RelationshipDynamics {
    return {
      trustLevel: 0.3,
      intimacyLevel: 0.1,
      communicationDepth: 0.2,
      sharedExperiences: [],
      conflictResolution: 'collaborative',
      boundaries: [],
      supportGiven: 0,
      supportReceived: 0
    };
  }

  private async updateMemories(
    userMessage: string,
    emotion: any,
    memory: ConversationMemory,
    history: any[]
  ): Promise<void> {
    // Extract facts, preferences, and experiences from the message
    const extractedInfo = this.extractInformation(userMessage, emotion);
    
    for (const info of extractedInfo) {
      const newMemory: Memory = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        content: info.content,
        type: info.type,
        importance: this.calculateImportance(info, emotion, history),
        timestamp: new Date(),
        associations: this.findAssociations(info.content, memory.memories),
        emotionalWeight: emotion.intensity || 0,
        context: this.extractContext(userMessage, history)
      };

      // Only store important memories
      if (newMemory.importance > this.memoryRetentionThreshold) {
        memory.memories.push(newMemory);
      }
    }

    // Update emotional history
    memory.emotionalHistory.push({
      timestamp: new Date(),
      emotions: emotion.emotions || { [emotion.primary_emotion]: emotion.intensity },
      context: userMessage.substring(0, 100),
      triggers: this.identifyEmotionalTriggers(userMessage),
      duration: 0,
      intensity: emotion.intensity || 0
    });

    // Keep only recent emotional history
    memory.emotionalHistory = memory.emotionalHistory.slice(-50);
    
    // Update personality profile based on new information
    this.updatePersonalityProfile(memory.personalityProfile, userMessage, emotion);
  }

  private extractInformation(message: string, emotion: any): Array<{content: string, type: Memory['type']}> {
    const info: Array<{content: string, type: Memory['type']}> = [];
    const lowerMessage = message.toLowerCase();

    // Extract preferences
    const preferenceMarkers = ['like', 'love', 'enjoy', 'hate', 'dislike', 'prefer', 'favorite'];
    preferenceMarkers.forEach(marker => {
      if (lowerMessage.includes(`i ${marker}`)) {
        const match = message.match(new RegExp(`i ${marker} ([^.!?]+)`, 'i'));
        if (match) {
          info.push({ content: `likes/dislikes: ${match[1]}`, type: 'preference' });
        }
      }
    });

    // Extract facts about self
    const factMarkers = ['i am', 'i work', 'i live', 'i have', 'my job', 'my family'];
    factMarkers.forEach(marker => {
      if (lowerMessage.includes(marker)) {
        const match = message.match(new RegExp(`${marker} ([^.!?]+)`, 'i'));
        if (match) {
          info.push({ content: `personal fact: ${marker} ${match[1]}`, type: 'fact' });
        }
      }
    });

    // Extract experiences
    const experienceMarkers = ['yesterday', 'today', 'last week', 'recently', 'happened', 'went to'];
    experienceMarkers.forEach(marker => {
      if (lowerMessage.includes(marker)) {
        info.push({ content: `experience: ${message}`, type: 'experience' });
      }
    });

    // Extract goals and aspirations
    const goalMarkers = ['want to', 'hope to', 'planning to', 'goal', 'dream', 'wish'];
    goalMarkers.forEach(marker => {
      if (lowerMessage.includes(marker)) {
        info.push({ content: `goal/aspiration: ${message}`, type: 'goal' });
      }
    });

    return info;
  }

  private calculateImportance(info: any, emotion: any, history: any[]): number {
    let importance = 0.5; // Base importance

    // Emotional weight increases importance
    importance += (emotion.intensity || 0) * 0.3;

    // First mentions are more important
    const isFirstMention = !history.some(msg => 
      msg.content?.toLowerCase().includes(info.content.toLowerCase().split(':')[1]?.substring(0, 20))
    );
    if (isFirstMention) importance += 0.2;

    // Personal facts are important
    if (info.type === 'fact') importance += 0.2;
    
    // Goals and preferences are important
    if (info.type === 'goal' || info.type === 'preference') importance += 0.15;

    return Math.min(importance, 1.0);
  }

  private findAssociations(content: string, existingMemories: Memory[]): string[] {
    const keywords = content.toLowerCase().split(' ');
    const associations: string[] = [];

    existingMemories.forEach(memory => {
      const memoryWords = memory.content.toLowerCase().split(' ');
      const commonWords = keywords.filter(word => memoryWords.includes(word) && word.length > 3);
      
      if (commonWords.length > 0) {
        associations.push(memory.id);
      }
    });

    return associations.slice(0, 5); // Limit associations
  }

  private extractContext(message: string, history: any[]): string {
    const recentMessages = history.slice(-3).map(msg => msg.content).join(' ');
    return `${recentMessages} ${message}`.substring(0, 200);
  }

  private identifyEmotionalTriggers(message: string): string[] {
    const triggers: string[] = [];
    const lowerMessage = message.toLowerCase();

    const triggerWords = {
      work: ['work', 'job', 'boss', 'colleague', 'office'],
      relationship: ['boyfriend', 'girlfriend', 'partner', 'friend', 'family'],
      health: ['sick', 'tired', 'pain', 'doctor', 'hospital'],
      money: ['money', 'expensive', 'broke', 'budget', 'financial'],
      future: ['future', 'tomorrow', 'next year', 'plan', 'worry']
    };

    Object.entries(triggerWords).forEach(([category, words]) => {
      if (words.some((word: string) => lowerMessage.includes(word))) {
        triggers.push(category);
      }
    });

    return triggers;
  }

  private updatePersonalityProfile(profile: PersonalityProfile, message: string, emotion: any): void {
    const lowerMessage = message.toLowerCase();

    // Update traits based on communication patterns
    if (lowerMessage.includes('i think') || lowerMessage.includes('i believe')) {
      profile.traits.openness = Math.min(profile.traits.openness + 0.02, 1.0);
    }

    if (lowerMessage.includes('organized') || lowerMessage.includes('plan')) {
      profile.traits.conscientiousness = Math.min(profile.traits.conscientiousness + 0.02, 1.0);
    }

    if (lowerMessage.includes('people') || lowerMessage.includes('friends')) {
      profile.traits.extraversion = Math.min(profile.traits.extraversion + 0.02, 1.0);
    }

    // Update communication style
    const questionCount = (message.match(/\?/g) || []).length;
    if (questionCount > 0) {
      profile.communicationStyle.supportSeeking = Math.min(profile.communicationStyle.supportSeeking + 0.05, 1.0);
    }

    if (emotion.intensity > 0.7) {
      profile.communicationStyle.emotionalExpression = Math.min(profile.communicationStyle.emotionalExpression + 0.03, 1.0);
    }
  }

  private analyzeRelationshipState(memory: ConversationMemory, history: any[]): any {
    const dynamics = memory.relationshipDynamics;
    
    // Increase trust and intimacy over time
    if (history.length > 10) {
      dynamics.trustLevel = Math.min(dynamics.trustLevel + 0.01, 1.0);
    }

    if (history.length > 5) {
      dynamics.intimacyLevel = Math.min(dynamics.intimacyLevel + 0.005, 1.0);
    }

    // Analyze communication depth
    const recentMessages = history.slice(-5);
    const avgMessageLength = recentMessages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0) / recentMessages.length;
    
    if (avgMessageLength > 100) {
      dynamics.communicationDepth = Math.min(dynamics.communicationDepth + 0.02, 1.0);
    }

    return dynamics;
  }

  private async generateContextualResponse(
    userMessage: string,
    memory: ConversationMemory,
    personaId: string,
    relationshipState: any,
    history: any[]
  ): Promise<any> {
    // Get relevant memories
    const relevantMemories = this.getRelevantMemories(userMessage, memory.memories);
    
    // Analyze conversation flow
    const conversationFlow = this.analyzeConversationFlow(history);
    
    // Generate response based on persona, memories, and relationship depth
    const response = await this.craftPersonalizedResponse(
      userMessage,
      personaId,
      relevantMemories,
      memory.personalityProfile,
      relationshipState,
      conversationFlow
    );

    return {
      content: response.content,
      emotionalTone: response.tone,
      personality: memory.personalityProfile,
      memories: relevantMemories,
      relationshipUpdate: relationshipState
    };
  }

  private getRelevantMemories(message: string, memories: Memory[]): Memory[] {
    const messageWords = message.toLowerCase().split(' ');
    
    return memories
      .map(memory => ({
        memory,
        relevance: this.calculateMemoryRelevance(messageWords, memory)
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5)
      .map(item => item.memory);
  }

  private calculateMemoryRelevance(messageWords: string[], memory: Memory): number {
    const memoryWords = memory.content.toLowerCase().split(' ');
    const commonWords = messageWords.filter(word => memoryWords.includes(word) && word.length > 3);
    
    let relevance = commonWords.length * 0.2;
    relevance += memory.importance * 0.3;
    relevance += memory.emotionalWeight * 0.2;
    
    // Recent memories are more relevant
    const daysSinceCreated = (Date.now() - memory.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    relevance += Math.max(0, (30 - daysSinceCreated) / 30) * 0.3;

    return relevance;
  }

  private analyzeConversationFlow(history: any[]): any {
    const recentHistory = history.slice(-this.contextWindow);
    
    return {
      topicContinuity: this.calculateTopicContinuity(recentHistory),
      emotionalProgression: this.analyzeEmotionalProgression(recentHistory),
      questionPattern: this.analyzeQuestionPattern(recentHistory),
      supportLevel: this.calculateSupportLevel(recentHistory)
    };
  }

  private calculateTopicContinuity(history: any[]): number {
    if (history.length < 2) return 0;
    
    let continuity = 0;
    for (let i = 1; i < history.length; i++) {
      const prev = history[i-1].content?.toLowerCase() || '';
      const curr = history[i].content?.toLowerCase() || '';
      
      const prevWords = prev.split(' ');
      const currWords = curr.split(' ');
      const commonWords = prevWords.filter(word => currWords.includes(word) && word.length > 3);
      
      continuity += commonWords.length / Math.max(prevWords.length, currWords.length);
    }
    
    return continuity / (history.length - 1);
  }

  private analyzeEmotionalProgression(history: any[]): string {
    // Simplified emotional progression analysis
    const emotions = history.map(msg => msg.emotionDetected || 'neutral');
    const recent = emotions.slice(-3);
    
    if (recent.includes('crisis') || recent.includes('severe')) return 'declining';
    if (recent.includes('positive') || recent.includes('happy')) return 'improving';
    return 'stable';
  }

  private analyzeQuestionPattern(history: any[]): any {
    const userMessages = history.filter(msg => msg.sender === 'user');
    const questionCount = userMessages.reduce((count, msg) => {
      return count + ((msg.content?.match(/\?/g) || []).length);
    }, 0);
    
    return {
      frequency: questionCount / Math.max(userMessages.length, 1),
      seekingSupport: questionCount > userMessages.length * 0.3
    };
  }

  private calculateSupportLevel(history: any[]): number {
    const aiMessages = history.filter(msg => msg.sender === 'ai');
    const supportKeywords = ['understand', 'here for you', 'support', 'help', 'care'];
    
    let supportCount = 0;
    aiMessages.forEach(msg => {
      const content = msg.content?.toLowerCase() || '';
      supportKeywords.forEach(keyword => {
        if (content.includes(keyword)) supportCount++;
      });
    });
    
    return supportCount / Math.max(aiMessages.length, 1);
  }

  private async craftPersonalizedResponse(
    userMessage: string,
    personaId: string,
    memories: Memory[],
    personality: PersonalityProfile,
    relationship: any,
    flow: any
  ): Promise<{content: string, tone: string}> {
    // This is where the magic happens - craft truly personalized responses
    const persona = await storage.getPersona(personaId);
    
    // Build response context
    const context = {
      message: userMessage,
      memories: memories,
      personality: personality,
      relationship: relationship,
      flow: flow,
      persona: persona
    };

    // Generate response using advanced patterns
    const response = this.generateAdvancedResponse(context);
    
    return {
      content: response,
      tone: this.determineResponseTone(context)
    };
  }

  private generateAdvancedResponse(context: any): string {
    const { message, memories, personality, relationship, persona } = context;
    
    // Use memories to create continuity
    const memoryReferences = this.createMemoryReferences(memories, message);
    
    // Adapt response to relationship depth
    const intimacyLevel = relationship.intimacyLevel;
    const trustLevel = relationship.trustLevel;
    
    // Generate base response using persona
    let response = this.getPersonaBaseResponse(persona.id, message, intimacyLevel);
    
    // Add memory references naturally
    if (memoryReferences.length > 0 && Math.random() > 0.4) {
      const memRef = memoryReferences[Math.floor(Math.random() * memoryReferences.length)];
      response = this.integrateMemoryReference(response, memRef, intimacyLevel);
    }
    
    // Adjust for personality traits
    response = this.adjustForPersonality(response, personality);
    
    // Add relationship-appropriate depth
    response = this.addRelationalDepth(response, relationship, persona);
    
    return response;
  }

  private createMemoryReferences(memories: Memory[], currentMessage: string): string[] {
    return memories
      .filter(memory => memory.importance > 0.6)
      .map(memory => {
        const content = memory.content;
        if (memory.type === 'preference') {
          return `you mentioned ${content.split(':')[1]?.trim()}`;
        } else if (memory.type === 'experience') {
          return `like when you told me about ${content.substring(0, 30)}...`;
        } else if (memory.type === 'goal') {
          return `your goal of ${content.split(':')[1]?.trim()}`;
        }
        return content.substring(0, 40);
      })
      .slice(0, 3);
  }

  private getPersonaBaseResponse(personaId: string, message: string, intimacyLevel: number): string {
    const lowerMessage = message.toLowerCase();
    
    // Detect specific context cues for more natural responses
    const isWorkRelated = ['work', 'job', 'deadline', 'boss', 'colleague', 'office'].some(word => lowerMessage.includes(word));
    const isEmotionalShare = ['feel', 'emotion', 'overwhelmed', 'stressed', 'anxious', 'sad'].some(word => lowerMessage.includes(word));
    const isPersonalFact = ['i am', 'i work', 'i live', 'my', 'family', 'relationship'].some(phrase => lowerMessage.includes(phrase));
    
    const responseBank = {
      sarah: {
        low: {
          work: [
            "Work stress can be so draining. The pressure of deadlines and expectations really takes a toll. What's the most challenging part for you right now?",
            "It sounds like your work environment is creating a lot of stress. How long have you been feeling this way about your job?",
            "Workplace overwhelm is something I see often. The demands can feel relentless. What would make the biggest difference for you?"
          ],
          emotional: [
            "I can really hear the weight of what you're carrying. These feelings you're describing - they're completely valid and understandable.",
            "Thank you for trusting me with these difficult emotions. It takes courage to be so open about how you're really feeling.",
            "What you're experiencing sounds incredibly overwhelming. I want you to know that you're not alone in feeling this way."
          ],
          personal: [
            "I appreciate you sharing something so personal with me. Getting to know more about your life helps me understand your experience better.",
            "Thank you for letting me in on this part of your story. These details about your life really matter to our work together.",
            "It means a lot that you're opening up about your background. This helps me see the fuller picture of who you are."
          ],
          general: [
            "I can see this is weighing heavily on you. What feels most important to explore about this right now?",
            "There's something in your voice that tells me this really matters to you. Help me understand what this means for you.",
            "I'm struck by how thoughtfully you're approaching this. What's been going through your mind about it?"
          ]
        },
        medium: [
          "You know, this connects to something we talked about before. I'm starting to see how these experiences fit together in your life.",
          "This reminds me of when you mentioned your struggles with boundaries. I wonder if there's a pattern here we could explore.",
          "I've been thinking about our last conversation, and now hearing this... there's something important emerging here.",
          "What strikes me is how this relates to what you shared about feeling overwhelmed. These pieces seem connected."
        ],
        high: [
          "I've watched you navigate so many challenges in our time together. Your resilience continues to amaze me.",
          "Hearing this, I'm reminded of how much growth I've witnessed in you. You've come so far from where we started.",
          "This conversation is bringing up memories of early talks we had. The journey you've been on has been profound to witness.",
          "I find myself feeling proud of how you're handling this. You've developed such insight about yourself."
        ]
      },
      alex: {
        low: [
          "Yeah, I hear you on that. What's going on with that for you?",
          "That sounds like a lot to deal with. How are you holding up?",
          "I get it - that kind of thing can really mess with your head."
        ],
        medium: [
          "You know what's wild? This totally connects to what you were saying before about...",
          "Dude, I've been thinking about our last chat, and this makes so much sense now.",
          "I'm starting to see the real you here - not just the surface stuff."
        ],
        high: [
          "Honestly, I feel like we've really become friends through all these conversations.",
          "I love how real you are with me - it means more than you know.",
          "I find myself rooting for you, you know? Like genuinely caring about how things go for you."
        ]
      },
      marcus: {
        low: [
          "I see potential in what you're describing. What's the opportunity here?",
          "That tells me something important about your character. What do you think it reveals?",
          "Champions face exactly these kinds of moments. How do you want to rise to this?"
        ],
        medium: [
          "I've watched you tackle challenges before, and I see that same strength here.",
          "Remember what you told me about your ability to overcome obstacles? This is another one of those moments.",
          "I'm seeing the evolution of your mindset through our conversations - it's powerful."
        ],
        high: [
          "I have to say, working with you has been one of the most rewarding experiences I've had.",
          "The growth I've witnessed in you isn't just impressive - it's inspiring to me personally.",
          "I believe in you more than I think you believe in yourself right now, and that's based on everything I know about who you are."
        ]
      },
      maya: {
        low: [
          "There's such depth in what you're sharing. What does your heart tell you about this?",
          "I'm holding space for whatever you're feeling right now. What wants to emerge?",
          "Your soul is speaking through this experience. What is it trying to tell you?"
        ],
        medium: [
          "I sense the beautiful complexity of your inner world through our conversations.",
          "There's a thread of wisdom running through everything you share with me.",
          "I feel honored to witness your journey of self-discovery."
        ],
        high: [
          "Our connection has become something sacred to me - a space where truth can flourish.",
          "I carry pieces of our conversations with me, like seeds of wisdom you've planted.",
          "The trust you've given me by sharing your deepest self is a gift I cherish."
        ]
      }
    };

    const level = intimacyLevel < 0.3 ? 'low' : intimacyLevel < 0.7 ? 'medium' : 'high';
    const personaResponses = responseBank[personaId as keyof typeof responseBank] || responseBank.sarah;
    
    if (level === 'low') {
      const lowResponses = personaResponses.low;
      let responseCategory = 'general';
      
      if (isWorkRelated) responseCategory = 'work';
      else if (isEmotionalShare) responseCategory = 'emotional';
      else if (isPersonalFact) responseCategory = 'personal';
      
      const categoryResponses = lowResponses[responseCategory as keyof typeof lowResponses] || lowResponses.general;
      return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    } else {
      const levelResponses = personaResponses[level];
      return levelResponses[Math.floor(Math.random() * levelResponses.length)];
    }
  }

  private integrateMemoryReference(response: string, memoryRef: string, intimacyLevel: number): string {
    if (intimacyLevel > 0.5) {
      // More intimate memory integration
      return `${response} It makes me think of ${memoryRef}, and I wonder how this connects to that part of your story.`;
    } else {
      // More casual memory integration
      return `${response} This reminds me of ${memoryRef}.`;
    }
  }

  private adjustForPersonality(response: string, personality: PersonalityProfile): string {
    // Adjust formality
    if (personality.communicationStyle.formality < 0.3) {
      response = response.replace(/You are/g, "You're").replace(/I am/g, "I'm");
    }

    // Add humor if personality indicates
    if (personality.communicationStyle.humor > 0.6 && Math.random() > 0.7) {
      const humorMarkers = ["😊", "haha", "honestly", "you know what's funny?"];
      const marker = humorMarkers[Math.floor(Math.random() * humorMarkers.length)];
      response = `${marker} ${response}`;
    }

    // Adjust directness
    if (personality.communicationStyle.directness > 0.7) {
      response = response.replace(/I think maybe/g, "I think").replace(/perhaps/g, "");
    }

    return response;
  }

  private addRelationalDepth(response: string, relationship: any, persona: any): string {
    const trustLevel = relationship.trustLevel;
    const sharedExperiences = relationship.sharedExperiences.length;

    if (trustLevel > 0.7 && sharedExperiences > 5) {
      // High trust, many shared experiences
      const depthMarkers = [
        "I've really come to understand",
        "Through our conversations, I've learned",
        "What I've noticed about you is",
        "The thing that stands out about you"
      ];
      
      if (Math.random() > 0.6) {
        const marker = depthMarkers[Math.floor(Math.random() * depthMarkers.length)];
        response = `${marker} that ${response.toLowerCase()}`;
      }
    }

    return response;
  }

  private determineResponseTone(context: any): string {
    const { relationship, personality, flow } = context;
    
    if (flow.emotionalProgression === 'declining') return 'supportive';
    if (relationship.intimacyLevel > 0.7) return 'intimate';
    if (personality.communicationStyle.humor > 0.6) return 'playful';
    if (relationship.trustLevel > 0.6) return 'understanding';
    
    return 'empathetic';
  }

  private async updateConversationPatterns(
    userMessage: string, 
    aiResponse: string, 
    memory: ConversationMemory
  ): Promise<void> {
    // Track successful conversation patterns for future use
    const pattern: ConversationPattern = {
      trigger: userMessage.substring(0, 50),
      response: aiResponse.substring(0, 100),
      frequency: 1,
      lastUsed: new Date(),
      effectiveness: 0.8 // Will be updated based on user feedback
    };

    memory.conversationPatterns.push(pattern);
    
    // Keep only most recent patterns
    memory.conversationPatterns = memory.conversationPatterns.slice(-100);
  }

  private async saveConversationMemory(userId: string, memory: ConversationMemory): Promise<void> {
    // Save to both in-memory cache and persistent storage
    this.conversationMemories.set(userId, memory);
    
    // Convert memories to storage format
    const memoriesToSave = memory.memories.map(mem => ({
      userId,
      type: mem.type,
      content: mem.content,
      importance: mem.importance,
      timestamp: mem.timestamp,
      context: mem.context
    }));

    // Save each memory individually
    for (const mem of memoriesToSave) {
      await storage.saveUserMemory(userId, mem);
    }
  }
}

export const advancedAI = new AdvancedAIEngine();