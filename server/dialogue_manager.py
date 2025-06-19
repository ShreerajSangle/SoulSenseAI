#!/usr/bin/env python3
"""
Dialogue Manager with Clinical Reasoning for SoulSense AI
Provides clinical reasoning and intervention explanations for therapeutic decisions
"""

import json
import datetime
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import yaml
import numpy as np

@dataclass
class ClinicalReasoning:
    intervention_type: str
    clinical_rationale: str
    evidence_base: List[str]
    expected_outcomes: List[str]
    contraindications: List[str]
    user_specific_factors: Dict[str, Any]
    confidence_level: float

@dataclass
class InterventionExplanation:
    intervention_name: str
    why_suggested: str
    how_it_helps: str
    evidence_support: str
    personalization_factors: List[str]
    expected_timeline: str
    success_indicators: List[str]

class DialogueManager:
    def __init__(self):
        self.intervention_evidence_base = self._load_evidence_base()
        self.clinical_decision_tree = self._build_decision_tree()
        self.reasoning_templates = self._load_reasoning_templates()
        
    def generate_clinical_reasoning(self, user_context: Dict[str, Any], 
                                  intervention_choice: str) -> ClinicalReasoning:
        """Generate clinical reasoning for intervention choice"""
        
        # Analyze user context
        emotional_state = user_context.get('current_emotion', 'neutral')
        severity_level = user_context.get('severity_level', 'mild')
        clinical_scores = user_context.get('clinical_scores', {})
        user_preferences = user_context.get('preferences', {})
        previous_interventions = user_context.get('intervention_history', [])
        
        # Determine clinical rationale
        rationale = self._determine_rationale(
            emotional_state, severity_level, clinical_scores, intervention_choice
        )
        
        # Get evidence base for intervention
        evidence = self.intervention_evidence_base.get(intervention_choice, [])
        
        # Predict expected outcomes
        expected_outcomes = self._predict_outcomes(
            intervention_choice, emotional_state, severity_level, clinical_scores
        )
        
        # Check contraindications
        contraindications = self._check_contraindications(
            intervention_choice, user_context
        )
        
        # Factor in user-specific considerations
        user_factors = self._analyze_user_factors(
            user_preferences, previous_interventions, clinical_scores
        )
        
        # Calculate confidence level
        confidence = self._calculate_confidence(
            evidence, user_factors, contraindications, severity_level
        )
        
        return ClinicalReasoning(
            intervention_type=intervention_choice,
            clinical_rationale=rationale,
            evidence_base=evidence,
            expected_outcomes=expected_outcomes,
            contraindications=contraindications,
            user_specific_factors=user_factors,
            confidence_level=confidence
        )
    
    def explain_intervention(self, intervention: str, user_context: Dict[str, Any]) -> InterventionExplanation:
        """Generate user-friendly explanation of why intervention was chosen"""
        
        clinical_reasoning = self.generate_clinical_reasoning(user_context, intervention)
        
        # Generate explanation components
        why_suggested = self._explain_why_suggested(intervention, user_context, clinical_reasoning)
        how_it_helps = self._explain_how_it_helps(intervention, user_context)
        evidence_support = self._explain_evidence(clinical_reasoning.evidence_base)
        personalization = self._explain_personalization(clinical_reasoning.user_specific_factors)
        timeline = self._estimate_timeline(intervention, user_context.get('severity_level', 'mild'))
        success_indicators = self._define_success_indicators(intervention, user_context)
        
        return InterventionExplanation(
            intervention_name=intervention,
            why_suggested=why_suggested,
            how_it_helps=how_it_helps,
            evidence_support=evidence_support,
            personalization_factors=personalization,
            expected_timeline=timeline,
            success_indicators=success_indicators
        )
    
    def make_clinical_decision(self, user_context: Dict[str, Any]) -> Tuple[str, ClinicalReasoning]:
        """Make evidence-based clinical decision for intervention"""
        
        # Extract key factors
        emotional_state = user_context.get('current_emotion', 'neutral')
        severity_level = user_context.get('severity_level', 'mild')
        clinical_scores = user_context.get('clinical_scores', {})
        crisis_indicators = user_context.get('crisis_indicators', [])
        
        # Handle crisis situations first
        if crisis_indicators or self._is_crisis_situation(clinical_scores, emotional_state):
            intervention = 'crisis_intervention'
            reasoning = self.generate_clinical_reasoning(user_context, intervention)
            return intervention, reasoning
        
        # Use decision tree for non-crisis situations
        intervention = self._navigate_decision_tree(user_context)
        reasoning = self.generate_clinical_reasoning(user_context, intervention)
        
        return intervention, reasoning
    
    def _load_evidence_base(self) -> Dict[str, List[str]]:
        """Load evidence-based research for interventions"""
        return {
            'breathing_exercises': [
                "Controlled breathing activates parasympathetic nervous system (Zaccaro et al., 2018)",
                "4-7-8 breathing reduces anxiety symptoms in clinical trials (Ellinwood et al., 2020)",
                "Diaphragmatic breathing shown effective for GAD (Chen et al., 2017)"
            ],
            'cognitive_restructuring': [
                "CBT cognitive techniques reduce negative thought patterns (Beck et al., 2020)",
                "Thought challenging effective for depression (Hofmann et al., 2012)",
                "Meta-analysis shows 60-80% response rate for anxiety disorders (Butler et al., 2006)"
            ],
            'mindfulness_meditation': [
                "MBSR reduces symptoms of anxiety and depression (Goyal et al., 2014)",
                "8-week mindfulness programs show neural changes in amygdala (Hölzel et al., 2011)",
                "Mindfulness-based interventions effective for relapse prevention (Segal et al., 2012)"
            ],
            'behavioral_activation': [
                "Activity scheduling effective for depression (Lejuez et al., 2011)",
                "Behavioral activation comparable to cognitive therapy (Dimidjian et al., 2006)",
                "Pleasant activity scheduling improves mood regulation (Mazzucchelli et al., 2009)"
            ],
            'progressive_muscle_relaxation': [
                "PMR reduces muscle tension and anxiety (Jacobson, 1938; updated Conrad & Roth, 2007)",
                "Effective for generalized anxiety disorder (Borkovec & Costello, 1993)",
                "Helps with sleep disturbances and somatic symptoms (Manzoni et al., 2008)"
            ],
            'grounding_techniques': [
                "5-4-3-2-1 technique interrupts dissociation and panic (Najavits, 2002)",
                "Sensory grounding effective for trauma responses (van der Kolk, 2014)",
                "Grounding reduces emotional dysregulation (Linehan, 2014)"
            ],
            'crisis_intervention': [
                "Safety planning reduces suicide risk (Stanley & Brown, 2012)",
                "Crisis intervention prevents hospitalization (Guo et al., 2001)",
                "Immediate support improves short-term outcomes (Roberts & Ottens, 2005)"
            ]
        }
    
    def _build_decision_tree(self) -> Dict[str, Any]:
        """Build clinical decision tree for intervention selection"""
        return {
            'root': {
                'condition': 'crisis_check',
                'branches': {
                    'crisis': 'crisis_intervention',
                    'no_crisis': 'severity_assessment'
                }
            },
            'severity_assessment': {
                'condition': 'severity_level',
                'branches': {
                    'minimal': 'emotion_check_minimal',
                    'mild': 'emotion_check_mild',
                    'moderate': 'emotion_check_moderate',
                    'severe': 'intensive_intervention'
                }
            },
            'emotion_check_minimal': {
                'condition': 'primary_emotion',
                'branches': {
                    'anxiety': 'breathing_exercises',
                    'sadness': 'behavioral_activation',
                    'stress': 'mindfulness_meditation',
                    'default': 'mindfulness_meditation'
                }
            },
            'emotion_check_mild': {
                'condition': 'primary_emotion',
                'branches': {
                    'anxiety': 'cognitive_restructuring',
                    'sadness': 'behavioral_activation',
                    'anger': 'progressive_muscle_relaxation',
                    'stress': 'breathing_exercises',
                    'default': 'cognitive_restructuring'
                }
            },
            'emotion_check_moderate': {
                'condition': 'primary_emotion',
                'branches': {
                    'anxiety': 'combined_cbt_mindfulness',
                    'sadness': 'cognitive_behavioral_activation',
                    'anger': 'emotion_regulation_skills',
                    'panic': 'grounding_techniques',
                    'default': 'cognitive_restructuring'
                }
            },
            'intensive_intervention': 'crisis_intervention'
        }
    
    def _load_reasoning_templates(self) -> Dict[str, str]:
        """Load reasoning explanation templates"""
        return {
            'breathing_exercises': "Based on your {emotion_state} and {severity_level} severity level, I'm recommending breathing exercises because they provide immediate physiological relief by activating your body's natural relaxation response.",
            'cognitive_restructuring': "Given your {emotion_state} and thought patterns indicating {cognitive_pattern}, cognitive restructuring will help you identify and challenge unhelpful thinking patterns that may be maintaining your distress.",
            'mindfulness_meditation': "Your current {emotion_state} combined with {stress_indicators} suggests that mindfulness practice will help you develop present-moment awareness and reduce emotional reactivity.",
            'behavioral_activation': "With {emotion_state} and reduced activity levels, behavioral activation will help increase engagement in meaningful activities to improve mood and energy.",
            'grounding_techniques': "Your {emotion_state} and {dissociation_indicators} indicate that grounding techniques will help you reconnect with the present moment and reduce overwhelming sensations."
        }
    
    def _determine_rationale(self, emotional_state: str, severity_level: str, 
                           clinical_scores: Dict, intervention: str) -> str:
        """Determine clinical rationale for intervention choice"""
        
        template = self.reasoning_templates.get(intervention, "")
        
        # Identify cognitive patterns
        cognitive_pattern = self._identify_cognitive_pattern(emotional_state, clinical_scores)
        
        # Identify stress indicators
        stress_indicators = self._identify_stress_indicators(clinical_scores)
        
        # Check for dissociation indicators
        dissociation_indicators = self._check_dissociation_indicators(emotional_state, clinical_scores)
        
        rationale = template.format(
            emotion_state=emotional_state,
            severity_level=severity_level,
            cognitive_pattern=cognitive_pattern,
            stress_indicators=stress_indicators,
            dissociation_indicators=dissociation_indicators
        )
        
        # Add clinical score context
        if clinical_scores.get('phq9_score', 0) > 15:
            rationale += " Your PHQ-9 score indicates moderate to severe depression symptoms, making this intervention particularly relevant."
        
        if clinical_scores.get('gad7_score', 0) > 10:
            rationale += " Your GAD-7 score shows significant anxiety levels that this intervention directly addresses."
        
        return rationale
    
    def _predict_outcomes(self, intervention: str, emotional_state: str, 
                         severity_level: str, clinical_scores: Dict) -> List[str]:
        """Predict expected outcomes for intervention"""
        
        base_outcomes = {
            'breathing_exercises': [
                "Reduced physiological anxiety symptoms within 5-10 minutes",
                "Improved emotional regulation over 2-4 weeks",
                "Better sleep quality with consistent practice"
            ],
            'cognitive_restructuring': [
                "Increased awareness of thought patterns within 1-2 weeks",
                "Reduced negative thinking by 30-50% over 6-8 weeks",
                "Improved mood and reduced rumination"
            ],
            'mindfulness_meditation': [
                "Enhanced present-moment awareness within days",
                "Reduced emotional reactivity over 4-6 weeks",
                "Improved stress resilience with regular practice"
            ],
            'behavioral_activation': [
                "Increased activity and engagement within 1-2 weeks",
                "Improved mood and energy levels over 3-4 weeks",
                "Enhanced sense of accomplishment and purpose"
            ]
        }
        
        outcomes = base_outcomes.get(intervention, ["General improvement in symptoms"])
        
        # Modify based on severity
        if severity_level in ['moderate', 'severe']:
            outcomes.append("May require 8-12 weeks for full benefit due to severity level")
        
        return outcomes
    
    def _check_contraindications(self, intervention: str, user_context: Dict) -> List[str]:
        """Check for contraindications to intervention"""
        
        contraindications = []
        medical_conditions = user_context.get('medical_conditions', [])
        medications = user_context.get('medications', [])
        trauma_history = user_context.get('trauma_history', False)
        
        if intervention == 'breathing_exercises':
            if 'respiratory_issues' in medical_conditions:
                contraindications.append("Respiratory conditions may limit breathing exercise effectiveness")
        
        elif intervention == 'mindfulness_meditation':
            if trauma_history and user_context.get('trauma_triggers_mindfulness', False):
                contraindications.append("Mindfulness may trigger trauma responses - use with caution")
        
        elif intervention == 'progressive_muscle_relaxation':
            if 'muscle_disorders' in medical_conditions:
                contraindications.append("Muscle disorders may interfere with PMR effectiveness")
        
        return contraindications
    
    def _analyze_user_factors(self, preferences: Dict, history: List, 
                            clinical_scores: Dict) -> Dict[str, Any]:
        """Analyze user-specific factors affecting intervention choice"""
        
        factors = {
            'preference_alignment': self._assess_preference_alignment(preferences),
            'historical_effectiveness': self._assess_historical_effectiveness(history),
            'readiness_level': self._assess_readiness_level(clinical_scores),
            'engagement_predictors': self._assess_engagement_predictors(preferences, clinical_scores)
        }
        
        return factors
    
    def _calculate_confidence(self, evidence: List[str], user_factors: Dict, 
                            contraindications: List[str], severity: str) -> float:
        """Calculate confidence level in intervention choice"""
        
        base_confidence = 0.7
        
        # Adjust for evidence strength
        evidence_boost = min(len(evidence) * 0.05, 0.2)
        
        # Adjust for user factors
        if user_factors.get('preference_alignment', 0) > 0.7:
            base_confidence += 0.1
        
        if user_factors.get('historical_effectiveness', 0) > 0.8:
            base_confidence += 0.1
        
        # Adjust for contraindications
        if contraindications:
            base_confidence -= len(contraindications) * 0.1
        
        # Adjust for severity
        if severity in ['severe', 'crisis']:
            base_confidence += 0.1  # Higher confidence in crisis interventions
        
        return min(max(base_confidence + evidence_boost, 0.0), 1.0)
    
    def _navigate_decision_tree(self, user_context: Dict) -> str:
        """Navigate clinical decision tree to select intervention"""
        
        current_node = 'root'
        
        while isinstance(self.clinical_decision_tree[current_node], dict):
            node = self.clinical_decision_tree[current_node]
            condition = node['condition']
            
            if condition == 'crisis_check':
                if self._is_crisis_situation(user_context.get('clinical_scores', {}), 
                                           user_context.get('current_emotion', '')):
                    current_node = node['branches']['crisis']
                else:
                    current_node = node['branches']['no_crisis']
            
            elif condition == 'severity_level':
                severity = user_context.get('severity_level', 'mild')
                current_node = node['branches'].get(severity, node['branches']['mild'])
            
            elif condition == 'primary_emotion':
                emotion = user_context.get('current_emotion', 'neutral')
                current_node = node['branches'].get(emotion, node['branches']['default'])
        
        return self.clinical_decision_tree[current_node]
    
    def _is_crisis_situation(self, clinical_scores: Dict, emotional_state: str) -> bool:
        """Determine if situation requires crisis intervention"""
        
        # Check PHQ-9 question 9 (suicidal ideation)
        if clinical_scores.get('phq9_suicidal_thoughts', 0) > 0:
            return True
        
        # Check overall severity
        if clinical_scores.get('phq9_score', 0) > 20:
            return True
        
        # Check emotional state indicators
        crisis_emotions = ['suicidal', 'hopeless', 'panic', 'overwhelmed']
        if emotional_state in crisis_emotions:
            return True
        
        return False
    
    def _explain_why_suggested(self, intervention: str, user_context: Dict, 
                             reasoning: ClinicalReasoning) -> str:
        """Generate user-friendly explanation of why intervention was suggested"""
        
        emotion = user_context.get('current_emotion', 'distressed')
        severity = user_context.get('severity_level', 'mild')
        
        explanations = {
            'breathing_exercises': f"I suggested breathing exercises because you're experiencing {emotion}, and controlled breathing is one of the fastest ways to activate your body's natural calming response. When we're anxious or stressed, our breathing becomes shallow, which can make these feelings worse.",
            
            'cognitive_restructuring': f"I recommended cognitive restructuring because your {emotion} seems connected to specific thought patterns. This technique helps you notice and gently challenge thoughts that might be making your distress worse, leading to more balanced thinking.",
            
            'mindfulness_meditation': f"Mindfulness practice fits well with your current {emotion} because it helps create space between you and overwhelming feelings. Rather than being caught up in distressing emotions, mindfulness helps you observe them with more distance and compassion.",
            
            'behavioral_activation': f"I suggested increasing meaningful activities because {emotion} often comes with reduced motivation and energy. Engaging in purposeful activities, even small ones, can help break the cycle and gradually improve your mood.",
            
            'grounding_techniques': f"Grounding techniques are particularly helpful when feeling {emotion} because they bring your attention back to the present moment and help you feel more stable and connected to your surroundings."
        }
        
        base_explanation = explanations.get(intervention, f"This intervention addresses the {emotion} you're experiencing.")
        
        # Add severity context
        if severity in ['moderate', 'severe']:
            base_explanation += f" Given the {severity} level of your symptoms, this approach provides both immediate relief and builds longer-term coping skills."
        
        return base_explanation
    
    def _explain_how_it_helps(self, intervention: str, user_context: Dict) -> str:
        """Explain mechanism of how intervention helps"""
        
        mechanisms = {
            'breathing_exercises': "Controlled breathing activates your parasympathetic nervous system - your body's 'rest and digest' mode. This slows your heart rate, lowers blood pressure, and reduces stress hormones like cortisol. The 4-7-8 pattern specifically helps reset your nervous system.",
            
            'cognitive_restructuring': "This technique works by helping you identify the connection between thoughts, feelings, and behaviors. When you notice and question automatic negative thoughts, you create space for more balanced perspectives, which naturally improves your emotional state.",
            
            'mindfulness_meditation': "Mindfulness strengthens your prefrontal cortex (the brain's CEO) while calming the amygdala (your alarm system). Regular practice literally rewires your brain to be less reactive to stress and more capable of emotional regulation.",
            
            'behavioral_activation': "Engaging in meaningful activities increases dopamine and serotonin - your brain's natural mood-boosting chemicals. It also provides a sense of accomplishment and connection, breaking the cycle of withdrawal that often maintains depression.",
            
            'grounding_techniques': "Grounding works by engaging your five senses to interrupt the fight-or-flight response. It helps your nervous system recognize that you're safe in the present moment, reducing overwhelming emotions and dissociation."
        }
        
        return mechanisms.get(intervention, "This intervention helps by addressing the underlying patterns maintaining your current difficulties.")
    
    def _explain_evidence(self, evidence_list: List[str]) -> str:
        """Create user-friendly evidence explanation"""
        
        if not evidence_list:
            return "This intervention is based on established therapeutic principles."
        
        simplified_evidence = []
        for evidence in evidence_list[:2]:  # Use top 2 pieces of evidence
            # Simplify research citations for user understanding
            if "Meta-analysis" in evidence:
                simplified_evidence.append("Large-scale research studies show this approach is effective")
            elif "clinical trials" in evidence:
                simplified_evidence.append("Clinical research demonstrates positive outcomes")
            elif "reduces" in evidence.lower():
                simplified_evidence.append("Studies show this technique reduces symptoms")
            else:
                simplified_evidence.append("Research supports this approach")
        
        return "Research basis: " + ". ".join(simplified_evidence) + "."
    
    def _explain_personalization(self, user_factors: Dict) -> List[str]:
        """Explain personalization factors in user-friendly terms"""
        
        personalization = []
        
        if user_factors.get('preference_alignment', 0) > 0.7:
            personalization.append("Matches your preferred coping style")
        
        if user_factors.get('historical_effectiveness', 0) > 0.7:
            personalization.append("Similar approaches have worked well for you before")
        
        readiness = user_factors.get('readiness_level', 0)
        if readiness > 0.8:
            personalization.append("You seem ready and motivated for this type of intervention")
        elif readiness < 0.4:
            personalization.append("Starting with this gentle approach to build confidence")
        
        engagement = user_factors.get('engagement_predictors', 0)
        if engagement > 0.7:
            personalization.append("Good fit for your learning and engagement style")
        
        return personalization or ["Chosen based on your current needs and situation"]
    
    def _estimate_timeline(self, intervention: str, severity: str) -> str:
        """Estimate timeline for intervention effects"""
        
        base_timelines = {
            'breathing_exercises': "Immediate relief (5-10 minutes), with cumulative benefits over 2-4 weeks",
            'cognitive_restructuring': "Initial awareness within 1-2 weeks, significant improvement in 6-8 weeks",
            'mindfulness_meditation': "Immediate calming effects, with deeper benefits developing over 4-8 weeks",
            'behavioral_activation': "Early mood improvements within 1-2 weeks, sustained benefits over 4-6 weeks",
            'grounding_techniques': "Immediate stabilization, with improved emotional regulation over 2-4 weeks"
        }
        
        timeline = base_timelines.get(intervention, "Benefits typically emerge within 2-4 weeks")
        
        if severity in ['moderate', 'severe']:
            timeline += ". Given your symptom severity, full benefits may take 8-12 weeks with consistent practice."
        
        return timeline
    
    def _define_success_indicators(self, intervention: str, user_context: Dict) -> List[str]:
        """Define observable success indicators for user"""
        
        indicators = {
            'breathing_exercises': [
                "Feeling calmer during and after breathing practice",
                "Sleeping better at night",
                "Managing stress situations more effectively"
            ],
            'cognitive_restructuring': [
                "Noticing when you're having negative thoughts",
                "Feeling less overwhelmed by worries",
                "Having more balanced perspectives on situations"
            ],
            'mindfulness_meditation': [
                "Feeling more present and less caught up in thoughts",
                "Responding rather than reacting to stressful situations",
                "Increased self-compassion and acceptance"
            ],
            'behavioral_activation': [
                "Increased motivation to do daily activities",
                "Feeling more accomplished and purposeful",
                "Improved energy levels throughout the day"
            ],
            'grounding_techniques': [
                "Feeling more stable during emotional moments",
                "Better ability to focus when overwhelmed",
                "Increased sense of safety and control"
            ]
        }
        
        return indicators.get(intervention, ["Reduced symptoms", "Improved coping", "Better daily functioning"])
    
    # Helper methods for user factor assessment
    def _assess_preference_alignment(self, preferences: Dict) -> float:
        """Assess how well intervention aligns with user preferences"""
        # Implementation would check user's stated preferences
        return 0.7  # Placeholder
    
    def _assess_historical_effectiveness(self, history: List) -> float:
        """Assess effectiveness of similar interventions in the past"""
        # Implementation would analyze intervention history
        return 0.6  # Placeholder
    
    def _assess_readiness_level(self, clinical_scores: Dict) -> float:
        """Assess user's readiness for intervention"""
        # Implementation would factor in motivation, severity, etc.
        return 0.8  # Placeholder
    
    def _assess_engagement_predictors(self, preferences: Dict, clinical_scores: Dict) -> float:
        """Assess likelihood of user engagement with intervention"""
        # Implementation would consider learning style, preferences, etc.
        return 0.7  # Placeholder
    
    def _identify_cognitive_pattern(self, emotional_state: str, clinical_scores: Dict) -> str:
        """Identify primary cognitive pattern"""
        patterns = {
            'anxiety': 'catastrophic thinking',
            'sadness': 'negative self-evaluation',
            'anger': 'blame and judgment',
            'stress': 'overwhelm and helplessness'
        }
        return patterns.get(emotional_state, 'general negative thinking')
    
    def _identify_stress_indicators(self, clinical_scores: Dict) -> str:
        """Identify stress indicators"""
        if clinical_scores.get('gad7_score', 0) > 10:
            return 'elevated anxiety and worry'
        return 'general stress responses'
    
    def _check_dissociation_indicators(self, emotional_state: str, clinical_scores: Dict) -> str:
        """Check for dissociation indicators"""
        if emotional_state in ['detached', 'numb', 'unreal']:
            return 'disconnection from present moment'
        return 'no significant dissociation'

# Global instance
dialogue_manager = DialogueManager()