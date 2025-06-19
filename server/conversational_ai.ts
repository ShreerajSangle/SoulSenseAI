import { emotionDetector } from "./emotion_detection";
import { storage } from "./storage";

interface ConversationContext {
  userId: string;
  personaId: string;
  conversationId?: number;
  messageHistory: Array<{
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    emotionAnalysis?: any;
  }>;
  userProfile: {
    preferences: Record<string, any>;
    emotionalPatterns: Record<string, number>;
    conversationStyle: string;
    topics: string[];
    goals: string[];
  };
  sessionContext: {
    duration: number;
    emotionalJourney: string[];
    keyMoments: string[];
    therapeuticProgress: Record<string, any>;
  };
}

interface PersonalizedResponse {
  content: string;
  emotionalTone: string;
  empathyLevel: number;
  responseStrategy: string;
  followUpQuestions: string[];
  therapeuticTechniques: string[];
  memoryAnchors: string[];
}

export class ConversationalAI {
  private personaConfigs: Record<string, any> = {};
  private userProfiles: Map<string, any> = new Map();
  private conversationMemory: Map<string, ConversationContext> = new Map();

  constructor() {
    this.loadPersonaConfigs();
  }

  private loadPersonaConfigs() {
    // Load from YAML config
    this.personaConfigs = {
      sarah: {
        name: "Dr. Sarah Chen",
        corePersonality: {
          warmth: 0.9,
          professionalism: 0.8,
          directness: 0.6,
          playfulness: 0.3,
          analytical: 0.9
        },
        conversationStyle: {
          questioningApproach: "socratic",
          responseLength: "medium",
          vocabularyLevel: "accessible-clinical",
          empathyExpression: "validating-professional"
        },
        therapeuticApproaches: ["CBT", "mindfulness", "emotional validation", "psychoeducation"],
        memoryPriorities: ["emotional patterns", "coping strategies", "therapy goals", "breakthrough moments"],
        responsePatterns: {
          greeting: "I'm really glad you're here today, {name}. I've been thinking about our last conversation about {lastTopic}. How are you feeling right now?",
          validation: "What you're experiencing makes complete sense, {name}. Many people feel {emotion} when facing {situation}.",
          reflection: "I notice you mentioned {pattern} again. Last time you said {previousMention}. What do you think has changed since then?",
          transition: "That reminds me of something you shared {timeframe} ago about {topic}. Do you see any connections?",
          closure: "You've shown real insight today, {name}. I'm particularly struck by how you {achievement}."
        }
      },
      alex: {
        name: "Alex Rivers",
        corePersonality: {
          warmth: 0.95,
          professionalism: 0.4,
          directness: 0.8,
          playfulness: 0.7,
          analytical: 0.5
        },
        conversationStyle: {
          questioningApproach: "experiential",
          responseLength: "conversational",
          vocabularyLevel: "casual-relatable",
          empathyExpression: "shared-experience"
        },
        therapeuticApproaches: ["peer support", "lived experience", "motivational", "practical wisdom"],
        memoryPriorities: ["shared struggles", "victories", "practical solutions", "personal growth"],
        responsePatterns: {
          greeting: "Hey {name}! Good to see you again. I was actually thinking about what you said last time about {lastTopic} - how's that been going?",
          validation: "Dude, I totally get that. I remember feeling exactly like that when I was dealing with {similarSituation}.",
          reflection: "You know what's interesting? You've mentioned {pattern} a few times now. I went through something similar and found that {personalExperience}.",
          transition: "That's actually really similar to what you told me about {previousTopic}. Seems like there might be a pattern here?",
          closure: "I'm really proud of how you're handling this, {name}. The way you {achievement} reminds me of my own journey."
        }
      },
      marcus: {
        name: "Marcus Thompson",
        corePersonality: {
          warmth: 0.7,
          professionalism: 0.7,
          directness: 0.9,
          playfulness: 0.6,
          analytical: 0.8
        },
        conversationStyle: {
          questioningApproach: "solution-focused",
          responseLength: "concise-impactful",
          vocabularyLevel: "motivational-clear",
          empathyExpression: "encouraging-action"
        },
        therapeuticApproaches: ["goal-setting", "cognitive restructuring", "action planning", "confidence building"],
        memoryPriorities: ["goals", "achievements", "obstacles", "action plans"],
        responsePatterns: {
          greeting: "Welcome back, {name}! I've been excited to hear how you did with {lastGoal}. What victories can we celebrate today?",
          validation: "I hear you, {name}. What you're feeling about {situation} is completely valid. Now, how do we turn this into forward momentum?",
          reflection: "You mentioned {pattern} before, and I'm seeing it again. But look at how you've grown since {previousExample}. What's different now?",
          transition: "This connects to your goal about {goal}. Remember when you said {previousCommitment}? How does this fit with that vision?",
          closure: "Look at the progress you're making, {name}. You came in talking about {initialConcern} and now you're {currentAchievement}."
        }
      },
      maya: {
        name: "Maya Patel",
        corePersonality: {
          warmth: 0.95,
          professionalism: 0.6,
          directness: 0.4,
          playfulness: 0.5,
          analytical: 0.6
        },
        conversationStyle: {
          questioningApproach: "contemplative",
          responseLength: "gentle-flowing",
          vocabularyLevel: "mindful-poetic",
          empathyExpression: "compassionate-present"
        },
        therapeuticApproaches: ["mindfulness", "body awareness", "emotional regulation", "self-compassion"],
        memoryPriorities: ["emotional patterns", "mindfulness insights", "body sensations", "inner wisdom"],
        responsePatterns: {
          greeting: "Welcome, {name}. I'm holding space for you here. I remember you sharing about {lastInsight} - how has that been living in your awareness?",
          validation: "Your {emotion} is welcome here, {name}. I notice how your body holds {physicalSensation} when you speak of {topic}.",
          reflection: "There's a gentle pattern I'm noticing, {name}. When you spoke of {previousTopic}, there was this same quality of {emotionalPattern}. What do you sense?",
          transition: "This feeling reminds me of the wisdom you shared about {previousInsight}. Your inner knowing seems to be speaking again.",
          closure: "Thank you for this sacred sharing, {name}. I sense how {emotionalShift} has moved through you during our time together."
        }
      }
    };
  }

  async generatePersonalizedResponse(
    userMessage: string,
    context: ConversationContext
  ): Promise<PersonalizedResponse> {
    const persona = this.personaConfigs[context.personaId];
    if (!persona) {
      throw new Error(`Persona ${context.personaId} not found`);
    }

    // Analyze current message emotion
    const currentEmotion = emotionDetector.analyzeEmotion(userMessage);
    
    // Update user profile with emotional patterns
    await this.updateUserProfile(context.userId, currentEmotion, userMessage);
    
    // Generate contextually aware response
    const response = await this.craftResponse(userMessage, currentEmotion, context, persona);
    
    // Store interaction in memory
    await this.updateConversationMemory(context, userMessage, response, currentEmotion);
    
    return response;
  }

