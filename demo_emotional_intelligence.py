#!/usr/bin/env python3
"""
Demo script to populate emotional intelligence data for frontend testing
"""

import asyncio
import sys
import os
import json
from datetime import datetime, timedelta

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from core.advanced_emotion_engine import AdvancedEmotionEngine

async def create_demo_data():
    """Create realistic demo data for emotional intelligence dashboard"""
    print("🧠 Creating Emotional Intelligence Demo Data")
    print("=" * 50)
    
    engine = AdvancedEmotionEngine()
    await engine.initialize()
    
    demo_user_id = "demo_user"
    
    try:
        cursor = engine.connection.cursor()
        
        # Create diverse emotional sessions over past 30 days
        sessions = [
            # Week 1 - High stress period
            {'day': 1, 'emotions': ['anxious', 'overwhelmed'], 'intensity': 8.0, 'stress': 9.0, 'persona': 'sarah', 'gains': ['breathing_exercise', 'cognitive_reframing']},
            {'day': 2, 'emotions': ['sad', 'frustrated'], 'intensity': 7.0, 'stress': 8.0, 'persona': 'sarah', 'gains': ['emotional_validation']},
            {'day': 3, 'emotions': ['anxious', 'worried'], 'intensity': 7.5, 'stress': 8.5, 'persona': 'maya', 'gains': ['meditation', 'grounding']},
            {'day': 4, 'emotions': ['tired', 'stressed'], 'intensity': 6.0, 'stress': 7.0, 'persona': 'maya', 'gains': ['mindfulness_practice']},
            {'day': 5, 'emotions': ['hopeful', 'determined'], 'intensity': 5.0, 'stress': 5.0, 'persona': 'marcus', 'gains': ['goal_setting', 'action_planning']},
            
            # Week 2 - Improvement period
            {'day': 8, 'emotions': ['motivated', 'focused'], 'intensity': 4.0, 'stress': 4.0, 'persona': 'marcus', 'gains': ['productivity_boost', 'confidence_building']},
            {'day': 9, 'emotions': ['content', 'peaceful'], 'intensity': 3.0, 'stress': 3.0, 'persona': 'maya', 'gains': ['inner_peace', 'spiritual_connection']},
            {'day': 10, 'emotions': ['happy', 'social'], 'intensity': 3.5, 'stress': 2.0, 'persona': 'alex', 'gains': ['social_support', 'humor_therapy']},
            {'day': 11, 'emotions': ['confident', 'optimistic'], 'intensity': 3.0, 'stress': 2.0, 'persona': 'alex', 'gains': ['peer_connection', 'positive_outlook']},
            
            # Week 3 - Mixed emotions
            {'day': 15, 'emotions': ['excited', 'nervous'], 'intensity': 5.0, 'stress': 4.0, 'persona': 'sarah', 'gains': ['emotion_regulation', 'coping_strategies']},
            {'day': 16, 'emotions': ['grateful', 'reflective'], 'intensity': 4.0, 'stress': 3.0, 'persona': 'maya', 'gains': ['gratitude_practice', 'self_reflection']},
            {'day': 17, 'emotions': ['determined', 'ambitious'], 'intensity': 4.5, 'stress': 3.5, 'persona': 'marcus', 'gains': ['goal_refinement', 'motivation_boost']},
            
            # Week 4 - Stable period
            {'day': 22, 'emotions': ['balanced', 'content'], 'intensity': 3.0, 'stress': 2.5, 'persona': 'maya', 'gains': ['emotional_balance', 'mindfulness']},
            {'day': 23, 'emotions': ['happy', 'energetic'], 'intensity': 3.5, 'stress': 2.0, 'persona': 'alex', 'gains': ['positive_energy', 'social_wellness']},
            {'day': 24, 'emotions': ['proud', 'accomplished'], 'intensity': 4.0, 'stress': 2.0, 'persona': 'marcus', 'gains': ['achievement_recognition', 'self_efficacy']},
        ]
        
        for session in sessions:
            date = datetime.now() - timedelta(days=session['day'])
            
            # Calculate resilience score based on session
            resilience = 0.3  # Base
            if session['stress'] < 5:
                resilience += 0.3
            if session['intensity'] < 5:
                resilience += 0.2
            if len(session['gains']) > 1:
                resilience += 0.2
            resilience = min(1.0, resilience)
            
            cursor.execute('''
                INSERT OR REPLACE INTO advanced_emotion_sessions 
                (user_id, session_date, primary_emotions, emotional_intensity, stress_level, 
                 resilience_score, therapeutic_gains, intervention_effectiveness, 
                 persona_match_score, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                demo_user_id,
                date.strftime('%Y-%m-%d'),
                json.dumps(session['emotions']),
                session['intensity'],
                session['stress'],
                resilience,
                json.dumps(session['gains']),
                json.dumps({'effectiveness': 0.7 + (resilience * 0.3)}),
                0.8,
                date.isoformat()
            ))
        
        engine.connection.commit()
        
        # Generate emotional profile
        profile = await engine.analyze_emotional_patterns(demo_user_id, 30)
        
        print("✅ Demo data created successfully!")
        print(f"📊 Sessions created: {len(sessions)}")
        print(f"🎭 Dominant emotions: {profile.dominant_emotions}")
        print(f"📈 Emotional volatility: {profile.emotional_volatility:.2f}")
        print(f"⚠️ Stress triggers: {profile.stress_triggers}")
        print(f"✨ Positive patterns: {profile.positive_patterns}")
        
        # Generate therapeutic opportunities
        opportunities = await engine.identify_therapeutic_opportunities(demo_user_id)
        print(f"🎯 Therapeutic opportunities: {len(opportunities)}")
        
        print("\n🌐 Emotional Intelligence Dashboard ready for testing!")
        print("Access the dashboard through the homepage 'Emotional Intelligence' button")
        
    except Exception as e:
        print(f"❌ Error creating demo data: {str(e)}")
        import traceback
        traceback.print_exc()
        
    finally:
        await engine.close()

if __name__ == "__main__":
    asyncio.run(create_demo_data())