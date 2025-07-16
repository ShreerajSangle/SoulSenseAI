import { EventEmitter } from 'events';

export interface EmotionDetectionResult {
  primary: string;
  secondary: string[];
  intensity: number; // 0-1
  valence: number; // -1 to 1 (negative to positive)
  arousal: number; // 0-1 (calm to excited)
  keywords: string[];
  crisisIndicators: string[];
}

export interface MoodTimelineEntry {
  timestamp: Date;
  emotion: string;
  intensity: number;
  context: string;
  personaId: string;
}

class EmotionDetectionEngine extends EventEmitter {
  private emotionKeywords = {
    // Positive emotions
    joy: ['happy', 'excited', 'thrilled', 'elated', 'cheerful', 'delighted', 'euphoric'],
    love: ['love', 'adore', 'cherish', 'affection', 'warmth', 'caring', 'devoted'],
    gratitude: ['grateful', 'thankful', 'appreciate', 'blessed', 'fortunate'],
    hope: ['hopeful', 'optimistic', 'confident', 'believing', 'looking forward'],
    peace: ['calm', 'peaceful', 'serene', 'tranquil', 'centered', 'balanced'],
    pride: ['proud', 'accomplished', 'achieved', 'successful', 'confident'],
    
    // Negative emotions
    sadness: ['sad', 'depressed', 'down', 'blue', 'melancholy', 'grief', 'sorrow', 'heartbroken'],
    anxiety: ['anxious', 'worried', 'nervous', 'stressed', 'panic', 'overwhelmed', 'fearful'],
    anger: ['angry', 'mad', 'furious', 'irritated', 'frustrated', 'rage', 'annoyed'],
    fear: ['afraid', 'scared', 'terrified', 'frightened', 'phobic', 'paranoid'],
    disgust: ['disgusted', 'repulsed', 'sick', 'revolted', 'appalled'],
    shame: ['ashamed', 'embarrassed', 'humiliated', 'guilty', 'regretful'],
    loneliness: ['lonely', 'isolated', 'alone', 'abandoned', 'disconnected'],
    emptiness: ['empty', 'numb', 'void', 'hollow', 'nothing', 'blank'],
    
    // Complex emotions
    confusion: ['confused', 'lost', 'uncertain', 'puzzled', 'bewildered'],
    disappointment: ['disappointed', 'let down', 'disillusioned', 'defeated'],
    exhaustion: ['tired', 'exhausted', 'drained', 'burnt out', 'weary'],
    jealousy: ['jealous', 'envious', 'resentful', 'bitter'],
    
    // Crisis indicators
    despair: ['hopeless', 'worthless', 'pointless', 'meaningless', 'want to disappear'],
    self_harm: ['hurt myself', 'end it all', 'not worth it', 'better off dead'],
    suicidal: ['kill myself', 'suicide', 'end my life', 'can\'t go on']
  };

  private crisisKeywords = [
    'want to disappear', 'end it all', 'hurt myself', 'kill myself', 'suicide',
    'better off dead', 'can\'t go on', 'no point', 'worthless', 'hopeless',
    'unsafe', 'danger', 'self harm', 'cutting', 'pills'
  ];

