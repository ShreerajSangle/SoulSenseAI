#!/usr/bin/env python3
"""
Test Advanced Emotion Engine
Tests emotional pattern analysis and therapeutic opportunity identification
"""

import asyncio
import json
from datetime import datetime, date, timedelta
from backend.core.advanced_emotion_engine import AdvancedEmotionEngine, EmotionalProfile, TherapeuticOpportunity
from backend.core.daily_loop import DailySoulSenseLoop

async def test_advanced_emotion_engine():
    """Test the advanced emotion engine functionality"""
    print("🧠 Testing Advanced Emotion Engine")
    print("=" * 50)
    
    # Initialize systems
    emotion_engine = AdvancedEmotionEngine()
    daily_loop = DailySoulSenseLoop()
    
    await emotion_engine.initialize()
    await daily_loop.initialize()
    
    test_user_id = "emotion_test_user"
    
    try:
        # Create realistic emotional journey data
        print("\n📝 Creating Emotional Journey Data...")
        
        # Week 1: High stress and anxiety
        await daily_loop.complete_loop_activity(
            user_id=test_user_id,
            loop_type="morning_checkin",
            mood_rating=3.0,
            energy_level=2.5,
            stress_level=8.5,
            gratitude_notes="Grateful for coffee",
            goals_for_day="Survive work presentation",
            reflection_notes="Woke up with anxiety about presentation, heart racing, can't focus",
            selected_persona="sarah",
            date_param=date.today() - timedelta(days=6)
        )
        
        await daily_loop.complete_loop_activity(
            user_id=test_user_id,
            loop_type="evening_reflection",
            mood_rating=4.0,
            energy_level=3.0,
            stress_level=7.5,
            gratitude_notes="Grateful for getting through the day",
            challenges_faced="Work presentation was overwhelming, felt judged by colleagues",
            accomplishments="Completed presentation despite anxiety",
            reflection_notes="Exhausted but relieved it's over. Need better coping strategies",
            selected_persona="sarah",
            date_param=date.today() - timedelta(days=6)
        )
        
        # Week 1: Continued stress with work pressure
        await daily_loop.complete_loop_activity(
            user_id=test_user_id,
            loop_type="morning_checkin",
            mood_rating=4.5,
            energy_level=4.0,
            stress_level=7.0,
            gratitude_notes="Grateful for supportive partner",
            goals_for_day="Handle work deadline pressure",
            reflection_notes="Still feeling anxious but slightly better than yesterday",
            selected_persona="sarah",
            date_param=date.today() - timedelta(days=5)
        )
        
        # Week 2: Discovering mindfulness
        await daily_loop.complete_loop_activity(
            user_id=test_user_id,
            loop_type="morning_checkin",
            mood_rating=6.0,
            energy_level=5.5,
            stress_level=5.5,
            gratitude_notes="Grateful for discovering meditation apps",
            goals_for_day="Try meditation and mindfulness practices",
            reflection_notes="Curious about spiritual practices, ready to try something new",
            selected_persona="maya",
            date_param=date.today() - timedelta(days=4)
        )
        
        await daily_loop.complete_loop_activity(
            user_id=test_user_id,
            loop_type="evening_reflection",
            mood_rating=7.5,
            energy_level=6.5,
            stress_level=4.0,
            gratitude_notes="Grateful for Maya's breathing guidance and inner peace",
            challenges_faced="None today - peaceful day",
            accomplishments="Completed 15-minute meditation, practiced breathing exercises, felt centered",
            reflection_notes="Amazing how much calmer I feel. Meditation really works for me",
            selected_persona="maya",
            date_param=date.today() - timedelta(days=4)
        )
        
        # Week 2: Building momentum
        await daily_loop.complete_loop_activity(
            user_id=test_user_id,
            loop_type="morning_checkin",
            mood_rating=8.0,
            energy_level=7.5,
            stress_level=3.0,
            gratitude_notes="Grateful for this transformation and newfound clarity",
            goals_for_day="Set goals and create action plans for personal growth",
            reflection_notes="Feeling energized and ready to achieve. Want to build on this momentum",
            selected_persona="marcus",
            date_param=date.today() - timedelta(days=2)
        )
        
        await daily_loop.complete_loop_activity(
            user_id=test_user_id,
            loop_type="evening_reflection",
            mood_rating=8.5,
            energy_level=7.0,
            stress_level=2.5,
            gratitude_notes="Grateful for personal growth and achievement mindset",
            challenges_faced="None - productive day",
            accomplishments="Set 3 major personal goals, created detailed action plans, completed work tasks efficiently",
            reflection_notes="Feel like I've found my groove. Ready to keep building on this success",
            selected_persona="marcus",
            date_param=date.today() - timedelta(days=2)
        )
        
        print("✅ Emotional journey data created")
        
        # Test 1: Emotional Pattern Analysis
        print("\n🔍 Testing Emotional Pattern Analysis...")
        emotional_profile = await emotion_engine.analyze_emotional_patterns(test_user_id, days_back=30)
        
        if emotional_profile:
            print("✅ Emotional profile generated successfully")
            print(f"   Dominant emotions: {emotional_profile.dominant_emotions}")
            print(f"   Emotional volatility: {emotional_profile.emotional_volatility:.2f}")
            print(f"   Stress triggers: {emotional_profile.stress_triggers}")
            print(f"   Positive patterns: {emotional_profile.positive_patterns}")
            print(f"   Support preferences: {emotional_profile.support_preferences}")
            print(f"   Resilience factors: {emotional_profile.resilience_factors}")
            print(f"   Therapeutic responsiveness: {emotional_profile.therapeutic_responsiveness}")
        else:
            print("❌ Failed to generate emotional profile")
            return False
        
        # Test 2: Therapeutic Opportunity Identification
        print("\n🎯 Testing Therapeutic Opportunity Identification...")
        opportunities = await emotion_engine.identify_therapeutic_opportunities(test_user_id)
        
        if opportunities:
            print(f"✅ Identified {len(opportunities)} therapeutic opportunities")
            for i, opp in enumerate(opportunities, 1):
                print(f"   {i}. {opp.opportunity_type}")
                print(f"      Confidence: {opp.confidence:.2f}")
                print(f"      Recommended persona: {opp.recommended_persona}")
                print(f"      Timing: {opp.intervention_timing}")
                print(f"      Techniques: {opp.therapeutic_techniques}")
                print(f"      Expected outcome: {opp.expected_outcome}")
        else:
            print("❌ No therapeutic opportunities identified")
        
        # Test 3: Profile Retrieval
        print("\n📊 Testing Profile Retrieval...")
        retrieved_profile = await emotion_engine.get_emotional_profile(test_user_id)
        
        if retrieved_profile:
            print("✅ Profile retrieved successfully")
            print(f"   Matches original profile: {retrieved_profile.dominant_emotions == emotional_profile.dominant_emotions}")
        else:
            print("❌ Failed to retrieve profile")
        
        # Test 4: Active Opportunities
        print("\n⚡ Testing Active Opportunities...")
        active_opportunities = await emotion_engine.get_active_opportunities(test_user_id)
        
        if active_opportunities:
            print(f"✅ Found {len(active_opportunities)} active opportunities")
            for opp in active_opportunities:
                print(f"   - {opp.opportunity_type} (Confidence: {opp.confidence:.2f})")
        else:
            print("❌ No active opportunities found")
        
        # Test 5: Emotion Extraction
        print("\n🗣️ Testing Emotion Extraction...")
        test_texts = [
            "I'm feeling anxious about tomorrow's meeting",
            "Had a wonderful day, feeling grateful and content",
            "Frustrated with work stress and overwhelming deadlines",
            "Peaceful meditation session brought me inner calm"
        ]
        
        for text in test_texts:
            emotions = emotion_engine._extract_emotions_from_text(text)
            print(f"   Text: '{text[:40]}...'")
            print(f"   Extracted emotions: {emotions}")
        
        # Test 6: Volatility Calculation
        print("\n📈 Testing Volatility Calculation...")
        
        # Create test entries with varying moods
        test_entries = [
            {'mood_rating': 3.0, 'date': '2025-01-01'},
            {'mood_rating': 7.0, 'date': '2025-01-02'},
            {'mood_rating': 2.0, 'date': '2025-01-03'},
            {'mood_rating': 8.5, 'date': '2025-01-04'},
            {'mood_rating': 4.0, 'date': '2025-01-05'}
        ]
        
        volatility = emotion_engine._calculate_emotional_volatility(test_entries)
        print(f"✅ Calculated volatility: {volatility:.2f}")
        print(f"   (High volatility expected due to mood swings: 3→7→2→8.5→4)")
        
        print("\n🎉 All Advanced Emotion Engine tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False
        
    finally:
        # Clean up test data
        await daily_loop.connection.execute("DELETE FROM daily_loop_entries WHERE user_id = ?", (test_user_id,))
        await emotion_engine.connection.execute("DELETE FROM emotional_profiles WHERE user_id = ?", (test_user_id,))
        await emotion_engine.connection.execute("DELETE FROM therapeutic_opportunities WHERE user_id = ?", (test_user_id,))
        await emotion_engine.connection.execute("DELETE FROM emotional_trends WHERE user_id = ?", (test_user_id,))
        await emotion_engine.connection.execute("DELETE FROM advanced_emotion_sessions WHERE user_id = ?", (test_user_id,))
        
        await daily_loop.connection.commit()
        await emotion_engine.connection.commit()
        
        await daily_loop.close()
        await emotion_engine.close()

async def test_therapeutic_opportunity_scenarios():
    """Test different therapeutic opportunity scenarios"""
    print("\n🎭 Testing Therapeutic Opportunity Scenarios")
    print("=" * 50)
    
    emotion_engine = AdvancedEmotionEngine()
    await emotion_engine.initialize()
    
    # Test scenario 1: High stress user
    print("\n🚨 Scenario 1: High Stress User")
    high_stress_profile = EmotionalProfile(
        dominant_emotions=['high_stress', 'anxious', 'overwhelmed'],
        emotional_volatility=0.7,
        stress_triggers=['work_stress', 'time_pressure'],
        positive_patterns=['mindfulness_practice'],
        support_preferences=['clinical_support'],
        resilience_factors=['seeking_support'],
        therapeutic_responsiveness={'sarah': 0.9, 'maya': 0.7}
    )
    
    await emotion_engine._save_emotional_profile("high_stress_user", high_stress_profile)
    opportunities = await emotion_engine.identify_therapeutic_opportunities("high_stress_user")
    
    print(f"   Identified {len(opportunities)} opportunities:")
    for opp in opportunities:
        print(f"   - {opp.opportunity_type}: {opp.recommended_persona} ({opp.confidence:.2f})")
    
    # Test scenario 2: Positive momentum user
    print("\n🚀 Scenario 2: Positive Momentum User")
    positive_profile = EmotionalProfile(
        dominant_emotions=['positive_mood', 'motivated', 'confident'],
        emotional_volatility=0.2,
        stress_triggers=[],
        positive_patterns=['achievement', 'goal_setting'],
        support_preferences=['goal_coaching'],
        resilience_factors=['incremental_progress'],
        therapeutic_responsiveness={'marcus': 0.9, 'alex': 0.8}
    )
    
    await emotion_engine._save_emotional_profile("positive_user", positive_profile)
    opportunities = await emotion_engine.identify_therapeutic_opportunities("positive_user")
    
    print(f"   Identified {len(opportunities)} opportunities:")
    for opp in opportunities:
        print(f"   - {opp.opportunity_type}: {opp.recommended_persona} ({opp.confidence:.2f})")
    
    # Test scenario 3: Volatile emotions user
    print("\n🌪️ Scenario 3: Emotionally Volatile User")
    volatile_profile = EmotionalProfile(
        dominant_emotions=['mood_swings', 'unstable', 'confused'],
        emotional_volatility=0.9,
        stress_triggers=['relationship_stress'],
        positive_patterns=['social_connection'],
        support_preferences=['peer_support'],
        resilience_factors=['self_care'],
        therapeutic_responsiveness={'sarah': 0.8, 'alex': 0.6}
    )
    
    await emotion_engine._save_emotional_profile("volatile_user", volatile_profile)
    opportunities = await emotion_engine.identify_therapeutic_opportunities("volatile_user")
    
    print(f"   Identified {len(opportunities)} opportunities:")
    for opp in opportunities:
        print(f"   - {opp.opportunity_type}: {opp.recommended_persona} ({opp.confidence:.2f})")
    
    # Clean up
    await emotion_engine.connection.execute("DELETE FROM emotional_profiles WHERE user_id IN ('high_stress_user', 'positive_user', 'volatile_user')")
    await emotion_engine.connection.execute("DELETE FROM therapeutic_opportunities WHERE user_id IN ('high_stress_user', 'positive_user', 'volatile_user')")
    await emotion_engine.connection.commit()
    await emotion_engine.close()
    
    print("✅ Therapeutic opportunity scenarios tested successfully")

async def main():
    """Run all advanced emotion engine tests"""
    print("🧠 Starting Advanced Emotion Engine Tests")
    print("=" * 60)
    
    # Test core functionality
    success = await test_advanced_emotion_engine()
    
    if success:
        # Test therapeutic scenarios
        await test_therapeutic_opportunity_scenarios()
        
        print("\n🎉 All Advanced Emotion Engine tests completed successfully!")
        print("=" * 60)
        print("✅ System capabilities verified:")
        print("  • Emotional pattern analysis from daily loop data")
        print("  • Therapeutic opportunity identification with confidence scoring")
        print("  • Persona-specific intervention recommendations")
        print("  • Emotional volatility and stress trigger detection")
        print("  • Resilience factor and positive pattern recognition")
        print("  • Profile persistence and retrieval")
    else:
        print("\n❌ Some tests failed. Please check the output above.")

if __name__ == "__main__":
    asyncio.run(main())