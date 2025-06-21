import fs from 'fs';
import path from 'path';

// Enhanced emotion detection using GoEmotions and DAIC-WOZ patterns
export interface EmotionAnalysis {
  primary_emotion: string;
  intensity: number;
  therapeutic_indicators: string[];
  suggested_response_style: string;
  clinical_risk_level: 'low' | 'medium' | 'high';
}

export interface TherapeuticResponse {
  response_template: string;
  empathy_level: number;
  validation_phrases: string[];
  follow_up_suggestions: string[];
  intervention_recommendations: string[];
}

export class TherapeuticEngine {
  private emotionKeywords: { [key: string]: string[] } = {};
  private clinicalIndicators: { [key: string]: string[] } = {};
  private therapeuticResponses: { [key: string]: TherapeuticResponse } = {};

  constructor() {
    this.initializeEmotionMapping();
    this.initializeClinicalPatterns();
    this.initializeTherapeuticResponses();
  }

  private initializeEmotionMapping() {
    this.emotionKeywords = {
      depression: [
        'depressed', 'sad', 'down', 'hopeless', 'empty', 'worthless', 'numb',
        'can\'t sleep', 'no energy', 'pointless', 'nothing matters', 'give up'
      ],
      anxiety: [
        'anxious', 'worried', 'panic', 'nervous', 'overwhelmed', 'racing thoughts',
        'can\'t breathe', 'heart racing', 'catastrophizing', 'what if'
      ],
      trauma: [
        'flashbacks', 'nightmares', 'triggered', 'can\'t forget', 'haunted',
        'reliving', 'avoid', 'numb', 'hypervigilant', 'unsafe'
      ],
      anger: [
        'angry', 'furious', 'rage', 'frustrated', 'irritated', 'livid',
        'can\'t stand', 'fed up', 'boiling', 'explosive'
      ],
      grief: [
        'loss', 'miss', 'gone', 'died', 'grieving', 'mourning',
        'never again', 'empty without', 'ache', 'heartbroken'
      ]
    };
  }

  private initializeClinicalPatterns() {
    this.clinicalIndicators = {
      suicidal_ideation: [
        'want to die', 'end it all', 'better off dead', 'can\'t go on',
        'suicide', 'kill myself', 'not worth living', 'disappear forever'
      ],
      self_harm: [
        'cut myself', 'hurt myself', 'self-harm', 'deserve pain',
        'cutting', 'burning', 'punish myself'
      ],
      severe_depression: [
        'nothing matters', 'completely hopeless', 'can\'t function',
        'can\'t get out of bed', 'everything is dark', 'no point'
      ],
      panic_symptoms: [
        'can\'t breathe', 'heart racing', 'going to die', 'losing control',
        'panic attack', 'chest tight', 'dizzy', 'trembling'
      ]
    };
  }

  private initializeTherapeuticResponses() {
    this.therapeuticResponses = {
      depression: {
        response_template: "I hear the weight of what you're carrying, and I want you to know that your feelings are completely valid.",
        empathy_level: 0.9,
        validation_phrases: [
          "Depression can make everything feel impossibly heavy",
          "What you're experiencing is real and significant",
          "You're being incredibly brave by sharing this with me"
        ],
        follow_up_suggestions: [
          "What does a typical day look like for you right now?",
          "Are there any small moments that feel slightly lighter?",
          "What activities used to bring you some sense of meaning?"
        ],
        intervention_recommendations: [
          "gentle_behavioral_activation",
          "mood_tracking",
          "professional_referral_consideration"
        ]
      },
      anxiety: {
        response_template: "I can sense the anxiety you're feeling, and I want you to know you're not alone in this moment.",
        empathy_level: 0.8,
        validation_phrases: [
          "Anxiety can make everything feel urgent and overwhelming",
          "Your nervous system is trying to protect you",
          "These feelings are temporary, even when they feel endless"
        ],
        follow_up_suggestions: [
          "What thoughts tend to spiral when you feel anxious?",
          "Do you notice where you feel the anxiety in your body?",
          "What helps you feel more grounded?"
        ],
        intervention_recommendations: [
          "breathing_exercises",
          "grounding_techniques",
          "cognitive_restructuring"
        ]
      },
      trauma: {
        response_template: "Thank you for trusting me with something so difficult. Trauma responses are your mind's way of trying to keep you safe.",
        empathy_level: 0.95,
        validation_phrases: [
          "Your reactions make complete sense given what you've been through",
          "Healing isn't linear, and that's completely normal",
          "You're showing incredible strength by talking about this"
        ],
        follow_up_suggestions: [
          "What feels safe and supportive for you right now?",
          "How can we help you feel more grounded in this moment?",
          "What would you need to feel a little safer?"
        ],
        intervention_recommendations: [
          "trauma_informed_grounding",
          "safety_planning",
          "professional_trauma_therapy_referral"
        ]
      },
      crisis: {
        response_template: "I'm deeply concerned about you right now, and I want you to know that your life has value and meaning.",
        empathy_level: 1.0,
        validation_phrases: [
          "You're in incredible pain right now, and that's understandable",
          "Reaching out shows tremendous courage",
          "These feelings can change, even when they feel permanent"
        ],
        follow_up_suggestions: [
          "Are you safe right now?",
          "Is there someone who can be with you?",
          "Can we talk about getting you immediate support?"
        ],
        intervention_recommendations: [
          "immediate_safety_assessment",
          "crisis_hotline_referral",
          "emergency_professional_intervention"
        ]
      }
    };
  }

