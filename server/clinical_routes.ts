import type { Express } from "express";
import { storage } from "./storage";

export function registerClinicalRoutes(app: Express) {

  // PHQ-9 Depression Assessment
  app.post("/api/clinical/phq9", async (req, res) => {
    try {
      const { userId = "anonymous", responses } = req.body;
      
      if (!responses || Object.keys(responses).length !== 9) {
        return res.status(400).json({ error: "PHQ-9 requires exactly 9 responses" });
      }

      const totalScore = Object.values(responses).reduce((sum: number, score: any) => sum + score, 0);
      
      let severity = "minimal";
      if (totalScore >= 20) severity = "severe";
      else if (totalScore >= 15) severity = "moderately_severe";
      else if (totalScore >= 10) severity = "moderate";
      else if (totalScore >= 5) severity = "mild";

      const suicidalThoughts = responses.question9 || 0;
      const suicideRisk = suicidalThoughts > 0;

      const clinicalRecommendations = generatePHQ9Recommendations(totalScore, suicidalThoughts);
      const clinicalReasoning = {
        assessmentType: "PHQ-9",
        score: totalScore,
        severity,
        clinicalJustification: `PHQ-9 score of ${totalScore} indicates ${severity} depression severity based on validated clinical thresholds`,
        evidenceBase: [
          "PHQ-9 validated with 88% sensitivity for major depression (Kroenke et al., 2001)",
          "Widely used clinical screening tool with strong psychometric properties"
        ],
        interventionRationale: suicideRisk ? 
          "Immediate safety assessment required due to suicidal ideation" :
          `${severity} depression requires structured therapeutic intervention`,
        recommendedInterventions: clinicalRecommendations
      };

      await storage.createMoodEntry({
        userId,
        moodRating: Math.max(1, 6 - Math.round(totalScore / 5)),
        type: 'clinical_assessment',
        notes: `PHQ-9: ${severity} depression (${totalScore})`
      });

      res.json({
        userId,
        assessmentDate: new Date().toISOString(),
        totalScore,
        severity,
        suicideRisk,
        clinicalReasoning
      });

    } catch (error) {
      console.error("PHQ-9 assessment error:", error);
      res.status(500).json({ error: "Failed to process PHQ-9 assessment" });
    }
  });

  // GAD-7 Anxiety Assessment
  app.post("/api/clinical/gad7", async (req, res) => {
    try {
      const { userId = "anonymous", responses } = req.body;
      
      if (!responses || Object.keys(responses).length !== 7) {
        return res.status(400).json({ error: "GAD-7 requires exactly 7 responses" });
      }

      const totalScore = Object.values(responses).reduce((sum: number, score: any) => sum + score, 0);
      
      let severity = "minimal";
      if (totalScore >= 15) severity = "severe";
      else if (totalScore >= 10) severity = "moderate";
      else if (totalScore >= 5) severity = "mild";

      const clinicalRecommendations = generateGAD7Recommendations(totalScore);
      const clinicalReasoning = {
        assessmentType: "GAD-7",
        score: totalScore,
        severity,
        clinicalJustification: `GAD-7 score of ${totalScore} indicates ${severity} anxiety level`,
        evidenceBase: [
          "GAD-7 reliable anxiety measure with good sensitivity (Spitzer et al., 2006)",
          "Effective screening tool for anxiety disorders"
        ],
        interventionRationale: `${severity} anxiety requires targeted management strategies`,
        recommendedInterventions: clinicalRecommendations
      };

      await storage.createMoodEntry({
        userId,
        moodRating: Math.max(1, 6 - Math.round(totalScore / 4)),
        type: 'clinical_assessment',
        notes: `GAD-7: ${severity} anxiety (${totalScore})`
      });

      res.json({
        userId,
        assessmentDate: new Date().toISOString(),
        totalScore,
        severity,
        clinicalReasoning
      });

    } catch (error) {
      console.error("GAD-7 assessment error:", error);
      res.status(500).json({ error: "Failed to process GAD-7 assessment" });
    }
  });

  // Clinical Intervention Recommendations
  app.post("/api/clinical/intervention", async (req, res) => {
    try {
      const { userId = "anonymous", userContext } = req.body;
      
      const intervention = determineIntervention(userContext);
      const reasoning = getInterventionReasoning(intervention, userContext);
      
      const response = {
        intervention,
        clinicalRationale: reasoning.rationale,
        evidenceBase: reasoning.evidence,
        expectedOutcomes: reasoning.outcomes,
        timelineEstimate: reasoning.timeline,
        personalizedExplanation: reasoning.explanation
      };

      await storage.saveUserMemory(userId, {
        type: 'clinical_intervention',
        intervention,
        reasoning: response,
        timestamp: new Date().toISOString()
      });

      res.json(response);

    } catch (error) {
      console.error("Clinical intervention error:", error);
      res.status(500).json({ error: "Failed to generate clinical intervention" });
    }
  });

  // Personalized Recommendations
  app.get("/api/personalization/recommendations/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const conversations = await storage.getUserConversations(userId);
      const moodData = await storage.getUserMoodEntries(userId, "30days");
      
      const emotionalPatterns = analyzeUserPatterns(moodData, conversations);
      
      const recommendations = {
        personalizedInterventions: getPersonalizedInterventions(emotionalPatterns),
        communicationStyle: determineCommunicationStyle(conversations),
        focusAreas: identifyUserFocusAreas(emotionalPatterns),
        confidenceLevel: calculateConfidence(conversations.length)
      };

      res.json(recommendations);

    } catch (error) {
      console.error("Personalization error:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // Therapeutic Goals
  app.post("/api/goals", async (req, res) => {
    try {
      const { userId = "anonymous", goalType, customizations } = req.body;
      
      const goalTemplates = {
        emotional_regulation: {
          title: "Develop Emotional Regulation Skills",
          description: "Learn to recognize and manage emotions effectively",
          targetDuration: 8,
          milestones: [
            { week: 2, title: "Emotion Recognition" },
            { week: 4, title: "Basic Regulation Skills" },
            { week: 6, title: "Advanced Techniques" },
            { week: 8, title: "Integration and Mastery" }
          ]
        },
        anxiety_management: {
          title: "Anxiety Management and Coping",
          description: "Build effective strategies for managing anxiety",
          targetDuration: 6,
          milestones: [
            { week: 1, title: "Understanding Anxiety" },
            { week: 3, title: "Coping Strategies" },
            { week: 5, title: "Real-world Application" },
            { week: 6, title: "Confidence Building" }
          ]
        },
        depression_recovery: {
          title: "Depression Recovery Journey",
          description: "Work towards improved mood and life satisfaction",
          targetDuration: 12,
          milestones: [
            { week: 2, title: "Daily Structure" },
            { week: 6, title: "Social Connections" },
            { week: 9, title: "Meaningful Activities" },
            { week: 12, title: "Sustained Wellbeing" }
          ]
        }
      };

      const template = goalTemplates[goalType as keyof typeof goalTemplates];
      if (!template) {
        return res.status(400).json({ error: "Invalid goal type" });
      }

      const goal = {
        goalId: `${userId}_${goalType}_${Date.now()}`,
        userId,
        goalType,
        title: customizations?.title || template.title,
        description: customizations?.description || template.description,
        targetDate: new Date(Date.now() + template.targetDuration * 7 * 24 * 60 * 60 * 1000).toISOString(),
        milestones: template.milestones.map(m => ({
          ...m,
          targetDate: new Date(Date.now() + m.week * 7 * 24 * 60 * 60 * 1000).toISOString(),
          achieved: false
        })),
        status: 'active',
        progress: 0,
        createdAt: new Date().toISOString()
      };

      await storage.saveUserMemory(userId, {
        type: 'therapeutic_goal',
        goal,
        timestamp: new Date().toISOString()
      });

      res.json(goal);

    } catch (error) {
      console.error("Goal creation error:", error);
      res.status(500).json({ error: "Failed to create goal" });
    }
  });

  // Goal Dashboard
  app.get("/api/goals/dashboard/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      const memories = await storage.getUserMemories(userId);
      const goals = memories.filter(m => m.type === 'therapeutic_goal').map(m => m.goal);
      const moodData = await storage.getUserMoodEntries(userId, "30days");

      const dashboard = {
        overview: {
          totalGoals: goals.length,
          activeGoals: goals.filter(g => g.status === 'active').length,
          completedGoals: goals.filter(g => g.status === 'completed').length,
          overallProgress: goals.length > 0 ? 
            goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length : 0
        },
        activeGoals: goals.filter(g => g.status === 'active'),
        recentAchievements: getAchievements(goals),
        upcomingMilestones: getMilestones(goals),
        progressTrends: analyzeProgress(moodData),
        recommendations: getRecommendations(goals, moodData)
      };

      res.json(dashboard);

    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ error: "Failed to generate dashboard" });
    }
  });

  // Goal Progress Update
  app.post("/api/goals/:goalId/progress", async (req, res) => {
    try {
      const { goalId } = req.params;
      const { userId = "anonymous", progressData } = req.body;

      const progressUpdate = {
        goalId,
        userId,
        timestamp: new Date().toISOString(),
        type: 'goal_progress',
        activities: progressData.activities || [],
        challenges: progressData.challenges || [],
        moodRating: progressData.moodRating,
        effortLevel: progressData.effortLevel
      };

      await storage.saveUserMemory(userId, progressUpdate);

      const response = {
        success: true,
        progressUpdate,
        encouragement: generateEncouragement(progressData),
        nextSteps: getNextSteps(progressData)
      };

      res.json(response);

    } catch (error) {
      console.error("Progress update error:", error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });
}

// Helper Functions

function generatePHQ9Recommendations(score: number, suicidalThoughts: number): string[] {
  const recommendations = [];
  
  if (suicidalThoughts > 0) {
    recommendations.push("crisis_intervention", "safety_planning", "immediate_professional_help");
  }
  
  if (score >= 20) {
    recommendations.push("intensive_therapy", "psychiatric_evaluation", "medication_assessment");
  } else if (score >= 15) {
    recommendations.push("structured_therapy", "cognitive_behavioral_therapy");
  } else if (score >= 10) {
    recommendations.push("regular_counseling", "behavioral_activation");
  } else if (score >= 5) {
    recommendations.push("supportive_counseling", "lifestyle_modifications");
  } else {
    recommendations.push("wellness_maintenance", "preventive_care");
  }
  
  return recommendations;
}

function generateGAD7Recommendations(score: number): string[] {
  const recommendations = [];
  
  if (score >= 15) {
    recommendations.push("intensive_anxiety_treatment", "CBT_for_anxiety", "medication_evaluation");
  } else if (score >= 10) {
    recommendations.push("anxiety_therapy", "stress_management", "relaxation_training");
  } else if (score >= 5) {
    recommendations.push("anxiety_coping_skills", "mindfulness_training");
  } else {
    recommendations.push("stress_prevention", "wellness_strategies");
  }
  
  return recommendations;
}

function determineIntervention(userContext: any): string {
  const { currentEmotion, severity } = userContext;
  
  if (severity === "severe") return "intensive_support";
  
  const interventionMap = {
    anxiety: "breathing_exercises",
    sadness: "behavioral_activation",
    anger: "emotion_regulation",
    stress: "stress_reduction"
  };
  
  return interventionMap[currentEmotion as keyof typeof interventionMap] || "mindfulness_meditation";
}

function getInterventionReasoning(intervention: string, userContext: any): any {
  const reasoningMap = {
    breathing_exercises: {
      rationale: "Controlled breathing activates parasympathetic nervous system for immediate anxiety relief",
      evidence: ["Proven effective for acute anxiety", "Physiological calming response"],
      outcomes: ["Reduced anxiety within minutes", "Improved emotional regulation"],
      timeline: "Immediate effects, benefits build over weeks",
      explanation: "Breathing exercises help calm your nervous system when anxiety strikes"
    },
    behavioral_activation: {
      rationale: "Increasing meaningful activities combats depression through behavioral change",
      evidence: ["Effective for depression treatment", "Improves mood through activity"],
      outcomes: ["Improved mood and energy", "Increased sense of accomplishment"],
      timeline: "Initial improvements within 1-2 weeks",
      explanation: "Engaging in meaningful activities helps lift mood and increase energy"
    },
    mindfulness_meditation: {
      rationale: "Mindfulness enhances present-moment awareness and reduces emotional reactivity",
      evidence: ["Reduces anxiety and depression", "Improves emotional regulation"],
      outcomes: ["Enhanced awareness", "Reduced stress reactivity"],
      timeline: "Benefits emerge over 4-8 weeks",
      explanation: "Mindfulness helps you observe thoughts and feelings with less reactivity"
    }
  };
  
  return reasoningMap[intervention as keyof typeof reasoningMap] || {
    rationale: "General therapeutic approach for current concerns",
    evidence: ["Standard therapeutic principles"],
    outcomes: ["Symptom improvement", "Enhanced coping"],
    timeline: "Variable based on individual response",
    explanation: "This approach addresses your current emotional needs"
  };
}

function analyzeUserPatterns(moodData: any[], conversations: any[]): any {
  const emotions = moodData.flatMap(entry => entry.emotions || []);
  const emotionCounts = emotions.reduce((acc: any, emotion: string) => {
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {});
  
  return {
    primaryEmotions: Object.entries(emotionCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([emotion]) => emotion),
    moodTrend: calculateTrend(moodData)
  };
}

function calculateTrend(moodData: any[]): string {
  if (moodData.length < 2) return "insufficient_data";
  
  const recent = moodData.slice(-5);
  const early = moodData.slice(0, 5);
  
  const recentAvg = recent.reduce((sum, entry) => sum + (entry.moodRating || 3), 0) / recent.length;
  const earlyAvg = early.reduce((sum, entry) => sum + (entry.moodRating || 3), 0) / early.length;
  
  if (recentAvg > earlyAvg + 0.5) return "improving";
  if (recentAvg < earlyAvg - 0.5) return "declining";
  return "stable";
}

function getPersonalizedInterventions(patterns: any): string[] {
  const interventionMap = {
    anxiety: ["breathing_exercises", "grounding_techniques"],
    sadness: ["behavioral_activation", "gratitude_practice"],
    anger: ["emotion_regulation", "physical_exercise"],
    stress: ["stress_reduction", "relaxation_techniques"]
  };
  
  const recommendations = new Set<string>();
  patterns.primaryEmotions.forEach((emotion: string) => {
    const interventions = interventionMap[emotion as keyof typeof interventionMap] || [];
    interventions.forEach(intervention => recommendations.add(intervention));
  });
  
  return Array.from(recommendations).slice(0, 5);
}

function determineCommunicationStyle(conversations: any[]): string {
  if (conversations.length < 3) return "balanced_supportive";
  
  const avgLength = conversations.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0) / conversations.length;
  
  if (avgLength > 15) return "detailed_exploratory";
  if (avgLength < 8) return "concise_focused";
  return "balanced_supportive";
}

function identifyUserFocusAreas(patterns: any): string[] {
  const areas = [];
  
  if (patterns.primaryEmotions.includes("anxiety")) {
    areas.push("anxiety_management");
  }
  
  if (patterns.primaryEmotions.includes("sadness")) {
    areas.push("mood_enhancement");
  }
  
  if (patterns.moodTrend === "declining") {
    areas.push("crisis_prevention");
  }
  
  return areas.length > 0 ? areas : ["general_wellness"];
}

function calculateConfidence(conversationCount: number): number {
  if (conversationCount < 3) return 0.3;
  if (conversationCount < 10) return 0.6;
  return 0.8;
}

function getAchievements(goals: any[]): any[] {
  return goals.flatMap(goal => 
    goal.milestones?.filter((m: any) => m.achieved) || []
  ).slice(0, 5);
}

function getMilestones(goals: any[]): any[] {
  return goals.flatMap(goal => 
    goal.milestones?.filter((m: any) => !m.achieved) || []
  ).slice(0, 3);
}

function analyzeProgress(moodData: any[]): any {
  return {
    moodTrend: calculateTrend(moodData),
    consistency: moodData.length > 7 ? 0.8 : 0.4
  };
}

function getRecommendations(goals: any[], moodData: any[]): string[] {
  const recommendations = [];
  
  if (goals.filter(g => g.status === 'active').length === 0) {
    recommendations.push("Consider setting your first therapeutic goal");
  }
  
  if (calculateTrend(moodData) === "declining") {
    recommendations.push("Focus on mood stabilization");
  }
  
  return recommendations;
}

function generateEncouragement(progressData: any): string {
  const encouragements = [
    "Every step forward is meaningful progress in your therapeutic journey.",
    "Your commitment to growth is making a real difference.",
    "Each challenge you work through builds resilience and strength."
  ];
  
  return encouragements[Math.floor(Math.random() * encouragements.length)];
}

function getNextSteps(progressData: any): string[] {
  const steps = ["Continue practicing the skills you're learning"];
  
  if (progressData.challenges?.length > 0) {
    steps.push("Address the challenges you've identified");
  }
  
  if (progressData.moodRating < 3) {
    steps.push("Focus on mood-lifting activities");
  }
  
  return steps;
}