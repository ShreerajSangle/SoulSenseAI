import fs from 'fs';
import path from 'path';

// GoEmotions emotion mapping - 27 fine-grained emotions
export const EMOTION_LABELS = [
  'admiration', 'amusement', 'anger', 'annoyance', 'approval', 'caring', 'confusion',
  'curiosity', 'desire', 'disappointment', 'disapproval', 'disgust', 'embarrassment',
  'excitement', 'fear', 'gratitude', 'grief', 'joy', 'love', 'nervousness', 'optimism',
  'pride', 'realization', 'relief', 'remorse', 'sadness', 'surprise'
];

// Emotion intensity mapping
export const EMOTION_INTENSITY = {
  low: 0.3,
  medium: 0.6,
  high: 0.9
};

// Therapeutic response patterns based on detected emotions
export const THERAPEUTIC_RESPONSES = {
  sadness: {
    validation: [
      "I can hear the sadness in your words, and that's completely valid.",
      "It sounds like you're going through a really difficult time right now.",
      "Feeling sad is a natural response to what you're experiencing."
    ],
    empathy: [
      "I'm here with you in this moment of sadness.",
      "Your feelings matter, and I want you to know you're not alone.",
      "It's okay to sit with these feelings - they're telling you something important."
    ],
    gentle_encouragement: [
      "Even in sadness, there's strength in reaching out and sharing.",
      "You're being incredibly brave by talking about this.",
      "Sometimes sadness is our heart's way of processing and healing."
    ]
  },
  anxiety: {
    grounding: [
      "Let's take a moment to ground ourselves in the present.",
      "I notice you might be feeling anxious - let's breathe together.",
      "Your anxiety is real, and we can work through this step by step."
    ],
    reassurance: [
      "You're safe right now, and I'm here to support you.",
      "These anxious thoughts don't define you or predict your future.",
      "You've gotten through difficult moments before, and you can do it again."
    ],
    coping: [
      "What helps you feel more grounded when anxiety visits?",
      "Would it help to focus on something you can control right now?",
      "Remember, anxiety often feels bigger than it actually is."
    ]
  },
  anger: {
    acknowledgment: [
      "I can sense the frustration and anger you're feeling.",
      "Your anger is telling us something important about your values.",
      "It's completely understandable that you feel angry about this."
    ],
    validation: [
      "Anger can be a healthy response to injustice or boundary violations.",
      "Your feelings are valid, even when they feel overwhelming.",
      "Sometimes anger is grief wearing a different mask."
    ],
    redirection: [
      "What do you think your anger is trying to protect or defend?",
      "How can we honor this feeling while finding a path forward?",
      "What would it look like to channel this energy constructively?"
    ]
  },
  joy: {
    amplification: [
      "I love hearing the joy in your voice - tell me more about this!",
      "Your happiness is contagious, and I'm so glad you're experiencing this.",
      "It's beautiful to witness you in this moment of joy."
    ],
    savoring: [
      "Let's pause and really soak in this positive feeling.",
      "What aspects of this joy feel most meaningful to you?",
      "How can we help you remember this feeling when times get tough?"
    ]
  }
};

// Clinical conversation patterns from DAIC-WOZ dataset
export interface TherapeuticPattern {
  trigger: string[];
  response_style: 'reflective' | 'exploratory' | 'supportive' | 'cognitive_restructuring';
  follow_up_questions: string[];
  interventions: string[];
}

export const CLINICAL_PATTERNS: TherapeuticPattern[] = [
  {
    trigger: ['depressed', 'sad', 'down', 'hopeless', 'worthless'],
    response_style: 'reflective',
    follow_up_questions: [
      "How long have you been feeling this way?",
      "What does a typical day look like for you right now?",
      "Are there moments when the sadness feels lighter?",
      "What activities used to bring you joy?"
    ],
    interventions: [
      "behavioral_activation",
      "mood_tracking",
      "gentle_activity_scheduling"
    ]
  },
  {
    trigger: ['anxious', 'worried', 'panic', 'nervous', 'scared'],
    response_style: 'supportive',
    follow_up_questions: [
      "What thoughts tend to run through your mind when you feel anxious?",
      "Do you notice any physical sensations with the anxiety?",
      "What helps you feel more calm and grounded?",
      "Are there specific situations that tend to trigger these feelings?"
    ],
    interventions: [
      "breathing_exercises",
      "grounding_techniques",
      "cognitive_restructuring"
    ]
  },
  {
    trigger: ['overwhelmed', 'stressed', 'too much', 'can\'t cope'],
    response_style: 'exploratory',
    follow_up_questions: [
      "What's feeling most overwhelming right now?",
      "How are you currently taking care of yourself?",
      "What would feel like relief in this moment?",
      "Are there any parts of this situation you feel you have control over?"
    ],
    interventions: [
      "priority_setting",
      "boundary_setting",
      "stress_management"
    ]
  }
];

