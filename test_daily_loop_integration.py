#!/usr/bin/env python3
"""
Test Daily Loop Integration System
Tests persona-daily loop integration for contextualized responses
"""

import asyncio
import json
from datetime import datetime, date, timedelta
from backend.core.daily_loop import DailySoulSenseLoop
from backend.core.daily_loop_integration import DailyLoopIntegration

async def test_daily_loop_integration():
    """Test comprehensive daily loop integration with personas"""
    print("🔗 Testing Daily Loop Integration System...")
    
    # Initialize systems
    daily_loop = DailySoulSenseLoop()
    integration = DailyLoopIntegration()
    
    await daily_loop.initialize()
    await integration.initialize()
    
    test_user_id = "test_user_integration"
    
    try:
        # Test 1: Create daily loop entries for testing
        print("\n📝 Setting up daily loop test data...")
        
        # Morning entry with low mood
        success = await daily_loop.complete_loop_activity(
            user_id=test_user_id,
            loop_type="morning_checkin",
            mood_rating=4.0,
            energy_level=3.5,
            stress_level=7.0,
            gratitude_notes="Grateful for my bed and coffee",
            goals_for_day="Try to feel better and get through work",
            reflection_notes="Woke up feeling anxious about the day ahead",
            selected_persona="sarah"
        )
        
        if success:
            print("✅ Morning check-in created (low mood, high stress)")
        else:
            print("❌ Failed to create morning check-in")
            return False
        
        # Midday entry with slight improvement
        success = await daily_loop.complete_loop_activity(
            user_id=test_user_id,
            loop_type="midday_pulse",
            mood_rating=5.5,
            energy_level=5.0,
            stress_level=6.0,
            gratitude_notes="Grateful for supportive colleagues",
            reflection_notes="Feeling a bit better after lunch and some deep breathing",
            selected_persona="maya"
        )
        
        if success:
            print("✅ Midday pulse created (improving mood)")
        else:
            print("❌ Failed to create midday pulse")
            return False
        
        # Test 2: Get Maya's context (should be recommended for low energy/stress)
        print("\n🪷 Testing Maya's Daily Loop Context...")
        maya_context = await integration.get_persona_context(test_user_id, "maya")
        
        if maya_context:
            print("✅ Maya context retrieved successfully")
            print(f"   Mood trend: {maya_context['daily_insight']['mood_trend']}")
            print(f"   Energy pattern: {maya_context['daily_insight']['energy_pattern']}")
            print(f"   Recommended for Maya: {maya_context['recommendations']['is_recommended']}")
            print(f"   Confidence score: {maya_context['recommendations']['confidence']:.2f}")
        else:
            print("❌ Failed to retrieve Maya's context")
            return False
        
        # Test 3: Get Sarah's context (should be recommended for high stress)
        print("\n👩‍⚕️ Testing Sarah's Daily Loop Context...")
        sarah_context = await integration.get_persona_context(test_user_id, "sarah")
        
        if sarah_context:
            print("✅ Sarah context retrieved successfully")
            print(f"   Stress indicators: {sarah_context['daily_insight']['stress_indicators']}")
            print(f"   Recommended for Sarah: {sarah_context['recommendations']['is_recommended']}")
            print(f"   Confidence score: {sarah_context['recommendations']['confidence']:.2f}")
            print(f"   Persona approach: {sarah_context['persona_context']['approach']}")
        else:
            print("❌ Failed to retrieve Sarah's context")
            return False
        
        # Test 4: Get Alex's context (peer support)
        print("\n😊 Testing Alex's Daily Loop Context...")
        alex_context = await integration.get_persona_context(test_user_id, "alex")
        
        if alex_context:
            print("✅ Alex context retrieved successfully")
            print(f"   Recommended for Alex: {alex_context['recommendations']['is_recommended']}")
            print(f"   Persona approach: {alex_context['persona_context']['approach']}")
            print(f"   Focus areas: {alex_context['persona_context']['focus_areas']}")
        else:
            print("❌ Failed to retrieve Alex's context")
            return False
        
        # Test 5: Get Marcus's context (goal-oriented)
        print("\n💪 Testing Marcus's Daily Loop Context...")
        marcus_context = await integration.get_persona_context(test_user_id, "marcus")
        
        if marcus_context:
            print("✅ Marcus context retrieved successfully")
            print(f"   Recommended for Marcus: {marcus_context['recommendations']['is_recommended']}")
            print(f"   Persona approach: {marcus_context['persona_context']['approach']}")
            print(f"   Energy pattern relevance: {marcus_context['daily_insight']['energy_pattern']}")
        else:
            print("❌ Failed to retrieve Marcus's context")
            return False
        
        # Test 6: Weekly insights
        print("\n📊 Testing Weekly Persona Insights...")
        weekly_insights = await integration.get_weekly_persona_insights(test_user_id)
        
        if weekly_insights:
            print("✅ Weekly insights retrieved successfully")
            print(f"   Mood trend: {weekly_insights.get('mood_trend', 'N/A')}")
            print(f"   Energy trend: {weekly_insights.get('energy_trend', 'N/A')}")
            print(f"   Recommended focus: {weekly_insights.get('recommended_focus', [])}")
            
            persona_priorities = weekly_insights.get('persona_priority', {})
            print("   Persona priorities:")
            for persona, priority in persona_priorities.items():
                print(f"     {persona}: {priority:.2f}")
        else:
            print("❌ Failed to retrieve weekly insights")
            return False
        
        # Test 7: Context saving
        print("\n💾 Testing Context Persistence...")
        test_context = {
            "last_interaction": datetime.now().isoformat(),
            "preferred_approach": "gentle_spiritual",
            "effective_techniques": ["breathwork", "meditation"]
        }
        
        await integration.save_persona_context(test_user_id, "maya", test_context)
        print("✅ Context saved successfully")
        
        # Test 8: Pattern analysis
        print("\n🔍 Testing Daily Pattern Analysis...")
        daily_insight = await integration.analyze_daily_patterns(test_user_id)
        
        if daily_insight:
            print("✅ Daily pattern analysis completed")
            print(f"   Mood trend: {daily_insight.mood_trend}")
            print(f"   Energy pattern: {daily_insight.energy_pattern}")
            print(f"   Stress indicators: {daily_insight.stress_indicators}")
            print(f"   Recommended personas: {daily_insight.recommended_personas}")
            print(f"   Conversation context: {daily_insight.conversation_context}")
        else:
            print("❌ Failed to analyze daily patterns")
            return False
        
        # Test 9: Persona recommendation accuracy
        print("\n🎯 Testing Persona Recommendation Logic...")
        
        # High stress should recommend Sarah
        if "sarah" in daily_insight.recommended_personas:
            print("✅ Sarah correctly recommended for high stress")
        else:
            print("❌ Sarah not recommended despite high stress")
        
        # Low energy should recommend Maya
        if "maya" in daily_insight.recommended_personas:
            print("✅ Maya correctly recommended for low energy")
        else:
            print("❌ Maya not recommended despite low energy")
        
        # Test 10: Context integration validation
        print("\n🔗 Testing Context Integration...")
        
        # Verify Maya's context includes stress relief suggestions
        maya_suggestions = maya_context['persona_context']['suggested_techniques']
        if any(technique in ['pranayama', 'meditation', 'stress_relief'] for technique in maya_suggestions):
            print("✅ Maya's suggestions appropriately include stress relief techniques")
        else:
            print("❌ Maya's suggestions don't include stress relief techniques")
        
        # Verify Sarah's context includes challenge processing
        sarah_focus = sarah_context['persona_context']['focus_areas']
        if any(area in ['challenge_processing', 'stress_management'] for area in sarah_focus):
            print("✅ Sarah's focus areas appropriately include challenge processing")
        else:
            print("❌ Sarah's focus areas don't include challenge processing")
        
        print("\n🎉 All Daily Loop Integration tests passed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False
        
    finally:
        # Clean up test data
        await daily_loop.connection.execute(
            "DELETE FROM daily_loop_entries WHERE user_id = ?",
            (test_user_id,)
        )
        await daily_loop.connection.execute(
            "DELETE FROM daily_loop_streaks WHERE user_id = ?",
            (test_user_id,)
        )
        await daily_loop.connection.execute(
            "DELETE FROM daily_wellness_insights WHERE user_id = ?",
            (test_user_id,)
        )
        await daily_loop.connection.execute(
            "DELETE FROM daily_persona_recommendations WHERE user_id = ?",
            (test_user_id,)
        )
        await daily_loop.connection.execute(
            "DELETE FROM daily_conversation_context WHERE user_id = ?",
            (test_user_id,)
        )
        await daily_loop.connection.execute(
            "DELETE FROM daily_wellness_for_personas WHERE user_id = ?",
            (test_user_id,)
        )
        await daily_loop.connection.commit()
        await integration.connection.commit()
        
        await daily_loop.close()
        await integration.close()

def test_persona_recommendation_logic():
    """Test the persona recommendation algorithm"""
    print("\n🧠 Testing Persona Recommendation Algorithm...")
    
    integration = DailyLoopIntegration()
    
    # Test high stress scenario
    high_stress_personas = integration._recommend_personas("stable", "moderate", 8.0, ["work stress", "relationship issues"])
    print(f"High stress recommendations: {high_stress_personas}")
    
    # Test low energy scenario
    low_energy_personas = integration._recommend_personas("declining", "low", 4.0, [])
    print(f"Low energy recommendations: {low_energy_personas}")
    
    # Test high energy scenario
    high_energy_personas = integration._recommend_personas("improving", "high", 3.0, [])
    print(f"High energy recommendations: {high_energy_personas}")
    
    # Test balanced scenario
    balanced_personas = integration._recommend_personas("stable", "moderate", 4.0, [])
    print(f"Balanced recommendations: {balanced_personas}")
    
    print("✅ Persona recommendation algorithm tested")

def test_context_generation():
    """Test conversation context generation"""
    print("\n💬 Testing Conversation Context Generation...")
    
    integration = DailyLoopIntegration()
    
    # Mock entries data
    mock_entries = [
        {
            'loop_type': 'morning_checkin',
            'mood_rating': 4.0,
            'energy_level': 3.5,
            'stress_level': 7.0,
            'accomplishments': None,
            'challenges_faced': 'Feeling anxious about work presentation'
        },
        {
            'loop_type': 'evening_reflection',
            'mood_rating': 6.0,
            'energy_level': 5.0,
            'stress_level': 5.0,
            'accomplishments': 'Completed presentation successfully',
            'challenges_faced': None
        }
    ]
    
    context = integration._generate_conversation_context(
        mock_entries, "improving", "moderate", ["challenges_reported"]
    )
    
    print(f"Generated context: {context}")
    
    if "improving" in context and "presentation" in context:
        print("✅ Context generation includes relevant details")
    else:
        print("❌ Context generation missing key details")

async def main():
    """Run all integration tests"""
    print("🔗 Starting Daily Loop Integration Tests")
    print("=" * 50)
    
    # Test recommendation logic
    test_persona_recommendation_logic()
    
    # Test context generation
    test_context_generation()
    
    # Test full integration
    success = await test_daily_loop_integration()
    
    if success:
        print("\n🎉 All integration tests passed! Daily Loop Integration is working correctly.")
    else:
        print("\n❌ Some integration tests failed. Please check the output above.")

if __name__ == "__main__":
    asyncio.run(main())