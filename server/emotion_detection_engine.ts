import OpenAI from 'openai';

interface EmotionalState {
  primary: string;
  secondary: string[];
  intensity: number; // 0-1 scale
  valence: number; // -1 to 1 (negative to positive)
  arousal: number; // 0-1 (calm to excited)
  confidence: number; // 0-1 confidence in detection
  triggers: string[];
  context: string;
  timestamp: Date;
}

interface EmotionalTrend {
  emotion: string;
  values: { timestamp: Date; intensity: number }[];
  trend: 'improving' | 'declining' | 'stable';
  correlation: string[];
}

interface RiskAssessment {
  suicideRisk: 'none' | 'low' | 'moderate' | 'high' | 'critical';
  selfHarmRisk: 'none' | 'low' | 'moderate' | 'high';
  crisisKeywords: string[];
  interventionLevel: 'none' | 'support' | 'professional' | 'emergency';
  confidence: number;
}

export class EmotionDetectionEngine {
  private openai: OpenAI;
  private emotionHistory: Map<string, EmotionalState[]> = new Map();
  
  // Comprehensive emotion lexicon
  private emotionKeywords = {
    sadness: ['sad', 'depressed', 'down', 'melancholy', 'grief', 'sorrow', 'despair', 'hopeless', 'empty', 'numb'],
    anxiety: ['anxious', 'worried', 'nervous', 'panic', 'fear', 'scared', 'overwhelmed', 'stressed', 'tense', 'restless'],
    anger: ['angry', 'furious', 'rage', 'mad', 'irritated', 'frustrated', 'annoyed', 'hostile', 'resentful', 'bitter'],
    joy: ['happy', 'joyful', 'excited', 'elated', 'cheerful', 'delighted', 'pleased', 'content', 'euphoric', 'ecstatic'],
    fear: ['afraid', 'terrified', 'frightened', 'scared', 'worried', 'anxious', 'paranoid', 'phobic', 'nervous', 'apprehensive'],
    disgust: ['disgusted', 'revolted', 'repulsed', 'sickened', 'appalled', 'nauseated', 'offended', 'grossed'],
    surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'bewildered', 'confused', 'perplexed'],
    shame: ['ashamed', 'guilty', 'embarrassed', 'humiliated', 'regretful', 'mortified', 'self-conscious'],
    love: ['love', 'affection', 'adoration', 'fondness', 'attachment', 'caring', 'tender', 'devoted'],
    loneliness: ['lonely', 'isolated', 'alone', 'abandoned', 'disconnected', 'excluded', 'solitary']
  };

  private crisisKeywords = [
    'suicide', 'kill myself', 'end it all', 'not worth living', 'better off dead',
    'self-harm', 'hurt myself', 'cut myself', 'want to die', 'no point',
    'hopeless', 'trapped', 'can\'t go on', 'burden', 'worthless'
  ];

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async detectEmotions(text: string, userId: string, context?: string): Promise<EmotionalState> {
    try {
      // Combine lexicon-based and AI-based detection
      const lexiconResult = this.lexiconBasedDetection(text);
      const aiResult = await this.aiBasedDetection(text, context);
      
      // Merge results with weighted confidence
      const mergedResult = this.mergeDetectionResults(lexiconResult, aiResult);
      
      // Store in history
      this.addToHistory(userId, mergedResult);
      
      return mergedResult;
    } catch (error) {
      console.error('Emotion detection error:', error);
      return this.fallbackDetection(text);
    }
  }

  private lexiconBasedDetection(text: string): Partial<EmotionalState> {
    const words = text.toLowerCase().split(/\s+/);
    const emotionScores: Record<string, number> = {};
    const detectedTriggers: string[] = [];

    // Score each emotion based on keyword presence
    for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
      let score = 0;
      for (const word of words) {
        for (const keyword of keywords) {
          if (word.includes(keyword)) {
            score += 1;
            detectedTriggers.push(keyword);
          }
        }
      }
      emotionScores[emotion] = score;
    }

    // Find primary emotion
    const primary = Object.entries(emotionScores)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';
    
    // Find secondary emotions
    const secondary = Object.entries(emotionScores)
      .filter(([emotion, score]) => emotion !== primary && score > 0)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([emotion]) => emotion);

    // Calculate intensity, valence, and arousal
    const intensity = Math.min(Math.max(emotionScores[primary] / 3, 0.1), 1);
    const valence = this.calculateValence(primary);
    const arousal = this.calculateArousal(primary);

    return {
      primary,
      secondary,
      intensity,
      valence,
      arousal,
      triggers: detectedTriggers,
      confidence: 0.7,
      timestamp: new Date()
    };
  }

  private async aiBasedDetection(text: string, context?: string): Promise<Partial<EmotionalState>> {
    const prompt = `Analyze the emotional content of this text and provide a detailed emotional assessment:

Text: "${text}"
${context ? `Context: ${context}` : ''}

Respond with JSON containing:
- primary: main emotion (sadness, anxiety, anger, joy, fear, disgust, surprise, shame, love, loneliness, neutral)
- secondary: array of secondary emotions
- intensity: 0-1 scale
- valence: -1 to 1 (negative to positive)
- arousal: 0-1 (calm to excited)
- triggers: array of specific words/phrases that indicate emotion
- context: brief description of emotional context
- confidence: 0-1 confidence in assessment`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      ...result,
      timestamp: new Date()
    };
  }

  private mergeDetectionResults(lexicon: Partial<EmotionalState>, ai: Partial<EmotionalState>): EmotionalState {
    return {
      primary: ai.primary || lexicon.primary || 'neutral',
      secondary: [...(ai.secondary || []), ...(lexicon.secondary || [])].slice(0, 3),
      intensity: ((ai.intensity || 0) * 0.6 + (lexicon.intensity || 0) * 0.4),
      valence: ((ai.valence || 0) * 0.6 + (lexicon.valence || 0) * 0.4),
      arousal: ((ai.arousal || 0) * 0.6 + (lexicon.arousal || 0) * 0.4),
      confidence: Math.max(ai.confidence || 0, lexicon.confidence || 0),
      triggers: [...(ai.triggers || []), ...(lexicon.triggers || [])],
      context: ai.context || lexicon.context || '',
      timestamp: new Date()
    };
  }

  private fallbackDetection(text: string): EmotionalState {
    const words = text.toLowerCase().split(/\s+/);
    let primary = 'neutral';
    
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'happy', 'love', 'amazing', 'wonderful'];
    const negativeWords = ['bad', 'sad', 'hate', 'terrible', 'awful', 'horrible'];
    
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) primary = 'joy';
    else if (negativeCount > positiveCount) primary = 'sadness';

    return {
      primary,
      secondary: [],
      intensity: 0.5,
      valence: primary === 'joy' ? 0.5 : primary === 'sadness' ? -0.5 : 0,
      arousal: 0.3,
      confidence: 0.3,
      triggers: [],
      context: 'fallback detection',
      timestamp: new Date()
    };
  }

  async assessRisk(text: string, emotionalState: EmotionalState): Promise<RiskAssessment> {
    const textLower = text.toLowerCase();
    const crisisKeywordsFound = this.crisisKeywords.filter(keyword => 
      textLower.includes(keyword)
    );

    let suicideRisk: RiskAssessment['suicideRisk'] = 'none';
    let selfHarmRisk: RiskAssessment['selfHarmRisk'] = 'none';
    let interventionLevel: RiskAssessment['interventionLevel'] = 'none';

    // Crisis keyword analysis
    if (crisisKeywordsFound.length > 0) {
      if (crisisKeywordsFound.some(k => ['suicide', 'kill myself', 'want to die'].includes(k))) {
        suicideRisk = 'high';
        interventionLevel = 'emergency';
      } else if (crisisKeywordsFound.some(k => ['self-harm', 'hurt myself', 'cut myself'].includes(k))) {
        selfHarmRisk = 'high';
        interventionLevel = 'professional';
      } else {
        suicideRisk = 'moderate';
        interventionLevel = 'professional';
      }
    }

    // Emotional state analysis
    if (emotionalState.primary === 'sadness' && emotionalState.intensity > 0.8) {
      suicideRisk = suicideRisk === 'none' ? 'low' : suicideRisk;
    }

    return {
      suicideRisk,
      selfHarmRisk,
      crisisKeywords: crisisKeywordsFound,
      interventionLevel,
      confidence: crisisKeywordsFound.length > 0 ? 0.9 : 0.6
    };
  }

  getEmotionalTrends(userId: string, days: number = 7): EmotionalTrend[] {
    const history = this.emotionHistory.get(userId) || [];
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentHistory = history.filter(state => state.timestamp >= cutoffDate);

    const emotionGroups: Record<string, { timestamp: Date; intensity: number }[]> = {};
    
    recentHistory.forEach(state => {
      if (!emotionGroups[state.primary]) {
        emotionGroups[state.primary] = [];
      }
      emotionGroups[state.primary].push({
        timestamp: state.timestamp,
        intensity: state.intensity
      });
    });

    return Object.entries(emotionGroups).map(([emotion, values]) => {
      const trend = this.calculateTrend(values);
      return {
        emotion,
        values,
        trend,
        correlation: this.findCorrelations(emotion, recentHistory)
      };
    });
  }

  private calculateValence(emotion: string): number {
    const valenceMap: Record<string, number> = {
      joy: 0.8, love: 0.9, surprise: 0.3,
      sadness: -0.7, anger: -0.6, fear: -0.5,
      anxiety: -0.4, disgust: -0.8, shame: -0.6,
      loneliness: -0.5, neutral: 0
    };
    return valenceMap[emotion] || 0;
  }

  private calculateArousal(emotion: string): number {
    const arousalMap: Record<string, number> = {
      anger: 0.9, anxiety: 0.8, fear: 0.7,
      joy: 0.6, surprise: 0.8, disgust: 0.5,
      sadness: 0.3, shame: 0.4, love: 0.5,
      loneliness: 0.2, neutral: 0.1
    };
    return arousalMap[emotion] || 0.3;
  }

  private calculateTrend(values: { timestamp: Date; intensity: number }[]): 'improving' | 'declining' | 'stable' {
    if (values.length < 3) return 'stable';
    
    const recent = values.slice(-3).map(v => v.intensity);
    const earlier = values.slice(0, -3).map(v => v.intensity);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    const diff = recentAvg - earlierAvg;
    
    if (diff > 0.1) return 'declining'; // Higher intensity = worse for negative emotions
    if (diff < -0.1) return 'improving';
    return 'stable';
  }

  private findCorrelations(emotion: string, history: EmotionalState[]): string[] {
    // Simple correlation analysis
    const cooccurrences: Record<string, number> = {};
    
    history.forEach(state => {
      if (state.primary === emotion) {
        state.secondary.forEach(secondary => {
          cooccurrences[secondary] = (cooccurrences[secondary] || 0) + 1;
        });
      }
    });

    return Object.entries(cooccurrences)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);
  }

  private addToHistory(userId: string, state: EmotionalState): void {
    if (!this.emotionHistory.has(userId)) {
      this.emotionHistory.set(userId, []);
    }
    
    const history = this.emotionHistory.get(userId)!;
    history.push(state);
    
    // Keep only last 100 entries per user
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }
}

export const emotionDetectionEngine = new EmotionDetectionEngine();