export class EmotionEngine {
  private goEmotionsData: Array<{text: string, emotions: string[], id: string}> = [];
  private daicPatterns: Array<{text: string, context: string}> = [];
  private emotionKeywords: Map<string, string[]> = new Map();
  
  constructor() {
    this.initializeEmotionKeywords();
    // Load datasets in background - in production, this would be pre-processed
    this.loadDatasets();
  }

  private initializeEmotionKeywords() {
    // Curated emotion keyword mapping for real-time detection
    this.emotionKeywords.set('sadness', [
      'sad', 'depressed', 'down', 'blue', 'hopeless', 'despair', 'grief', 'mourning',
      'heartbroken', 'melancholy', 'devastated', 'crushed', 'defeated', 'lost'
    ]);
    
    this.emotionKeywords.set('anxiety', [
      'anxious', 'worried', 'nervous', 'scared', 'panic', 'overwhelmed', 'stressed',
      'fearful', 'on edge', 'tense', 'restless', 'uneasy', 'apprehensive'
    ]);
    
    this.emotionKeywords.set('anger', [
      'angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'rage',
      'livid', 'outraged', 'bitter', 'resentful', 'hostile', 'aggravated'
    ]);
    
    this.emotionKeywords.set('joy', [
      'happy', 'joyful', 'excited', 'thrilled', 'elated', 'delighted', 'cheerful',
      'euphoric', 'blissful', 'content', 'grateful', 'optimistic', 'hopeful'
    ]);
    
    this.emotionKeywords.set('fear', [
      'afraid', 'terrified', 'frightened', 'horrified', 'petrified', 'alarmed',
      'threatened', 'intimidated', 'paranoid', 'phobic'
    ]);
    
    this.emotionKeywords.set('disgust', [
      'disgusted', 'revolted', 'repulsed', 'sickened', 'nauseated', 'appalled'
    ]);
    
    this.emotionKeywords.set('surprise', [
      'surprised', 'shocked', 'astonished', 'amazed', 'stunned', 'bewildered'
    ]);
  }

  private async loadDatasets() {
    try {
      // Load GoEmotions data for emotion classification
      const goEmotionsPath = path.join(process.cwd(), 'attached_assets/raw/goemotions/train.tsv');
      if (fs.existsSync(goEmotionsPath)) {
        const data = fs.readFileSync(goEmotionsPath, 'utf-8');
        const lines = data.split('\n').slice(1, 1000); // Sample for performance
        
        this.goEmotionsData = lines.map((line, index) => {
          const parts = line.split('\t');
          if (parts.length >= 2) {
            return {
              text: parts[0] || '',
              emotions: this.extractEmotionsFromText(parts[0] || ''),
              id: parts[1] || `emotion_${index}`
            };
          }
          return { text: '', emotions: [], id: `emotion_${index}` };
        }).filter(item => item.text.length > 0);
      }

      // Load DAIC-WOZ therapeutic patterns
      const daicPath = path.join(process.cwd(), 'attached_assets/raw/daic_woz/daic_dialogue_clean.csv');
      if (fs.existsSync(daicPath)) {
        const data = fs.readFileSync(daicPath, 'utf-8');
        const lines = data.split('\n').slice(1, 500); // Sample for performance
        
        this.daicPatterns = lines.map((line, index) => ({
          text: line.replace(/"/g, '').trim(),
          context: 'therapeutic_dialogue'
        })).filter(item => item.text.length > 10);
      }

      console.log(`Loaded ${this.goEmotionsData.length} emotion samples and ${this.daicPatterns.length} therapeutic patterns`);
    } catch (error) {
      console.error('Error loading emotion datasets:', error);
    }
  }

  public analyzeEmotion(text: string): {
    primary_emotion: string;
    secondary_emotions: string[];
    intensity: number;
    therapeutic_indicators: string[];
    suggested_response_style: string;
  } {
    const textLower = text.toLowerCase();
    const emotionScores: Map<string, number> = new Map();
    const therapeuticIndicators: string[] = [];

    // Keyword-based emotion detection
    this.emotionKeywords.forEach((keywords, emotion) => {
      let score = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = (textLower.match(regex) || []).length;
        score += matches;
      }
      if (score > 0) {
        emotionScores.set(emotion, score);
      }
    });

    // Clinical pattern matching
    for (const pattern of CLINICAL_PATTERNS) {
      for (const trigger of pattern.trigger) {
        if (textLower.includes(trigger)) {
          therapeuticIndicators.push(trigger);
        }
      }
    }

    // Determine primary emotion
    const sortedEmotions = Array.from(emotionScores.entries())
      .sort(([,a], [,b]) => b - a);
    
    const primaryEmotion = sortedEmotions.length > 0 ? sortedEmotions[0][0] : 'neutral';
    const secondaryEmotions = sortedEmotions.slice(1, 3).map(([emotion]) => emotion);
    
    // Calculate intensity based on emotion word strength and frequency
    const maxScore = sortedEmotions.length > 0 ? sortedEmotions[0][1] : 0;
    const intensity = Math.min(0.9, Math.max(0.1, maxScore * 0.3));

    // Determine response style
    const suggestedStyle = this.getSuggestedResponseStyle(primaryEmotion, therapeuticIndicators);

    return {
      primary_emotion: primaryEmotion,
      secondary_emotions: secondaryEmotions,
      intensity,
      therapeutic_indicators: therapeuticIndicators,
      suggested_response_style: suggestedStyle
    };
  }

