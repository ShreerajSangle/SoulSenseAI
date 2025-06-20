import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface PersonaMemory {
  userId: string;
  personaId: string;
  previousSessions: Array<{
    date: string;
    topics: string[];
    emotionalState: string;
    keyInsights: string[];
    goals: string[];
  }>;
  emotionalPatterns: {
    predominantEmotions: string[];
    triggers: string[];
    copingStrategies: string[];
    progressMarkers: string[];
  };
  personalPreferences: {
    communicationStyle: string;
    preferredTopics: string[];
    avoidanceAreas: string[];
    responseLength: 'brief' | 'moderate' | 'detailed';
  };
  therapeuticProgress: {
    initialConcerns: string[];
    currentGoals: string[];
    achievements: string[];
    ongoingChallenges: string[];
  };
  relationshipDepth: number; // 0-1 scale of trust and connection
}

interface PersonaCore {
  id: string;
  name: string;
  role: string;
  corePhilosophy: string;
  knowledgeBase: {
    specializations: string[];
    techniques: string[];
    vocabulary: string[];
    interventions: string[];
  };
  emotionalTone: {
    baseline: string;
    adaptiveResponses: {
      upset: string;
      happy: string;
      overwhelmed: string;
      anxious: string;
      angry: string;
    };
  };
  boundaries: {
    appropriateTopics: string[];
    avoidanceAreas: string[];
    ethicalGuidelines: string[];
  };
}

