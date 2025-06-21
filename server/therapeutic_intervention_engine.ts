import OpenAI from 'openai';

interface TherapeuticIntervention {
  id: string;
  type: 'CBT' | 'DBT' | 'ACT' | 'Mindfulness' | 'Grounding' | 'Breathing';
  name: string;
  description: string;
  estimatedDuration: number; // minutes
  steps: InterventionStep[];
  applicableEmotions: string[];
  severityRange: string[];
  personaCompatibility: string[];
}

interface InterventionStep {
  stepNumber: number;
  instruction: string;
  duration?: number;
  type: 'instruction' | 'question' | 'reflection' | 'exercise' | 'breathing';
  expectedResponse?: string;
  followUpQuestions?: string[];
}

interface ActiveSession {
  userId: string;
  interventionId: string;
  currentStep: number;
  startTime: Date;
  responses: Record<number, string>;
  effectiveness?: number;
  completed: boolean;
}

export class TherapeuticInterventionEngine {
  private openai: OpenAI;
  private activeSessions: Map<string, ActiveSession> = new Map();
  
  private interventions: TherapeuticIntervention[] = [
    // CBT Interventions
    {
      id: 'cbt-thought-challenging',
      type: 'CBT',
      name: 'Thought Challenging',
      description: 'Challenge negative thought patterns and cognitive distortions',
      estimatedDuration: 10,
      applicableEmotions: ['anxiety', 'sadness', 'anger', 'shame'],
      severityRange: ['mild', 'moderate', 'moderately_severe'],
      personaCompatibility: ['sarah', 'marcus'],
      steps: [
        {
          stepNumber: 1,
          type: 'question',
          instruction: "Let's identify the specific thought that's bothering you. What's going through your mind right now?",
          followUpQuestions: [
            "Can you be more specific about this thought?",
            "When did you first notice this thought?"
          ]
        },
        {
          stepNumber: 2,
          type: 'question',
          instruction: "On a scale of 1-10, how much do you believe this thought is true right now?",
          expectedResponse: "number"
        },
        {
          stepNumber: 3,
          type: 'instruction',
          instruction: "Now let's examine the evidence. What evidence supports this thought? What evidence contradicts it?"
        },
        {
          stepNumber: 4,
          type: 'question',
          instruction: "What would you tell a good friend who had this exact thought?",
        },
        {
          stepNumber: 5,
          type: 'reflection',
          instruction: "Let's create a more balanced thought. Based on the evidence, what's a more realistic way to think about this situation?"
        },
        {
          stepNumber: 6,
          type: 'question',
          instruction: "Now, on that same 1-10 scale, how much do you believe the original thought after this exercise?"
        }
      ]
    },
    {
      id: 'cbt-behavioral-activation',
      type: 'CBT',
      name: 'Behavioral Activation',
      description: 'Increase engagement in meaningful and pleasurable activities',
      estimatedDuration: 15,
      applicableEmotions: ['sadness', 'loneliness'],
      severityRange: ['mild', 'moderate'],
      personaCompatibility: ['sarah', 'marcus', 'maya'],
      steps: [
        {
          stepNumber: 1,
          type: 'question',
          instruction: "Think of three activities that used to bring you joy or satisfaction. What are they?",
        },
        {
          stepNumber: 2,
          type: 'question',
          instruction: "What's preventing you from doing these activities now?",
        },
        {
          stepNumber: 3,
          type: 'instruction',
          instruction: "Let's break down one activity into smaller, manageable steps. Choose the easiest activity from your list."
        },
        {
          stepNumber: 4,
          type: 'exercise',
          instruction: "Plan when you'll do this activity today or tomorrow. Be specific about the time and how long you'll do it.",
          duration: 5
        },
        {
          stepNumber: 5,
          type: 'reflection',
          instruction: "Imagine yourself completing this activity. How do you think you'll feel during and after?"
        }
      ]
    },
    
    // DBT Interventions
    {
      id: 'dbt-distress-tolerance',
      type: 'DBT',
      name: 'TIPP for Crisis Survival',
      description: 'Temperature, Intense exercise, Paced breathing, Paired muscle relaxation',
      estimatedDuration: 8,
      applicableEmotions: ['anger', 'anxiety', 'panic'],
      severityRange: ['moderate', 'moderately_severe', 'severe'],
      personaCompatibility: ['sarah', 'maya'],
      steps: [
        {
          stepNumber: 1,
          type: 'instruction',
          instruction: "We'll use TIPP - a quick way to change your body chemistry and reduce intense emotions. Are you in a safe space?"
        },
        {
          stepNumber: 2,
          type: 'exercise',
          instruction: "Temperature: Hold ice cubes, splash cold water on your face, or hold a cold object for 30 seconds.",
          duration: 1
        },
        {
          stepNumber: 3,
          type: 'exercise',
          instruction: "Intense exercise: Do jumping jacks, run in place, or do push-ups for 1 minute.",
          duration: 1
        },
        {
          stepNumber: 4,
          type: 'breathing',
          instruction: "Paced breathing: Breathe in for 4 counts, hold for 4, exhale for 6. Repeat 5 times.",
          duration: 2
        },
        {
          stepNumber: 5,
          type: 'exercise',
          instruction: "Paired muscle relaxation: Tense all muscles for 5 seconds, then completely relax. Feel the contrast.",
          duration: 1
        },
        {
          stepNumber: 6,
          type: 'question',
          instruction: "How is your emotional intensity now compared to when we started?"
        }
      ]
    },
    {
      id: 'dbt-wise-mind',
      type: 'DBT',
      name: 'Wise Mind Access',
      description: 'Find the balance between emotional and rational mind',
      estimatedDuration: 12,
      applicableEmotions: ['anxiety', 'anger', 'confusion'],
      severityRange: ['mild', 'moderate'],
      personaCompatibility: ['sarah', 'maya'],
      steps: [
        {
          stepNumber: 1,
          type: 'instruction',
          instruction: "Let's find your wise mind - the place where emotion and reason meet. Sit comfortably and close your eyes if you can."
        },
        {
          stepNumber: 2,
          type: 'breathing',
          instruction: "Take three deep breaths, focusing only on the sensation of breathing.",
          duration: 2
        },
        {
          stepNumber: 3,
          type: 'question',
          instruction: "Think about your current situation. What is your emotional mind telling you? Don't judge it, just notice."
        },
        {
          stepNumber: 4,
          type: 'question',
          instruction: "Now, what is your rational mind saying about the same situation? What are the facts?"
        },
        {
          stepNumber: 5,
          type: 'reflection',
          instruction: "Imagine these two perspectives meeting in a calm, wise place inside you. What wisdom emerges from this meeting?"
        },
        {
          stepNumber: 6,
          type: 'question',
          instruction: "From this wise mind perspective, what feels like the most balanced next step?"
        }
      ]
    },
    
    // ACT Interventions
    {
      id: 'act-values-clarification',
      type: 'ACT',
      name: 'Values Clarification',
      description: 'Connect with your core values to guide meaningful action',
      estimatedDuration: 15,
      applicableEmotions: ['sadness', 'loneliness', 'confusion'],
      severityRange: ['mild', 'moderate'],
      personaCompatibility: ['sarah', 'marcus'],
      steps: [
        {
          stepNumber: 1,
          type: 'question',
          instruction: "Imagine you're at your 80th birthday party. People are describing what kind of person you were. What would you want them to say?"
        },
        {
          stepNumber: 2,
          type: 'instruction',
          instruction: "Think about different life domains: relationships, work, personal growth, health, community. Which areas matter most to you?"
        },
        {
          stepNumber: 3,
          type: 'question',
          instruction: "What activities make you feel most like yourself - most authentic and alive?"
        },
        {
          stepNumber: 4,
          type: 'reflection',
          instruction: "Looking at your current challenges through the lens of your values, what small step could you take today that aligns with what matters to you?"
        },
        {
          stepNumber: 5,
          type: 'question',
          instruction: "What might try to stop you from taking this values-based action? How could you work with those obstacles?"
        }
      ]
    },
    {
      id: 'act-cognitive-defusion',
      type: 'ACT',
      name: 'Cognitive Defusion',
      description: 'Create distance from thoughts rather than fighting them',
      estimatedDuration: 10,
      applicableEmotions: ['anxiety', 'sadness', 'shame'],
      severityRange: ['mild', 'moderate'],
      personaCompatibility: ['sarah', 'maya'],
      steps: [
        {
          stepNumber: 1,
          type: 'question',
          instruction: "What's a thought that's been stuck on repeat in your mind lately?"
        },
        {
          stepNumber: 2,
          type: 'exercise',
          instruction: "Now say this thought out loud, but start with 'I'm having the thought that...'",
          duration: 1
        },
        {
          stepNumber: 3,
          type: 'exercise',
          instruction: "Now say it again with 'I notice I'm having the thought that...'",
          duration: 1
        },
        {
          stepNumber: 4,
          type: 'exercise',
          instruction: "Try singing the thought to the tune of 'Happy Birthday' or in a silly voice.",
          duration: 2
        },
        {
          stepNumber: 5,
          type: 'reflection',
          instruction: "How does the thought feel different now? The content is the same, but how is your relationship with it changed?"
        }
      ]
    },
    
    // Mindfulness Interventions
    {
      id: 'mindfulness-body-scan',
      type: 'Mindfulness',
      name: 'Progressive Body Scan',
      description: 'Systematic relaxation and body awareness practice',
      estimatedDuration: 15,
      applicableEmotions: ['anxiety', 'stress', 'tension'],
      severityRange: ['mild', 'moderate'],
      personaCompatibility: ['maya', 'sarah'],
      steps: [
        {
          stepNumber: 1,
          type: 'instruction',
          instruction: "Find a comfortable position lying down or sitting with support. Close your eyes or soften your gaze."
        },
        {
          stepNumber: 2,
          type: 'breathing',
          instruction: "Take three deep breaths to settle in. Let your breath return to its natural rhythm.",
          duration: 2
        },
        {
          stepNumber: 3,
          type: 'exercise',
          instruction: "Starting with your toes, notice any sensations. Don't try to change anything, just observe with curiosity.",
          duration: 2
        },
        {
          stepNumber: 4,
          type: 'exercise',
          instruction: "Slowly move your attention up through your feet, ankles, calves, knees... Notice tension and relaxation.",
          duration: 4
        },
        {
          stepNumber: 5,
          type: 'exercise',
          instruction: "Continue through your torso, arms, neck, and head. Where do you hold stress? Send breath to those areas.",
          duration: 4
        },
        {
          stepNumber: 6,
          type: 'reflection',
          instruction: "Take a moment to feel your whole body as one connected system. What do you notice?"
        }
      ]
    },
    {
      id: 'mindfulness-5-4-3-2-1',
      type: 'Grounding',
      name: '5-4-3-2-1 Grounding',
      description: 'Sensory grounding technique for anxiety and panic',
      estimatedDuration: 5,
      applicableEmotions: ['anxiety', 'panic', 'overwhelm'],
      severityRange: ['moderate', 'moderately_severe', 'severe'],
      personaCompatibility: ['maya', 'sarah', 'alex'],
      steps: [
        {
          stepNumber: 1,
          type: 'instruction',
          instruction: "This is a grounding technique using your senses. We'll work through this together step by step."
        },
        {
          stepNumber: 2,
          type: 'question',
          instruction: "Look around and name 5 things you can see. Take your time with each one."
        },
        {
          stepNumber: 3,
          type: 'question',
          instruction: "Now name 4 things you can touch or feel. Notice their texture, temperature, weight."
        },
        {
          stepNumber: 4,
          type: 'question',
          instruction: "Name 3 things you can hear. Include sounds you weren't noticing before."
        },
        {
          stepNumber: 5,
          type: 'question',
          instruction: "Name 2 things you can smell, or 2 smells you enjoy imagining."
        },
        {
          stepNumber: 6,
          type: 'question',
          instruction: "Name 1 thing you can taste, or think of a taste you find comforting."
        },
        {
          stepNumber: 7,
          type: 'reflection',
          instruction: "How do you feel now compared to when we started? You're here, you're present, you're safe."
        }
      ]
    },
    
    // Breathing Techniques
    {
      id: 'breathing-box',
      type: 'Breathing',
      name: 'Box Breathing',
      description: 'Four-count breathing for calm and focus',
      estimatedDuration: 5,
      applicableEmotions: ['anxiety', 'stress', 'anger'],
      severityRange: ['mild', 'moderate'],
      personaCompatibility: ['maya', 'sarah', 'marcus'],
      steps: [
        {
          stepNumber: 1,
          type: 'instruction',
          instruction: "Box breathing creates a steady, calming rhythm. Sit comfortably with your feet flat on the floor."
        },
        {
          stepNumber: 2,
          type: 'breathing',
          instruction: "Breathe in for 4 counts... Hold for 4 counts... Exhale for 4 counts... Hold empty for 4 counts.",
          duration: 1
        },
        {
          stepNumber: 3,
          type: 'breathing',
          instruction: "Continue this pattern. Imagine drawing a box as you breathe - up on inhale, across on hold, down on exhale, across on pause.",
          duration: 3
        },
        {
          stepNumber: 4,
          type: 'reflection',
          instruction: "Notice how your nervous system has shifted. This is a tool you can use anywhere, anytime."
        }
      ]
    }
  ];

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  recommendInterventions(
    emotionalState: any,
    clinicalProfile: any,
    personaId: string
  ): TherapeuticIntervention[] {
    const applicableInterventions = this.interventions.filter(intervention => {
      // Check emotional compatibility
      const emotionMatch = intervention.applicableEmotions.includes(emotionalState.primary) ||
                          intervention.applicableEmotions.some(emotion => 
                            emotionalState.secondary.includes(emotion)
                          );
      
      // Check severity compatibility
      const severityMatch = intervention.severityRange.includes(clinicalProfile.phq9.severity) ||
                           intervention.severityRange.includes(clinicalProfile.gad7.severity);
      
      // Check persona compatibility
      const personaMatch = intervention.personaCompatibility.includes(personaId);
      
      return emotionMatch && severityMatch && personaMatch;
    });

    // Sort by priority based on severity and emotion intensity
    return applicableInterventions.sort((a, b) => {
      const aPriority = this.calculateInterventionPriority(a, emotionalState, clinicalProfile);
      const bPriority = this.calculateInterventionPriority(b, emotionalState, clinicalProfile);
      return bPriority - aPriority;
    }).slice(0, 3);
  }

