// Assessment Enhancement Functions for Persona Recommendations and Goal Suggestions

export function generatePersonaRecommendationsForAssessment(assessmentType: string, severity: string, score: number) {
  if (assessmentType === 'depression') {
    if (severity === 'severe' || severity === 'moderately_severe') {
      return [
        {
          id: "dr-sarah",
          name: "Dr. Sarah Chen",
          reason: "Professional therapeutic support is recommended for severe depression symptoms"
        },
        {
          id: "alex",
          name: "Alex",
          reason: "Peer support can provide understanding and validation during difficult times"
        }
      ];
    } else if (severity === 'moderate') {
      return [
        {
          id: "dr-sarah",
          name: "Dr. Sarah Chen",
          reason: "Clinical guidance can help develop effective coping strategies"
        },
        {
          id: "maya",
          name: "Maya",
          reason: "Mindfulness practices can complement therapeutic approaches"
        },
        {
          id: "alex",
          name: "Alex",
          reason: "Peer support provides relatable perspectives on recovery"
        }
      ];
    } else {
      return [
        {
          id: "marcus",
          name: "Marcus",
          reason: "Motivation coaching can help build positive momentum"
        },
        {
          id: "maya",
          name: "Maya",
          reason: "Preventive mindfulness practices support mental wellness"
        }
      ];
    }
  }

  if (assessmentType === 'anxiety') {
    if (severity === 'severe' || severity === 'moderately_severe') {
      return [
        {
          id: "dr-sarah",
          name: "Dr. Sarah Chen", 
          reason: "Professional anxiety treatment is recommended for severe symptoms"
        },
        {
          id: "maya",
          name: "Maya",
          reason: "Mindfulness techniques are highly effective for anxiety management"
        }
      ];
    } else {
      return [
        {
          id: "maya",
          name: "Maya",
          reason: "Mindfulness and breathing techniques can reduce anxiety symptoms"
        },
        {
          id: "marcus",
          name: "Marcus",
          reason: "Building confidence and coping skills can overcome anxiety"
        }
      ];
    }
  }

  return [];
}

export function generateGoalSuggestionsForAssessment(assessmentType: string, severity: string, responses: Record<string, number>) {
  const goals = [];

  if (assessmentType === 'depression') {
    if (severity === 'severe' || severity === 'moderately_severe') {
      goals.push(
        "Establish daily self-care routine with professional support",
        "Develop crisis management and safety planning skills", 
        "Build a strong therapeutic relationship and treatment plan",
        "Create a support network of trusted friends and family"
      );
    } else if (severity === 'moderate') {
      goals.push(
        "Practice daily mood monitoring and emotional awareness",
        "Develop healthy coping strategies for difficult emotions",
        "Improve sleep hygiene and establish consistent routines",
        "Engage in meaningful activities that bring joy and purpose"
      );
    } else {
      goals.push(
        "Maintain positive mental health through self-care practices",
        "Build resilience and stress management skills",
        "Cultivate gratitude and positive thinking patterns", 
        "Strengthen social connections and communication skills"
      );
    }
  }

  if (assessmentType === 'anxiety') {
    if (severity === 'severe' || severity === 'moderately_severe') {
      goals.push(
        "Learn anxiety management techniques and breathing exercises",
        "Develop strategies for handling panic attacks and high anxiety",
        "Build confidence in anxiety-provoking situations gradually",
        "Create a personalized anxiety action plan"
      );
    } else {
      goals.push(
        "Practice mindfulness and relaxation techniques daily",
        "Challenge negative thought patterns and build positive self-talk",
        "Gradually face fears through exposure and confidence building",
        "Develop healthy boundaries and stress reduction strategies"
      );
    }
  }

  return goals;
}