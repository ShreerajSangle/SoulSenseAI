import Anthropic from '@anthropic-ai/sdk';
import { therapeuticEngine } from './therapeutic_engine';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ConversationMemory {
  userId: string;
  personaId: string;
  emotionalProfile: {
    dominantEmotions: string[];
    emotionalTriggers: string[];
    copingPatterns: string[];
    vulnerabilityLevel: number; // 0-1 scale
  };
  relationshipDynamics: {
    trustLevel: number; // 0-1 scale  
    intimacyDepth: number; // 0-1 scale
    communicationStyle: string;
    preferredSupport: string[];
  };
  conversationPatterns: {
    topics: string[];
    responsePreferences: string[];
    avoidanceAreas: string[];
    engagementLevel: number;
  };
  therapeuticProgress: {
    initialConcerns: string[];
    workingGoals: string[];
    breakthroughs: string[];
    recurringThemes: string[];
  };
  lastInteraction: Date;
}

interface EmotionalIntelligence {
  primary: string;
  secondary: string[];
  intensity: number; // 0-1 scale
  context: string;
  needsSupport: boolean;
  crisisIndicators: string[];
}

export class EnhancedConversationSystem {
  private memoryStore = new Map<string, ConversationMemory>();

  async generateResponse(
    personaId: string,
    userId: string,
    message: string,
    conversationHistory: any[],
    moodData?: any
  ): Promise<{
    content: string;
    emotionalTone: string;
    therapeuticElements: string[];
    followUpQuestions: string[];
    crisisDetected: boolean;
    suggestedInterventions: string[];
  }> {
    // Analyze emotional intelligence of the message
    const emotionalAnalysis = await this.analyzeEmotionalIntelligence(message, conversationHistory);
    
    // Get or create conversation memory
    const memory = this.getConversationMemory(userId, personaId);
    
    // Update memory with current interaction
    this.updateMemoryWithInteraction(memory, message, emotionalAnalysis);
    
    // Generate contextually aware response
    const response = await this.generateContextualResponse(
      personaId,
      message,
      emotionalAnalysis,
      memory,
      conversationHistory,
      moodData
    );
    
    return response;
  }

