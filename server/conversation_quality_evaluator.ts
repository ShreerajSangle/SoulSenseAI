// Conversation Quality Evaluator - Scores responses for therapeutic quality
export interface QualityMetrics {
  empathyLevel: number;        // 0-1: How empathetic is the response
  relevance: number;           // 0-1: How relevant to user's message
  personaConsistency: number;  // 0-1: How well it matches persona
  emotionalAppropriateness: number; // 0-1: Appropriate for user's emotional state
  therapeuticValue: number;    // 0-1: How helpful therapeutically
  safetyScore: number;         // 0-1: Safety and appropriateness
  overallQuality: number;      // 0-1: Weighted overall score
}

export interface QualityEvaluation {
  metrics: QualityMetrics;
  feedback: string[];
  improvementSuggestions: string[];
  shouldRetry: boolean;
  confidence: number;
}

export class ConversationQualityEvaluator {
  private empathyKeywords = [
    'understand', 'feel', 'difficult', 'challenging', 'hear you', 'makes sense',
    'validate', 'acknowledge', 'resonate', 'appreciate', 'imagine'
  ];

  private supportiveKeywords = [
    'support', 'here for you', 'not alone', 'care', 'safe', 'okay',
    'normal', 'valid', 'strength', 'courage', 'proud', 'hope'
  ];

  private problematicPatterns = [
    'you should', 'you need to', 'just think positive', 'get over it',
    'everything happens for a reason', 'others have it worse', 'snap out of it',
    'just relax', 'don\'t worry', 'it\'s all in your head'
  ];

  private crisisLanguage = [
    'suicide', 'kill myself', 'end it all', 'can\'t go on', 'better off dead',
    'hurt myself', 'self harm', 'cutting', 'overdose', 'not worth living'
  ];

  evaluateResponse(
    userMessage: string,
    aiResponse: string,
    personaId: string,
    emotionalContext: any,
    conversationPhase: string
  ): QualityEvaluation {
    const metrics = this.calculateMetrics(
      userMessage, aiResponse, personaId, emotionalContext, conversationPhase
    );

    const feedback = this.generateFeedback(metrics, aiResponse);
    const improvementSuggestions = this.generateImprovements(metrics, userMessage, aiResponse);
    
    // Determine if response should be retried (quality threshold)
    const shouldRetry = metrics.overallQuality < 0.6 || metrics.safetyScore < 0.8;
    
    return {
      metrics,
      feedback,
      improvementSuggestions,
      shouldRetry,
      confidence: this.calculateConfidence(metrics)
    };
  }

  private calculateMetrics(
    userMessage: string,
    aiResponse: string,
    personaId: string,
    emotionalContext: any,
    conversationPhase: string
  ): QualityMetrics {
    const empathyLevel = this.scoreEmpathy(aiResponse, emotionalContext);
    const relevance = this.scoreRelevance(userMessage, aiResponse);
    const personaConsistency = this.scorePersonaConsistency(aiResponse, personaId);
    const emotionalAppropriateness = this.scoreEmotionalAppropriateness(
      aiResponse, emotionalContext
    );
    const therapeuticValue = this.scoreTherapeuticValue(
      aiResponse, conversationPhase, emotionalContext
    );
    const safetyScore = this.scoreSafety(userMessage, aiResponse);

    // Weighted overall score
    const overallQuality = (
      empathyLevel * 0.25 +
      relevance * 0.15 +
      personaConsistency * 0.15 +
      emotionalAppropriateness * 0.20 +
      therapeuticValue * 0.20 +
      safetyScore * 0.05
    );

    return {
      empathyLevel,
      relevance,
      personaConsistency,
      emotionalAppropriateness,
      therapeuticValue,
      safetyScore,
      overallQuality
    };
  }

