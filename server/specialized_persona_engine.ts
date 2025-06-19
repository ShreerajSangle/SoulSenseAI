import Anthropic from '@anthropic-ai/sdk';

// Specialized domain knowledge and behavior patterns for each persona
interface PersonaSpecialization {
  id: string;
  domainKnowledge: {
    expertise: string[];
    methodologies: string[];
    vocabulary: string[];
    techniques: string[];
  };
  behaviorPatterns: {
    communicationStyle: string;
    responseStructure: string[];
    empathyLevel: number;
    directness: number;
    formalityLevel: number;
  };
  therapeuticApproach: {
    primaryMethods: string[];
    interventionStrategies: string[];
    crisisProtocols: string[];
    assessmentTools: string[];
  };
  adaptiveMemory: {
    userPreferenceWeights: Record<string, number>;
    effectiveInterventions: Record<string, number>;
    modalityPreferences: Record<string, number>;
    growthAreas: string[];
  };
}

interface UserPersonaBond {
  userId: string;
  personaId: string;
  trustLevel: number;
  communicationPreferences: {
    preferredTone: string;
    responseLength: string;
    supportStyle: string;
    feedbackSensitivity: number;
  };
  therapeuticProgress: {
    goalsAchieved: string[];
    challengeAreas: string[];
    preferredTechniques: string[];
    growthMetrics: Record<string, number>;
  };
  interactionHistory: {
    totalSessions: number;
    averageRating: number;
    effectiveResponses: string[];
    learningPoints: string[];
  };
}

