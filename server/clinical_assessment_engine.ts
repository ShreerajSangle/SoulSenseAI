import OpenAI from 'openai';

interface PHQ9Assessment {
  score: number;
  severity: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';
  suicideRisk: boolean;
  responses: Record<string, number>;
  completionPercentage: number;
  lastUpdated: Date;
}

interface GAD7Assessment {
  score: number;
  severity: 'minimal' | 'mild' | 'moderate' | 'severe';
  responses: Record<string, number>;
  completionPercentage: number;
  lastUpdated: Date;
}

interface ClinicalProfile {
  userId: string;
  phq9: PHQ9Assessment;
  gad7: GAD7Assessment;
  riskFactors: string[];
  protectiveFactors: string[];
  recommendedInterventions: string[];
  lastAssessment: Date;
  trends: {
    depression: 'improving' | 'stable' | 'worsening';
    anxiety: 'improving' | 'stable' | 'worsening';
  };
}

export class ClinicalAssessmentEngine {
  private openai: OpenAI;
  private userProfiles: Map<string, ClinicalProfile> = new Map();

  // PHQ-9 questions mapped to conversation patterns
  private phq9Questions = {
    anhedonia: {
      question: "Little interest or pleasure in doing things",
      patterns: [
        'nothing interests me', 'don\'t enjoy anything', 'lost interest',
        'everything feels boring', 'can\'t find pleasure', 'nothing feels fun',
        'don\'t care about', 'lost motivation', 'activities feel pointless'
      ],
      weight: 1.0
    },
    depression: {
      question: "Feeling down, depressed, or hopeless",
      patterns: [
        'feeling depressed', 'feel hopeless', 'everything is hopeless',
        'feel down', 'sad all the time', 'can\'t see the point',
        'life feels meaningless', 'no hope', 'feel worthless'
      ],
      weight: 1.2
    },
    sleep: {
      question: "Trouble falling or staying asleep, or sleeping too much",
      patterns: [
        'can\'t sleep', 'insomnia', 'wake up at night', 'sleeping too much',
        'tired but can\'t sleep', 'sleep problems', 'restless nights',
        'oversleeping', 'sleep all day', 'exhausted but awake'
      ],
      weight: 0.8
    },
    fatigue: {
      question: "Feeling tired or having little energy",
      patterns: [
        'always tired', 'no energy', 'exhausted', 'feel drained',
        'can\'t get out of bed', 'everything is effort', 'physically tired',
        'mental fatigue', 'burned out', 'running on empty'
      ],
      weight: 0.9
    },
    appetite: {
      question: "Poor appetite or overeating",
      patterns: [
        'not hungry', 'lost appetite', 'eating too much', 'can\'t stop eating',
        'food doesn\'t appeal', 'stress eating', 'emotional eating',
        'binge eating', 'no interest in food', 'eating habits changed'
      ],
      weight: 0.7
    },
    selfEsteem: {
      question: "Feeling bad about yourself",
      patterns: [
        'hate myself', 'feel worthless', 'I\'m a failure', 'feel guilty',
        'disappointed in myself', 'let everyone down', 'not good enough',
        'feel stupid', 'ashamed of myself', 'self-loathing'
      ],
      weight: 1.1
    },
    concentration: {
      question: "Trouble concentrating",
      patterns: [
        'can\'t focus', 'mind wanders', 'trouble concentrating',
        'can\'t think clearly', 'memory problems', 'distracted',
        'brain fog', 'hard to make decisions', 'can\'t pay attention'
      ],
      weight: 0.8
    },
    psychomotor: {
      question: "Moving or speaking slowly, or being fidgety",
      patterns: [
        'moving slowly', 'feel sluggish', 'can\'t sit still',
        'restless', 'fidgety', 'agitated', 'pacing',
        'feel slowed down', 'hyperactive', 'nervous energy'
      ],
      weight: 0.6
    },
    suicidal: {
      question: "Thoughts of death or self-harm",
      patterns: [
        'want to die', 'suicidal thoughts', 'better off dead',
        'hurt myself', 'end it all', 'not worth living',
        'kill myself', 'thoughts of death', 'self-harm'
      ],
      weight: 2.0
    }
  };