  private getSuggestedResponseStyle(emotion: string, indicators: string[]): string {
    if (indicators.some(i => ['depressed', 'hopeless', 'worthless'].includes(i))) {
      return 'reflective_supportive';
    }
    if (indicators.some(i => ['anxious', 'panic', 'overwhelmed'].includes(i))) {
      return 'grounding_supportive';
    }
    if (emotion === 'anger') {
      return 'validating_exploratory';
    }
    if (emotion === 'sadness') {
      return 'empathetic_reflective';
    }
    if (emotion === 'joy') {
      return 'amplifying_celebratory';
    }
    return 'supportive_exploratory';
  }

  public generateTherapeuticResponse(
    emotion: string, 
    intensity: number, 
    userMessage: string,
    personaId: string
  ): {
    response: string;
    follow_up_questions: string[];
    suggested_interventions: string[];
  } {
    const responses = THERAPEUTIC_RESPONSES[emotion as keyof typeof THERAPEUTIC_RESPONSES];
    if (!responses) {
      return {
        response: "I hear you, and I'm here to listen and support you through whatever you're experiencing.",
        follow_up_questions: ["How are you feeling right now?", "What's been on your mind lately?"],
        suggested_interventions: ["active_listening", "emotional_validation"]
      };
    }

    // Select appropriate response based on intensity and persona
    let responseCategory: string[] = [];
    if (intensity > 0.7) {
      responseCategory = (responses as any).validation || (responses as any).acknowledgment || (responses as any).grounding || [];
    } else if (intensity > 0.4) {
      responseCategory = (responses as any).empathy || (responses as any).reassurance || (responses as any).amplification || [];
    } else {
      responseCategory = (responses as any).gentle_encouragement || (responses as any).coping || (responses as any).savoring || [];
    }

    const selectedResponse = responseCategory[Math.floor(Math.random() * responseCategory.length)] || 
      "I'm here to listen and support you.";

    // Get follow-up questions based on detected patterns
    const matchingPattern = CLINICAL_PATTERNS.find(pattern => 
      pattern.trigger.some(trigger => userMessage.toLowerCase().includes(trigger))
    );

    const followUpQuestions = matchingPattern?.follow_up_questions || [
      "Tell me more about what you're experiencing.",
      "How long have you been feeling this way?",
      "What would be most helpful for you right now?"
    ];

    const interventions = matchingPattern?.interventions || ["emotional_support", "active_listening"];

    return {
      response: selectedResponse,
      follow_up_questions: followUpQuestions.slice(0, 2),
      suggested_interventions: interventions
    };
  }

  private extractEmotionsFromText(text: string): string[] {
    const emotions: string[] = [];
    const textLower = text.toLowerCase();

    this.emotionKeywords.forEach((keywords, emotion) => {
      for (const keyword of keywords) {
        if (textLower.includes(keyword)) {
          emotions.push(emotion);
          break;
        }
      }
    });

    return emotions;
  }

  public getEmotionInsights(emotionHistory: Array<{emotion: string, timestamp: Date}>): {
    patterns: string[];
    trends: string;
    recommendations: string[];
  } {
    if (emotionHistory.length < 2) {
      return {
        patterns: [],
        trends: "Insufficient data for pattern analysis",
        recommendations: ["Continue tracking your emotions to identify patterns"]
      };
    }

    const recentEmotions = emotionHistory.slice(-10);
    const emotionCounts = new Map<string, number>();
    
    recentEmotions.forEach(entry => {
      const count = emotionCounts.get(entry.emotion) || 0;
      emotionCounts.set(entry.emotion, count + 1);
    });

    const dominantEmotion = Array.from(emotionCounts.entries())
      .sort(([,a], [,b]) => b - a)[0][0];

    const patterns = [`Most frequent emotion: ${dominantEmotion}`];
    const trends = `Recent emotional pattern shows ${dominantEmotion} as dominant emotion`;
    
    const recommendations = [
      `Focus on ${dominantEmotion}-specific coping strategies`,
      "Consider journaling about triggers and patterns",
      "Practice mindfulness to increase emotional awareness"
    ];

    return { patterns, trends, recommendations };
  }
}

export const emotionEngine = new EmotionEngine();