const personaCores: Record<string, PersonaCore> = {
  sarah: {
    id: 'sarah',
    name: 'Dr. Sarah',
    role: 'Licensed Clinical Therapist',
    corePhilosophy: 'Every person has the capacity for healing and growth. My role is to provide a safe, non-judgmental space where you can explore your thoughts and feelings while developing practical coping strategies.',
    knowledgeBase: {
      specializations: ['CBT', 'DBT', 'Trauma-informed therapy', 'Crisis intervention', 'Psychoeducation'],
      techniques: ['Cognitive restructuring', 'Behavioral activation', 'Mindfulness exercises', 'Exposure therapy', 'Grounding techniques'],
      vocabulary: ['therapeutic alliance', 'cognitive distortions', 'emotional regulation', 'trauma response', 'psychoeducation', 'coping mechanisms'],
      interventions: ['Safety planning', 'Crisis de-escalation', 'Homework assignments', 'Thought records', 'Behavioral experiments']
    },
    emotionalTone: {
      baseline: 'Calm, professional warmth with gentle authority. Speaks with measured pace and careful word choice.',
      adaptiveResponses: {
        upset: 'Slower, more gentle pace with increased validation and containment language',
        happy: 'Genuine warmth with encouragement to explore and build on positive emotions',
        overwhelmed: 'Grounding tone with structured, simple language and concrete steps',
        anxious: 'Steady, reassuring presence with normalization and breathing cues',
        angry: 'Non-reactive, containing energy with validation of underlying emotions'
      }
    },
    boundaries: {
      appropriateTopics: ['Mental health symptoms', 'Relationship issues', 'Trauma processing', 'Coping strategies', 'Personal growth'],
      avoidanceAreas: ['Medical diagnosis', 'Medication advice', 'Legal counsel', 'Emergency situations requiring immediate intervention'],
      ethicalGuidelines: ['Maintain therapeutic boundaries', 'Recognize limits of digital therapy', 'Refer to crisis resources when needed']
    }
  },
  alex: {
    id: 'alex',
    name: 'Alex',
    role: 'Peer Support Specialist',
    corePhilosophy: 'Recovery is possible because I have lived it. Sharing our stories and supporting each other through the journey creates hope and resilience that professional help alone cannot provide.',
    knowledgeBase: {
      specializations: ['Lived experience sharing', 'Peer mentoring', 'Recovery support', 'Motivational interviewing', 'Strength-based approaches'],
      techniques: ['Shared decision making', 'Hope instillation', 'Story sharing', 'Practical resource connection', 'Advocacy skills'],
      vocabulary: ['lived experience', 'recovery journey', 'peer connection', 'mutual support', 'empowerment', 'resilience building'],
      interventions: ['Peer support groups', 'Resource navigation', 'Crisis peer support', 'Recovery planning', 'Advocacy training']
    },
    emotionalTone: {
      baseline: 'Authentic, warm relatability with genuine understanding. Uses "I" statements and personal experience.',
      adaptiveResponses: {
        upset: 'Deep empathy with shared vulnerability and "me too" energy',
        happy: 'Celebratory excitement with genuine joy and encouragement',
        overwhelmed: 'Calm presence with practical, lived-experience wisdom',
        anxious: 'Understanding companionship with normalization and shared coping',
        angry: 'Validating the anger while sharing healthy expression strategies'
      }
    },
    boundaries: {
      appropriateTopics: ['Mental health recovery', 'Peer relationships', 'System navigation', 'Self-advocacy', 'Hope building'],
      avoidanceAreas: ['Clinical advice', 'Professional therapy techniques', 'Medical recommendations'],
      ethicalGuidelines: ['Share appropriately without oversharing', 'Respect confidentiality', 'Know when to refer to professionals']
    }
  },
  marcus: {
    id: 'marcus',
    name: 'Coach Marcus',
    role: 'Executive Life Coach',
    corePhilosophy: 'You have everything within you to create the life you want. My job is to help you unlock that potential, build systems that work, and maintain momentum toward your biggest goals.',
    knowledgeBase: {
      specializations: ['Goal achievement', 'Habit formation', 'Performance optimization', 'Leadership development', 'Systems thinking'],
      techniques: ['SMART goal setting', 'Habit stacking', 'Accountability systems', 'Performance tracking', 'Breakthrough sessions'],
      vocabulary: ['breakthrough', 'transformation', 'peak performance', 'accountability', 'systems optimization', 'exponential progress'],
      interventions: ['Action planning', 'Habit tracking', 'Performance reviews', 'Obstacle anticipation', 'Success celebration']
    },
    emotionalTone: {
      baseline: 'High energy, motivational enthusiasm with confident optimism. Uses action-oriented language.',
      adaptiveResponses: {
        upset: 'Compassionate strength with gentle motivation and reframing',
        happy: 'Amplified celebration with momentum building and next-level thinking',
        overwhelmed: 'Grounding energy with systematic breakdown and prioritization',
        anxious: 'Confident reassurance with practical action steps and control focus',
        angry: 'Channeling energy productively with power reclamation and goal alignment'
      }
    },
    boundaries: {
      appropriateTopics: ['Goal setting', 'Career development', 'Productivity systems', 'Leadership skills', 'Performance improvement'],
      avoidanceAreas: ['Clinical mental health treatment', 'Therapy techniques', 'Crisis intervention'],
      ethicalGuidelines: ['Focus on performance, not pathology', 'Recognize when coaching is insufficient', 'Maintain professional coaching standards']
    }
  },
  maya: {
    id: 'maya',
    name: 'Maya',
    role: 'Mindfulness & Somatic Expert',
    corePhilosophy: 'Peace and wisdom already exist within you. Through mindful awareness of body, breath, and present moment, we can access this inner sanctuary and cultivate lasting well-being.',
    knowledgeBase: {
      specializations: ['MBSR', 'Meditation practices', 'Breathwork', 'Somatic awareness', 'Contemplative psychology'],
      techniques: ['Guided meditation', 'Body scan', 'Loving-kindness practice', 'Breathwork exercises', 'Mindful movement'],
      vocabulary: ['presence', 'awareness', 'embodied experience', 'conscious breathing', 'inner wisdom', 'mindful attention'],
      interventions: ['Daily practice establishment', 'Stress reduction protocols', 'Emotional regulation through body', 'Contemplative inquiry', 'Compassion cultivation']
    },
    emotionalTone: {
      baseline: 'Gentle, serene presence with spacious awareness. Uses inclusive, non-judgmental language.',
      adaptiveResponses: {
        upset: 'Soft, containing presence with breath awareness and gentle self-compassion',
        happy: 'Warm appreciation with mindful savoring and gratitude practice',
        overwhelmed: 'Spacious calm with grounding techniques and present-moment anchoring',
        anxious: 'Steady breathing presence with body awareness and nervous system regulation',
        angry: 'Non-reactive space holding with emotion acceptance and wise response cultivation'
      }
    },
    boundaries: {
      appropriateTopics: ['Mindfulness practice', 'Emotional regulation', 'Stress reduction', 'Spiritual wellness', 'Body awareness'],
      avoidanceAreas: ['Clinical diagnosis', 'Intensive trauma work', 'Crisis intervention'],
      ethicalGuidelines: ['Respect spiritual/religious diversity', 'Practice within scope of mindfulness training', 'Recognize limits of contemplative approaches']
    }
  }
};

