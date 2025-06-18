interface EmotionAnalysis {
  primary_emotion: string;
  intensity: number; // 0-1 scale
  secondary_emotions: string[];
  confidence: number;
  crisis_indicators: {
    level: 'none' | 'mild' | 'moderate' | 'severe';
    keywords: string[];
    requires_intervention: boolean;
  };
  mood_valence: number; // -1 (negative) to 1 (positive)
  arousal_level: number; // 0 (calm) to 1 (highly activated)
}

export class EmotionDetector {
  private emotionKeywords = {
    anxiety: {
      words: ['worried', 'anxious', 'nervous', 'scared', 'panic', 'stress', 'overwhelmed', 'tense'],
      intensity_modifiers: ['extremely', 'very', 'really', 'so', 'completely'],
      valence: -0.6,
      arousal: 0.8
    },
    depression: {
      words: ['sad', 'depressed', 'down', 'hopeless', 'empty', 'numb', 'worthless', 'lost'],
      intensity_modifiers: ['deeply', 'completely', 'utterly', 'totally'],
      valence: -0.8,
      arousal: 0.3
    },
    anger: {
      words: ['angry', 'mad', 'furious', 'irritated', 'frustrated', 'rage', 'pissed'],
      intensity_modifiers: ['extremely', 'very', 'really', 'so'],
      valence: -0.5,
      arousal: 0.9
    },
    joy: {
      words: ['happy', 'excited', 'joyful', 'elated', 'cheerful', 'delighted', 'thrilled'],
      intensity_modifiers: ['extremely', 'very', 'really', 'so'],
      valence: 0.8,
      arousal: 0.7
    },
    fear: {
      words: ['afraid', 'terrified', 'scared', 'frightened', 'worried', 'panic'],
      intensity_modifiers: ['extremely', 'very', 'really', 'so'],
      valence: -0.7,
      arousal: 0.9
    },
    calm: {
      words: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'content'],
      intensity_modifiers: ['very', 'completely', 'totally'],
      valence: 0.5,
      arousal: 0.2
    },
    confused: {
      words: ['confused', 'lost', 'uncertain', 'unclear', 'mixed up', 'puzzled'],
      intensity_modifiers: ['very', 'really', 'completely'],
      valence: -0.2,
      arousal: 0.4
    }
  };

  private crisisKeywords = {
    severe: [
      'suicide', 'kill myself', 'end it all', 'not worth living', 'better off dead',
      'want to die', 'take my own life', 'can\'t live anymore'
    ],
    moderate: [
      'hopeless', 'can\'t go on', 'nothing matters', 'give up', 'too much',
      'can\'t handle this', 'want it to stop', 'escape from everything'
    ],
    mild: [
      'overwhelmed', 'can\'t cope', 'breaking down', 'falling apart',
      'too hard', 'can\'t do this anymore'
    ],
    self_harm: [
      'cut myself', 'hurt myself', 'self-harm', 'punish myself',
      'deserve pain', 'cutting', 'burning myself'
    ]
  };

  analyzeEmotion(text: string): EmotionAnalysis {
    const normalizedText = text.toLowerCase();
    const words = normalizedText.split(/\s+/);
    
    // Detect emotions
    const detectedEmotions: { emotion: string; score: number; valence: number; arousal: number }[] = [];
    
    for (const [emotion, config] of Object.entries(this.emotionKeywords)) {
      let score = 0;
      let matchCount = 0;
      
      for (const keyword of config.words) {
        if (normalizedText.includes(keyword)) {
          matchCount++;
          // Check for intensity modifiers nearby
          const keywordIndex = normalizedText.indexOf(keyword);
          const surroundingText = normalizedText.substring(
            Math.max(0, keywordIndex - 20),
            keywordIndex + keyword.length + 20
          );
          
          let intensityMultiplier = 1;
          for (const modifier of config.intensity_modifiers) {
            if (surroundingText.includes(modifier)) {
              intensityMultiplier = 1.5;
              break;
            }
          }
          
          score += intensityMultiplier;
        }
      }
      
      if (matchCount > 0) {
        detectedEmotions.push({
          emotion,
          score: score / config.words.length,
          valence: config.valence,
          arousal: config.arousal
        });
      }
    }

    // Sort by score and get primary emotion
    detectedEmotions.sort((a, b) => b.score - a.score);
    const primaryEmotion = detectedEmotions[0] || { emotion: 'neutral', score: 0, valence: 0, arousal: 0.3 };
    
    // Calculate overall mood valence and arousal
    const avgValence = detectedEmotions.length > 0 
      ? detectedEmotions.reduce((sum, e) => sum + e.valence * e.score, 0) / detectedEmotions.reduce((sum, e) => sum + e.score, 1)
      : 0;
    
    const avgArousal = detectedEmotions.length > 0
      ? detectedEmotions.reduce((sum, e) => sum + e.arousal * e.score, 0) / detectedEmotions.reduce((sum, e) => sum + e.score, 1)
      : 0.3;

    // Crisis detection
    const crisisIndicators = this.detectCrisis(normalizedText);

    return {
      primary_emotion: primaryEmotion.emotion,
      intensity: Math.min(primaryEmotion.score, 1),
      secondary_emotions: detectedEmotions.slice(1, 3).map(e => e.emotion),
      confidence: detectedEmotions.length > 0 ? Math.min(primaryEmotion.score * 0.8, 1) : 0.3,
      crisis_indicators: crisisIndicators,
      mood_valence: Math.max(-1, Math.min(1, avgValence)),
      arousal_level: Math.max(0, Math.min(1, avgArousal))
    };
  }

  private detectCrisis(text: string): EmotionAnalysis['crisis_indicators'] {
    const foundKeywords: string[] = [];
    let highestLevel: 'none' | 'mild' | 'moderate' | 'severe' = 'none';

    // Check each crisis level
    for (const [level, keywords] of Object.entries(this.crisisKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          foundKeywords.push(keyword);
          if (level === 'severe' || (level === 'self_harm' && highestLevel !== 'severe')) {
            highestLevel = 'severe';
          } else if (level === 'moderate' && highestLevel === 'none') {
            highestLevel = 'moderate';
          } else if (level === 'mild' && highestLevel === 'none') {
            highestLevel = 'mild';
          }
        }
      }
    }

    return {
      level: highestLevel,
      keywords: foundKeywords,
      requires_intervention: highestLevel === 'severe' || highestLevel === 'moderate'
    };
  }

  generateEmotionInsight(emotion: EmotionAnalysis): string {
    const { primary_emotion, intensity, mood_valence, crisis_indicators } = emotion;

    if (crisis_indicators.level !== 'none') {
      return this.generateCrisisInsight(crisis_indicators.level);
    }

    const intensityLevel = intensity > 0.7 ? 'high' : intensity > 0.4 ? 'moderate' : 'low';
    
    const insights = {
      anxiety: {
        high: "I notice you're experiencing significant anxiety. This is your mind trying to protect you, but it might be working overtime.",
        moderate: "There seems to be some anxiety present. It's completely normal to feel this way when facing uncertainty.",
        low: "I sense a touch of nervousness. Sometimes naming our feelings can help us understand them better."
      },
      depression: {
        high: "I hear deep sadness in your words. These feelings are heavy, and you don't have to carry them alone.",
        moderate: "You sound like you're going through a difficult time. Your feelings are valid and understandable.",
        low: "I notice some sadness. It's okay to feel down sometimes - it's part of being human."
      },
      anger: {
        high: "There's a lot of anger here, and that makes sense. Anger often shows us what matters to us.",
        moderate: "I can hear frustration in what you're sharing. These feelings are telling you something important.",
        low: "I sense some irritation. Sometimes anger is our way of protecting ourselves."
      },
      joy: {
        high: "What wonderful energy! I'm glad you're experiencing such positive emotions.",
        moderate: "There's something bright in your mood today. That's lovely to see.",
        low: "I notice some contentment in your words. These moments of positivity are precious."
      }
    };

    return insights[primary_emotion as keyof typeof insights]?.[intensityLevel] || 
           "I'm picking up on some complex emotions here. How would you describe what you're feeling?";
  }

  private generateCrisisInsight(level: 'mild' | 'moderate' | 'severe'): string {
    const insights = {
      mild: "I notice you're feeling overwhelmed right now. These intense feelings can be really difficult to manage.",
      moderate: "I'm hearing that you're in significant distress. Your safety and wellbeing are what matter most right now.",
      severe: "I'm very concerned about what you've shared. You deserve support and care - let's focus on keeping you safe."
    };

    return insights[level];
  }
}

export const emotionDetector = new EmotionDetector();