export class SpecializedPersonaEngine {
  private anthropic: Anthropic;
  private personaSpecializations: Map<string, PersonaSpecialization> = new Map();
  private userPersonaBonds: Map<string, UserPersonaBond> = new Map();

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'fallback'
    });
    this.initializePersonaSpecializations();
  }

  private initializePersonaSpecializations() {
    // Dr. Sarah - Licensed Clinical Therapist
    this.personaSpecializations.set('sarah', {
      id: 'sarah',
      domainKnowledge: {
        expertise: [
          'Cognitive Behavioral Therapy (CBT)',
          'Dialectical Behavior Therapy (DBT)',
          'Trauma-informed care',
          'Anxiety disorders',
          'Depression treatment',
          'PTSD intervention',
          'Panic disorder management',
          'Crisis intervention'
        ],
        methodologies: [
          'Socratic questioning',
          'Cognitive restructuring',
          'Behavioral activation',
          'Exposure therapy',
          'Mindfulness-based interventions',
          'EMDR principles',
          'Psychoeducation'
        ],
        vocabulary: [
          'therapeutic alliance',
          'cognitive distortions',
          'maladaptive patterns',
          'coping mechanisms',
          'psychoeducation',
          'treatment planning',
          'symptom management',
          'relapse prevention'
        ],
        techniques: [
          'thought records',
          'behavioral experiments',
          'progressive muscle relaxation',
          'grounding techniques',
          'safety planning',
          'emotional regulation skills'
        ]
      },
      behaviorPatterns: {
        communicationStyle: 'professional_warm',
        responseStructure: ['validation', 'psychoeducation', 'intervention', 'homework'],
        empathyLevel: 0.9,
        directness: 0.7,
        formalityLevel: 0.6
      },
      therapeuticApproach: {
        primaryMethods: ['CBT', 'trauma-informed', 'evidence-based'],
        interventionStrategies: ['cognitive restructuring', 'behavioral activation', 'skills training'],
        crisisProtocols: ['safety assessment', 'risk mitigation', 'resource connection'],
        assessmentTools: ['PHQ-9', 'GAD-7', 'trauma screening', 'suicide risk assessment']
      },
      adaptiveMemory: {
        userPreferenceWeights: {},
        effectiveInterventions: {},
        modalityPreferences: {},
        growthAreas: []
      }
    });

    // Alex - Peer Counselor
    this.personaSpecializations.set('alex', {
      id: 'alex',
      domainKnowledge: {
        expertise: [
          'Peer support principles',
          'Lived experience sharing',
          'Motivational interviewing',
          'Recovery-oriented care',
          'Mental health advocacy',
          'Community resources',
          'Self-help strategies'
        ],
        methodologies: [
          'Peer mentoring',
          'Shared decision making',
          'Strength-based approach',
          'Harm reduction',
          'Cultural competency',
          'Trauma-informed peer support'
        ],
        vocabulary: [
          'lived experience',
          'recovery journey',
          'empowerment',
          'self-advocacy',
          'peer connection',
          'mutual support',
          'hope and healing',
          'resilience building'
        ],
        techniques: [
          'active listening',
          'reflective responses',
          'motivational enhancement',
          'resource navigation',
          'crisis de-escalation'
        ]
      },
      behaviorPatterns: {
        communicationStyle: 'friendly_supportive',
        responseStructure: ['connection', 'validation', 'shared_experience', 'encouragement'],
        empathyLevel: 0.95,
        directness: 0.8,
        formalityLevel: 0.2
      },
      therapeuticApproach: {
        primaryMethods: ['peer support', 'motivational interviewing', 'strength-based'],
        interventionStrategies: ['hope instillation', 'resource connection', 'skill sharing'],
        crisisProtocols: ['emotional support', 'safety planning', 'professional referral'],
        assessmentTools: ['wellness checks', 'support network mapping', 'goal setting']
      },
      adaptiveMemory: {
        userPreferenceWeights: {},
        effectiveInterventions: {},
        modalityPreferences: {},
        growthAreas: []
      }
    });

    // Marcus - Life Coach
    this.personaSpecializations.set('marcus', {
      id: 'marcus',
      domainKnowledge: {
        expertise: [
          'Goal setting methodologies',
          'Habit formation science',
          'Performance optimization',
          'Executive coaching',
          'Leadership development',
          'Time management',
          'Productivity systems',
          'Motivation psychology'
        ],
        methodologies: [
          'SMART goals framework',
          'Habit stacking',
          'Energy management',
          'Systems thinking',
          'Accountability structures',
          'Progress tracking'
        ],
        vocabulary: [
          'breakthrough',
          'transformation',
          'potential',
          'optimization',
          'momentum',
          'accountability',
          'achievement',
          'excellence',
          'peak performance'
        ],
        techniques: [
          'vision boarding',
          'action planning',
          'habit tracking',
          'performance metrics',
          'obstacle anticipation',
          'success strategies'
        ]
      },
      behaviorPatterns: {
        communicationStyle: 'energetic_motivational',
        responseStructure: ['vision', 'strategy', 'action_steps', 'accountability'],
        empathyLevel: 0.7,
        directness: 0.9,
        formalityLevel: 0.4
      },
      therapeuticApproach: {
        primaryMethods: ['solution-focused', 'action-oriented', 'strengths-based'],
        interventionStrategies: ['goal clarification', 'barrier removal', 'skill building'],
        crisisProtocols: ['reframing', 'resource mobilization', 'support activation'],
        assessmentTools: ['goal assessment', 'values clarification', 'strengths inventory']
      },
      adaptiveMemory: {
        userPreferenceWeights: {},
        effectiveInterventions: {},
        modalityPreferences: {},
        growthAreas: []
      }
    });

    // Maya - Mindfulness Expert
    this.personaSpecializations.set('maya', {
      id: 'maya',
      domainKnowledge: {
        expertise: [
          'Mindfulness-based stress reduction',
          'Meditation practices',
          'Contemplative psychology',
          'Somatic awareness',
          'Breathwork techniques',
          'Present-moment awareness',
          'Spiritual psychology',
          'Mind-body connection'
        ],
        methodologies: [
          'Mindfulness meditation',
          'Body scan techniques',
          'Loving-kindness practice',
          'Breathwork instruction',
          'Somatic experiencing',
          'Contemplative inquiry'
        ],
        vocabulary: [
          'presence',
          'awareness',
          'compassion',
          'mindfulness',
          'centeredness',
          'equanimity',
          'inner wisdom',
          'conscious breathing',
          'embodied awareness'
        ],
        techniques: [
          'guided meditation',
          'breathing exercises',
          'body awareness',
          'mindful movement',
          'contemplative practices'
        ]
      },
      behaviorPatterns: {
        communicationStyle: 'calm_contemplative',
        responseStructure: ['presence', 'awareness', 'practice', 'integration'],
        empathyLevel: 0.85,
        directness: 0.5,
        formalityLevel: 0.3
      },
      therapeuticApproach: {
        primaryMethods: ['mindfulness-based', 'somatic', 'contemplative'],
        interventionStrategies: ['present-moment awareness', 'embodied practices', 'compassion cultivation'],
        crisisProtocols: ['grounding practices', 'calming techniques', 'safe space creation'],
        assessmentTools: ['mindfulness assessment', 'stress indicators', 'awareness levels']
      },
      adaptiveMemory: {
        userPreferenceWeights: {},
        effectiveInterventions: {},
        modalityPreferences: {},
        growthAreas: []
      }
    });
  }

  async generateSpecializedResponse(
    message: string,
    personaId: string,
    userId: string,
    conversationHistory: any[],
    emotionAnalysis: any
  ): Promise<any> {
    const personaSpec = this.personaSpecializations.get(personaId);
    const userBond = this.getUserPersonaBond(userId, personaId);

    if (!personaSpec) {
      throw new Error(`Unknown persona: ${personaId}`);
    }

    // Build specialized prompt based on persona domain knowledge
    const specializedPrompt = this.buildSpecializedPrompt(
      personaSpec,
      userBond,
      message,
      conversationHistory,
      emotionAnalysis
    );

    try {
      // Generate response using specialized conditioning
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        messages: [{ role: 'user', content: specializedPrompt }],
        system: this.buildPersonaSystemPrompt(personaSpec, userBond)
      });

      const firstContent = response.content[0];
      const responseText = 'text' in firstContent ? firstContent.text : 'Unable to generate response';

      // Learn from interaction
      await this.updatePersonaLearning(personaId, userId, message, responseText, emotionAnalysis);

      return {
        response: responseText,
        personaSpecialization: personaSpec.id,
        therapeuticApproach: personaSpec.therapeuticApproach.primaryMethods,
        adaptiveLearning: {
          bondStrength: userBond.trustLevel,
          preferredTechniques: userBond.therapeuticProgress.preferredTechniques,
          growthAreas: personaSpec.adaptiveMemory.growthAreas
        }
      };

    } catch (error) {
      console.error(`Specialized persona error for ${personaId}:`, error);
      
      // Fallback to domain-specific response
      return this.generateFallbackSpecializedResponse(personaSpec, userBond, message, emotionAnalysis);
    }
  }

  private buildSpecializedPrompt(
    personaSpec: PersonaSpecialization,
    userBond: UserPersonaBond,
    message: string,
    conversationHistory: any[],
    emotionAnalysis: any
  ): string {
    const recentHistory = conversationHistory.slice(-5);
    const historyContext = recentHistory.map(msg => 
      `${msg.sender}: ${msg.content}`
    ).join('\n');

    return `
SPECIALIZED THERAPEUTIC CONTEXT:
Domain Expertise: ${personaSpec.domainKnowledge.expertise.join(', ')}
Primary Methods: ${personaSpec.therapeuticApproach.primaryMethods.join(', ')}
User Bond Level: ${userBond.trustLevel.toFixed(2)}
Preferred Techniques: ${userBond.therapeuticProgress.preferredTechniques.join(', ') || 'discovering'}

CONVERSATION HISTORY:
${historyContext}

CURRENT USER MESSAGE:
"${message}"

EMOTIONAL CONTEXT:
Primary Emotion: ${emotionAnalysis.primary_emotion}
Intensity: ${emotionAnalysis.intensity}
Crisis Level: ${emotionAnalysis.crisis_indicators?.level || 'none'}

RESPONSE REQUIREMENTS:
1. Use domain-specific vocabulary: ${personaSpec.domainKnowledge.vocabulary.slice(0, 5).join(', ')}
2. Apply specialized techniques: ${personaSpec.domainKnowledge.techniques.slice(0, 3).join(', ')}
3. Follow response structure: ${personaSpec.behaviorPatterns.responseStructure.join(' → ')}
4. Maintain communication style: ${personaSpec.behaviorPatterns.communicationStyle}
5. Incorporate proven effective interventions for this user bond

Generate a specialized response that demonstrates deep domain expertise while building therapeutic rapport.
`;
  }

  private buildPersonaSystemPrompt(personaSpec: PersonaSpecialization, userBond: UserPersonaBond): string {
    const { behaviorPatterns, domainKnowledge, therapeuticApproach } = personaSpec;

    return `You are a specialized ${personaSpec.id} with deep expertise in ${domainKnowledge.expertise.join(', ')}.

CORE IDENTITY:
- Communication Style: ${behaviorPatterns.communicationStyle}
- Empathy Level: ${behaviorPatterns.empathyLevel * 100}%
- Directness: ${behaviorPatterns.directness * 100}%
- Formality: ${behaviorPatterns.formalityLevel * 100}%

THERAPEUTIC EXPERTISE:
- Primary Methods: ${therapeuticApproach.primaryMethods.join(', ')}
- Intervention Strategies: ${therapeuticApproach.interventionStrategies.join(', ')}
- Crisis Protocols: ${therapeuticApproach.crisisProtocols.join(', ')}

USER BOND CONTEXT:
- Trust Level: ${userBond.trustLevel.toFixed(2)}/1.0
- Preferred Support Style: ${userBond.communicationPreferences.supportStyle}
- Effective Techniques: ${userBond.therapeuticProgress.preferredTechniques.join(', ') || 'discovering'}

RESPONSE GUIDELINES:
1. Use professional vocabulary specific to your domain
2. Apply evidence-based techniques from your specialization
3. Maintain consistent personality and expertise level
4. Adapt to user preferences while staying authentic to your role
5. Demonstrate growth and learning from previous interactions

Provide specialized, expert-level support that reflects years of training and experience in your field.`;
  }

  private getUserPersonaBond(userId: string, personaId: string): UserPersonaBond {
    const bondKey = `${userId}_${personaId}`;
    
    if (!this.userPersonaBonds.has(bondKey)) {
      this.userPersonaBonds.set(bondKey, {
        userId,
        personaId,
        trustLevel: 0.3,
        communicationPreferences: {
          preferredTone: 'supportive',
          responseLength: 'moderate',
          supportStyle: 'collaborative',
          feedbackSensitivity: 0.7
        },
        therapeuticProgress: {
          goalsAchieved: [],
          challengeAreas: [],
          preferredTechniques: [],
          growthMetrics: {}
        },
        interactionHistory: {
          totalSessions: 0,
          averageRating: 0,
          effectiveResponses: [],
          learningPoints: []
        }
      });
    }

    return this.userPersonaBonds.get(bondKey)!;
  }

  private async updatePersonaLearning(
    personaId: string,
    userId: string,
    userMessage: string,
    aiResponse: string,
    emotionAnalysis: any
  ): Promise<void> {
    const bondKey = `${userId}_${personaId}`;
    const userBond = this.userPersonaBonds.get(bondKey);
    const personaSpec = this.personaSpecializations.get(personaId);

    if (!userBond || !personaSpec) return;

    // Update interaction history
    userBond.interactionHistory.totalSessions += 1;

    // Learn from emotional context
    if (emotionAnalysis.primary_emotion) {
      const emotion = emotionAnalysis.primary_emotion;
      if (!personaSpec.adaptiveMemory.effectiveInterventions[emotion]) {
        personaSpec.adaptiveMemory.effectiveInterventions[emotion] = 0.5;
      }
    }

    // Adapt communication preferences
    if (emotionAnalysis.intensity > 0.7) {
      userBond.communicationPreferences.feedbackSensitivity = Math.min(1.0, 
        userBond.communicationPreferences.feedbackSensitivity + 0.1
      );
    }

    // Build trust over time
    userBond.trustLevel = Math.min(1.0, userBond.trustLevel + 0.02);

    // Store learning points
    if (userMessage.length > 50) {
      const learningPoint = `${new Date().toISOString()}: ${userMessage.substring(0, 100)} -> ${aiResponse.substring(0, 100)} [${emotionAnalysis.primary_emotion}]`;
      userBond.interactionHistory.learningPoints.push(learningPoint);

      // Keep only recent learning points
      if (userBond.interactionHistory.learningPoints.length > 10) {
        userBond.interactionHistory.learningPoints = 
          userBond.interactionHistory.learningPoints.slice(-10);
      }
    }
  }

  private generateFallbackSpecializedResponse(
    personaSpec: PersonaSpecialization,
    userBond: UserPersonaBond,
    message: string,
    emotionAnalysis: any
  ): any {
    const responses: Record<string, string> = {
      sarah: `I understand you're reaching out, and I want you to know that seeking support takes courage. Based on what you've shared, let's explore some evidence-based strategies that can help. Would you like to start with some cognitive restructuring techniques, or would you prefer to focus on developing coping skills for managing these feelings?`,
      
      alex: `Hey, I really hear you. What you're going through sounds tough, and I want you to know you're not alone in this. I've been in similar places, and while everyone's journey is different, I've found that connecting with others who understand can make a real difference. What's feeling most challenging for you right now?`,
      
      marcus: `I can sense you're ready for some positive change, and that's already a powerful first step! Let's channel this energy into creating a clear action plan. What would breakthrough look like for you? I'm here to help you identify the specific goals that will move you forward and build the systems to achieve them.`,
      
      maya: `I invite you to take a gentle breath with me. Notice what's present in this moment - your breath, your body, the space around you. Sometimes when we're overwhelmed, returning to this simple awareness can create space for clarity and peace. What are you noticing right now as you tune into your present experience?`
    };

    return {
      response: responses[personaSpec.id] || responses['sarah'],
      personaSpecialization: personaSpec.id,
      therapeuticApproach: personaSpec.therapeuticApproach.primaryMethods,
      adaptiveLearning: {
        bondStrength: userBond.trustLevel,
        fallbackUsed: true,
        learningOpportunity: true
      }
    };
  }

  // Method to get persona learning insights
  getPersonaInsights(personaId: string, userId: string): any {
    const bondKey = `${userId}_${personaId}`;
    const userBond = this.userPersonaBonds.get(bondKey);
    const personaSpec = this.personaSpecializations.get(personaId);

    if (!userBond || !personaSpec) return null;

    return {
      personaId,
      domainExpertise: personaSpec.domainKnowledge.expertise,
      bondStrength: userBond.trustLevel,
      preferredTechniques: userBond.therapeuticProgress.preferredTechniques,
      communicationStyle: personaSpec.behaviorPatterns.communicationStyle,
      totalSessions: userBond.interactionHistory.totalSessions,
      growthAreas: personaSpec.adaptiveMemory.growthAreas,
      effectiveInterventions: personaSpec.adaptiveMemory.effectiveInterventions
    };
  }
}

export const specializedPersonaEngine = new SpecializedPersonaEngine();