  // GAD-7 questions mapped to conversation patterns
  private gad7Questions = {
    nervousness: {
      question: "Feeling nervous, anxious, or on edge",
      patterns: [
        'feel nervous', 'anxious', 'on edge', 'uptight',
        'wound up', 'tense', 'jittery', 'restless',
        'can\'t relax', 'always worried'
      ],
      weight: 1.0
    },
    worryControl: {
      question: "Not being able to stop or control worrying",
      patterns: [
        'can\'t stop worrying', 'worry constantly', 'overthinking',
        'racing thoughts', 'mind won\'t stop', 'endless worry',
        'can\'t control thoughts', 'ruminating', 'obsessive thoughts'
      ],
      weight: 1.2
    },
    excessiveWorry: {
      question: "Worrying too much about different things",
      patterns: [
        'worry about everything', 'always anxious about', 'catastrophizing',
        'worst case scenarios', 'what if', 'anticipating problems',
        'worry too much', 'anxiety about', 'stressed about everything'
      ],
      weight: 1.1
    },
    relaxation: {
      question: "Trouble relaxing",
      patterns: [
        'can\'t relax', 'always tense', 'unable to unwind',
        'feel wound up', 'trouble calming down', 'stressed',
        'high strung', 'can\'t settle', 'always alert'
      ],
      weight: 0.9
    },
    restlessness: {
      question: "Being so restless that it\'s hard to sit still",
      patterns: [
        'restless', 'fidgety', 'can\'t sit still', 'need to move',
        'pacing', 'agitated', 'hyperactive', 'jumpy',
        'uncomfortable sitting', 'feel trapped'
      ],
      weight: 0.8
    },
    irritability: {
      question: "Becoming easily annoyed or irritable",
      patterns: [
        'easily annoyed', 'irritable', 'short tempered', 'snappy',
        'quick to anger', 'impatient', 'frustrated easily',
        'on edge', 'touchy', 'mood swings'
      ],
      weight: 0.9
    },
    fearfulness: {
      question: "Feeling afraid as if something awful might happen",
      patterns: [
        'feel afraid', 'sense of dread', 'something bad will happen',
        'impending doom', 'scared', 'fear of', 'panic',
        'terrified', 'catastrophic thinking', 'anticipating disaster'
      ],
      weight: 1.1
    }
  };

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async assessFromConversation(
    userId: string, 
    messageText: string, 
    conversationHistory: any[]
  ): Promise<ClinicalProfile> {
    let profile = this.getUserProfile(userId);
    
    // Update assessments based on current message
    this.updatePHQ9FromText(profile, messageText);
    this.updateGAD7FromText(profile, messageText);
    
    // Use AI to identify additional clinical indicators
    await this.aiEnhancedAssessment(profile, messageText, conversationHistory);
    
    // Calculate risk factors and protective factors
    this.updateRiskFactors(profile);
    this.updateProtectiveFactors(profile);
    
    // Generate intervention recommendations
    this.generateInterventions(profile);
    
    // Update trends
    this.updateTrends(profile);
    
    profile.lastAssessment = new Date();
    this.userProfiles.set(userId, profile);
    
    return profile;
  }

