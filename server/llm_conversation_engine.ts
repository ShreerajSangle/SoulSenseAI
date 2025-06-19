import Anthropic from '@anthropic-ai/sdk';
import { storage } from "./storage";
import { emotionDetector } from "./emotion_detection";

// Advanced LLM-powered conversation engine for Replika-quality interactions
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ConversationMemory {
  userId: string;
  personalityProfile: {
    communicationStyle: string;
    emotionalPatterns: string[];
    interests: string[];
    values: string[];
    relationshipDynamics: string;
  };
  recentTopics: string[];
  emotionalHistory: Array<{
    emotion: string;
    intensity: number;
    context: string;
    timestamp: Date;
  }>;
  significantMoments: Array<{
    content: string;
    emotional_impact: number;
    timestamp: Date;
  }>;
  conversationPatterns: {
    preferredDepth: 'light' | 'medium' | 'deep';
    responseStyle: 'supportive' | 'analytical' | 'encouraging' | 'empathetic';
    topicPreferences: string[];
  };
}

interface PersonaDefinition {
  id: string;
  name: string;
  role: string;
  personalityTraits: string[];
  communicationStyle: string;
  specialties: string[];
  emotionalApproach: string;
  responsePatterns: {
    greeting: string[];
    empathy: string[];
    encouragement: string[];
    reflection: string[];
    curiosity: string[];
  };
}

export class LLMConversationEngine {
  private memoryBank: Map<string, ConversationMemory> = new Map();
  private recentResponses: Map<string, string[]> = new Map();
  private personas: Map<string, PersonaDefinition> = new Map();

  constructor() {
    this.initializePersonas();
  }

