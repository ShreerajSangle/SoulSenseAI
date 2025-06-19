#!/usr/bin/env python3
"""
Clinical Outcomes Assessment System for SoulSense AI
Tracks PHQ-9, GAD-7 scores and clinical metrics with evidence-based analysis
"""

import json
import datetime
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import numpy as np

class SeverityLevel(Enum):
    MINIMAL = "minimal"
    MILD = "mild"
    MODERATE = "moderate"
    MODERATELY_SEVERE = "moderately_severe"
    SEVERE = "severe"

@dataclass
class PHQ9Assessment:
    user_id: str
    assessment_date: str
    scores: Dict[str, int]  # 9 questions scored 0-3
    total_score: int
    severity_level: str
    functional_impairment: str
    suicide_risk_indicators: List[str]
    clinical_notes: Optional[str] = None

@dataclass
class GAD7Assessment:
    user_id: str
    assessment_date: str
    scores: Dict[str, int]  # 7 questions scored 0-3
    total_score: int
    severity_level: str
    functional_impact: str
    clinical_notes: Optional[str] = None

@dataclass
class ClinicalOutcome:
    user_id: str
    outcome_date: str
    intervention_type: str
    baseline_scores: Dict[str, int]
    follow_up_scores: Dict[str, int]
    improvement_percentage: float
    clinical_significance: bool
    notes: str