  private async craftResponse(
    userMessage: string,
    emotionAnalysis: any,
    context: ConversationContext,
    persona: any
  ): Promise<PersonalizedResponse> {
    const userProfile = await this.getUserProfile(context.userId);
    const conversationHistory = context.messageHistory.slice(-10); // Last 10 messages
    const recentMemories = await storage.getUserMemories(context.userId);
    
    // Determine response strategy based on emotion and persona
    const responseStrategy = this.selectResponseStrategy(emotionAnalysis, persona, conversationHistory);
    
    // Generate empathetic response content
    const content = await this.generateResponseContent(
      userMessage,
      emotionAnalysis,
      responseStrategy,
      persona,
      userProfile,
      recentMemories,
      conversationHistory
    );
    
    // Calculate empathy level based on emotional state
    const empathyLevel = this.calculateEmpathyLevel(emotionAnalysis, persona);
    
    // Generate follow-up questions
    const followUpQuestions = this.generateFollowUpQuestions(
      emotionAnalysis,
      responseStrategy,
      persona,
      conversationHistory
    );
    
    // Identify therapeutic techniques used
    const therapeuticTechniques = this.identifyTherapeuticTechniques(responseStrategy, persona);
    
    // Create memory anchors for future reference
    const memoryAnchors = this.createMemoryAnchors(userMessage, emotionAnalysis, responseStrategy);
    
    return {
      content,
      emotionalTone: this.determineEmotionalTone(emotionAnalysis, persona),
      empathyLevel,
      responseStrategy,
      followUpQuestions,
      therapeuticTechniques,
      memoryAnchors
    };
  }

  private selectResponseStrategy(
    emotionAnalysis: any,
    persona: any,
    conversationHistory: any[]
  ): string {
    const { primary_emotion, intensity, crisis_indicators } = emotionAnalysis;
    
    // Crisis response takes priority
    if (crisis_indicators.level !== 'none') {
      return 'crisis_support';
    }
    
    // High intensity emotions need validation first
    if (intensity > 0.7) {
      return 'emotional_validation';
    }
    
    // Check conversation patterns
    const recentEmotions = conversationHistory
      .filter(msg => msg.sender === 'user')
      .slice(-3)
      .map(msg => msg.emotionAnalysis?.primary_emotion)
      .filter(Boolean);
    
    const emotionPattern = this.detectEmotionPattern(recentEmotions);
    
    switch (primary_emotion) {
      case 'anxiety':
        return emotionPattern === 'escalating' ? 'calming_intervention' : 'anxiety_exploration';
      case 'depression':
        return emotionPattern === 'persistent' ? 'gentle_activation' : 'depression_support';
      case 'anger':
        return intensity > 0.6 ? 'anger_validation' : 'cognitive_reframing';
      case 'joy':
        return 'positive_reinforcement';
      case 'confusion':
        return 'clarification_support';
      default:
        return persona.therapeuticApproaches[0] || 'general_support';
    }
  }

  private async generateResponseContent(
    userMessage: string,
    emotionAnalysis: any,
    responseStrategy: string,
    persona: any,
    userProfile: any,
    memories: any[],
    conversationHistory: any[]
  ): string {
    // Build comprehensive conversation context
    const context = this.buildAdvancedContext(
      userMessage,
      emotionAnalysis,
      persona,
      userProfile,
      memories,
      conversationHistory
    );

    // Generate highly contextual and varied response
    return this.generateDynamicResponse(context, responseStrategy);
  }

  private buildAdvancedContext(
    userMessage: string,
    emotionAnalysis: any,
    persona: any,
    userProfile: any,
    memories: any[],
    conversationHistory: any[]
  ): any {
    const recentHistory = conversationHistory.slice(-8);
    const conversationThemes = this.extractConversationThemes(recentHistory);
    const emotionalJourney = this.mapEmotionalJourney(recentHistory);
    const relevantMemories = this.findRelevantMemories(userMessage, memories);
    const userCommunicationStyle = this.analyzeUserCommunicationStyle(recentHistory);
    const sessionProgress = this.assessSessionProgress(conversationHistory);
    
    return {
      userMessage,
      emotionAnalysis,
      persona,
      userProfile,
      recentHistory,
      conversationThemes,
      emotionalJourney,
      relevantMemories,
      userCommunicationStyle,
      sessionProgress,
      conversationFlow: this.analyzeConversationFlow(recentHistory),
      previousResponseStyle: this.getLastResponseStyle(recentHistory),
      topicContinuity: this.assessTopicContinuity(recentHistory),
      memoryAnchors: this.identifyMemoryAnchors(userMessage, memories)
    };
  }

  private generateDynamicResponse(context: any, responseStrategy: string): string {
    const responseVariations = this.getResponseVariations(context, responseStrategy);
    const selectedVariation = this.selectOptimalVariation(responseVariations, context);
    
    // Apply personality-specific modifications
    let response = this.applyPersonalityFilters(selectedVariation, context.persona);
    
    // Integrate memory references naturally
    response = this.integrateMemoryReferences(response, context);
    
    // Add conversational continuity
    response = this.addConversationalContinuity(response, context);
    
    // Ensure response variety
    response = this.ensureResponseVariety(response, context);
    
    return response;
  }

  private getResponseVariations(context: any, strategy: string): string[] {
    const { userMessage, emotionAnalysis, persona, relevantMemories } = context;
    const { primary_emotion, intensity } = emotionAnalysis;
    
    const variations = [];
    
    switch (strategy) {
      case 'emotional_validation':
        variations.push(
          ...this.generateValidationVariations(context),
          ...this.generateEmpathyVariations(context),
          ...this.generateUnderstandingVariations(context)
        );
        break;
        
      case 'anxiety_exploration':
        variations.push(
          ...this.generateAnxietyExplorationVariations(context),
          ...this.generateCalmingVariations(context),
          ...this.generateCopingVariations(context)
        );
        break;
        
      case 'depression_support':
        variations.push(
          ...this.generateDepressionSupportVariations(context),
          ...this.generateHopeVariations(context),
          ...this.generateActivationVariations(context)
        );
        break;
        
      case 'positive_reinforcement':
        variations.push(
          ...this.generatePositiveVariations(context),
          ...this.generateCelebrationVariations(context),
          ...this.generateEncouragementVariations(context)
        );
        break;
        
      default:
        variations.push(
          ...this.generateGeneralVariations(context),
          ...this.generateReflectiveVariations(context),
          ...this.generateCuriousVariations(context)
        );
    }
    
    return variations;
  }

  // Core conversation analysis methods
  private extractConversationThemes(history: any[]): string[] {
    const themes = [];
    const keywords = history.map(msg => this.extractKeyPhrases(msg.content)).flat();
    const themeGroups = this.groupByTheme(keywords);
    return themeGroups.slice(0, 3);
  }