  private calculateInterventionPriority(
    intervention: TherapeuticIntervention,
    emotionalState: any,
    clinicalProfile: any
  ): number {
    let priority = 0;
    
    // Higher priority for matching primary emotion
    if (intervention.applicableEmotions.includes(emotionalState.primary)) {
      priority += 3;
    }
    
    // Priority for crisis situations
    if (clinicalProfile.phq9.suicideRisk && intervention.type === 'DBT') {
      priority += 5;
    }
    
    // Priority based on emotional intensity
    priority += emotionalState.intensity * 2;
    
    // Priority for shorter interventions in crisis
    if (emotionalState.intensity > 0.7 && intervention.estimatedDuration <= 10) {
      priority += 2;
    }
    
    return priority;
  }

  startIntervention(userId: string, interventionId: string): ActiveSession | null {
    const intervention = this.interventions.find(i => i.id === interventionId);
    if (!intervention) return null;

    const session: ActiveSession = {
      userId,
      interventionId,
      currentStep: 0,
      startTime: new Date(),
      responses: {},
      completed: false
    };

    this.activeSessions.set(userId, session);
    return session;
  }

  processInterventionStep(
    userId: string,
    response?: string
  ): { 
    currentStep: InterventionStep | null;
    isComplete: boolean;
    nextPrompt?: string;
    progress: number;
  } {
    const session = this.activeSessions.get(userId);
    if (!session) {
      return { currentStep: null, isComplete: true, progress: 100 };
    }

    const intervention = this.interventions.find(i => i.id === session.interventionId);
    if (!intervention) {
      return { currentStep: null, isComplete: true, progress: 100 };
    }

    // Store response if provided
    if (response && session.currentStep > 0) {
      session.responses[session.currentStep] = response;
    }

    // Move to next step
    session.currentStep++;

    // Check if intervention is complete
    if (session.currentStep > intervention.steps.length) {
      session.completed = true;
      this.activeSessions.delete(userId);
      return { 
        currentStep: null, 
        isComplete: true, 
        progress: 100,
        nextPrompt: "Great work completing this intervention! How are you feeling now?"
      };
    }

    const currentStep = intervention.steps[session.currentStep - 1];
    const progress = (session.currentStep / intervention.steps.length) * 100;

    return {
      currentStep,
      isComplete: false,
      progress,
      nextPrompt: this.generatePersonalizedPrompt(currentStep, session)
    };
  }

