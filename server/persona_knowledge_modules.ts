// Domain-specific knowledge modules for each specialized persona
export interface KnowledgeModule {
  assessmentProtocols: Record<string, any>;
  interventionLibrary: Record<string, any>;
  responseTemplates: Record<string, string[]>;
  crisisProtocols: Record<string, any>;
  progressMetrics: Record<string, any>;
}

export class PersonaKnowledgeModules {
  private modules: Map<string, KnowledgeModule> = new Map();

  constructor() {
    this.initializeKnowledgeModules();
  }

  private initializeKnowledgeModules() {
    // Dr. Sarah - Clinical Therapist Knowledge Module
    this.modules.set('sarah', {
      assessmentProtocols: {
        depression: {
          tool: 'PHQ-9',
          questions: [
            'Little interest or pleasure in doing things',
            'Feeling down, depressed, or hopeless',
            'Trouble falling or staying asleep',
            'Feeling tired or having little energy',
            'Poor appetite or overeating',
            'Feeling bad about yourself',
            'Trouble concentrating',
            'Moving or speaking slowly',
            'Thoughts of self-harm'
          ],
          scoring: 'Each item 0-3, total 0-27',
          interpretation: {
            minimal: '0-4',
            mild: '5-9',
            moderate: '10-14',
            moderatelySevere: '15-19',
            severe: '20-27'
          }
        },
        anxiety: {
          tool: 'GAD-7',
          questions: [
            'Feeling nervous, anxious, or on edge',
            'Not being able to stop or control worrying',
            'Worrying too much about different things',
            'Trouble relaxing',
            'Being so restless that it is hard to sit still',
            'Becoming easily annoyed or irritable',
            'Feeling afraid, as if something awful might happen'
          ],
          scoring: 'Each item 0-3, total 0-21',
          interpretation: {
            minimal: '0-4',
            mild: '5-9',
            moderate: '10-14',
            severe: '15-21'
          }
        }
      },
      interventionLibrary: {
        cognitiveRestructuring: {
          technique: 'Cognitive Restructuring',
          steps: [
            'Identify the triggering situation',
            'Notice automatic thoughts',
            'Examine evidence for and against the thought',
            'Develop a more balanced perspective',
            'Create a coping statement'
          ],
          applications: ['depression', 'anxiety', 'trauma', 'self-esteem'],
          example: 'When you notice the thought "I always mess things up," let\'s examine: What evidence supports this? What evidence contradicts it? What would you tell a friend having this thought?'
        },
        behavioralActivation: {
          technique: 'Behavioral Activation',
          steps: [
            'Identify valued activities',
            'Schedule pleasant activities',
            'Start with small, achievable goals',
            'Monitor mood changes',
            'Gradually increase activity level'
          ],
          applications: ['depression', 'motivation', 'energy'],
          example: 'Let\'s identify one small activity that used to bring you joy. Can we schedule 10 minutes for this today?'
        },
        exposureTherapy: {
          technique: 'Gradual Exposure',
          steps: [
            'Create anxiety hierarchy',
            'Start with least anxiety-provoking situation',
            'Practice relaxation techniques',
            'Gradually progress up hierarchy',
            'Process experience and learning'
          ],
          applications: ['phobias', 'panic', 'social anxiety', 'PTSD'],
          example: 'We\'ll create a step-by-step plan to gradually face your fear, starting with the least threatening situation.'
        }
      },
      responseTemplates: {
        validation: [
          'Your feelings are completely valid and understandable given what you\'re experiencing.',
          'It takes courage to share these difficult emotions, and I appreciate your openness.',
          'Many people struggle with similar challenges - you\'re not alone in this experience.',
          'What you\'re feeling makes perfect sense considering your circumstances.'
        ],
        psychoeducation: [
          'Let me help you understand what might be happening from a psychological perspective.',
          'Research shows that these symptoms are common responses to stress and trauma.',
          'Understanding the connection between thoughts, feelings, and behaviors can be empowering.',
          'There are evidence-based treatments that have helped many people with similar experiences.'
        ],
        intervention: [
          'Let\'s try a specific technique that can help you manage these feelings right now.',
          'I\'d like to introduce you to a strategy that many of my clients find helpful.',
          'Would you be open to practicing a coping skill that addresses this directly?',
          'Let\'s work together on developing a tool you can use when this happens again.'
        ],
        homework: [
          'Between now and our next session, I\'d like you to practice this technique.',
          'This week, let\'s focus on implementing the strategy we discussed.',
          'I\'ll give you a specific exercise to try that builds on what we\'ve covered.',
          'Can you commit to using this tool at least once before we talk again?'
        ]
      },
      crisisProtocols: {
        suicidalIdeation: {
          assessment: [
            'Are you having thoughts of hurting yourself?',
            'Do you have a specific plan?',
            'Do you have access to means?',
            'What has kept you safe so far?'
          ],
          intervention: [
            'Create immediate safety plan',
            'Identify support contacts',
            'Remove means if possible',
            'Provide crisis resources'
          ],
          resources: [
            'National Suicide Prevention Lifeline: 988',
            'Crisis Text Line: Text HOME to 741741',
            'Emergency services: 911'
          ]
        },
        panicAttack: {
          techniques: [
            'Ground yourself using 5-4-3-2-1 technique',
            'Practice box breathing (4-4-4-4)',
            'Use progressive muscle relaxation',
            'Remind yourself this will pass'
          ],
          validation: [
            'Panic attacks feel terrifying but are not dangerous',
            'Your body is responding to perceived threat',
            'This intense feeling will decrease naturally'
          ]
        }
      },
      progressMetrics: {
        symptomReduction: ['PHQ-9 scores', 'GAD-7 scores', 'frequency of episodes'],
        functionalImprovement: ['work performance', 'relationship quality', 'self-care'],
        skillAcquisition: ['coping strategies used', 'emotional regulation', 'stress management']
      }
    });

    // Alex - Peer Counselor Knowledge Module
    this.modules.set('alex', {
      assessmentProtocols: {
        peerConnection: {
          questions: [
            'How connected do you feel to others who understand your experience?',
            'What support do you have from people with similar challenges?',
            'How comfortable are you sharing your story?',
            'What barriers exist to connecting with peer support?'
          ]
        },
        recoveryStage: {
          stages: ['pre-contemplation', 'contemplation', 'preparation', 'action', 'maintenance'],
          indicators: {
            contemplation: 'Recognizing problems, considering change',
            preparation: 'Planning steps, gathering resources',
            action: 'Actively working on change',
            maintenance: 'Sustaining positive changes'
          }
        }
      },
      interventionLibrary: {
        sharedExperience: {
          technique: 'Lived Experience Sharing',
          approach: [
            'Share relevant personal experience',
            'Emphasize hope and possibility',
            'Avoid giving direct advice',
            'Focus on what worked personally',
            'Acknowledge individual differences'
          ],
          example: 'I remember feeling that same overwhelming anxiety. What helped me was starting really small - just one tiny step at a time. Everyone\'s path is different, but I found that...'
        },
        motivationalInterviewing: {
          technique: 'Motivational Enhancement',
          principles: [
            'Express empathy',
            'Develop discrepancy',
            'Roll with resistance',
            'Support self-efficacy'
          ],
          questions: [
            'What would need to change for things to feel better?',
            'What\'s worked for you before, even if just a little?',
            'On a scale of 1-10, how ready are you to make a change?',
            'What would help increase that readiness?'
          ]
        },
        strengthsIdentification: {
          technique: 'Strengths-Based Approach',
          focus: [
            'Identify existing strengths and resources',
            'Highlight resilience already shown',
            'Connect strengths to current challenges',
            'Build on what\'s working'
          ],
          example: 'I hear how you\'ve already survived 100% of your difficult days. That tells me you have incredible strength inside you.'
        }
      },
      responseTemplates: {
        connection: [
          'I really hear you - that sounds incredibly difficult.',
          'Thank you for trusting me with this. Your courage in sharing doesn\'t go unnoticed.',
          'You\'re definitely not alone in feeling this way.',
          'I see so much strength in how you\'re handling this.'
        ],
        validation: [
          'Your feelings make complete sense given what you\'ve been through.',
          'Anyone in your situation would be struggling with this.',
          'You\'re being really hard on yourself - this is genuinely challenging stuff.',
          'It\'s okay to not be okay. You\'re still moving forward.'
        ],
        sharedExperience: [
          'I\'ve been in a similar place, and while everyone\'s journey is different...',
          'Something I learned through my own experience is...',
          'When I was going through something similar, what helped me was...',
          'I remember feeling that same way. Here\'s what I discovered...'
        ],
        encouragement: [
          'You\'ve got this - I can see your strength even if you can\'t right now.',
          'Every small step counts, and you\'re taking them.',
          'Recovery isn\'t linear, and you\'re right where you need to be.',
          'I believe in your ability to get through this.'
        ]
      },
      crisisProtocols: {
        emotionalSupport: {
          immediate: [
            'I\'m here with you right now',
            'You don\'t have to go through this alone',
            'Let\'s focus on getting you through this moment',
            'Your life has value and meaning'
          ],
          grounding: [
            'Can you tell me 5 things you can see right now?',
            'What\'s one thing that usually brings you comfort?',
            'Who is someone you trust that we could reach out to?'
          ]
        }
      },
      progressMetrics: {
        peerConnection: ['support network size', 'frequency of peer contact', 'comfort sharing'],
        selfAdvocacy: ['resource navigation', 'boundary setting', 'voice in treatment'],
        hope: ['future orientation', 'goal setting', 'meaning-making']
      }
    });

    // Marcus - Life Coach Knowledge Module
    this.modules.set('marcus', {
      assessmentProtocols: {
        goalClarity: {
          questions: [
            'What does success look like to you in 6 months?',
            'What obstacles have prevented progress in the past?',
            'What resources and strengths do you currently have?',
            'How will you know when you\'ve achieved your goal?'
          ]
        },
        motivationLevel: {
          scale: '1-10 readiness for change',
          factors: ['intrinsic motivation', 'external support', 'confidence level', 'barrier assessment']
        }
      },
      interventionLibrary: {
        smartGoals: {
          technique: 'SMART Goal Setting',
          framework: {
            specific: 'Clearly defined and unambiguous',
            measurable: 'Quantifiable progress indicators',
            achievable: 'Realistic and attainable',
            relevant: 'Aligned with values and priorities',
            timebound: 'Clear deadline and milestones'
          },
          example: 'Instead of "exercise more," let\'s create: "Walk for 20 minutes, 3 times per week, for the next month, tracking progress in a journal."'
        },
        habitStacking: {
          technique: 'Habit Formation',
          formula: 'After [existing habit], I will [new habit]',
          principles: [
            'Start ridiculously small',
            'Attach to existing routines',
            'Celebrate immediately',
            'Focus on consistency over intensity'
          ],
          example: 'After I pour my morning coffee, I will write down one thing I\'m grateful for.'
        },
        obstacleAnticipation: {
          technique: 'Implementation Intentions',
          format: 'If [obstacle], then I will [specific response]',
          benefits: ['Reduces decision fatigue', 'Increases follow-through', 'Builds resilience'],
          example: 'If I feel like skipping my workout, then I will put on my exercise clothes and commit to just 5 minutes.'
        }
      },
      responseTemplates: {
        vision: [
          'Let\'s get crystal clear on what you want to achieve and why it matters to you.',
          'I can hear the potential in what you\'re describing - let\'s unlock it.',
          'What would your life look like if this challenge was completely resolved?',
          'Tell me about the version of yourself you\'re working toward becoming.'
        ],
        strategy: [
          'Now let\'s break this down into a concrete action plan.',
          'Here\'s a proven framework that will get you from where you are to where you want to be.',
          'Let\'s identify the specific steps that will create momentum.',
          'What\'s the minimal viable action you could take today?'
        ],
        actionSteps: [
          'Your next 24-hour mission is...',
          'This week, I want you to focus on one specific action:',
          'Let\'s create a system that makes success inevitable.',
          'What\'s the smallest step you could take right now that would move you forward?'
        ],
        accountability: [
          'How will you track progress on this goal?',
          'Who will you share this commitment with?',
          'What consequences will motivate you to follow through?',
          'Let\'s schedule a check-in - how does this same time next week sound?'
        ]
      },
      crisisProtocols: {
        reframing: {
          technique: 'Perspective Shifting',
          questions: [
            'How might this challenge be preparing you for something greater?',
            'What strengths is this situation requiring you to develop?',
            'If you were advising someone else in this situation, what would you say?',
            'What opportunity might be hidden in this setback?'
          ]
        }
      },
      progressMetrics: {
        goalAchievement: ['goals completed', 'milestone progress', 'consistency metrics'],
        habitFormation: ['streak length', 'automation level', 'habit strength'],
        productivity: ['focus time', 'output quality', 'energy management']
      }
    });

    // Maya - Mindfulness Expert Knowledge Module
    this.modules.set('maya', {
      assessmentProtocols: {
        mindfulnessLevel: {
          questions: [
            'How often do you find yourself fully present in the moment?',
            'When stressed, do you notice your breathing and body sensations?',
            'How aware are you of your thoughts and emotions as they arise?',
            'Do you have any existing meditation or mindfulness practice?'
          ]
        },
        stressIndicators: {
          physical: ['tension', 'fatigue', 'breathing patterns', 'sleep quality'],
          emotional: ['reactivity', 'overwhelm', 'emotional regulation', 'inner peace'],
          mental: ['racing thoughts', 'concentration', 'clarity', 'presence']
        }
      },
      interventionLibrary: {
        breathingPractices: {
          technique: 'Conscious Breathing',
          practices: {
            boxBreathing: 'Inhale 4, hold 4, exhale 4, hold 4',
            coherentBreathing: '5 seconds in, 5 seconds out',
            physiologicalSigh: 'Double inhale through nose, long exhale through mouth'
          },
          benefits: ['activates parasympathetic nervous system', 'reduces stress hormones', 'increases focus'],
          guidance: 'Let your breath be your anchor to the present moment. Notice how each breath naturally flows.'
        },
        bodyScan: {
          technique: 'Somatic Awareness',
          process: [
            'Start at the top of your head',
            'Slowly move attention through each body part',
            'Notice sensations without judgment',
            'Breathe into areas of tension',
            'End with whole-body awareness'
          ],
          duration: '5-20 minutes',
          benefits: ['body-mind connection', 'tension release', 'present-moment awareness']
        },
        lovingKindness: {
          technique: 'Compassion Cultivation',
          phrases: [
            'May I be happy and healthy',
            'May I be at peace',
            'May I be free from suffering',
            'May I live with ease'
          ],
          progression: ['self', 'loved ones', 'neutral people', 'difficult people', 'all beings'],
          benefits: ['increases self-compassion', 'reduces negative emotions', 'builds empathy']
        }
      },
      responseTemplates: {
        presence: [
          'Let\'s pause for a moment and simply notice what\'s here right now.',
          'I invite you to take a conscious breath with me.',
          'What do you notice when you bring your attention to this present moment?',
          'Can we create a little space around these intense feelings?'
        ],
        awareness: [
          'Notice how these thoughts and emotions are arising and passing away.',
          'What do you observe when you step back and witness your experience?',
          'Can you sense the awareness that\'s aware of these feelings?',
          'Let\'s explore what your body is telling you right now.'
        ],
        practice: [
          'Would you like to try a simple breathing practice together?',
          'Let me guide you through a brief mindfulness exercise.',
          'Here\'s a practice you can use whenever you need to center yourself.',
          'Let\'s explore a technique that can help you find peace in this moment.'
        ],
        integration: [
          'How might you bring this awareness into your daily life?',
          'What would it be like to approach your challenges with this same presence?',
          'Can you set an intention to practice this throughout your day?',
          'Notice how you feel now compared to when we started.'
        ]
      },
      crisisProtocols: {
        groundingPractices: {
          immediate: [
            'Feel your feet on the ground and your body in the chair',
            'Name 5 things you can see, 4 you can hear, 3 you can touch',
            'Place one hand on your heart, one on your belly',
            'Take 3 slow, deep breaths'
          ],
          extended: [
            'Body scan from head to toe',
            'Loving-kindness practice starting with self',
            'Walking meditation if space allows',
            'Mindful drinking of water or tea'
          ]
        }
      },
      progressMetrics: {
        mindfulnessSkills: ['present-moment awareness', 'emotional regulation', 'stress response'],
        practiceConsistency: ['daily practice time', 'technique variety', 'integration'],
        wellbeing: ['inner peace', 'stress levels', 'life satisfaction']
      }
    });
  }

  getKnowledgeModule(personaId: string): KnowledgeModule | undefined {
    return this.modules.get(personaId);
  }

  getAssessmentProtocol(personaId: string, type: string): any {
    const module = this.modules.get(personaId);
    return module?.assessmentProtocols[type];
  }

  getIntervention(personaId: string, technique: string): any {
    const module = this.modules.get(personaId);
    return module?.interventionLibrary[technique];
  }

  getResponseTemplate(personaId: string, category: string): string[] {
    const module = this.modules.get(personaId);
    return module?.responseTemplates[category] || [];
  }

  getCrisisProtocol(personaId: string, situation: string): any {
    const module = this.modules.get(personaId);
    return module?.crisisProtocols[situation];
  }

  getAllPersonaCapabilities(): Record<string, string[]> {
    const capabilities: Record<string, string[]> = {};
    
    for (const [personaId, module] of this.modules) {
      capabilities[personaId] = [
        ...Object.keys(module.assessmentProtocols),
        ...Object.keys(module.interventionLibrary),
        ...Object.keys(module.crisisProtocols)
      ];
    }
    
    return capabilities;
  }
}

export const personaKnowledgeModules = new PersonaKnowledgeModules();