  private scoreEmpathy(response: string, emotionalContext: any): number {
    let score = 0.5; // baseline
    const lowerResponse = response.toLowerCase();

    // Check for empathetic language
    const empathyMatches = this.empathyKeywords.filter(keyword => 
      lowerResponse.includes(keyword)
    ).length;
    score += Math.min(0.3, empathyMatches * 0.1);

    // Check for validation
    if (lowerResponse.includes('valid') || lowerResponse.includes('understandable')) {
      score += 0.1;
    }

    // Bonus for emotional reflection
    const emotions = emotionalContext.detectedEmotions || [];
    const emotionMentioned = emotions.some((emotion: string) => 
      lowerResponse.includes(emotion)
    );
    if (emotionMentioned) score += 0.1;

    // Penalty for dismissive language
    if (lowerResponse.includes('just') && (
      lowerResponse.includes('think positive') || 
      lowerResponse.includes('relax') ||
      lowerResponse.includes('calm down')
    )) {
      score -= 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  private scoreRelevance(userMessage: string, aiResponse: string): number {
    let score = 0.5;
    
    // Extract key topics from user message
    const userWords = userMessage.toLowerCase().split(/\s+/);
    const responseWords = aiResponse.toLowerCase().split(/\s+/);
    
    // Calculate word overlap (simple relevance metric)
    const relevantWords = userWords.filter(word => 
      word.length > 3 && responseWords.includes(word)
    );
    
    const overlapRatio = relevantWords.length / Math.max(userWords.length, 1);
    score += overlapRatio * 0.3;

    // Check if response addresses user's emotional state
    if (userMessage.toLowerCase().includes('feel') && 
        aiResponse.toLowerCase().includes('feel')) {
      score += 0.2;
    }

    // Check for appropriate question asking
    if (userMessage.includes('?') && aiResponse.includes('?')) {
      score += 0.1;
    }

    return Math.max(0, Math.min(1, score));
  }

  private scorePersonaConsistency(response: string, personaId: string): number {
    let score = 0.7; // baseline assumption of consistency
    const lowerResponse = response.toLowerCase();

    // Persona-specific language patterns
    switch (personaId) {
      case 'sarah':
        // Clinical but warm language
        if (lowerResponse.includes('explore') || lowerResponse.includes('understand') ||
            lowerResponse.includes('process')) score += 0.1;
        if (lowerResponse.includes('dude') || lowerResponse.includes('totally')) score -= 0.2;
        break;
        
      case 'maya':
        // Poetic, mindful language
        if (lowerResponse.includes('breath') || lowerResponse.includes('present') ||
            lowerResponse.includes('gentle')) score += 0.1;
        if (lowerResponse.includes('action plan') || lowerResponse.includes('goal')) score -= 0.1;
        break;
        
      case 'marcus':
        // Action-oriented, motivational
        if (lowerResponse.includes('action') || lowerResponse.includes('step') ||
            lowerResponse.includes('goal')) score += 0.1;
        if (lowerResponse.includes('just breathe') || lowerResponse.includes('meditation')) score -= 0.1;
        break;
        
      case 'alex':
        // Casual, relatable
        if (lowerResponse.includes('totally') || lowerResponse.includes('same') ||
            lowerResponse.includes('mood')) score += 0.1;
        if (lowerResponse.includes('therapeutic') || lowerResponse.includes('clinical')) score -= 0.2;
        break;
    }

    return Math.max(0, Math.min(1, score));
  }

  private scoreEmotionalAppropriateness(response: string, emotionalContext: any): number {
    let score = 0.6;
    const intensity = emotionalContext.intensity || 0.5;
    const valence = emotionalContext.valence || 0;
    const lowerResponse = response.toLowerCase();

    // High intensity negative emotions need gentle, supportive responses
    if (intensity > 0.7 && valence < -0.3) {
      if (this.supportiveKeywords.some(keyword => lowerResponse.includes(keyword))) {
        score += 0.2;
      }
      if (lowerResponse.includes('just') || lowerResponse.includes('simply')) {
        score -= 0.2; // Avoid minimizing language
      }
    }

    // Low mood needs validation, not immediate solutions
    if (emotionalContext.detectedEmotions?.includes('sadness') || 
        emotionalContext.detectedEmotions?.includes('depression')) {
      if (lowerResponse.includes('valid') || lowerResponse.includes('difficult')) {
        score += 0.1;
      }
      if (lowerResponse.includes('think positive') || lowerResponse.includes('cheer up')) {
        score -= 0.3;
      }
    }

    // Anxiety needs grounding, not excitement
    if (emotionalContext.detectedEmotions?.includes('anxiety')) {
      if (lowerResponse.includes('breath') || lowerResponse.includes('ground')) {
        score += 0.1;
      }
      if (lowerResponse.includes('exciting') || lowerResponse.includes('!')) {
        score -= 0.1;
      }
    }

    return Math.max(0, Math.min(1, score));
  }

  private scoreTherapeuticValue(
    response: string, 
    conversationPhase: string, 
    emotionalContext: any
  ): number {
    let score = 0.5;
    const lowerResponse = response.toLowerCase();

    // Phase-appropriate responses
    switch (conversationPhase) {
      case 'emotional_checkin':
        if (lowerResponse.includes('how are') || lowerResponse.includes('feeling')) {
          score += 0.2;
        }
        break;
        
      case 'exploratory_dialogue':
        if (lowerResponse.includes('?') && 
            (lowerResponse.includes('tell me') || lowerResponse.includes('what'))) {
          score += 0.2;
        }
        break;
        
      case 'solution_framing':
        if (lowerResponse.includes('try') || lowerResponse.includes('might help') ||
            lowerResponse.includes('consider')) {
          score += 0.2;
        }
        break;
    }

    // Therapeutic techniques
    if (lowerResponse.includes('notice') || lowerResponse.includes('aware')) {
      score += 0.1; // Mindfulness
    }
    if (lowerResponse.includes('pattern') || lowerResponse.includes('thought')) {
      score += 0.1; // CBT elements
    }

    // Avoid giving advice too quickly
    if (conversationPhase === 'emotional_checkin' && 
        (lowerResponse.includes('should') || lowerResponse.includes('need to'))) {
      score -= 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  private scoreSafety(userMessage: string, aiResponse: string): number {
    let score = 1.0; // Start with perfect safety score
    const lowerUser = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();

    // Check for crisis indicators in user message
    const hasCrisisLanguage = this.crisisLanguage.some(phrase => 
      lowerUser.includes(phrase)
    );

    if (hasCrisisLanguage) {
      // Response should acknowledge crisis appropriately
      if (lowerResponse.includes('safe') || lowerResponse.includes('help') ||
          lowerResponse.includes('support')) {
        score = 0.9; // Good crisis response
      } else {
        score = 0.3; // Poor crisis response
      }
      
      // Should not provide medical advice
      if (lowerResponse.includes('diagnose') || lowerResponse.includes('medication')) {
        score -= 0.3;
      }
    }

    // Check for problematic patterns
    const hasProblematicLanguage = this.problematicPatterns.some(pattern =>
      lowerResponse.includes(pattern)
    );
    if (hasProblematicLanguage) {
      score -= 0.4;
    }

    // Ensure boundaries are maintained
    if (lowerResponse.includes('i am a therapist') || 
        lowerResponse.includes('i diagnose')) {
      score -= 0.5;
    }

    return Math.max(0, Math.min(1, score));
  }

  private generateFeedback(metrics: QualityMetrics, response: string): string[] {
    const feedback: string[] = [];

    if (metrics.empathyLevel < 0.6) {
      feedback.push("Response could be more empathetic and validating");
    }
    if (metrics.relevance < 0.6) {
      feedback.push("Response should more directly address user's message");
    }
    if (metrics.personaConsistency < 0.6) {
      feedback.push("Response doesn't fully match expected persona characteristics");
    }
    if (metrics.emotionalAppropriateness < 0.6) {
      feedback.push("Response tone doesn't match user's emotional state");
    }
    if (metrics.therapeuticValue < 0.6) {
      feedback.push("Response could provide more therapeutic value");
    }
    if (metrics.safetyScore < 0.8) {
      feedback.push("Safety concerns identified in response");
    }

    if (metrics.overallQuality >= 0.8) {
      feedback.push("High-quality therapeutic response");
    }

    return feedback;
  }

  private generateImprovements(
    metrics: QualityMetrics, 
    userMessage: string, 
    response: string
  ): string[] {
    const improvements: string[] = [];

    if (metrics.empathyLevel < 0.6) {
      improvements.push("Add more validating language like 'That sounds really difficult' or 'I can understand why you'd feel that way'");
    }
    
    if (metrics.therapeuticValue < 0.6) {
      improvements.push("Include a gentle, open-ended question to encourage deeper exploration");
    }
    
    if (metrics.emotionalAppropriateness < 0.6) {
      improvements.push("Match the emotional tone more closely - be gentler if they're distressed, more energetic if they're motivated");
    }

    return improvements;
  }

  private calculateConfidence(metrics: QualityMetrics): number {
    // Confidence is higher when metrics are consistent (not all over the place)
    const values = [
      metrics.empathyLevel,
      metrics.relevance,
      metrics.personaConsistency,
      metrics.emotionalAppropriateness,
      metrics.therapeuticValue
    ];
    
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    
    // Lower variance = higher confidence
    return Math.max(0.3, 1 - variance);
  }

  // Get quality trends over time
  getQualityTrends(evaluations: QualityEvaluation[]): any {
    if (evaluations.length === 0) return null;

    const recent = evaluations.slice(-10);
    const averageQuality = recent.reduce((sum, evaluation) => sum + evaluation.metrics.overallQuality, 0) / recent.length;
    
    return {
      averageQuality,
      improvementTrend: recent.length > 5 ? 
        recent.slice(-3).reduce((sum, evaluation) => sum + evaluation.metrics.overallQuality, 0) / 3 -
        recent.slice(0, 3).reduce((sum, evaluation) => sum + evaluation.metrics.overallQuality, 0) / 3 : 0,
      commonIssues: this.findCommonIssues(recent)
    };
  }

  private findCommonIssues(evaluations: QualityEvaluation[]): string[] {
    const issueCount: Record<string, number> = {};
    
    evaluations.forEach(evaluation => {
      evaluation.feedback.forEach(feedback => {
        issueCount[feedback] = (issueCount[feedback] || 0) + 1;
      });
    });

    return Object.entries(issueCount)
      .filter(([_, count]) => count >= 3)
      .map(([issue, _]) => issue);
  }
}

export const qualityEvaluator = new ConversationQualityEvaluator();