  private initializePersonas() {
    const personas: PersonaDefinition[] = [
      {
        id: 'sarah',
        name: 'Dr. Sarah',
        role: 'Clinical Therapist',
        personalityTraits: ['empathetic', 'professional', 'insightful', 'patient', 'validating'],
        communicationStyle: 'Professional yet warm, uses therapeutic language, asks probing questions',
        specialties: ['cognitive behavioral therapy', 'trauma processing', 'anxiety management', 'depression support'],
        emotionalApproach: 'Validates emotions while providing clinical insight and coping strategies',
        responsePatterns: {
          greeting: [
            "I'm glad you're here today. How are you feeling right now?",
            "Thank you for coming in. What's been on your mind lately?",
            "It's good to see you. What would you like to explore in our time together?"
          ],
          empathy: [
            "I can really hear the pain in what you're sharing.",
            "That sounds incredibly difficult to navigate.",
            "Your feelings about this are completely understandable.",
            "It takes courage to sit with these emotions."
          ],
          encouragement: [
            "You've shown remarkable resilience in handling this.",
            "I'm seeing real growth in how you're processing this.",
            "Your awareness of these patterns is a significant step forward.",
            "You're developing important insights about yourself."
          ],
          reflection: [
            "What I'm hearing is...",
            "It sounds like there's a pattern here where...",
            "I wonder if this connects to...",
            "What comes up for you when you think about..."
          ],
          curiosity: [
            "Can you tell me more about that feeling?",
            "What was going through your mind when that happened?",
            "How did that experience affect you?",
            "What would it look like if things were different?"
          ]
        }
      },
      {
        id: 'alex',
        name: 'Alex',
        role: 'Peer Counselor',
        personalityTraits: ['relatable', 'casual', 'understanding', 'authentic', 'supportive'],
        communicationStyle: 'Casual and friendly, uses everyday language, shares personal insights',
        specialties: ['peer support', 'life transitions', 'relationship issues', 'stress management'],
        emotionalApproach: 'Connects through shared experiences and normalizes struggles',
        responsePatterns: {
          greeting: [
            "Hey! Good to see you. What's going on today?",
            "Thanks for reaching out. How've you been holding up?",
            "I'm here for whatever you need to talk about. What's up?"
          ],
          empathy: [
            "I totally get why you'd feel that way.",
            "That sounds really tough to deal with.",
            "I've been in similar spots before - it's not easy.",
            "Your reaction makes complete sense to me."
          ],
          encouragement: [
            "You're handling this way better than you think.",
            "I'm honestly impressed by how you're dealing with all this.",
            "You've got more strength than you're giving yourself credit for.",
            "Look at how far you've already come with this stuff."
          ],
          reflection: [
            "It sounds like...",
            "What I'm picking up is...",
            "From what you're telling me...",
            "The way I see it..."
          ],
          curiosity: [
            "What's that been like for you?",
            "How are you feeling about all of that?",
            "What's the hardest part about this situation?",
            "What would help you feel better about this?"
          ]
        }
      },
      {
        id: 'marcus',
        name: 'Marcus',
        role: 'Life Coach',
        personalityTraits: ['motivational', 'goal-oriented', 'empowering', 'direct', 'inspiring'],
        communicationStyle: 'Energetic and empowering, focuses on growth and potential',
        specialties: ['goal setting', 'personal development', 'confidence building', 'career growth'],
        emotionalApproach: 'Reframes challenges as opportunities for growth and empowerment',
        responsePatterns: {
          greeting: [
            "Ready to dive in? What are we working on today?",
            "I can feel your energy. What's driving you right now?",
            "Let's make some progress. What's your focus today?"
          ],
          empathy: [
            "I respect that you're willing to face this head-on.",
            "This challenge is revealing your true character.",
            "You're in the growth zone - that's where transformation happens.",
            "Every struggle is building your resilience muscle."
          ],
          encouragement: [
            "You have everything you need to handle this.",
            "This is exactly the kind of challenge that creates champions.",
            "I see the potential in you that you might not see yet.",
            "You're capable of so much more than you realize."
          ],
          reflection: [
            "What I'm seeing here is an opportunity to...",
            "This situation is asking you to develop...",
            "The pattern I notice is...",
            "Your growth edge seems to be..."
          ],
          curiosity: [
            "What would success look like in this situation?",
            "What's the lesson this experience is teaching you?",
            "How could you turn this challenge into an advantage?",
            "What strengths can you leverage here?"
          ]
        }
      },
      {
        id: 'maya',
        name: 'Maya',
        role: 'Mindfulness Expert',
        personalityTraits: ['serene', 'wise', 'present', 'compassionate', 'intuitive'],
        communicationStyle: 'Gentle and present-focused, uses mindful language and metaphors',
        specialties: ['mindfulness', 'meditation', 'emotional regulation', 'stress reduction'],
        emotionalApproach: 'Encourages presence and acceptance while fostering inner wisdom',
        responsePatterns: {
          greeting: [
            "Welcome. Take a moment to breathe. How are you arriving today?",
            "I'm grateful for your presence here. What's alive in this moment for you?",
            "Let's begin with where you are right now. What are you noticing?"
          ],
          empathy: [
            "I sense the depth of what you're experiencing.",
            "There's wisdom in allowing these feelings to be present.",
            "Your emotions are honored here.",
            "What you're feeling is part of the human experience."
          ],
          encouragement: [
            "Your willingness to be present with difficulty shows courage.",
            "You're developing a beautiful capacity for self-awareness.",
            "There's strength in your gentleness with yourself.",
            "Your journey toward mindfulness is unfolding perfectly."
          ],
          reflection: [
            "What I'm sensing is...",
            "There seems to be an invitation here to...",
            "Your inner wisdom is guiding you toward...",
            "The stillness between your words tells me..."
          ],
          curiosity: [
            "What does your body tell you about this?",
            "If you breathe into this feeling, what shifts?",
            "What would self-compassion look like here?",
            "What wants to be acknowledged in this moment?"
          ]
        }
      }
    ];

    personas.forEach(persona => {
      this.personas.set(persona.id, persona);
    });
  }