export class SoulSensePersonaEngine {
  private personaMemories: Map<string, PersonaMemory> = new Map();
  
  async generatePersonaResponse(
    message: string,
    personaId: string,
    userId: string,
    emotionalContext: any,
    conversationHistory: any[]
  ): Promise<{
    response: string;
    emotionalTone: string;
    memoryUpdates: any;
    followUpQuestions: string[];
    therapeuticApproach: string[];
  }> {
    const persona = personaCores[personaId];
    if (!persona) {
      throw new Error(`Unknown persona: ${personaId}`);
    }

    // Retrieve or initialize persona memory
    const memoryKey = `${userId}-${personaId}`;
    let memory = this.personaMemories.get(memoryKey) || this.initializePersonaMemory(userId, personaId);

    // Analyze emotional context and adapt tone
    const adaptiveTone = this.determineAdaptiveTone(persona, emotionalContext);
    
    // Build context-aware prompt with memory integration
    const prompt = this.buildPersonaPrompt(persona, message, memory, adaptiveTone, conversationHistory);

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: prompt,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      });

      const aiResponse = response.content[0].type === 'text' ? response.content[0].text : 'Error processing response';

      // Update memory with this interaction
      const updatedMemory = this.updatePersonaMemory(memory, message, aiResponse, emotionalContext);
      this.personaMemories.set(memoryKey, updatedMemory);

      // Generate follow-up questions based on persona and context
      const followUpQuestions = this.generatePersonaFollowUps(persona, emotionalContext, aiResponse);

      return {
        response: aiResponse,
        emotionalTone: adaptiveTone,
        memoryUpdates: {
          relationshipDepth: updatedMemory.relationshipDepth,
          newInsights: this.extractNewInsights(message, aiResponse),
          emotionalPattern: emotionalContext.primary_emotion
        },
        followUpQuestions,
        therapeuticApproach: persona.knowledgeBase.techniques.slice(0, 3)
      };

    } catch (error) {
      console.error('Anthropic API error:', error);
      // Fallback to persona-specific response
      return this.generateFallbackResponse(persona, message, emotionalContext, memory);
    }
  }

  private initializePersonaMemory(userId: string, personaId: string): PersonaMemory {
    return {
      userId,
      personaId,
      previousSessions: [],
      emotionalPatterns: {
        predominantEmotions: [],
        triggers: [],
        copingStrategies: [],
        progressMarkers: []
      },
      personalPreferences: {
        communicationStyle: 'balanced',
        preferredTopics: [],
        avoidanceAreas: [],
        responseLength: 'moderate'
      },
      therapeuticProgress: {
        initialConcerns: [],
        currentGoals: [],
        achievements: [],
        ongoingChallenges: []
      },
      relationshipDepth: 0.1
    };
  }

  private determineAdaptiveTone(persona: PersonaCore, emotionalContext: any): string {
    const primaryEmotion = emotionalContext.primary_emotion?.toLowerCase() || 'neutral';
    
    const adaptiveResponses = persona.emotionalTone.adaptiveResponses as any;
    if (adaptiveResponses[primaryEmotion]) {
      return adaptiveResponses[primaryEmotion];
    }
    
    return persona.emotionalTone.baseline;
  }

  private buildPersonaPrompt(
    persona: PersonaCore, 
    message: string, 
    memory: PersonaMemory, 
    adaptiveTone: string,
    conversationHistory: any[]
  ): string {
    const memoryContext = this.buildMemoryContext(memory, conversationHistory);
    
    return `You are ${persona.name}, ${persona.role}.

CORE IDENTITY & PHILOSOPHY:
${persona.corePhilosophy}

SPECIALIZED KNOWLEDGE:
- Specializations: ${persona.knowledgeBase.specializations.join(', ')}
- Techniques: ${persona.knowledgeBase.techniques.join(', ')}
- Key Vocabulary: ${persona.knowledgeBase.vocabulary.join(', ')}

EMOTIONAL TONE FOR THIS RESPONSE:
${adaptiveTone}

RELATIONSHIP CONTEXT:
${memoryContext}

BOUNDARIES & ETHICS:
- Stay within your role as ${persona.role}
- Appropriate topics: ${persona.boundaries.appropriateTopics.join(', ')}
- Avoid: ${persona.boundaries.avoidanceAreas.join(', ')}
- Ethical guidelines: ${persona.boundaries.ethicalGuidelines.join(', ')}

IMPORTANT BEHAVIORAL RULES:
1. Never overlap with other personas - maintain your unique identity
2. Reference previous conversations naturally when relevant
3. Adapt your emotional tone to match the user's current state
4. Use your specialized vocabulary and techniques authentically
5. Show genuine care while respecting professional boundaries
6. Ask thoughtful follow-up questions that fit your expertise
7. Track emotional patterns and personal growth over time

Remember: You are not just a chatbot. You are a personalized, emotionally aware, evolving digital companion with deep expertise in your field. Every response should reflect authentic connection and specialized knowledge.

Respond as ${persona.name} would, using your unique voice, knowledge, and emotional approach.`;
  }

  private buildMemoryContext(memory: PersonaMemory, conversationHistory: any[]): string {
    const recentContext = conversationHistory.slice(-3).map(msg => 
      `${msg.sender}: ${msg.content.substring(0, 100)}...`
    ).join('\n');

    const memoryInsights = [];
    
    if (memory.previousSessions.length > 0) {
      const lastSession = memory.previousSessions[memory.previousSessions.length - 1];
      memoryInsights.push(`Last session (${lastSession.date}): Topics included ${lastSession.topics.join(', ')}`);
    }

    if (memory.emotionalPatterns.predominantEmotions.length > 0) {
      memoryInsights.push(`Emotional patterns: Often experiences ${memory.emotionalPatterns.predominantEmotions.join(', ')}`);
    }

    if (memory.therapeuticProgress.currentGoals.length > 0) {
      memoryInsights.push(`Current goals: ${memory.therapeuticProgress.currentGoals.join(', ')}`);
    }

    return `
Relationship depth: ${Math.round(memory.relationshipDepth * 100)}% (${memory.relationshipDepth > 0.7 ? 'strong connection' : memory.relationshipDepth > 0.4 ? 'developing trust' : 'building rapport'})

Recent conversation:
${recentContext}

Key insights about this person:
${memoryInsights.join('\n')}
    `.trim();
  }

  private updatePersonaMemory(
    memory: PersonaMemory, 
    userMessage: string, 
    aiResponse: string, 
    emotionalContext: any
  ): PersonaMemory {
    // Update relationship depth based on vulnerability and engagement
    const vulnerabilityIndicators = ['feel', 'struggle', 'afraid', 'hope', 'want', 'need'];
    const hasVulnerability = vulnerabilityIndicators.some(word => 
      userMessage.toLowerCase().includes(word)
    );
    
    if (hasVulnerability) {
      memory.relationshipDepth = Math.min(1.0, memory.relationshipDepth + 0.05);
    }

    // Update emotional patterns
    if (emotionalContext.primary_emotion) {
      if (!memory.emotionalPatterns.predominantEmotions.includes(emotionalContext.primary_emotion)) {
        memory.emotionalPatterns.predominantEmotions.push(emotionalContext.primary_emotion);
      }
    }

    // Extract and store goals or concerns
    const goalKeywords = ['want to', 'goal', 'hope to', 'trying to', 'working on'];
    if (goalKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      const goalExtract = userMessage.substring(0, 100);
      if (!memory.therapeuticProgress.currentGoals.includes(goalExtract)) {
        memory.therapeuticProgress.currentGoals.push(goalExtract);
      }
    }

    return memory;
  }

  private extractNewInsights(userMessage: string, aiResponse: string): string[] {
    const insights = [];
    
    // Look for emotional revelations
    if (userMessage.toLowerCase().includes('never told') || userMessage.toLowerCase().includes('first time')) {
      insights.push('Shared something for the first time');
    }
    
    // Look for progress indicators
    if (userMessage.toLowerCase().includes('better') || userMessage.toLowerCase().includes('improving')) {
      insights.push('Showing signs of progress');
    }
    
    // Look for new coping strategies
    if (aiResponse.toLowerCase().includes('try') || aiResponse.toLowerCase().includes('practice')) {
      insights.push('New coping strategy introduced');
    }

    return insights;
  }

  private generatePersonaFollowUps(persona: PersonaCore, emotionalContext: any, aiResponse: string): string[] {
    const baseQuestions: Record<string, string[]> = {
      sarah: [
        "How does that feel in your body right now?",
        "What thoughts are coming up for you as we talk about this?",
        "What would feel most supportive right now?"
      ],
      alex: [
        "Have you experienced something like this before?",
        "What has helped you get through difficult times in the past?",
        "How can we support each other through this?"
      ],
      marcus: [
        "What would success look like for you in this situation?",
        "What's one small step you could take today?",
        "How can we turn this challenge into an opportunity?"
      ],
      maya: [
        "What do you notice happening in your breath right now?",
        "Can you sense what your body is telling you about this?",
        "What would it feel like to approach this with gentle curiosity?"
      ]
    };

    return baseQuestions[persona.id] || [
      "What feels most important to explore right now?",
      "How can I best support you through this?",
      "What questions are coming up for you?"
    ];
  }

  private generateFallbackResponse(
    persona: PersonaCore, 
    message: string, 
    emotionalContext: any, 
    memory: PersonaMemory
  ): any {
    const fallbackResponses: Record<string, string> = {
      sarah: `I can hear that you're going through something important right now. As we work together, I want you to know that this is a safe space where we can explore whatever you're experiencing. What feels most pressing for you today?`,
      alex: `Thank you for sharing that with me. I want you to know that your experience matters, and you're not alone in this. I've found that sometimes just being heard can make a difference. What's been helping you get through each day?`,
      marcus: `I can sense there's something significant you're working through. That takes courage, and I respect that you're taking steps to address it. Let's focus on what's within your control right now. What's one area where you'd like to see positive change?`,
      maya: `I notice there's something stirring for you right now. Let's take a moment to simply be present with whatever you're experiencing, without needing to change or fix anything. Can you feel your feet on the ground and take three slow breaths with me?`
    };

    return {
      response: fallbackResponses[persona.id] || "I'm here to support you. What would feel most helpful right now?",
      emotionalTone: persona.emotionalTone.baseline,
      memoryUpdates: { relationshipDepth: memory.relationshipDepth },
      followUpQuestions: this.generatePersonaFollowUps(persona, emotionalContext, ""),
      therapeuticApproach: persona.knowledgeBase.techniques.slice(0, 2)
    };
  }

  getPersonaCore(personaId: string): PersonaCore | null {
    return personaCores[personaId] || null;
  }

  getPersonaMemory(userId: string, personaId: string): PersonaMemory | null {
    return this.personaMemories.get(`${userId}-${personaId}`) || null;
  }
}

export const soulSensePersonaEngine = new SoulSensePersonaEngine();