  private getUserProfile(userId: string): ClinicalProfile {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        userId,
        phq9: {
          score: 0,
          severity: 'minimal',
          suicideRisk: false,
          responses: {},
          completionPercentage: 0,
          lastUpdated: new Date()
        },
        gad7: {
          score: 0,
          severity: 'minimal',
          responses: {},
          completionPercentage: 0,
          lastUpdated: new Date()
        },
        riskFactors: [],
        protectiveFactors: [],
        recommendedInterventions: [],
        lastAssessment: new Date(),
        trends: {
          depression: 'stable',
          anxiety: 'stable'
        }
      });
    }
    return this.userProfiles.get(userId)!;
  }

  private updatePHQ9FromText(profile: ClinicalProfile, text: string): void {
    const textLower = text.toLowerCase();
    
    for (const [key, question] of Object.entries(this.phq9Questions)) {
      let score = 0;
      
      for (const pattern of question.patterns) {
        if (textLower.includes(pattern)) {
          score += question.weight;
        }
      }
      
      // Normalize score to 0-3 scale
      const normalizedScore = Math.min(Math.floor(score), 3);
      
      if (normalizedScore > 0) {
        profile.phq9.responses[key] = Math.max(
          profile.phq9.responses[key] || 0,
          normalizedScore
        );
      }
    }
    
    this.calculatePHQ9Score(profile);
  }

  private updateGAD7FromText(profile: ClinicalProfile, text: string): void {
    const textLower = text.toLowerCase();
    
    for (const [key, question] of Object.entries(this.gad7Questions)) {
      let score = 0;
      
      for (const pattern of question.patterns) {
        if (textLower.includes(pattern)) {
          score += question.weight;
        }
      }
      
      // Normalize score to 0-3 scale
      const normalizedScore = Math.min(Math.floor(score), 3);
      
      if (normalizedScore > 0) {
        profile.gad7.responses[key] = Math.max(
          profile.gad7.responses[key] || 0,
          normalizedScore
        );
      }
    }
    
    this.calculateGAD7Score(profile);
  }

  private calculatePHQ9Score(profile: ClinicalProfile): void {
    const responses = profile.phq9.responses;
    const totalQuestions = Object.keys(this.phq9Questions).length;
    const answeredQuestions = Object.keys(responses).length;
    
    profile.phq9.score = Object.values(responses).reduce((sum, score) => sum + score, 0);
    profile.phq9.completionPercentage = (answeredQuestions / totalQuestions) * 100;
    
    // Determine severity
    if (profile.phq9.score >= 20) profile.phq9.severity = 'severe';
    else if (profile.phq9.score >= 15) profile.phq9.severity = 'moderately_severe';
    else if (profile.phq9.score >= 10) profile.phq9.severity = 'moderate';
    else if (profile.phq9.score >= 5) profile.phq9.severity = 'mild';
    else profile.phq9.severity = 'minimal';
    
    // Check suicide risk
    profile.phq9.suicideRisk = (responses.suicidal || 0) > 0;
    
    profile.phq9.lastUpdated = new Date();
  }

  private calculateGAD7Score(profile: ClinicalProfile): void {
    const responses = profile.gad7.responses;
    const totalQuestions = Object.keys(this.gad7Questions).length;
    const answeredQuestions = Object.keys(responses).length;
    
    profile.gad7.score = Object.values(responses).reduce((sum, score) => sum + score, 0);
    profile.gad7.completionPercentage = (answeredQuestions / totalQuestions) * 100;
    
    // Determine severity
    if (profile.gad7.score >= 15) profile.gad7.severity = 'severe';
    else if (profile.gad7.score >= 10) profile.gad7.severity = 'moderate';
    else if (profile.gad7.score >= 5) profile.gad7.severity = 'mild';
    else profile.gad7.severity = 'minimal';
    
    profile.gad7.lastUpdated = new Date();
  }

  private async aiEnhancedAssessment(
    profile: ClinicalProfile, 
    messageText: string, 
    conversationHistory: any[]
  ): Promise<void> {
    try {
      const prompt = `As a clinical assessment AI, analyze this conversation for signs of depression and anxiety. Consider the context and patterns.

Current message: "${messageText}"
Conversation context: ${conversationHistory.slice(-5).map(m => m.content).join(' ')}

Current PHQ-9 score: ${profile.phq9.score} (${profile.phq9.severity})
Current GAD-7 score: ${profile.gad7.score} (${profile.gad7.severity})

Provide JSON response with:
- additionalDepressiveIndicators: array of specific indicators found
- additionalAnxietyIndicators: array of specific indicators found
- riskFactors: array of identified risk factors
- protectiveFactors: array of identified protective factors
- severityAdjustment: number (-2 to +2) to adjust current severity
- confidence: 0-1 confidence in assessment`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 600
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      // Apply AI insights
      if (analysis.severityAdjustment) {
        this.adjustScores(profile, analysis.severityAdjustment);
      }
      
      if (analysis.riskFactors) {
        profile.riskFactors.push(...analysis.riskFactors);
      }
      
      if (analysis.protectiveFactors) {
        profile.protectiveFactors.push(...analysis.protectiveFactors);
      }
      
    } catch (error) {
      console.error('AI-enhanced assessment error:', error);
    }
  }

  private adjustScores(profile: ClinicalProfile, adjustment: number): void {
    profile.phq9.score = Math.max(0, Math.min(27, profile.phq9.score + adjustment));
    profile.gad7.score = Math.max(0, Math.min(21, profile.gad7.score + adjustment));
    
    this.calculatePHQ9Score(profile);
    this.calculateGAD7Score(profile);
  }

  private updateRiskFactors(profile: ClinicalProfile): void {
    const riskFactors = [];
    
    if (profile.phq9.severity === 'severe' || profile.phq9.severity === 'moderately_severe') {
      riskFactors.push('Severe depression symptoms');
    }
    
    if (profile.gad7.severity === 'severe') {
      riskFactors.push('Severe anxiety symptoms');
    }
    
    if (profile.phq9.suicideRisk) {
      riskFactors.push('Suicidal ideation');
    }
    
    if (profile.phq9.score > 15 && profile.gad7.score > 10) {
      riskFactors.push('Comorbid depression and anxiety');
    }
    
    // Remove duplicates and update
    profile.riskFactors = [...new Set([...profile.riskFactors, ...riskFactors])];
  }

  private updateProtectiveFactors(profile: ClinicalProfile): void {
    const protectiveFactors = [];
    
    if (profile.phq9.severity === 'minimal' || profile.phq9.severity === 'mild') {
      protectiveFactors.push('Low depression symptoms');
    }
    
    if (profile.gad7.severity === 'minimal' || profile.gad7.severity === 'mild') {
      protectiveFactors.push('Low anxiety symptoms');
    }
    
    if (!profile.phq9.suicideRisk) {
      protectiveFactors.push('No current suicidal ideation');
    }
    
    // Add seeking help as protective factor
    protectiveFactors.push('Actively seeking support');
    
    profile.protectiveFactors = [...new Set([...profile.protectiveFactors, ...protectiveFactors])];
  }

  private generateInterventions(profile: ClinicalProfile): void {
    const interventions = [];
    
    // Depression interventions
    if (profile.phq9.severity === 'severe' || profile.phq9.severity === 'moderately_severe') {
      interventions.push('Professional therapy recommended');
      interventions.push('Consider psychiatric evaluation');
      interventions.push('CBT for depression');
    } else if (profile.phq9.severity === 'moderate') {
      interventions.push('Therapy or counseling recommended');
      interventions.push('Behavioral activation techniques');
      interventions.push('Regular exercise routine');
    }
    
    // Anxiety interventions
    if (profile.gad7.severity === 'severe') {
      interventions.push('Anxiety management therapy');
      interventions.push('Relaxation techniques');
      interventions.push('Mindfulness-based interventions');
    } else if (profile.gad7.severity === 'moderate') {
      interventions.push('Stress management techniques');
      interventions.push('Deep breathing exercises');
    }
    
    // Crisis interventions
    if (profile.phq9.suicideRisk) {
      interventions.unshift('Immediate safety assessment needed');
      interventions.unshift('Crisis hotline resources');
    }
    
    profile.recommendedInterventions = interventions;
  }

  private updateTrends(profile: ClinicalProfile): void {
    // This would typically compare with historical data
    // For now, we'll base it on current severity levels
    
    if (profile.phq9.severity === 'severe' || profile.phq9.severity === 'moderately_severe') {
      profile.trends.depression = 'worsening';
    } else if (profile.phq9.severity === 'minimal') {
      profile.trends.depression = 'improving';
    } else {
      profile.trends.depression = 'stable';
    }
    
    if (profile.gad7.severity === 'severe') {
      profile.trends.anxiety = 'worsening';
    } else if (profile.gad7.severity === 'minimal') {
      profile.trends.anxiety = 'improving';
    } else {
      profile.trends.anxiety = 'stable';
    }
  }

  generateAdaptiveQuestions(profile: ClinicalProfile): string[] {
    const questions = [];
    
    // Questions based on incomplete assessments
    const phq9Completion = profile.phq9.completionPercentage;
    const gad7Completion = profile.gad7.completionPercentage;
    
    if (phq9Completion < 70) {
      if (!profile.phq9.responses.sleep) {
        questions.push("How has your sleep been lately?");
      }
      if (!profile.phq9.responses.fatigue) {
        questions.push("Have you been feeling tired or low on energy?");
      }
      if (!profile.phq9.responses.appetite) {
        questions.push("How has your appetite been?");
      }
    }
    
    if (gad7Completion < 70) {
      if (!profile.gad7.responses.worryControl) {
        questions.push("Do you find it hard to stop worrying once you start?");
      }
      if (!profile.gad7.responses.relaxation) {
        questions.push("Are you able to relax easily?");
      }
    }
    
    // Severity-based questions
    if (profile.phq9.severity === 'moderate' || profile.phq9.severity === 'moderately_severe') {
      questions.push("What activities used to bring you joy?");
      questions.push("How are you taking care of yourself these days?");
    }
    
    if (profile.gad7.severity === 'moderate' || profile.gad7.severity === 'severe') {
      questions.push("What tends to trigger your worry the most?");
      questions.push("What helps you feel calmer?");
    }
    
    return questions.slice(0, 3); // Return max 3 questions
  }

  getClinicalSummary(userId: string): string {
    const profile = this.getUserProfile(userId);
    
    let summary = `Clinical Assessment Summary:\n`;
    summary += `Depression (PHQ-9): ${profile.phq9.score}/27 (${profile.phq9.severity})\n`;
    summary += `Anxiety (GAD-7): ${profile.gad7.score}/21 (${profile.gad7.severity})\n`;
    
    if (profile.phq9.suicideRisk) {
      summary += `⚠️ Suicide risk indicators present\n`;
    }
    
    if (profile.riskFactors.length > 0) {
      summary += `Risk factors: ${profile.riskFactors.join(', ')}\n`;
    }
    
    if (profile.recommendedInterventions.length > 0) {
      summary += `Recommended interventions: ${profile.recommendedInterventions.slice(0, 3).join(', ')}\n`;
    }
    
    return summary;
  }
}

export const clinicalAssessmentEngine = new ClinicalAssessmentEngine();