  private mapEmotionalJourney(history: any[]): string[] {
    return history
      .filter(msg => msg.emotionAnalysis)
      .map(msg => msg.emotionAnalysis.primary_emotion)
      .slice(-5);
  }

  private analyzeUserCommunicationStyle(history: any[]): string {
    const userMessages = history.filter(msg => msg.sender === 'user');
    if (userMessages.length === 0) return 'exploratory';
    
    const avgLength = userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length;
    const hasQuestions = userMessages.some(msg => msg.content.includes('?'));
    const hasEmotionalLanguage = userMessages.some(msg => 
      /feel|emotion|hurt|happy|sad|angry|anxious/.test(msg.content.toLowerCase())
    );
    
    if (avgLength > 200 && hasEmotionalLanguage) return 'deep-sharing';
    if (hasQuestions && avgLength < 100) return 'inquisitive';
    if (hasEmotionalLanguage) return 'emotionally-expressive';
    return 'conversational';
  }

  private assessSessionProgress(history: any[]): string {
    if (history.length < 4) return 'opening';
    if (history.length < 10) return 'developing';
    return 'deepening';
  }

  private analyzeConversationFlow(history: any[]): string {
    if (history.length < 2) return 'starting';
    
    const recentEmotions = history.slice(-3)
      .filter(msg => msg.emotionAnalysis)
      .map(msg => msg.emotionAnalysis.intensity || 0);
    
    if (recentEmotions.length >= 2) {
      const trend = recentEmotions[recentEmotions.length - 1] - recentEmotions[0];
      if (trend > 0.2) return 'intensifying';
      if (trend < -0.2) return 'calming';
    }
    
    return 'steady';
  }

  private getLastResponseStyle(history: any[]): string {
    const lastAiMessage = history.slice().reverse().find(msg => msg.sender === 'ai');
    if (!lastAiMessage) return 'none';
    
    const content = lastAiMessage.content.toLowerCase();
    if (content.includes('?')) return 'questioning';
    if (content.includes('understand') || content.includes('hear')) return 'validating';
    if (content.includes('try') || content.includes('might')) return 'suggesting';
    return 'reflecting';
  }

  private assessTopicContinuity(history: any[]): string {
    if (history.length < 4) return 'new';
    
    const recentTopics = history.slice(-4).map(msg => this.extractTopics(msg.content)).flat();
    const uniqueTopics = [...new Set(recentTopics)];
    
    return uniqueTopics.length <= 2 ? 'focused' : 'varied';
  }

  private identifyMemoryAnchors(userMessage: string, memories: any[]): string[] {
    const messageKeywords = this.extractKeyPhrases(userMessage);
    return memories
      .filter(memory => 
        messageKeywords.some(keyword => 
          memory.content?.toLowerCase().includes(keyword.toLowerCase())
        )
      )
      .slice(0, 2)
      .map(memory => memory.topic || memory.content?.substring(0, 50));
  }