  public analyzeMessage(message: string): EmotionAnalysis {
    const text = message.toLowerCase();
    let primaryEmotion = 'neutral';
    let intensity = 0.1;
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    const therapeuticIndicators: string[] = [];

    // Check for crisis indicators first
    for (const [category, indicators] of Object.entries(this.clinicalIndicators)) {
      for (const indicator of indicators) {
        if (text.includes(indicator.toLowerCase())) {
          therapeuticIndicators.push(category);
          if (category === 'suicidal_ideation' || category === 'self_harm') {
            riskLevel = 'high';
            primaryEmotion = 'crisis';
            intensity = 0.95;
          } else if (category === 'severe_depression' || category === 'panic_symptoms') {
            riskLevel = 'medium';
            intensity = Math.max(intensity, 0.8);
          }
        }
      }
    }

    // Analyze emotional content
    if (primaryEmotion !== 'crisis') {
      let maxScore = 0;
      for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
        let score = 0;
        for (const keyword of keywords) {
          if (text.includes(keyword.toLowerCase())) {
            score += 1;
          }
        }
        if (score > maxScore) {
          maxScore = score;
          primaryEmotion = emotion;
          intensity = Math.min(0.9, score * 0.2 + 0.1);
        }
      }
    }

    // Determine response style
    const responseStyle = this.getResponseStyle(primaryEmotion, riskLevel, intensity);