class ClinicalOutcomesSystem:
    def __init__(self):
        self.phq9_assessments = []
        self.gad7_assessments = []
        self.clinical_outcomes = []
        
        # PHQ-9 scoring thresholds
        self.phq9_thresholds = {
            SeverityLevel.MINIMAL: (0, 4),
            SeverityLevel.MILD: (5, 9),
            SeverityLevel.MODERATE: (10, 14),
            SeverityLevel.MODERATELY_SEVERE: (15, 19),
            SeverityLevel.SEVERE: (20, 27)
        }
        
        # GAD-7 scoring thresholds
        self.gad7_thresholds = {
            SeverityLevel.MINIMAL: (0, 4),
            SeverityLevel.MILD: (5, 9),
            SeverityLevel.MODERATE: (10, 14),
            SeverityLevel.SEVERE: (15, 21)
        }
    
    def process_phq9_assessment(self, user_id: str, responses: Dict[str, int]) -> PHQ9Assessment:
        """Process PHQ-9 questionnaire responses and generate clinical assessment"""
        
        # Validate responses
        if len(responses) != 9:
            raise ValueError("PHQ-9 requires exactly 9 responses")
        
        for key, value in responses.items():
            if not (0 <= value <= 3):
                raise ValueError(f"PHQ-9 responses must be between 0-3, got {value} for {key}")
        
        total_score = sum(responses.values())
        severity_level = self._determine_phq9_severity(total_score)
        functional_impairment = self._assess_functional_impairment_phq9(responses)
        suicide_risk = self._assess_suicide_risk(responses)
        
        assessment = PHQ9Assessment(
            user_id=user_id,
            assessment_date=datetime.datetime.now().isoformat(),
            scores=responses,
            total_score=total_score,
            severity_level=severity_level.value,
            functional_impairment=functional_impairment,
            suicide_risk_indicators=suicide_risk
        )
        
        self.phq9_assessments.append(assessment)
        return assessment
    
    def process_gad7_assessment(self, user_id: str, responses: Dict[str, int]) -> GAD7Assessment:
        """Process GAD-7 questionnaire responses and generate clinical assessment"""
        
        # Validate responses
        if len(responses) != 7:
            raise ValueError("GAD-7 requires exactly 7 responses")
        
        for key, value in responses.items():
            if not (0 <= value <= 3):
                raise ValueError(f"GAD-7 responses must be between 0-3, got {value} for {key}")
        
        total_score = sum(responses.values())
        severity_level = self._determine_gad7_severity(total_score)
        functional_impact = self._assess_functional_impact_gad7(responses)
        
        assessment = GAD7Assessment(
            user_id=user_id,
            assessment_date=datetime.datetime.now().isoformat(),
            scores=responses,
            total_score=total_score,
            severity_level=severity_level.value,
            functional_impact=functional_impact
        )
        
        self.gad7_assessments.append(assessment)
        return assessment
    
    def calculate_clinical_outcomes(self, user_id: str, intervention_type: str, 
                                  timeframe_days: int = 30) -> Optional[ClinicalOutcome]:
        """Calculate clinical outcomes based on before/after assessments"""
        
        # Get baseline and follow-up assessments
        user_phq9 = [a for a in self.phq9_assessments if a.user_id == user_id]
        user_gad7 = [a for a in self.gad7_assessments if a.user_id == user_id]
        
        if len(user_phq9) < 2 and len(user_gad7) < 2:
            return None
        
        baseline_scores = {}
        follow_up_scores = {}
        
        # Get PHQ-9 baseline and follow-up
        if len(user_phq9) >= 2:
            baseline_phq9 = user_phq9[0]
            latest_phq9 = user_phq9[-1]
            baseline_scores['phq9'] = baseline_phq9.total_score
            follow_up_scores['phq9'] = latest_phq9.total_score
        
        # Get GAD-7 baseline and follow-up
        if len(user_gad7) >= 2:
            baseline_gad7 = user_gad7[0]
            latest_gad7 = user_gad7[-1]
            baseline_scores['gad7'] = baseline_gad7.total_score
            follow_up_scores['gad7'] = latest_gad7.total_score
        
        # Calculate improvement percentage
        improvement_pct = self._calculate_improvement_percentage(baseline_scores, follow_up_scores)
        clinical_significance = self._assess_clinical_significance(baseline_scores, follow_up_scores)
        
        outcome = ClinicalOutcome(
            user_id=user_id,
            outcome_date=datetime.datetime.now().isoformat(),
            intervention_type=intervention_type,
            baseline_scores=baseline_scores,
            follow_up_scores=follow_up_scores,
            improvement_percentage=improvement_pct,
            clinical_significance=clinical_significance,
            notes=self._generate_outcome_notes(baseline_scores, follow_up_scores, improvement_pct)
        )
        
        self.clinical_outcomes.append(outcome)
        return outcome
    
    def generate_clinical_insights(self, user_id: str) -> Dict[str, Any]:
        """Generate comprehensive clinical insights for a user"""
        
        user_phq9 = [a for a in self.phq9_assessments if a.user_id == user_id]
        user_gad7 = [a for a in self.gad7_assessments if a.user_id == user_id]
        user_outcomes = [o for o in self.clinical_outcomes if o.user_id == user_id]
        
        insights = {
            "assessment_summary": self._generate_assessment_summary(user_phq9, user_gad7),
            "trend_analysis": self._analyze_trends(user_phq9, user_gad7),
            "risk_assessment": self._comprehensive_risk_assessment(user_phq9, user_gad7),
            "treatment_response": self._analyze_treatment_response(user_outcomes),
            "clinical_recommendations": self._generate_clinical_recommendations(user_phq9, user_gad7, user_outcomes)
        }
        
        return insights
    
    def _determine_phq9_severity(self, total_score: int) -> SeverityLevel:
        """Determine PHQ-9 severity level based on total score"""
        for severity, (min_score, max_score) in self.phq9_thresholds.items():
            if min_score <= total_score <= max_score:
                return severity
        return SeverityLevel.SEVERE
    
    def _determine_gad7_severity(self, total_score: int) -> SeverityLevel:
        """Determine GAD-7 severity level based on total score"""
        for severity, (min_score, max_score) in self.gad7_thresholds.items():
            if min_score <= total_score <= max_score:
                return severity
        return SeverityLevel.SEVERE
    
    def _assess_functional_impairment_phq9(self, responses: Dict[str, int]) -> str:
        """Assess functional impairment from PHQ-9 responses"""
        # Question 10 in PHQ-9 asks about functional impairment
        impairment_indicators = [
            "difficulty_working",
            "difficulty_relationships", 
            "difficulty_daily_activities"
        ]
        
        # Analyze specific symptoms that indicate functional impairment
        sleep_issues = responses.get("sleep_problems", 0)
        concentration_issues = responses.get("concentration_problems", 0)
        energy_issues = responses.get("energy_problems", 0)
        
        impairment_score = sleep_issues + concentration_issues + energy_issues
        
        if impairment_score >= 6:
            return "severe_impairment"
        elif impairment_score >= 4:
            return "moderate_impairment"
        elif impairment_score >= 2:
            return "mild_impairment"
        else:
            return "minimal_impairment"
    
    def _assess_functional_impact_gad7(self, responses: Dict[str, int]) -> str:
        """Assess functional impact from GAD-7 responses"""
        worry_intensity = responses.get("excessive_worry", 0)
        control_difficulty = responses.get("difficulty_controlling_worry", 0)
        restlessness = responses.get("restlessness", 0)
        
        impact_score = worry_intensity + control_difficulty + restlessness
        
        if impact_score >= 6:
            return "severe_impact"
        elif impact_score >= 4:
            return "moderate_impact"
        elif impact_score >= 2:
            return "mild_impact"
        else:
            return "minimal_impact"
    
    def _assess_suicide_risk(self, responses: Dict[str, int]) -> List[str]:
        """Assess suicide risk indicators from PHQ-9"""
        risk_indicators = []
        
        # Question 9 specifically addresses suicidal ideation
        suicidal_thoughts = responses.get("suicidal_thoughts", 0)
        
        if suicidal_thoughts >= 1:
            if suicidal_thoughts == 1:
                risk_indicators.append("passive_suicidal_ideation")
            elif suicidal_thoughts == 2:
                risk_indicators.append("moderate_suicidal_ideation")
            elif suicidal_thoughts == 3:
                risk_indicators.append("severe_suicidal_ideation")
        
        # Additional risk factors from other symptoms
        hopelessness = responses.get("hopelessness", 0)
        anhedonia = responses.get("anhedonia", 0)
        
        if hopelessness >= 2 and anhedonia >= 2:
            risk_indicators.append("high_risk_symptom_constellation")
        
        return risk_indicators
    
    def _calculate_improvement_percentage(self, baseline: Dict[str, int], 
                                        follow_up: Dict[str, int]) -> float:
        """Calculate overall improvement percentage"""
        improvements = []
        
        for scale in baseline.keys():
            if scale in follow_up:
                baseline_score = baseline[scale]
                follow_up_score = follow_up[scale]
                
                if baseline_score > 0:
                    improvement = ((baseline_score - follow_up_score) / baseline_score) * 100
                    improvements.append(improvement)
        
        return float(np.mean(improvements)) if improvements else 0.0
    
    def _assess_clinical_significance(self, baseline: Dict[str, int], 
                                    follow_up: Dict[str, int]) -> bool:
        """Assess if changes are clinically significant"""
        # Clinical significance thresholds
        phq9_threshold = 5  # 5-point change is clinically significant
        gad7_threshold = 4  # 4-point change is clinically significant
        
        significant_changes = 0
        total_comparisons = 0
        
        if 'phq9' in baseline and 'phq9' in follow_up:
            phq9_change = abs(baseline['phq9'] - follow_up['phq9'])
            total_comparisons += 1
            if phq9_change >= phq9_threshold:
                significant_changes += 1
        
        if 'gad7' in baseline and 'gad7' in follow_up:
            gad7_change = abs(baseline['gad7'] - follow_up['gad7'])
            total_comparisons += 1
            if gad7_change >= gad7_threshold:
                significant_changes += 1
        
        return significant_changes > 0 and total_comparisons > 0
    
    def _generate_outcome_notes(self, baseline: Dict[str, int], 
                              follow_up: Dict[str, int], improvement_pct: float) -> str:
        """Generate clinical notes for outcome assessment"""
        notes = []
        
        if improvement_pct > 50:
            notes.append("Significant clinical improvement observed")
        elif improvement_pct > 25:
            notes.append("Moderate improvement noted")
        elif improvement_pct > 0:
            notes.append("Mild improvement detected")
        elif improvement_pct < -25:
            notes.append("Concerning deterioration - requires clinical attention")
        else:
            notes.append("Stable presentation with minimal change")
        
        for scale, score in follow_up.items():
            if scale == 'phq9':
                severity = self._determine_phq9_severity(score)
                notes.append(f"Current depression severity: {severity.value}")
            elif scale == 'gad7':
                severity = self._determine_gad7_severity(score)
                notes.append(f"Current anxiety severity: {severity.value}")
        
        return " | ".join(notes)
    
    def _generate_assessment_summary(self, phq9_list: List[PHQ9Assessment], 
                                   gad7_list: List[GAD7Assessment]) -> Dict[str, Any]:
        """Generate summary of all assessments"""
        summary = {
            "total_phq9_assessments": len(phq9_list),
            "total_gad7_assessments": len(gad7_list),
            "assessment_frequency": "regular" if len(phq9_list) + len(gad7_list) >= 4 else "infrequent"
        }
        
        if phq9_list:
            latest_phq9 = phq9_list[-1]
            summary["current_depression_severity"] = latest_phq9.severity_level
            summary["current_phq9_score"] = latest_phq9.total_score
            summary["suicide_risk_present"] = len(latest_phq9.suicide_risk_indicators) > 0
        
        if gad7_list:
            latest_gad7 = gad7_list[-1]
            summary["current_anxiety_severity"] = latest_gad7.severity_level
            summary["current_gad7_score"] = latest_gad7.total_score
        
        return summary
    
    def _analyze_trends(self, phq9_list: List[PHQ9Assessment], 
                       gad7_list: List[GAD7Assessment]) -> Dict[str, Any]:
        """Analyze trends in assessment scores over time"""
        trends = {}
        
        if len(phq9_list) >= 2:
            phq9_scores = [a.total_score for a in phq9_list]
            trends["phq9_trend"] = self._calculate_trend(phq9_scores)
            trends["phq9_slope"] = np.polyfit(range(len(phq9_scores)), phq9_scores, 1)[0]
        
        if len(gad7_list) >= 2:
            gad7_scores = [a.total_score for a in gad7_list]
            trends["gad7_trend"] = self._calculate_trend(gad7_scores)
            trends["gad7_slope"] = np.polyfit(range(len(gad7_scores)), gad7_scores, 1)[0]
        
        return trends
    
    def _calculate_trend(self, scores: List[int]) -> str:
        """Calculate trend direction from score series"""
        if len(scores) < 2:
            return "insufficient_data"
        
        recent_avg = np.mean(scores[-3:]) if len(scores) >= 3 else scores[-1]
        early_avg = np.mean(scores[:3]) if len(scores) >= 3 else scores[0]
        
        difference = recent_avg - early_avg
        
        if difference <= -2:
            return "improving"
        elif difference >= 2:
            return "worsening"
        else:
            return "stable"
    
    def _comprehensive_risk_assessment(self, phq9_list: List[PHQ9Assessment], 
                                     gad7_list: List[GAD7Assessment]) -> Dict[str, Any]:
        """Comprehensive risk assessment"""
        risk_assessment = {
            "overall_risk_level": "low",
            "risk_factors": [],
            "protective_factors": []
        }
        
        if phq9_list:
            latest_phq9 = phq9_list[-1]
            
            # Check suicide risk
            if latest_phq9.suicide_risk_indicators:
                risk_assessment["overall_risk_level"] = "high"
                risk_assessment["risk_factors"].extend(latest_phq9.suicide_risk_indicators)
            
            # Check severity level
            if latest_phq9.severity_level in ["moderately_severe", "severe"]:
                risk_assessment["overall_risk_level"] = "elevated" if risk_assessment["overall_risk_level"] == "low" else "high"
                risk_assessment["risk_factors"].append(f"severe_depression_{latest_phq9.severity_level}")
        
        if gad7_list:
            latest_gad7 = gad7_list[-1]
            if latest_gad7.severity_level == "severe":
                risk_assessment["overall_risk_level"] = "elevated" if risk_assessment["overall_risk_level"] == "low" else "high"
                risk_assessment["risk_factors"].append("severe_anxiety")
        
        # Check for improvement trends as protective factors
        trends = self._analyze_trends(phq9_list, gad7_list)
        if trends.get("phq9_trend") == "improving":
            risk_assessment["protective_factors"].append("improving_depression_scores")
        if trends.get("gad7_trend") == "improving":
            risk_assessment["protective_factors"].append("improving_anxiety_scores")
        
        return risk_assessment
    
    def _analyze_treatment_response(self, outcomes: List[ClinicalOutcome]) -> Dict[str, Any]:
        """Analyze treatment response patterns"""
        if not outcomes:
            return {"message": "No treatment outcomes available"}
        
        response_analysis = {
            "overall_response": "positive" if outcomes[-1].improvement_percentage > 25 else "limited",
            "average_improvement": np.mean([o.improvement_percentage for o in outcomes]),
            "clinically_significant_changes": sum(1 for o in outcomes if o.clinical_significance),
            "intervention_effectiveness": {}
        }
        
        # Analyze effectiveness by intervention type
        intervention_outcomes = {}
        for outcome in outcomes:
            intervention = outcome.intervention_type
            if intervention not in intervention_outcomes:
                intervention_outcomes[intervention] = []
            intervention_outcomes[intervention].append(outcome.improvement_percentage)
        
        for intervention, improvements in intervention_outcomes.items():
            response_analysis["intervention_effectiveness"][intervention] = {
                "average_improvement": np.mean(improvements),
                "success_rate": sum(1 for imp in improvements if imp > 25) / len(improvements)
            }
        
        return response_analysis
    
    def _generate_clinical_recommendations(self, phq9_list: List[PHQ9Assessment], 
                                         gad7_list: List[GAD7Assessment],
                                         outcomes: List[ClinicalOutcome]) -> List[str]:
        """Generate evidence-based clinical recommendations"""
        recommendations = []
        
        # Current severity-based recommendations
        if phq9_list:
            latest_phq9 = phq9_list[-1]
            if latest_phq9.suicide_risk_indicators:
                recommendations.append("URGENT: Suicide risk assessment and crisis intervention required")
            elif latest_phq9.severity_level == "severe":
                recommendations.append("Consider intensive treatment options including psychiatric evaluation")
            elif latest_phq9.severity_level in ["moderate", "moderately_severe"]:
                recommendations.append("Structured therapeutic intervention recommended (CBT, IPT, or medication)")
        
        if gad7_list:
            latest_gad7 = gad7_list[-1]
            if latest_gad7.severity_level == "severe":
                recommendations.append("Anxiety-specific interventions needed (CBT for anxiety, relaxation training)")
        
        # Trend-based recommendations
        trends = self._analyze_trends(phq9_list, gad7_list)
        if trends.get("phq9_trend") == "worsening":
            recommendations.append("Depression symptoms worsening - treatment intensification needed")
        if trends.get("gad7_trend") == "worsening":
            recommendations.append("Anxiety symptoms increasing - intervention adjustment required")
        
        # Outcome-based recommendations
        if outcomes:
            latest_outcome = outcomes[-1]
            if latest_outcome.improvement_percentage < 0:
                recommendations.append("Treatment approach review needed - consider alternative interventions")
            elif latest_outcome.improvement_percentage > 50:
                recommendations.append("Excellent progress - continue current treatment approach")
        
        # Default recommendations if no specific issues
        if not recommendations:
            recommendations.extend([
                "Continue regular monitoring with standardized assessments",
                "Maintain therapeutic engagement and homework compliance",
                "Focus on relapse prevention strategies"
            ])
        
        return recommendations

# Global instance
clinical_system = ClinicalOutcomesSystem()