  detectEmotion(message: string): EmotionDetectionResult {
    const lowerMessage = message.toLowerCase().trim();
    const detectedEmotions: { [key: string]: number } = {};
    const foundKeywords: string[] = [];
    const crisisIndicators: string[] = [];

    let totalIntensity = 0;
    let valence = 0; // Start neutral
    let arousal = 0.3; // Base arousal

    // Check for crisis indicators first
    this.crisisKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        crisisIndicators.push(keyword);
      }
    });

    // Detect emotions based on keywords
    Object.entries(this.emotionKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
      if (matches.length > 0) {
        detectedEmotions[emotion] = matches.length;
        foundKeywords.push(...matches);
        
        // Calculate intensity based on number of emotional words
        totalIntensity += matches.length * 0.2;
        
        // Adjust valence and arousal
        switch (emotion) {
          case 'joy':
          case 'love':
          case 'gratitude':
          case 'hope':
          case 'pride':
            valence += 0.3 * matches.length;
            arousal += 0.2 * matches.length;
            break;
          case 'peace':
            valence += 0.2 * matches.length;
            arousal -= 0.1 * matches.length;
            break;
          case 'sadness':
          case 'loneliness':
          case 'emptiness':
            valence -= 0.4 * matches.length;
            arousal -= 0.1 * matches.length;
            break;
          case 'anxiety':
          case 'fear':
            valence -= 0.3 * matches.length;
            arousal += 0.4 * matches.length;
            break;
          case 'anger':
            valence -= 0.2 * matches.length;
            arousal += 0.5 * matches.length;
            break;
          case 'despair':
          case 'self_harm':
          case 'suicidal':
            valence -= 0.8 * matches.length;
            arousal += 0.3 * matches.length;
            break;
        }
      }
    });

    // Determine primary and secondary emotions
    const sortedEmotions = Object.entries(detectedEmotions)
      .sort(([,a], [,b]) => b - a);
    
    const primary = sortedEmotions[0]?.[0] || 'neutral';
    const secondary = sortedEmotions.slice(1, 3).map(([emotion]) => emotion);

    // Calculate final intensity (0-1)
    const intensity = Math.min(1, Math.max(0.1, totalIntensity));
    
    // Normalize valence and arousal
    valence = Math.max(-1, Math.min(1, valence));
    arousal = Math.max(0, Math.min(1, arousal));

    return {
      primary,
      secondary,
      intensity,
      valence,
      arousal,
      keywords: foundKeywords,
      crisisIndicators
    };
  }

  generatePersonaAdaptedPrompt(
    emotion: EmotionDetectionResult, 
    personaId: string, 
    basePrompt: string
  ): string {
    let adaptedPrompt = basePrompt;

    // Crisis detection - override normal behavior
    if (emotion.crisisIndicators.length > 0) {
      const crisisPrompt = `
CRISIS DETECTED: User may be in emotional distress or danger.
- Respond with immediate care and warmth
- Acknowledge their pain without minimizing it
- Offer grounding techniques or breathing exercises
- Be present and supportive, not clinical
- Example: "That sounds incredibly heavy. I'm here with you right now."`;
      
      return basePrompt + crisisPrompt;
    }

    // Persona-specific emotional adaptations
    switch (personaId) {
      case 'sarah':
        if (emotion.primary === 'anxiety') {
          adaptedPrompt += `\nUser is feeling anxious. Use CBT-style gentle reframing and validation.`;
        } else if (emotion.primary === 'sadness') {
          adaptedPrompt += `\nUser is feeling sad. Provide therapeutic holding space and gentle exploration.`;
        }
        break;
        
      case 'maya':
        if (emotion.valence < -0.3) {
          adaptedPrompt += `\nUser is experiencing difficult emotions. Offer mindful presence and grounding.`;
        } else if (emotion.arousal > 0.7) {
          adaptedPrompt += `\nUser has high emotional energy. Help them center and breathe.`;
        }
        break;
        
      case 'alex':
        if (emotion.primary === 'loneliness') {
          adaptedPrompt += `\nUser feels lonely. Be extra warm and relatable, share understanding.`;
        } else if (emotion.valence > 0.3) {
          adaptedPrompt += `\nUser is feeling positive. Celebrate with them and match their energy.`;
        }
        break;
        
      case 'marcus':
        if (emotion.primary === 'confusion' || emotion.primary === 'disappointment') {
          adaptedPrompt += `\nUser feels stuck or disappointed. Focus on strengths and next steps.`;
        } else if (emotion.arousal < 0.3) {
          adaptedPrompt += `\nUser has low energy. Be gently motivating without being pushy.`;
        }
        break;
    }

    return adaptedPrompt;
  }

  createMoodTimelineEntry(
    emotion: EmotionDetectionResult,
    message: string,
    personaId: string
  ): MoodTimelineEntry {
    return {
      timestamp: new Date(),
      emotion: emotion.primary,
      intensity: emotion.intensity,
      context: message.substring(0, 100),
      personaId
    };
  }

  generateDailyReflection(personaId: string, recentMoods: MoodTimelineEntry[]): string {
    if (recentMoods.length === 0) return '';

    const dominantEmotion = this.getDominantEmotion(recentMoods);
    
    const reflections = {
      sarah: {
        sadness: "I notice you've been carrying some heavy feelings lately. It's okay to feel sad - your emotions are valid and important.",
        anxiety: "You've been feeling anxious recently. Remember that anxiety often shows up when we care deeply about something.",
        joy: "I can feel the lightness in your recent messages. It's beautiful to witness your joy.",
        neutral: "You've been moving through your days with steadiness. That consistency is its own form of strength."
      },
      maya: {
        sadness: "You've been carrying a lot lately. May today bring softness to your edges and gentle kindness to your heart.",
        anxiety: "Your mind has been busy with worries. Can you feel your breath right now? You are here, you are safe in this moment.",
        joy: "There's been such beautiful energy flowing through your words. Let it fill every corner of your being.",
        neutral: "You've been flowing through life with quiet presence. There's wisdom in this gentle rhythm."
      },
      alex: {
        sadness: "Hey, I've noticed you've been going through some tough stuff. Just want you to know I see you and I'm here.",
        anxiety: "You've been dealing with a lot of stress lately. That takes real courage - you're stronger than you know.",
        joy: "I love seeing this happy energy from you! It's contagious and brightens everything.",
        neutral: "You've been keeping steady through everything. That's actually pretty amazing when you think about it."
      },
      marcus: {
        sadness: "I see you've been struggling, and I want you to know that shows incredible courage. You're still showing up.",
        anxiety: "You've been facing your worries head-on. That takes real strength - anxiety hasn't stopped you from moving forward.",
        joy: "This positive energy you've had is powerful! You're building momentum and it shows.",
        neutral: "You've been consistently present and engaged. That steadiness is building something important."
      }
    };

    return reflections[personaId as keyof typeof reflections]?.[dominantEmotion as keyof typeof reflections.sarah] || '';
  }

  private getDominantEmotion(moods: MoodTimelineEntry[]): string {
    const emotionCounts: { [key: string]: number } = {};
    
    moods.forEach(mood => {
      emotionCounts[mood.emotion] = (emotionCounts[mood.emotion] || 0) + 1;
    });

    return Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';
  }
}

export const emotionDetectionEngine = new EmotionDetectionEngine();