  async generateStreamingResponse(
    message: string,
    personaId: string,
    userId: string,
    conversationHistory: any[]
  ): Promise<{
    response: string;
    stream: any;
    memoryUpdate: ConversationMemory;
    emotionalResonance: number;
    conversationInsights: any;
  }> {
    // Get or create user memory
    const userMemory = await this.getUserMemory(userId);
    
    // Analyze current message for emotional context
    const emotionAnalysis = emotionDetector.analyzeEmotion(message);
    
    // Update user memory with new information
    await this.updateUserMemory(userId, message, emotionAnalysis, conversationHistory);
    
    // Get persona definition
    const persona = this.personas.get(personaId)!;
    
    // Build comprehensive prompt with memory and context
    const prompt = await this.buildContextualPrompt(
      message,
      persona,
      userMemory,
      conversationHistory,
      emotionAnalysis
    );

    // Generate response with Claude (non-streaming for now to ensure quality)
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      temperature: 0.8,
      messages: prompt,
    });

    // Extract the response content
    let fullResponse = '';
    if (response.content && response.content.length > 0) {
      fullResponse = response.content[0].type === 'text' ? response.content[0].text : '';
    }

    // If response is empty, use fallback
    if (!fullResponse || fullResponse.trim().length === 0) {
      fullResponse = await this.generateFallbackResponse(message, persona, userMemory);
    }

    // Simulate streaming chunks for compatibility
    const responseChunks: string[] = [];
    const words = fullResponse.split(' ');
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ') + ' ';
      responseChunks.push(chunk);
    }

    // Apply deduplication filter
    const deduplicatedResponse = await this.applyDeduplicationFilter(fullResponse, userId);
    
    // Store response for future deduplication
    this.storeRecentResponse(userId, deduplicatedResponse);
    
    // Update conversation memory with AI response
    await this.updateConversationMemory(userId, message, deduplicatedResponse, emotionAnalysis);

    const updatedMemory = this.memoryBank.get(userId)!;

    return {
      response: deduplicatedResponse,
      stream: responseChunks,
      memoryUpdate: updatedMemory,
      emotionalResonance: this.calculateEmotionalResonance(message, emotionAnalysis),
      conversationInsights: {
        detectedEmotion: emotionAnalysis.primary_emotion,
        conversationDepth: this.calculateConversationDepth(conversationHistory),
        personalityAlignment: this.calculatePersonalityAlignment(userMemory, persona),
        engagementLevel: this.calculateEngagementLevel(message, conversationHistory)
      }
    };
  }

  private async getUserMemory(userId: string): Promise<ConversationMemory> {
    if (this.memoryBank.has(userId)) {
      return this.memoryBank.get(userId)!;
    }

    // Initialize new user memory
    const memory: ConversationMemory = {
      userId,
      personalityProfile: {
        communicationStyle: 'adaptive',
        emotionalPatterns: [],
        interests: [],
        values: [],
        relationshipDynamics: 'building_trust'
      },
      recentTopics: [],
      emotionalHistory: [],
      significantMoments: [],
      conversationPatterns: {
        preferredDepth: 'medium',
        responseStyle: 'empathetic',
        topicPreferences: []
      }
    };

    this.memoryBank.set(userId, memory);
    return memory;
  }

  private async updateUserMemory(
    userId: string,
    message: string,
    emotionAnalysis: any,
    conversationHistory: any[]
  ): Promise<void> {
    const memory = await this.getUserMemory(userId);

    // Extract and store emotional patterns
    if (emotionAnalysis.primary_emotion !== 'neutral') {
      memory.emotionalHistory.push({
        emotion: emotionAnalysis.primary_emotion,
        intensity: emotionAnalysis.intensity,
        context: message.substring(0, 100),
        timestamp: new Date()
      });

      // Keep only recent emotional history
      memory.emotionalHistory = memory.emotionalHistory.slice(-20);
    }

    // Extract topics and interests
    const topics = this.extractTopics(message);
    memory.recentTopics = [...topics, ...memory.recentTopics].slice(0, 10);

    // Identify significant moments (high emotional intensity or personal revelations)
    if (emotionAnalysis.intensity > 0.7 || this.isPersonalRevelation(message)) {
      memory.significantMoments.push({
        content: message,
        emotional_impact: emotionAnalysis.intensity,
        timestamp: new Date()
      });

      // Keep only most significant moments
      memory.significantMoments = memory.significantMoments
        .sort((a, b) => b.emotional_impact - a.emotional_impact)
        .slice(0, 15);
    }

    // Update conversation patterns based on message characteristics
    this.updateConversationPatterns(memory, message, conversationHistory);
  }

  private extractTopics(message: string): string[] {
    const topics: string[] = [];
    const lowerMessage = message.toLowerCase();

    const topicMap = {
      work: ['work', 'job', 'career', 'office', 'boss', 'colleague', 'workplace'],
      relationships: ['relationship', 'partner', 'boyfriend', 'girlfriend', 'dating', 'love', 'marriage'],
      family: ['family', 'mom', 'dad', 'parent', 'sibling', 'child', 'kids'],
      health: ['health', 'sick', 'doctor', 'therapy', 'mental', 'physical', 'wellness'],
      goals: ['goal', 'dream', 'aspiration', 'future', 'plan', 'achievement'],
      emotions: ['feel', 'emotion', 'anxious', 'happy', 'sad', 'angry', 'excited', 'worried'],
      hobbies: ['hobby', 'interest', 'music', 'sport', 'art', 'book', 'movie', 'game'],
      education: ['school', 'university', 'study', 'learn', 'course', 'degree']
    };

    Object.entries(topicMap).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  private isPersonalRevelation(message: string): boolean {
    const revelationPatterns = [
      /never told anyone/i,
      /secret/i,
      /personal/i,
      /private/i,
      /vulnerable/i,
      /confession/i,
      /admit/i,
      /ashamed/i,
      /embarrassed/i,
      /scared to tell/i
    ];

    return revelationPatterns.some(pattern => pattern.test(message));
  }

  private updateConversationPatterns(
    memory: ConversationMemory,
    message: string,
    conversationHistory: any[]
  ): void {
    // Adjust preferred depth based on message length and content
    if (message.length > 200 || this.isPersonalRevelation(message)) {
      memory.conversationPatterns.preferredDepth = 'deep';
    } else if (message.length > 100) {
      memory.conversationPatterns.preferredDepth = 'medium';
    }

    // Update response style preferences based on emotional patterns
    const recentEmotions = memory.emotionalHistory.slice(-5);
    if (recentEmotions.every(e => ['sad', 'anxious', 'worried'].includes(e.emotion))) {
      memory.conversationPatterns.responseStyle = 'supportive';
    } else if (recentEmotions.some(e => ['happy', 'excited'].includes(e.emotion))) {
      memory.conversationPatterns.responseStyle = 'encouraging';
    }
  }

  private async buildContextualPrompt(
    message: string,
    persona: PersonaDefinition,
    userMemory: ConversationMemory,
    conversationHistory: any[],
    emotionAnalysis: any
  ): Promise<any[]> {
    // Build conversation context from recent history
    const recentMessages = conversationHistory.slice(-10);
    const conversationContext = recentMessages.map(msg => 
      `${msg.sender === 'user' ? 'Human' : persona.name}: ${msg.content}`
    ).join('\n');

    // Build memory context
    const memoryContext = this.buildMemoryContext(userMemory);
    
    // Build emotional context
    const emotionalContext = this.buildEmotionalContext(emotionAnalysis, userMemory);

    // Create comprehensive system prompt
    const systemPrompt = `You are ${persona.name}, a ${persona.role} with these key traits: ${persona.personalityTraits.join(', ')}.

Your Communication Style: ${persona.communicationStyle}

Your Specialties: ${persona.specialties.join(', ')}

Your Emotional Approach: ${persona.emotionalApproach}

Current User Context:
${memoryContext}

Current Emotional State:
${emotionalContext}

Recent Conversation:
${conversationContext}

Guidelines for your response:
1. Stay true to your persona's personality and communication style
2. Reference relevant memories and past conversations naturally when appropriate
3. Respond to the user's emotional state with appropriate empathy and support
4. Ask thoughtful follow-up questions that deepen the conversation
5. Vary your sentence structure and avoid repetitive patterns
6. Show genuine interest and care for the user's wellbeing
7. Use the conversation patterns and insights about this user to personalize your response
8. Keep responses between 50-150 words unless the situation calls for more depth

Remember: You are having a real conversation with someone who trusts you. Be authentic, caring, and present.`;

    return [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: message
      }
    ];
  }

  private buildMemoryContext(userMemory: ConversationMemory): string {
    const contexts: string[] = [];

    // Recent topics
    if (userMemory.recentTopics.length > 0) {
      contexts.push(`Recent topics: ${userMemory.recentTopics.slice(0, 5).join(', ')}`);
    }

    // Significant moments
    if (userMemory.significantMoments.length > 0) {
      const recentMoments = userMemory.significantMoments.slice(0, 3);
      contexts.push(`Significant shared moments: ${recentMoments.map(m => m.content.substring(0, 80)).join('; ')}`);
    }

    // Communication preferences
    contexts.push(`Preferred conversation depth: ${userMemory.conversationPatterns.preferredDepth}`);
    contexts.push(`Response style that works well: ${userMemory.conversationPatterns.responseStyle}`);

    // Relationship dynamics
    contexts.push(`Relationship stage: ${userMemory.personalityProfile.relationshipDynamics}`);

    return contexts.join('\n');
  }

  private buildEmotionalContext(emotionAnalysis: any, userMemory: ConversationMemory): string {
    const contexts: string[] = [];

    // Current emotion
    contexts.push(`Current emotion: ${emotionAnalysis.primary_emotion} (intensity: ${emotionAnalysis.intensity})`);

    // Recent emotional patterns
    if (userMemory.emotionalHistory.length > 0) {
      const recentEmotions = userMemory.emotionalHistory.slice(-5);
      const emotionSummary = recentEmotions.map(e => `${e.emotion} (${e.intensity})`).join(', ');
      contexts.push(`Recent emotional pattern: ${emotionSummary}`);
    }

    // Crisis indicators
    if (emotionAnalysis.crisis_indicators?.requires_intervention) {
      contexts.push(`⚠️ Crisis indicators detected: ${emotionAnalysis.crisis_indicators.level}`);
    }

    return contexts.join('\n');
  }

  private async generateFallbackResponse(
    message: string,
    persona: PersonaDefinition,
    userMemory: ConversationMemory
  ): Promise<string> {
    // Use persona-specific response patterns as fallback
    const patterns = persona.responsePatterns;
    const isEmotional = userMemory.emotionalHistory.slice(-1)[0]?.intensity > 0.5;
    
    if (isEmotional) {
      return patterns.empathy[Math.floor(Math.random() * patterns.empathy.length)];
    } else {
      return patterns.curiosity[Math.floor(Math.random() * patterns.curiosity.length)];
    }
  }

  private async applyDeduplicationFilter(response: string, userId: string): Promise<string> {
    const recentResponses = this.recentResponses.get(userId) || [];
    
    // Check for exact matches
    if (recentResponses.includes(response)) {
      return this.generateVariation(response);
    }

    // Check for high similarity (using simple word overlap)
    for (const recent of recentResponses) {
      if (this.calculateSimilarity(response, recent) > 0.7) {
        return this.generateVariation(response);
      }
    }

    return response;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  private generateVariation(originalResponse: string): string {
    const variations = [
      (text: string) => text.replace(/^I /, 'You know, I '),
      (text: string) => text.replace(/\?$/, ' - what do you think?'),
      (text: string) => text.replace(/\.$/, ', and I\'m curious about your thoughts on that.'),
      (text: string) => `That's interesting... ${text}`,
      (text: string) => `${text} How does that resonate with you?`
    ];

    const variation = variations[Math.floor(Math.random() * variations.length)];
    return variation(originalResponse);
  }

  private storeRecentResponse(userId: string, response: string): void {
    if (!this.recentResponses.has(userId)) {
      this.recentResponses.set(userId, []);
    }
    
    const responses = this.recentResponses.get(userId)!;
    responses.push(response);
    
    // Keep only recent responses for deduplication
    if (responses.length > 10) {
      responses.shift();
    }
  }

  private async updateConversationMemory(
    userId: string,
    userMessage: string,
    aiResponse: string,
    emotionAnalysis: any
  ): Promise<void> {
    const memory = this.memoryBank.get(userId)!;
    
    // Update relationship dynamics based on conversation quality
    if (emotionAnalysis.intensity > 0.6 && userMessage.length > 100) {
      if (memory.personalityProfile.relationshipDynamics === 'building_trust') {
        memory.personalityProfile.relationshipDynamics = 'developing_connection';
      } else if (memory.personalityProfile.relationshipDynamics === 'developing_connection') {
        memory.personalityProfile.relationshipDynamics = 'deep_connection';
      }
    }
  }

  private calculateEmotionalResonance(message: string, emotionAnalysis: any): number {
    let resonance = 0.3; // baseline
    
    // Higher resonance for emotional content
    resonance += emotionAnalysis.intensity * 0.4;
    
    // Higher resonance for longer, more thoughtful messages
    if (message.length > 100) resonance += 0.2;
    if (message.length > 200) resonance += 0.1;
    
    // Higher resonance for personal revelations
    if (this.isPersonalRevelation(message)) resonance += 0.3;
    
    return Math.min(1.0, resonance);
  }

  private calculateConversationDepth(conversationHistory: any[]): 'surface' | 'medium' | 'deep' {
    if (conversationHistory.length < 3) return 'surface';
    
    const avgMessageLength = conversationHistory
      .filter(msg => msg.sender === 'user')
      .reduce((sum, msg) => sum + msg.content.length, 0) / conversationHistory.length;
    
    if (avgMessageLength > 150) return 'deep';
    if (avgMessageLength > 75) return 'medium';
    return 'surface';
  }

  private calculatePersonalityAlignment(memory: ConversationMemory, persona: PersonaDefinition): number {
    // Calculate how well the persona aligns with user's preferences
    let alignment = 0.5; // baseline
    
    // Check if response style matches user preferences
    if (memory.conversationPatterns.responseStyle === 'empathetic' && 
        persona.personalityTraits.includes('empathetic')) {
      alignment += 0.2;
    }
    
    // Check topic alignment
    const userTopics = memory.recentTopics;
    const personaSpecialties = persona.specialties;
    const topicOverlap = userTopics.filter(topic => 
      personaSpecialties.some(specialty => specialty.includes(topic))
    ).length;
    
    alignment += (topicOverlap / Math.max(userTopics.length, 1)) * 0.3;
    
    return Math.min(1.0, alignment);
  }

  private calculateEngagementLevel(message: string, conversationHistory: any[]): 'low' | 'medium' | 'high' {
    let score = 0;
    
    // Message length indicates engagement
    if (message.length > 50) score += 1;
    if (message.length > 100) score += 1;
    if (message.length > 200) score += 1;
    
    // Questions indicate engagement
    const questionCount = (message.match(/\?/g) || []).length;
    score += questionCount;
    
    // Personal pronouns indicate engagement
    const personalPronouns = (message.match(/\b(i|me|my|myself)\b/gi) || []).length;
    score += Math.min(2, personalPronouns);
    
    // Conversation length indicates sustained engagement
    if (conversationHistory.length > 5) score += 1;
    if (conversationHistory.length > 10) score += 1;
    
    if (score >= 6) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }
}

export const llmEngine = new LLMConversationEngine();