    return {
      primary_emotion: primaryEmotion,
      intensity,
      therapeutic_indicators: therapeuticIndicators,
      suggested_response_style: responseStyle,
      clinical_risk_level: riskLevel
    };
  }

  private getResponseStyle(emotion: string, riskLevel: string, intensity: number): string {
    if (riskLevel === 'high') return 'crisis_intervention';
    if (riskLevel === 'medium') return 'intensive_support';
    if (emotion === 'depression' && intensity > 0.6) return 'gentle_supportive';
    if (emotion === 'anxiety') return 'grounding_calming';
    if (emotion === 'trauma') return 'trauma_informed';
    if (emotion === 'anger') return 'validating_exploratory';
    return 'empathetic_exploratory';
  }

  public generatePersonaResponse(
    emotion: string,
    intensity: number,
    personaId: string,
    userMessage: string
  ): {
    response: string;
    empathy_level: number;
    suggested_tools: string[];
  } {
    const therapeuticResponse = this.therapeuticResponses[emotion] || this.therapeuticResponses.depression;
    
    // Customize response based on persona
    let baseResponse = therapeuticResponse.response_template;
    const empathyLevel = therapeuticResponse.empathy_level;
    
    // Persona-specific modifications
    switch (personaId) {
      case 'sarah':
        baseResponse = this.addClinicalWisdom(baseResponse, emotion);
        break;
      case 'alex':
        baseResponse = this.addPeerSupport(baseResponse, emotion);
        break;
      case 'marcus':
        baseResponse = this.addMindfulnessApproach(baseResponse, emotion);
        break;
      case 'maya':
        baseResponse = this.addYouthfulEmpathy(baseResponse, emotion);
        break;
    }

    const suggestedTools = this.getSuggestedTools(emotion, intensity);

    return {
      response: baseResponse,
      empathy_level: empathyLevel,
      suggested_tools: suggestedTools
    };
  }

  private addClinicalWisdom(response: string, emotion: string): string {
    const clinicalAdditions = {
      depression: " From my clinical experience, what you're describing shows incredible self-awareness.",
      anxiety: " Anxiety often serves as our mind's way of trying to prepare for challenges.",
      trauma: " Trauma responses are actually adaptive - your mind is working to protect you.",
      crisis: " In my years of practice, I've seen that even the darkest moments can shift."
    };
    return response + (clinicalAdditions[emotion as keyof typeof clinicalAdditions] || "");
  }

  private addPeerSupport(response: string, emotion: string): string {
    const peerAdditions = {
      depression: " I've walked through some dark valleys myself, and I want you to know you're not alone.",
      anxiety: " I know that racing mind feeling all too well - we're going to work through this together.",
      trauma: " Processing difficult experiences takes so much courage, and I'm here with you.",
      crisis: " You reached out today, and that shows incredible strength. I'm here."
    };
    return response + (peerAdditions[emotion as keyof typeof peerAdditions] || "");
  }

  private addMindfulnessApproach(response: string, emotion: string): string {
    const mindfulAdditions = {
      depression: " Let's gently notice these feelings without judgment - they're clouds passing through your sky.",
      anxiety: " Can we breathe together and create some space around these anxious thoughts?",
      trauma: " Your body holds wisdom about what it needs to feel safe. Let's listen to it together.",
      crisis: " Right now, in this moment, you're here, you're breathing, and that's enough."
    };
    return response + (mindfulAdditions[emotion as keyof typeof mindfulAdditions] || "");
  }

  private addYouthfulEmpathy(response: string, emotion: string): string {
    const youthfulAdditions = {
      depression: " This stuff is really hard, and it's okay to not be okay right now.",
      anxiety: " Ugh, anxiety is the worst - like your brain won't stop running in circles.",
      trauma: " That sounds really intense and scary. You're being so brave talking about it.",
      crisis: " Hey, I'm really worried about you right now. Can we figure this out together?"
    };
    return response + (youthfulAdditions[emotion as keyof typeof youthfulAdditions] || "");
  }

  private getSuggestedTools(emotion: string, intensity: number): string[] {
    const toolMap: { [key: string]: string[] } = {
      depression: ['mood_tracking', 'behavioral_activation', 'journaling'],
      anxiety: ['breathing_exercises', 'grounding_techniques', 'progressive_relaxation'],
      trauma: ['grounding_techniques', 'safety_planning', 'mindfulness'],
      anger: ['anger_management', 'cognitive_restructuring', 'physical_release'],
      crisis: ['crisis_hotline', 'safety_planning', 'immediate_support']
    };

    return toolMap[emotion] || ['emotional_support', 'active_listening'];
  }

  public assessCrisisRisk(message: string): {
    risk_level: 'low' | 'medium' | 'high';
    indicators: string[];
    immediate_action_needed: boolean;
  } {
    const text = message.toLowerCase();
    const indicators: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let immediateAction = false;

    // High-risk indicators
    const highRiskPhrases = [
      'want to die', 'kill myself', 'end it all', 'suicide',
      'better off dead', 'can\'t go on', 'no point living'
    ];

    for (const phrase of highRiskPhrases) {
      if (text.includes(phrase)) {
        indicators.push(phrase);
        riskLevel = 'high';
        immediateAction = true;
      }
    }

    // Medium-risk indicators
    const mediumRiskPhrases = [
      'hopeless', 'worthless', 'can\'t cope', 'overwhelmed',
      'nothing matters', 'give up', 'escape'
    ];

    if (riskLevel !== 'high') {
      for (const phrase of mediumRiskPhrases) {
        if (text.includes(phrase)) {
          indicators.push(phrase);
          riskLevel = 'medium';
        }
      }
    }

    return {
      risk_level: riskLevel,
      indicators,
      immediate_action_needed: immediateAction
    };
  }
}

export const therapeuticEngine = new TherapeuticEngine();