  private generatePersonalizedPrompt(step: InterventionStep, session: ActiveSession): string {
    let prompt = step.instruction;

    // Add duration guidance if specified
    if (step.duration) {
      prompt += ` (Take about ${step.duration} minute${step.duration > 1 ? 's' : ''} for this step.)`;
    }

    // Add encouraging transitions
    if (session.currentStep > 1) {
      const encouragements = [
        "You're doing great. ",
        "Nice work so far. ",
        "Let's continue. ",
        "You're making progress. "
      ];
      prompt = encouragements[Math.floor(Math.random() * encouragements.length)] + prompt;
    }

    return prompt;
  }

  getActiveSession(userId: string): ActiveSession | null {
    return this.activeSessions.get(userId) || null;
  }

  completeSession(userId: string, effectiveness: number): void {
    const session = this.activeSessions.get(userId);
    if (session) {
      session.effectiveness = effectiveness;
      session.completed = true;
      // Store session data for analytics
      this.activeSessions.delete(userId);
    }
  }

  async generatePersonalizedIntervention(
    emotionalState: any,
    userHistory: string[],
    personaId: string
  ): Promise<TherapeuticIntervention> {
    try {
      const prompt = `Create a personalized therapeutic intervention based on this user's emotional state and history.

Emotional State: ${emotionalState.primary} (intensity: ${emotionalState.intensity})
Secondary emotions: ${emotionalState.secondary.join(', ')}
User History Context: ${userHistory.slice(-3).join(' ')}
Persona: ${personaId}

Create a custom intervention with 4-6 steps that would be most helpful. Format as JSON with:
- id: unique identifier
- type: therapy type (CBT/DBT/ACT/Mindfulness)
- name: intervention name
- description: brief description
- estimatedDuration: minutes
- steps: array of step objects with stepNumber, type, instruction

Make it specific to their emotional state and previous conversations.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 800
      });

      const customIntervention = JSON.parse(response.choices[0].message.content || '{}');
      
      // Add required fields
      customIntervention.applicableEmotions = [emotionalState.primary, ...emotionalState.secondary];
      customIntervention.severityRange = ['mild', 'moderate', 'moderately_severe'];
      customIntervention.personaCompatibility = [personaId];

      return customIntervention;
    } catch (error) {
      console.error('Error generating personalized intervention:', error);
      // Return a basic mindfulness intervention as fallback
      return this.interventions.find(i => i.id === 'mindfulness-5-4-3-2-1')!;
    }
  }

  generateJournalingPrompts(emotionalState: any, clinicalProfile: any): string[] {
    const prompts = [];

    // Emotion-specific prompts
    const emotionPrompts: Record<string, string[]> = {
      sadness: [
        "What would you say to comfort a friend feeling this way?",
        "Write about a time when you felt proud of yourself.",
        "What small thing could bring you a moment of peace today?"
      ],
      anxiety: [
        "What are three things that are actually within your control right now?",
        "Describe your worry as if it were a character in a story.",
        "What would your life look like if this worry wasn't so prominent?"
      ],
      anger: [
        "What is this anger trying to protect or defend?",
        "If your anger could speak, what would it say it needs?",
        "Write about what this situation might look like in a year."
      ],
      loneliness: [
        "Write a letter to your past self about the connections you've made.",
        "What qualities do you bring to relationships?",
        "Describe a moment when you felt truly understood."
      ]
    };

    const primaryEmotion = emotionalState.primary;
    if (emotionPrompts[primaryEmotion]) {
      prompts.push(...emotionPrompts[primaryEmotion]);
    }

    // Severity-based prompts
    if (clinicalProfile.phq9.severity === 'moderate' || clinicalProfile.phq9.severity === 'moderately_severe') {
      prompts.push(
        "What are three things you're grateful for, even if they feel small?",
        "Write about a strength you have that others might not see.",
        "What would you do if you knew you couldn't fail?"
      );
    }

    // General therapeutic prompts
    prompts.push(
      "What emotion are you trying not to feel right now?",
      "If your body could speak, what would it tell you?",
      "What do you need more of in your life? What do you need less of?"
    );

    return prompts.slice(0, 5);
  }

  generateMotivationalQuotes(emotionalState: any, personaId: string): string[] {
    const quotes: Record<string, string[]> = {
      sadness: [
        "The wound is the place where the Light enters you. - Rumi",
        "You are stronger than you think and more resilient than you know.",
        "Healing isn't linear, and that's perfectly okay."
      ],
      anxiety: [
        "You have been assigned this mountain to show others it can be moved.",
        "Breathing in, I calm my body. Breathing out, I smile. - Thich Nhat Hanh",
        "This feeling is temporary, but your strength is permanent."
      ],
      anger: [
        "You are not your anger. You are the awareness that observes it.",
        "Every emotion is valid, but every action is a choice.",
        "Your peace is more important than proving your point."
      ]
    };

    const emotionQuotes = quotes[emotionalState.primary] || [
      "One day at a time, one breath at a time, one moment at a time.",
      "You matter, your feelings matter, and your healing matters.",
      "Progress, not perfection, is the goal."
    ];

    // Persona-specific additions
    if (personaId === 'marcus') {
      emotionQuotes.push("Every setback is a setup for a comeback - you've got this!");
    } else if (personaId === 'maya') {
      emotionQuotes.push("Like a tree, you can bend without breaking. Like water, you can find your way through.");
    }

    return emotionQuotes;
  }
}

export const therapeuticInterventionEngine = new TherapeuticInterventionEngine();