  private async analyzeEmotionalIntelligence(
    message: string,
    conversationHistory: any[]
  ): Promise<EmotionalIntelligence> {
    // Ensure conversationHistory is an array
    const history = Array.isArray(conversationHistory) ? conversationHistory : [];
    
    const emotionPrompt = `Analyze the emotional intelligence of this message with deep psychological insight:

Message: "${message}"

Recent conversation context:
${history.length > 0 ? history.slice(-3).map(m => `${m.sender}: ${m.content}`).join('\n') : 'No previous conversation'}

Provide analysis in this JSON format:
{
  "primary": "dominant emotion",
  "secondary": ["supporting emotions"],
  "intensity": 0.8,
  "context": "what's driving these emotions",
  "needsSupport": true/false,
  "crisisIndicators": ["any concerning elements"]
}

Focus on:
- Underlying emotional needs and vulnerabilities
- Subtle cues that indicate mental state
- Support requirements and intervention opportunities
- Crisis indicators requiring immediate attention`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        temperature: 0.3,
        messages: [{ role: 'user', content: emotionPrompt }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const analysis = JSON.parse(content.text);
        return analysis;
      }
      throw new Error('Unexpected response format');
    } catch (error) {
      console.error('Emotional analysis error:', error);
      return {
        primary: 'neutral',
        secondary: [],
        intensity: 0.5,
        context: 'Unable to analyze',
        needsSupport: false,
        crisisIndicators: []
      };
    }
  }

  private getConversationMemory(userId: string, personaId: string): ConversationMemory {
    const key = `${userId}-${personaId}`;
    
    if (!this.memoryStore.has(key)) {
      this.memoryStore.set(key, {
        userId,
        personaId,
        emotionalProfile: {
          dominantEmotions: [],
          emotionalTriggers: [],
          copingPatterns: [],
          vulnerabilityLevel: 0.3
        },
        relationshipDynamics: {
          trustLevel: 0.2,
          intimacyDepth: 0.1,
          communicationStyle: 'exploring',
          preferredSupport: []
        },
        conversationPatterns: {
          topics: [],
          responsePreferences: [],
          avoidanceAreas: [],
          engagementLevel: 0.5
        },
        therapeuticProgress: {
          initialConcerns: [],
          workingGoals: [],
          breakthroughs: [],
          recurringThemes: []
        },
        lastInteraction: new Date()
      });
    }
    
    return this.memoryStore.get(key)!;
  }

  private updateMemoryWithInteraction(
    memory: ConversationMemory,
    message: string,
    emotionalAnalysis: EmotionalIntelligence
  ): void {
    // Update emotional profile
    if (!memory.emotionalProfile.dominantEmotions.includes(emotionalAnalysis.primary)) {
      memory.emotionalProfile.dominantEmotions.push(emotionalAnalysis.primary);
    }

    // Adjust vulnerability level based on openness
    const vulnerabilityIndicators = ['feel', 'hurt', 'scared', 'alone', 'lost', 'overwhelmed'];
    const hasVulnerability = vulnerabilityIndicators.some(word => 
      message.toLowerCase().includes(word)
    );
    
    if (hasVulnerability) {
      memory.emotionalProfile.vulnerabilityLevel = Math.min(1.0, 
        memory.emotionalProfile.vulnerabilityLevel + 0.1
      );
      memory.relationshipDynamics.trustLevel = Math.min(1.0,
        memory.relationshipDynamics.trustLevel + 0.05
      );
    }

    // Update relationship dynamics
    if (emotionalAnalysis.intensity > 0.7) {
      memory.relationshipDynamics.intimacyDepth = Math.min(1.0,
        memory.relationshipDynamics.intimacyDepth + 0.03
      );
    }

    memory.lastInteraction = new Date();
  }

  private async generateContextualResponse(
    personaId: string,
    message: string,
    emotionalAnalysis: EmotionalIntelligence,
    memory: ConversationMemory,
    conversationHistory: any[],
    moodData?: any
  ): Promise<{
    content: string;
    emotionalTone: string;
    therapeuticElements: string[];
    followUpQuestions: string[];
    crisisDetected: boolean;
    suggestedInterventions: string[];
  }> {
    const personaProfiles = {
      sarah: {
        name: "Dr. Sarah", 
        role: "Licensed Clinical Therapist",
        approach: "Evidence-based therapeutic interventions with professional warmth",
        specialties: ["CBT", "trauma-informed therapy", "crisis intervention"]
      },
      alex: {
        name: "Alex",
        role: "Peer Support Specialist", 
        approach: "Lived experience sharing with authentic connection",
        specialties: ["peer support", "recovery journey", "mutual aid"]
      },
      marcus: {
        name: "Marcus",
        role: "Life Coach",
        approach: "Goal-oriented support with motivational energy",
        specialties: ["goal setting", "motivation", "personal development"]
      },
      maya: {
        name: "Maya", 
        role: "Mindfulness Guide",
        approach: "Present-moment awareness with gentle wisdom",
        specialties: ["mindfulness", "meditation", "body awareness"]
      }
    };

    const persona = personaProfiles[personaId as keyof typeof personaProfiles];
    if (!persona) throw new Error(`Unknown persona: ${personaId}`);

    // Analyze message using therapeutic engine with dataset insights
    const emotionAnalysis = therapeuticEngine.analyzeMessage(message);
    const crisisAssessment = therapeuticEngine.assessCrisisRisk(message);
    const therapeuticResponse = therapeuticEngine.generatePersonaResponse(
      emotionAnalysis.primary_emotion,
      emotionAnalysis.intensity,
      personaId,
      message
    );

    // Check if this is a new conversation or greeting
    const isNewConversation = conversationHistory.length === 0 || 
                            (conversationHistory.length === 1 && message.toLowerCase().includes('hello'));

    const systemPrompt = `You are ${persona.name}, ${persona.role}.

Your personality: ${persona.approach}
Your specialties: ${persona.specialties.join(', ')}

CONVERSATION STYLE:
- Be warm, natural, and genuinely welcoming
- Start with a personal greeting and introduction if this is a new conversation
- Use conversational language, not clinical jargon
- Show genuine interest in the person as an individual
- Be empathetic without being overly analytical

${isNewConversation ? `
GREETING INSTRUCTIONS:
- Start with a warm, personal greeting like "Hello! I'm ${persona.name}"
- Briefly introduce yourself in a friendly way
- Ask an open, welcoming question about how they're doing
- Keep it natural and conversational, not clinical
` : `
EMOTIONAL CONTEXT:
- Primary emotion detected: ${emotionAnalysis.primary_emotion}
- Intensity: ${Math.round(emotionAnalysis.intensity * 100)}%
- Response style needed: ${emotionAnalysis.suggested_response_style}

${crisisAssessment.immediate_action_needed ? 'CRISIS PRIORITY: Focus on immediate safety and support' : ''}

RELATIONSHIP CONTEXT:
- Trust level: ${Math.round(memory.relationshipDynamics.trustLevel * 100)}%
- Conversation depth: ${Math.round(memory.relationshipDynamics.intimacyDepth * 100)}%

RECENT CONVERSATION:
${conversationHistory.slice(-3).map(m => `${m.sender}: ${m.content}`).join('\n')}
`}

RESPONSE GUIDELINES:
1. Be genuinely warm and conversational
2. Match your persona's unique style and expertise naturally
3. If crisis indicators present, prioritize safety immediately
4. Show authentic interest in the person's wellbeing
5. Ask thoughtful follow-up questions
6. Offer support in your area of expertise when appropriate
7. Keep responses natural and human-like, not robotic

Remember: You're having a real conversation with a person who needs support. Be present, authentic, and genuinely caring.`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        temperature: 0.8,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response format');
      }
      const responseText = content.text;
      
      // Extract therapeutic elements and follow-up questions using dataset insights
      const therapeuticElements = this.extractTherapeuticElements(responseText, persona);
      const followUpQuestions = this.generateFollowUpQuestions(personaId, emotionAnalysis);
      const suggestedInterventions = therapeuticResponse.suggested_tools;

      return {
        content: responseText,
        emotionalTone: emotionAnalysis.primary_emotion,
        therapeuticElements,
        followUpQuestions,
        crisisDetected: crisisAssessment.immediate_action_needed,
        suggestedInterventions
      };
    } catch (error) {
      console.error('Response generation error:', error);
      return this.getFallbackResponse(persona, emotionalAnalysis);
    }
  }

  private extractTherapeuticElements(content: string, persona: any): string[] {
    const elements = [];
    
    // Identify therapeutic techniques used
    const techniques = {
      'validation': ['understand', 'hear you', 'makes sense', 'valid'],
      'reflection': ['sounds like', 'it seems', 'what I hear'],
      'normalization': ['common', 'normal', 'many people'],
      'reframing': ['another way', 'different perspective', 'consider'],
      'psychoeducation': ['happens when', 'this is because', 'research shows']
    };
    
    for (const [technique, keywords] of Object.entries(techniques)) {
      if (keywords.some(keyword => content.toLowerCase().includes(keyword))) {
        elements.push(technique);
      }
    }
    
    return elements;
  }

  private generateFollowUpQuestions(personaId: string, emotionAnalysis: any): string[] {
    const questionSets = {
      sarah: [
        "What thoughts are going through your mind about this?",
        "How has this been affecting your daily life?",
        "What coping strategies have you tried so far?"
      ],
      alex: [
        "Have you experienced something similar before?",
        "What has helped you through difficult times in the past?",
        "How can we support each other through this?"
      ],
      marcus: [
        "What would success look like for you in this situation?",
        "What's one small step you could take today?",
        "How might this challenge help you grow?"
      ],
      maya: [
        "What do you notice in your body right now?",
        "Can you breathe into this feeling?",
        "What would it be like to approach this with curiosity?"
      ]
    };

    return questionSets[personaId as keyof typeof questionSets] || [];
  }

  private suggestInterventions(emotionalAnalysis: EmotionalIntelligence, persona: any): string[] {
    const interventions = [];
    
    if (emotionalAnalysis.intensity > 0.7) {
      interventions.push('Grounding techniques', 'Emotional regulation');
    }
    
    if (emotionalAnalysis.needsSupport) {
      interventions.push('Supportive listening', 'Validation exercises');
    }
    
    if (emotionalAnalysis.crisisIndicators.length > 0) {
      interventions.push('Crisis support', 'Safety planning');
    }
    
    return interventions;
  }

  private getFallbackResponse(persona: any, emotionalAnalysis: EmotionalIntelligence): any {
    return {
      content: `I can sense that you're going through something important right now. As ${persona.name}, I want you to know that I'm here to support you through this. What feels most pressing for you at this moment?`,
      emotionalTone: emotionalAnalysis.primary,
      therapeuticElements: ['validation', 'supportive presence'],
      followUpQuestions: ["What would feel most helpful right now?"],
      crisisDetected: false,
      suggestedInterventions: ['Active listening']
    };
  }
}

export const enhancedConversationSystem = new EnhancedConversationSystem();