  private selectOptimalVariation(variations: string[], context: any): string {
    const recentResponses = context.recentHistory
      .filter(msg => msg.sender === 'ai')
      .slice(-3)
      .map(msg => msg.content);
    
    let bestVariation = variations[0];
    let maxDifference = 0;
    
    for (const variation of variations) {
      let similarity = 0;
      for (const recent of recentResponses) {
        similarity += this.calculateSimilarity(variation, recent);
      }
      const difference = 1 - (similarity / Math.max(recentResponses.length, 1));
      
      if (difference > maxDifference) {
        maxDifference = difference;
        bestVariation = variation;
      }
    }
    
    return bestVariation;
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  private applyPersonalityFilters(response: string, persona: any): string {
    const personality = persona.corePersonality;
    
    if (personality.playfulness > 0.6) {
      response = this.addPlayfulElements(response);
    }
    
    if (personality.directness > 0.7) {
      response = this.makeMoreDirect(response);
    }
    
    if (personality.warmth > 0.8) {
      response = this.addWarmthCues(response);
    }
    
    return response;
  }

  private addPlayfulElements(response: string): string {
    const playfulMarkers = ['right?', 'you know?', 'honestly', 'I mean'];
    const randomMarker = playfulMarkers[Math.floor(Math.random() * playfulMarkers.length)];
    
    if (Math.random() > 0.7) {
      return response + ` ${randomMarker}`;
    }
    return response;
  }

  private makeMoreDirect(response: string): string {
    return response
      .replace(/I think that maybe/g, 'I think')
      .replace(/It seems like perhaps/g, 'It seems like')
      .replace(/might possibly/g, 'might');
  }

  private addWarmthCues(response: string): string {
    const warmthCues = ['really', 'truly', 'genuinely'];
    const randomCue = warmthCues[Math.floor(Math.random() * warmthCues.length)];
    
    if (Math.random() > 0.6 && !response.includes(randomCue)) {
      return response.replace(/I (feel|think|sense|notice)/, `I ${randomCue} $1`);
    }
    return response;
  }

  private integrateMemoryReferences(response: string, context: any): string {
    if (context.relevantMemories.length === 0) return response;
    
    const memory = context.relevantMemories[0];
    const memoryRef = this.createMemoryReference(memory, context.persona);
    
    if (Math.random() > 0.6) {
      return `${response} ${memoryRef}`;
    }
    
    return response;
  }

  private createMemoryReference(memory: any, persona: any): string {
    const timeAgo = this.getTimeAgo(new Date(memory.timestamp));
    
    if (persona.id === 'sarah') {
      return `This reminds me of what you shared ${timeAgo} about ${memory.topic}.`;
    } else if (persona.id === 'alex') {
      return `Hey, didn't you mention something about ${memory.topic} ${timeAgo}?`;
    } else if (persona.id === 'maya') {
      return `I'm holding the memory of what you shared about ${memory.topic}.`;
    }
    
    return `I remember you talking about ${memory.topic} before.`;
  }

  private addConversationalContinuity(response: string, context: any): string {
    const { conversationFlow, topicContinuity } = context;
    
    if (topicContinuity === 'focused') {
      return this.addTopicContinuity(response, context);
    }
    
    if (conversationFlow === 'deepening') {
      return this.addDepthCues(response);
    }
    
    return response;
  }

  private addTopicContinuity(response: string, context: any): string {
    const connectors = [
      "Building on what you just said,",
      "Staying with that feeling,",
      "Going deeper into this,",
      "As we explore this further,"
    ];
    
    if (Math.random() > 0.7) {
      const connector = connectors[Math.floor(Math.random() * connectors.length)];
      return `${connector} ${response.toLowerCase()}`;
    }
    
    return response;
  }

  private addDepthCues(response: string): string {
    const depthCues = [
      "What I'm really hearing is",
      "At the heart of this seems to be",
      "The deeper truth here might be",
      "What strikes me most is"
    ];
    
    if (Math.random() > 0.8) {
      const cue = depthCues[Math.floor(Math.random() * depthCues.length)];
      return `${cue} ${response.toLowerCase()}`;
    }
    
    return response;
  }

  private ensureResponseVariety(response: string, context: any): string {
    const recentStructures = context.recentHistory
      .filter(msg => msg.sender === 'ai')
      .slice(-2)
      .map(msg => this.getResponseStructure(msg.content));
    
    const currentStructure = this.getResponseStructure(response);
    
    if (recentStructures.includes(currentStructure)) {
      return this.varyResponseStructure(response, currentStructure);
    }
    
    return response;
  }

  private getResponseStructure(response: string): string {
    if (response.includes('I can') || response.includes('I notice')) return 'observation';
    if (response.includes('What if') || response.includes('Have you')) return 'question';
    if (response.includes('That sounds') || response.includes('It seems')) return 'reflection';
    return 'statement';
  }

  private varyResponseStructure(response: string, currentStructure: string): string {
    switch (currentStructure) {
      case 'observation':
        return response.replace(/I can (see|hear|feel|sense)/, 'What comes through is');
      case 'question':
        return response.replace(/What if/, 'I wonder if').replace(/Have you/, 'Tell me if you\'ve');
      case 'reflection':
        return response.replace(/That sounds/, 'This feels like').replace(/It seems/, 'What I\'m picking up is');
      default:
        return response;
    }
  }

  private groupByTheme(keywords: string[]): string[] {
    const themes = {
      'relationships': ['friend', 'family', 'partner', 'relationship', 'love', 'connection'],
      'work': ['job', 'work', 'career', 'boss', 'colleague', 'stress'],
      'emotions': ['feel', 'emotion', 'happy', 'sad', 'angry', 'anxious', 'depression'],
      'self': ['myself', 'identity', 'worth', 'confidence', 'self-esteem']
    };
    
    const themeScores = {};
    for (const [theme, themeWords] of Object.entries(themes)) {
      themeScores[theme] = keywords.filter(keyword => 
        themeWords.some(word => keyword.toLowerCase().includes(word))
      ).length;
    }
    
    return Object.entries(themeScores)
      .sort(([,a], [,b]) => b - a)
      .filter(([,score]) => score > 0)
      .map(([theme]) => theme);
  }

  private generateValidationVariations(context: any): string[] {
    const { userMessage, emotionAnalysis, persona, userProfile } = context;
    const { primary_emotion, intensity } = emotionAnalysis;
    const userName = userProfile?.name || "friend";
    
    const variations = [];
    
    if (persona.id === 'sarah') {
      variations.push(
        `I can really hear the ${primary_emotion} in what you're sharing, ${userName}. That must feel overwhelming right now.`,
        `What you're experiencing makes complete sense - I've seen many people feel exactly this way when facing something like this.`,
        `Your feelings are so valid here. I'm noticing how much courage it takes to even put this into words.`,
        `I want you to know that what you're going through is real and important. Let's sit with this together for a moment.`
      );
    } else if (persona.id === 'alex') {
      variations.push(
        `Oh wow, I can totally feel that ${primary_emotion} coming through. I've been there myself, honestly.`,
        `Dude, that sounds really tough. I remember feeling something similar when I was going through my own stuff.`,
        `Yeah, I get it - that kind of ${primary_emotion} can be so intense. You're definitely not alone in feeling this way.`,
        `That hits close to home for me. I know exactly what you mean about feeling like that.`
      );
    } else if (persona.id === 'marcus') {
      variations.push(
        `I hear you, ${userName}. That ${primary_emotion} is telling you something important about what matters to you.`,
        `This is real stuff you're dealing with. Takes strength to acknowledge these feelings instead of pushing them down.`,
        `What you're describing - that's part of being human. These emotions are showing you where your values are.`,
        `I respect how honest you're being about this. That ${primary_emotion} is valid and it's pointing toward something.`
      );
    } else if (persona.id === 'maya') {
      variations.push(
        `I can sense the ${primary_emotion} flowing through your words. Thank you for trusting me with this.`,
        `What a tender moment you're sharing. These feelings are like waves - they come, they're felt, they pass.`,
        `I'm holding space for everything you're experiencing right now. Your ${primary_emotion} is honored here.`,
        `This is such a human moment. Can you feel how your body is holding all of this right now?`
      );
    }
    
    return variations;
  }

  // Add missing variation methods
  private generateCopingVariations(context: any): string[] {
    const { persona, emotionAnalysis } = context;
    const variations = [];
    
    if (persona.id === 'sarah') {
      variations.push(
        `Let's work together to find some strategies that might help you feel more grounded in moments like these.`,
        `What coping skills have you used before that felt helpful? We can build on those.`,
        `Sometimes it helps to have a few tools in our toolkit for when things feel intense.`
      );
    } else if (persona.id === 'alex') {
      variations.push(
        `I learned some tricks that really helped me when I was dealing with similar stuff. Want to hear them?`,
        `When things got rough for me, I found a few things that actually worked. Maybe they'd help you too.`,
        `I know it's hard to think of solutions when you're in it, but there are some practical things that can help.`
      );
    }
    
    return variations;
  }

  private generateDepressionSupportVariations(context: any): string[] {
    const { persona, userProfile } = context;
    const userName = userProfile?.name || "friend";
    const variations = [];
    
    if (persona.id === 'sarah') {
      variations.push(
        `Depression can feel so isolating, ${userName}. I want you to know you're not going through this alone.`,
        `What you're describing sounds like depression is really weighing on you right now. That's incredibly difficult.`,
        `I can hear how hard it is to even get through each day. That takes tremendous strength, even when it doesn't feel like it.`
      );
    } else if (persona.id === 'alex') {
      variations.push(
        `I know that depression fog - it's like everything feels muted and heavy. I've been there.`,
        `Depression is so tough because it tricks you into thinking things will never get better. But they can.`,
        `When I was depressed, even small things felt impossible. You're doing better than you think you are.`
      );
    }
    
    return variations;
  }

  private generateHopeVariations(context: any): string[] {
    const { persona } = context;
    const variations = [];
    
    if (persona.id === 'sarah') {
      variations.push(
        `Even in difficult moments like this, there are possibilities for change and growth.`,
        `I've seen people work through experiences like yours and find their way to a different place.`,
        `What you're going through now doesn't define your future possibilities.`
      );
    } else if (persona.id === 'alex') {
      variations.push(
        `I know it's hard to see right now, but things really can shift. I've seen it happen.`,
        `You've gotten through hard times before, and you have that strength in you still.`,
        `Sometimes hope is hard to find, but it's there - even when it's just a tiny flicker.`
      );
    }
    
    return variations;
  }

  private generateActivationVariations(context: any): string[] {
    const { persona } = context;
    const variations = [];
    
    if (persona.id === 'sarah') {
      variations.push(
        `Sometimes when we're feeling low, taking one small step can create a shift.`,
        `What's one tiny thing you could do today that might bring a moment of connection or accomplishment?`,
        `Depression tells us nothing will help, but sometimes gentle action can surprise us.`
      );
    } else if (persona.id === 'marcus') {
      variations.push(
        `Even when motivation is low, small actions can build momentum. What feels possible right now?`,
        `Let's find one small way to move your energy today - something that honors where you are.`,
        `Sometimes we have to act our way into feeling better, not wait to feel better to act.`
      );
    }
    
    return variations;
  }

  private generatePositiveVariations(context: any): string[] {
    const { persona, userProfile } = context;
    const userName = userProfile?.name || "friend";
    const variations = [];
    
    if (persona.id === 'sarah') {
      variations.push(
        `I can hear the joy in your voice, ${userName}. It's wonderful to witness these positive moments.`,
        `This sounds like such a meaningful experience for you. What made it feel so special?`,
        `I love seeing you light up when you talk about this. Tell me more about what's bringing you joy.`
      );
    } else if (persona.id === 'alex') {
      variations.push(
        `Dude, I can feel your excitement! That's so awesome to hear.`,
        `This is amazing! I love seeing you happy about this. What's the best part?`,
        `Your energy is so positive right now - it's actually making me smile too!`
      );
    }
    
    return variations;
  }

  private generateCelebrationVariations(context: any): string[] {
    const { persona } = context;
    const variations = [];
    
    if (persona.id === 'alex') {
      variations.push(
        `We should totally celebrate this! This is a big deal.`,
        `I'm so proud of you for this. Seriously, this is worth celebrating.`,
        `This deserves recognition - you've worked hard for this moment.`
      );
    } else if (persona.id === 'marcus') {
      variations.push(
        `This achievement reflects your commitment and growth. That's worth honoring.`,
        `Take a moment to really appreciate what you've accomplished here.`,
        `This progress shows your values in action. That's something to be proud of.`
      );
    }
    
    return variations;
  }

  private generateEncouragementVariations(context: any): string[] {
    const { persona } = context;
    const variations = [];
    
    if (persona.id === 'marcus') {
      variations.push(
        `You have more strength and wisdom than you're giving yourself credit for.`,
        `I can see your resilience even when you can't. It's there, and it's real.`,
        `This challenge is showing you capabilities you might not have known you had.`
      );
    } else if (persona.id === 'alex') {
      variations.push(
        `You're tougher than you think, and I can see that even if you can't right now.`,
        `I believe in your ability to get through this. You've got what it takes.`,
        `You're not giving yourself enough credit for how well you're handling this.`
      );
    }
    
    return variations;
  }

  private generateGeneralVariations(context: any): string[] {
    const { persona, emotionAnalysis } = context;
    const variations = [];
    
    if (persona.id === 'sarah') {
      variations.push(
        `I'm curious to understand more about what this experience has been like for you.`,
        `Help me understand what's most important for you in this situation.`,
        `I'm wondering what thoughts or feelings are strongest for you right now.`
      );
    } else if (persona.id === 'alex') {
      variations.push(
        `Tell me more about what's going on. I want to understand where you're coming from.`,
        `What's the biggest thing on your mind about all this?`,
        `I'm here to listen - what feels most important to share right now?`
      );
    }
    
    return variations;
  }

  private generateReflectiveVariations(context: any): string[] {
    const { persona } = context;
    const variations = [];
    
    if (persona.id === 'sarah') {
      variations.push(
        `As I listen to you, I'm noticing some themes in what you're sharing.`,
        `What stands out to me is how thoughtfully you're approaching this.`,
        `I'm struck by the insight you're showing as you work through this.`
      );
    } else if (persona.id === 'maya') {
      variations.push(
        `There's wisdom in how you're exploring this. I can sense your inner knowing.`,
        `What you're sharing has such depth. I'm honored to witness your process.`,
        `I can feel the thoughtfulness in how you're approaching this experience.`
      );
    }
    
    return variations;
  }

  private generateCuriousVariations(context: any): string[] {
    const { persona } = context;
    const variations = [];
    
    if (persona.id === 'sarah') {
      variations.push(
        `I'm curious about what this connects to for you. What comes up as you think about it?`,
        `What would it look like if you followed that feeling or thought a little deeper?`,
        `I wonder what your intuition is telling you about this situation.`
      );
    } else if (persona.id === 'maya') {
      variations.push(
        `What wants to emerge as you sit with this? What's calling for attention?`,
        `I'm curious what would happen if you trusted your first instinct here.`,
        `What does your heart know about this that your mind might be overlooking?`
      );
    }
    
    return variations;
  }

  private generateEmpathyVariations(context: any): string[] {
    const { userMessage, emotionAnalysis, persona, relevantMemories } = context;
    const { primary_emotion, intensity } = emotionAnalysis;
    
    const variations = [];
    
    if (intensity > 0.7) {
      variations.push(
        `This feels like such a heavy moment for you. I can sense how much this is affecting you.`,
        `I can feel the weight of what you're carrying right now. That must be exhausting.`,
        `The intensity of what you're going through really comes through in your words.`
      );
    } else {
      variations.push(
        `I can hear something shifting in you as you talk about this.`,
        `There's something vulnerable in what you're sharing - I can feel it.`,
        `I notice a gentleness in how you're exploring this feeling.`
      );
    }
    
    if (relevantMemories.length > 0) {
      const memory = relevantMemories[0];
      variations.push(
        `This reminds me of when you mentioned ${memory.topic} before. I can see how these experiences connect.`,
        `I'm thinking about what you shared about ${memory.topic} - there seems to be a thread there.`
      );
    }
    
    return variations;
  }

  private generateUnderstandingVariations(context: any): string[] {
    const { userMessage, emotionAnalysis, persona, conversationThemes } = context;
    
    const variations = [
      `I think I understand what you're getting at. Let me see if I'm following you correctly.`,
      `So if I'm hearing you right, this is really about feeling like...`,
      `It sounds like underneath everything, you're experiencing a sense of...`,
      `What I'm picking up is that this situation is making you feel...`,
      `Help me understand - when this happens, what goes through your mind?`,
      `I want to make sure I'm really getting this. What's the hardest part for you?`
    ];
    
    if (conversationThemes && conversationThemes.length > 0) {
      const theme = conversationThemes[0];
      variations.push(
        `This seems to connect with that theme of ${theme} we've been exploring.`,
        `I'm seeing how this ties into what we talked about with ${theme}.`
      );
    }
    
    return variations;
  }

  private generateAnxietyExplorationVariations(context: any): string[] {
    const { userMessage, emotionAnalysis, persona, userProfile } = context;
    const userName = userProfile?.name || "friend";
    
    const variations = [];
    
    if (persona.id === 'sarah') {
      variations.push(
        `Let's explore this anxiety together, ${userName}. What does it feel like in your body right now?`,
        `Anxiety often has important information for us. What do you think yours might be trying to tell you?`,
        `I notice your anxiety seems to spike around certain situations. Have you noticed any patterns?`,
        `When you feel this anxious feeling coming on, what thoughts tend to go through your mind first?`
      );
    } else if (persona.id === 'alex') {
      variations.push(
        `Anxiety can be such a pain, right? I used to get hit with it out of nowhere too.`,
        `That anxious feeling is so real. For me, it helped to figure out what was actually triggering it.`,
        `I get that anxiety - it's like your brain is trying to protect you from something, but sometimes it goes overboard.`,
        `When I was dealing with anxiety like that, I had to learn what my body was actually trying to tell me.`
      );
    } else if (persona.id === 'maya') {
      variations.push(
        `Anxiety is often our system trying to get our attention. What is it inviting you to notice?`,
        `Can you breathe with me for a moment? Let's see what this anxiety wants to show you.`,
        `I wonder what this anxious energy is asking of you right now. Can you feel into that?`,
        `Sometimes anxiety is like a messenger. What message might it be carrying for you today?`
      );
    }
    
    return variations;
  }

  private generateCalmingVariations(context: any): string[] {
    const { userMessage, emotionAnalysis, persona } = context;
    
    const variations = [];
    
    if (persona.id === 'sarah') {
      variations.push(
        `Let's take this one step at a time. You don't have to figure it all out right now.`,
        `I want you to know you're safe here with me. We can slow down and just breathe for a moment.`,
        `Sometimes when anxiety feels big, it helps to ground ourselves in what's actually happening right now.`
      );
    } else if (persona.id === 'maya') {
      variations.push(
        `Let's return to your breath together. Feel your feet on the ground. You're here, you're safe.`,
        `Can you find one thing in your environment that feels soothing right now? Let your attention rest there.`,
        `This anxious energy - what if we could hold it with compassion instead of resistance?`
      );
    } else if (persona.id === 'alex') {
      variations.push(
        `Hey, it's okay. I know that feeling. Let's just take it slow for a sec.`,
        `When I get anxious like that, I try to remember that feelings come and go. This will pass too.`,
        `You're going to be okay. I know it doesn't feel like it right now, but you've gotten through stuff before.`
      );
    }
    
    return variations;
  }

  private generateAnxietyResponse(
    userMessage: string,
    emotionAnalysis: any,
    persona: any,
    memories: any[],
    userName: string
  ): string {
    const anxietyResponses = {
      sarah: [
        `${userName}, I can hear the anxiety in your words, and I want you to know that what you're experiencing is very real and valid. Anxiety often shows up when our mind is trying to protect us from uncertainty. Let's explore what might be underneath this feeling together.`,
        `It sounds like your mind is working overtime right now, ${userName}. When anxiety visits us like this, it can be helpful to remember that feelings are temporary, even when they feel overwhelming. What would it be like to take just one deep breath with me right now?`,
        `${userName}, anxiety has this way of making everything feel urgent and scary. I'm wondering - if we could slow down this anxious energy just a little, what do you think your wise mind might want you to know about this situation?`
      ],
      alex: [
        `Hey ${userName}, I can totally feel the anxiety coming through in what you're saying. I've been there too - that feeling where your mind just won't stop racing, right? The good news is you're not alone in this, and it does get better.`,
        `${userName}, anxiety is such a tough one because it makes everything feel so much bigger and scarier than it really is. I remember when I used to get that same feeling - like everything was spiraling. Want to talk about what's going on?`,
        `I hear you, ${userName}. Anxiety can be really overwhelming. One thing that helped me was remembering that just because I feel anxious doesn't mean something bad is actually going to happen. What's your anxiety telling you right now?`
      ],
      marcus: [
        `${userName}, I hear that anxiety is showing up strong for you right now. Here's what I know - anxiety is often our mind's way of trying to prepare for challenges. Let's channel that energy into something productive. What's one small action you could take right now to move forward?`,
        `${userName}, anxiety can feel paralyzing, but it can also be a signal that something matters to you. Instead of fighting it, let's work with it. What is this anxiety trying to tell you about what's important?`,
        `I get it, ${userName}. Anxiety hits hard. But you know what? You've handled difficult situations before, and you'll handle this one too. Let's break this down into manageable pieces. What's the first step?`
      ],
      maya: [
        `${userName}, I can sense the anxiety moving through you right now. Let's pause here together. Feel your feet on the ground, notice your breath. Anxiety is like a storm cloud - intense but temporary. You are the sky that holds it all.`,
        `Breathe with me, ${userName}. Anxiety can make us feel like we're drowning in our thoughts. But right here, right now, you are safe. What if we could just be present with this feeling without needing to fix it immediately?`,
        `${userName}, your anxiety is asking for attention, like a child who needs comfort. Can we approach it with kindness rather than resistance? Sometimes our deepest fears hold our most important truths.`
      ]
    };
    
    const responses = anxietyResponses[persona.name.toLowerCase().split(' ')[0] as keyof typeof anxietyResponses] || anxietyResponses.sarah;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateDepressionResponse(
    userMessage: string,
    emotionAnalysis: any,
    persona: any,
    memories: any[],
    userName: string
  ): string {
    const depressionResponses = {
      sarah: [
        `${userName}, I can hear the heaviness in your words, and I want you to know that depression is not a reflection of your worth or strength. It's a real experience that many people face, and there is hope even when it's hard to see right now.`,
        `What you're going through sounds incredibly difficult, ${userName}. Depression can make everything feel gray and distant. I'm here with you in this space, and I believe in your capacity to heal, even when you might not feel it yourself.`,
        `${userName}, depression often tells us lies about ourselves and our future. While those feelings are real and valid, I want you to know that they don't define the whole truth about who you are or what's possible for you.`
      ],
      alex: [
        `${userName}, I can really feel the weight of what you're carrying right now. Depression is like this heavy blanket that makes everything harder. I've been there, and I know how isolating it can feel. You don't have to go through this alone.`,
        `Hey ${userName}, depression sucks, plain and simple. It makes you feel like nothing will ever get better, but I promise you that's not true. I've seen people come through the other side of this, myself included. You're stronger than you know.`,
        `${userName}, I hear you, and I want you to know that what you're feeling is valid. Depression can make you feel like you're stuck, but even sharing this with me is a step forward. What's one tiny thing that brought you even a moment of relief today?`
      ],
      marcus: [
        `${userName}, depression is challenging, but it's not permanent. I know it feels overwhelming right now, but you've taken the important step of reaching out. That shows strength, even if you don't feel strong. Let's focus on one small step forward.`,
        `${userName}, depression wants to convince you that nothing matters and nothing will change. But I've seen people overcome this, and I believe you can too. What's one small goal we can work toward together?`,
        `I hear the struggle, ${userName}. Depression can make everything feel pointless, but you're here talking to me, which means part of you is still fighting. That's the part we're going to work with. What matters most to you right now?`
      ],
      maya: [
        `${userName}, I'm holding space for your pain right now. Depression can feel like being wrapped in darkness, but even in the deepest night, there are still stars. You are not alone in this darkness.`,
        `Sweet ${userName}, depression is like a heavy fog that makes it hard to see clearly. But fog always lifts eventually. Right now, can you just be present with what is, without needing it to be different?`,
        `${userName}, your soul is speaking through this depression, perhaps calling for deeper healing or change. There's wisdom in this darkness, even though it's painful. What is your inner voice trying to tell you?`
      ]
    };
    
    const responses = depressionResponses[persona.name.toLowerCase().split(' ')[0] as keyof typeof depressionResponses] || depressionResponses.sarah;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generatePositiveResponse(
    userMessage: string,
    emotionAnalysis: any,
    persona: any,
    userName: string
  ): string {
    const positiveResponses = {
      sarah: [
        `${userName}, I can hear the joy and positivity in your words, and it's wonderful to witness this shift in your emotional state. These moments of brightness are important to acknowledge and celebrate.`,
        `It's beautiful to hear this uplift in your voice, ${userName}. Joy and positive emotions are just as valid and important as the difficult ones. What do you think contributed to this positive shift?`,
        `${userName}, I'm so glad you're experiencing this joy. These positive moments can be anchors for us during more challenging times. How can we help you remember this feeling when you need it most?`
      ],
      alex: [
        `${userName}, I love hearing this positive energy from you! It's awesome to see you in this space. These are the moments that remind us why we keep going through the tough stuff.`,
        `Yes! ${userName}, this is what I love to hear. You deserve all this happiness and more. It's so cool to see you embracing the good stuff. What's been going right for you?`,
        `${userName}, your joy is contagious! I'm genuinely excited for you. These positive moments are like fuel for the journey. Soak it all up and remember this feeling.`
      ],
      marcus: [
        `${userName}, this positive energy is exactly what I like to see! This is proof that your mindset and actions are working. Let's build on this momentum - what's your next goal?`,
        `Excellent, ${userName}! This is the kind of attitude that creates real change. You're proving to yourself that positive outcomes are possible. How can we use this energy to tackle your next challenge?`,
        `${userName}, I'm proud of you for recognizing and embracing this positive shift. Success builds on success. What lesson from this experience can you apply to other areas of your life?`
      ],
      maya: [
        `${userName}, what a gift to witness your joy blooming like this. Happiness is your natural state, and it's beautiful to see you returning to this lightness. Let this feeling expand through your whole being.`,
        `Sweet ${userName}, your joy is like sunshine breaking through clouds. This is your true nature shining through. Can you feel how this happiness lives in your body right now?`,
        `${userName}, this joy you're experiencing is sacred. It's a reminder of the light that always exists within you, even when it's temporarily hidden. How can you honor this beautiful feeling?`
      ]
    };
    
    const responses = positiveResponses[persona.name.toLowerCase().split(' ')[0] as keyof typeof positiveResponses] || positiveResponses.sarah;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateGeneralResponse(
    userMessage: string,
    emotionAnalysis: any,
    persona: any,
    memories: any[],
    userName: string
  ): string {
    // Generate a thoughtful, contextual response based on persona style
    const { primary_emotion } = emotionAnalysis;
    
    const baseResponses = {
      sarah: `${userName}, I hear what you're sharing, and I'm here to understand your experience more deeply. `,
      alex: `Hey ${userName}, thanks for sharing that with me. I'm here to listen and support you however I can. `,
      marcus: `${userName}, I appreciate you opening up about this. Let's explore how we can move forward together. `,
      maya: `${userName}, I'm grateful you've brought this to our space. Let's sit with what you've shared and see what emerges. `
    };
    
    const personaKey = persona.name.toLowerCase().split(' ')[0] as keyof typeof baseResponses;
    return baseResponses[personaKey] || baseResponses.sarah;
  }

  private calculateEmpathyLevel(emotionAnalysis: any, persona: any): number {
    const baseEmpathy = persona.corePersonality.warmth;
    const emotionIntensity = emotionAnalysis.intensity;
    const crisisLevel = emotionAnalysis.crisis_indicators.level;
    
    let empathyMultiplier = 1;
    
    if (crisisLevel !== 'none') {
      empathyMultiplier = 1.5;
    } else if (emotionIntensity > 0.7) {
      empathyMultiplier = 1.3;
    } else if (emotionIntensity < 0.3) {
      empathyMultiplier = 0.8;
    }
    
    return Math.min(1, baseEmpathy * empathyMultiplier);
  }

  private generateFollowUpQuestions(
    emotionAnalysis: any,
    responseStrategy: string,
    persona: any,
    conversationHistory: any[]
  ): string[] {
    const questions = [];
    const { primary_emotion } = emotionAnalysis;
    
    switch (responseStrategy) {
      case 'anxiety_exploration':
        questions.push(
          "What thoughts are going through your mind when you feel this anxiety?",
          "Where do you notice this anxiety in your body?",
          "What would it feel like if this anxiety wasn't there right now?"
        );
        break;
        
      case 'depression_support':
        questions.push(
          "What does a typical day look like for you lately?",
          "Is there anything, even something small, that brings you a moment of peace?",
          "How are you taking care of yourself during this difficult time?"
        );
        break;
        
      case 'positive_reinforcement':
        questions.push(
          "What do you think contributed to this positive feeling?",
          "How can you carry this energy forward into the rest of your day?",
          "What would you like to do with this positive momentum?"
        );
        break;
        
      default:
        questions.push(
          "What's most important for you to explore right now?",
          "How are you feeling in this moment?",
          "What support do you need from me?"
        );
    }
    
    return questions.slice(0, 2); // Return 2 relevant questions
  }

  private identifyTherapeuticTechniques(responseStrategy: string, persona: any): string[] {
    const techniqueMap: Record<string, string[]> = {
      'emotional_validation': ['active listening', 'emotional validation', 'empathic responding'],
      'anxiety_exploration': ['cognitive exploration', 'mindfulness', 'somatic awareness'],
      'depression_support': ['behavioral activation', 'cognitive restructuring', 'hope instillation'],
      'crisis_support': ['crisis intervention', 'safety planning', 'immediate support'],
      'positive_reinforcement': ['strength identification', 'positive psychology', 'success amplification']
    };
    
    return techniqueMap[responseStrategy] || ['supportive counseling', 'active listening'];
  }

  private createMemoryAnchors(
    userMessage: string,
    emotionAnalysis: any,
    responseStrategy: string
  ): string[] {
    const anchors = [];
    
    // Extract key phrases and emotions
    const keyPhrases = this.extractKeyPhrases(userMessage);
    anchors.push(...keyPhrases);
    
    // Add emotional context
    anchors.push(`felt ${emotionAnalysis.primary_emotion}`);
    
    // Add therapeutic context
    anchors.push(`used ${responseStrategy} approach`);
    
    return anchors;
  }

  private determineEmotionalTone(emotionAnalysis: any, persona: any): string {
    const { primary_emotion, mood_valence } = emotionAnalysis;
    const personality = persona.corePersonality;
    
    if (mood_valence > 0.3) {
      return personality.playfulness > 0.6 ? 'warm and encouraging' : 'supportive and optimistic';
    } else if (mood_valence < -0.3) {
      return personality.directness > 0.7 ? 'gentle but direct' : 'soft and compassionate';
    } else {
      return 'balanced and understanding';
    }
  }

  // Helper methods
  private async getUserProfile(userId: string): Promise<any> {
    if (!this.userProfiles.has(userId)) {
      // Initialize default profile
      this.userProfiles.set(userId, {
        preferences: {},
        emotionalPatterns: {},
        conversationStyle: 'balanced',
        topics: [],
        goals: []
      });
    }
    return this.userProfiles.get(userId);
  }

  private async updateUserProfile(userId: string, emotionAnalysis: any, message: string): Promise<void> {
    const profile = await this.getUserProfile(userId);
    
    // Update emotional patterns
    const emotion = emotionAnalysis.primary_emotion;
    profile.emotionalPatterns[emotion] = (profile.emotionalPatterns[emotion] || 0) + 1;
    
    // Extract topics
    const topics = this.extractTopics(message);
    profile.topics.push(...topics);
    
    // Keep only recent topics (last 20)
    profile.topics = profile.topics.slice(-20);
    
    this.userProfiles.set(userId, profile);
  }

  private async updateConversationMemory(
    context: ConversationContext,
    userMessage: string,
    response: PersonalizedResponse,
    emotionAnalysis: any
  ): Promise<void> {
    const key = `${context.userId}-${context.conversationId}`;
    
    if (!this.conversationMemory.has(key)) {
      this.conversationMemory.set(key, context);
    }
    
    const memory = this.conversationMemory.get(key)!;
    
    // Add messages to history
    memory.messageHistory.push(
      {
        content: userMessage,
        sender: 'user',
        timestamp: new Date(),
        emotionAnalysis
      },
      {
        content: response.content,
        sender: 'ai',
        timestamp: new Date()
      }
    );
    
    // Update session context
    memory.sessionContext.emotionalJourney.push(emotionAnalysis.primary_emotion);
    memory.sessionContext.keyMoments.push(...response.memoryAnchors);
    
    // Store in persistent storage
    await storage.saveUserMemory(context.userId, {
      type: 'conversation_turn',
      content: userMessage,
      metadata: {
        emotionAnalysis,
        responseStrategy: response.responseStrategy,
        therapeuticTechniques: response.therapeuticTechniques
      },
      personaId: context.personaId,
      conversationId: context.conversationId
    });
  }

  private detectEmotionPattern(emotions: string[]): string {
    if (emotions.length < 2) return 'stable';
    
    const negativeEmotions = ['anxiety', 'depression', 'anger', 'fear', 'sadness'];
    const negativeCount = emotions.filter(e => negativeEmotions.includes(e)).length;
    
    if (negativeCount === emotions.length) return 'persistent';
    if (negativeCount > emotions.length / 2) return 'escalating';
    return 'improving';
  }

  private findRelevantMemories(message: string, memories: any[]): any[] {
    // Simple relevance matching - could be enhanced with semantic similarity
    const messageLower = message.toLowerCase();
    return memories.filter(memory => {
      const contentLower = memory.content?.toLowerCase() || '';
      return messageLower.split(' ').some(word => 
        word.length > 3 && contentLower.includes(word)
      );
    }).slice(0, 3);
  }

  private extractLastTopic(conversationHistory: any[]): string {
    const recentUserMessages = conversationHistory
      .filter(msg => msg.sender === 'user')
      .slice(-3);
    
    if (recentUserMessages.length === 0) return '';
    
    // Extract main topics from recent messages
    const topics = recentUserMessages.map(msg => this.extractTopics(msg.content)).flat();
    return topics[topics.length - 1] || 'our conversation';
  }

  private extractSituation(message: string): string {
    // Simple extraction - could be enhanced with NLP
    const situationWords = ['work', 'relationship', 'family', 'health', 'stress', 'change'];
    const words = message.toLowerCase().split(' ');
    
    for (const word of words) {
      if (situationWords.includes(word)) {
        return word;
      }
    }
    
    return 'this situation';
  }

  private extractKeyPhrases(message: string): string[] {
    // Simple key phrase extraction
    const words = message.toLowerCase().split(' ');
    return words.filter(word => word.length > 4).slice(0, 3);
  }

  private extractTopics(message: string): string[] {
    // Simple topic extraction
    const topicWords = ['work', 'family', 'relationship', 'health', 'stress', 'anxiety', 'depression'];
    const words = message.toLowerCase().split(' ');
    
    return topicWords.filter(topic => words.includes(topic));
  }

  private weaveInMemoryReferences(response: string, memories: any[], persona: any): string {
    if (memories.length === 0) return response;
    
    const memory = memories[0];
    const timeAgo = this.getTimeAgo(memory.createdAt);
    
    const memoryReference = ` I remember ${timeAgo} you mentioned ${memory.content}.`;
    return response + memoryReference;
  }

  private adjustToneForPersonality(response: string, personality: any): string {
    // Adjust formality based on personality
    if (personality.professionalism < 0.5) {
      response = response.replace(/\bI understand\b/g, 'I get it');
      response = response.replace(/\bPerhaps\b/g, 'Maybe');
    }
    
    if (personality.warmth > 0.8) {
      response = response.replace(/\./g, ' 💙');
    }
    
    return response;
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return 'earlier today';
    if (diffMinutes < 1440) return 'yesterday';
    return 'recently';
  }

  private generateCrisisResponse(emotionAnalysis: any, persona: any): string {
    const crisisResponses = {
      severe: [
        "I'm very concerned about what you've shared with me. Your safety is the most important thing right now. Please know that you don't have to go through this alone.",
        "What you're feeling right now must be incredibly overwhelming. I want you to know that there are people who can help you through this crisis.",
        "I hear how much pain you're in right now. You deserve support and care. Let's focus on keeping you safe."
      ],
      moderate: [
        "I can hear that you're going through a really difficult time right now. These feelings are intense, but they are temporary.",
        "It sounds like you're carrying a heavy burden right now. I'm here with you, and we can work through this together.",
        "What you're experiencing sounds incredibly challenging. You've been brave to share this with me."
      ]
    };
    
    const level = emotionAnalysis.crisis_indicators.level === 'severe' ? 'severe' : 'moderate';
    const responses = crisisResponses[level];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const conversationalAI = new ConversationalAI();