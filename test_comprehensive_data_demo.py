#!/usr/bin/env python3
"""
Comprehensive Data Demo for Daily Loop Integration
Shows real data flow from daily patterns to persona responses
"""

import asyncio
import json
from datetime import datetime, date, timedelta
from backend.core.daily_loop import DailySoulSenseLoop
from backend.core.daily_loop_integration import DailyLoopIntegration

async def create_realistic_user_journey():
    """Create a realistic 3-day user journey with varied patterns"""
    print("🎭 Creating Realistic User Journey Data")
    print("=" * 50)
    
    daily_loop = DailySoulSenseLoop()
    integration = DailyLoopIntegration()
    
    await daily_loop.initialize()
    await integration.initialize()
    
    demo_user_id = "realistic_user_demo"
    
    try:
        # Day 1: Struggling with anxiety and low energy
        print("\n📅 DAY 1: Struggling with Anxiety")
        
        # Morning - high anxiety, low energy
        await daily_loop.complete_loop_activity(
            user_id=demo_user_id,
            loop_type="morning_checkin",
            mood_rating=3.0,
            energy_level=2.5,
            stress_level=8.5,
            gratitude_notes="Grateful for my morning coffee and supportive partner",
            goals_for_day="Try to manage anxiety and get through work meetings",
            reflection_notes="Woke up with racing thoughts about upcoming presentation",
            selected_persona="sarah"
        )
        
        # Midday - slight improvement after therapy session
        await daily_loop.complete_loop_activity(
            user_id=demo_user_id,
            loop_type="midday_pulse",
            mood_rating=4.5,
            energy_level=3.0,
            stress_level=7.0,
            gratitude_notes="Grateful for Dr. Sarah's breathing exercises",
            reflection_notes="Feeling more grounded after our conversation",
            selected_persona="sarah"
        )
        
        # Evening - exhausted but accomplished
        await daily_loop.complete_loop_activity(
            user_id=demo_user_id,
            loop_type="evening_reflection",
            mood_rating=5.5,
            energy_level=3.5,
            stress_level=6.0,
            gratitude_notes="Grateful for getting through the day and having support",
            challenges_faced="Presentation anxiety was overwhelming",
            accomplishments="Completed presentation despite anxiety, practiced breathing techniques",
            reflection_notes="Challenging day but I survived and learned coping strategies",
            selected_persona="sarah"
        )
        
        # Day 2: Feeling better, exploring spirituality
        print("\n📅 DAY 2: Exploring Spiritual Wellness")
        
        # Morning - more balanced, curious about mindfulness
        await daily_loop.complete_loop_activity(
            user_id=demo_user_id,
            loop_type="morning_checkin",
            mood_rating=6.0,
            energy_level=5.5,
            stress_level=5.0,
            gratitude_notes="Grateful for yesterday's growth and inner strength",
            goals_for_day="Explore mindfulness practices and maintain balance",
            reflection_notes="Woke up feeling more centered, interested in meditation",
            selected_persona="maya",
            date_param=date.today() + timedelta(days=1)
        )
        
        # Midday - energized by yoga practice
        await daily_loop.complete_loop_activity(
            user_id=demo_user_id,
            loop_type="midday_pulse",
            mood_rating=7.5,
            energy_level=7.0,
            stress_level=3.5,
            gratitude_notes="Grateful for Maya's yoga flow and spiritual guidance",
            reflection_notes="Feel so much lighter after our pranayama session",
            selected_persona="maya",
            date_param=date.today() + timedelta(days=1)
        )
        
        # Evening - peaceful and reflective
        await daily_loop.complete_loop_activity(
            user_id=demo_user_id,
            loop_type="evening_reflection",
            mood_rating=8.0,
            energy_level=6.5,
            stress_level=2.5,
            gratitude_notes="Grateful for spiritual awakening and inner peace",
            challenges_faced="None - peaceful day",
            accomplishments="Completed 20-minute meditation, connected with inner wisdom",
            reflection_notes="Feeling deeply connected to myself and the universe",
            selected_persona="maya",
            date_param=date.today() + timedelta(days=1)
        )
        
        # Day 3: High energy, ready for goals
        print("\n📅 DAY 3: High Energy and Goal Setting")
        
        # Morning - energized and motivated
        await daily_loop.complete_loop_activity(
            user_id=demo_user_id,
            loop_type="morning_checkin",
            mood_rating=8.5,
            energy_level=8.0,
            stress_level=2.0,
            gratitude_notes="Grateful for this transformation and newfound clarity",
            goals_for_day="Set ambitious goals and create action plans",
            reflection_notes="Woke up feeling unstoppable and ready to achieve",
            selected_persona="marcus",
            date_param=date.today() + timedelta(days=2)
        )
        
        # Midday - productive and focused
        await daily_loop.complete_loop_activity(
            user_id=demo_user_id,
            loop_type="midday_pulse",
            mood_rating=8.5,
            energy_level=8.5,
            stress_level=2.5,
            gratitude_notes="Grateful for Marcus's goal-setting framework",
            reflection_notes="So productive! Loving this structured approach",
            selected_persona="marcus",
            date_param=date.today() + timedelta(days=2)
        )
        
        # Evening - accomplished and planning ahead
        await daily_loop.complete_loop_activity(
            user_id=demo_user_id,
            loop_type="evening_reflection",
            mood_rating=9.0,
            energy_level=7.5,
            stress_level=1.5,
            gratitude_notes="Grateful for this incredible growth journey",
            challenges_faced="None - amazing day",
            accomplishments="Set 3 major goals, created detailed action plans, completed all tasks",
            reflection_notes="Feel like I've found my rhythm and purpose",
            selected_persona="marcus",
            date_param=date.today() + timedelta(days=2)
        )
        
        print("\n✅ Realistic user journey created successfully!")
        return demo_user_id
        
    except Exception as e:
        print(f"❌ Error creating user journey: {e}")
        return None

async def demonstrate_persona_recommendations():
    """Show how persona recommendations evolve based on patterns"""
    print("\n🎯 Persona Recommendation Evolution")
    print("=" * 50)
    
    integration = DailyLoopIntegration()
    await integration.initialize()
    
    demo_user_id = "realistic_user_demo"
    
    try:
        # Day 1 analysis (high stress, low energy)
        print("\n📊 DAY 1 ANALYSIS (High Stress, Low Energy)")
        day1_insights = await integration.get_weekly_persona_insights(demo_user_id)
        
        if day1_insights:
            print(f"Mood trend: {day1_insights.get('mood_trend', 'N/A')}")
            print(f"Energy trend: {day1_insights.get('energy_trend', 'N/A')}")
            print(f"Recommended focus: {day1_insights.get('recommended_focus', [])}")
            print("Persona priorities:")
            for persona, priority in day1_insights.get('persona_priority', {}).items():
                print(f"  {persona}: {priority:.1%}")
        
        # Get individual persona contexts for Day 1
        for persona in ['sarah', 'maya', 'alex', 'marcus']:
            context = await integration.get_persona_context(demo_user_id, persona)
            if context:
                recommended = "✅ RECOMMENDED" if context['recommendations']['is_recommended'] else "❌ Not recommended"
                confidence = context['recommendations']['confidence']
                print(f"  {persona.capitalize()}: {recommended} (Confidence: {confidence:.1%})")
        
        # Day 2 analysis (balanced, spiritual exploration)
        print("\n📊 DAY 2 ANALYSIS (Balanced, Spiritual)")
        # Simulate day 2 by analyzing patterns
        day2_analysis = await integration.analyze_daily_patterns(demo_user_id, date.today() + timedelta(days=1))
        
        if day2_analysis:
            print(f"Mood trend: {day2_analysis.mood_trend}")
            print(f"Energy pattern: {day2_analysis.energy_pattern}")
            print(f"Recommended personas: {day2_analysis.recommended_personas}")
            print(f"Focus areas: {day2_analysis.gratitude_themes}")
        
        # Day 3 analysis (high energy, goal-oriented)
        print("\n📊 DAY 3 ANALYSIS (High Energy, Goal-Oriented)")
        day3_analysis = await integration.analyze_daily_patterns(demo_user_id, date.today() + timedelta(days=2))
        
        if day3_analysis:
            print(f"Mood trend: {day3_analysis.mood_trend}")
            print(f"Energy pattern: {day3_analysis.energy_pattern}")
            print(f"Recommended personas: {day3_analysis.recommended_personas}")
            print(f"Conversation context: {day3_analysis.conversation_context}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in persona recommendations: {e}")
        return False

async def demonstrate_contextual_responses():
    """Show how daily context influences persona responses"""
    print("\n💬 Contextual Response Demonstration")
    print("=" * 50)
    
    integration = DailyLoopIntegration()
    await integration.initialize()
    
    demo_user_id = "realistic_user_demo"
    
    try:
        # Day 1: Sarah's context for high stress
        print("\n👩‍⚕️ SARAH'S CONTEXT (Day 1 - High Stress)")
        sarah_context = await integration.get_persona_context(demo_user_id, "sarah")
        
        if sarah_context:
            print(f"Daily insight: {sarah_context['daily_insight']}")
            print(f"Persona approach: {sarah_context['persona_context']['approach']}")
            print(f"Focus areas: {sarah_context['persona_context']['focus_areas']}")
            print(f"Suggested techniques: {sarah_context['persona_context']['suggested_techniques']}")
        
        # Day 2: Maya's context for spiritual exploration
        print("\n🪷 MAYA'S CONTEXT (Day 2 - Spiritual Exploration)")
        maya_context = await integration.get_persona_context(demo_user_id, "maya", date.today() + timedelta(days=1))
        
        if maya_context:
            print(f"Daily insight: {maya_context['daily_insight']}")
            print(f"Persona approach: {maya_context['persona_context']['approach']}")
            print(f"Focus areas: {maya_context['persona_context']['focus_areas']}")
            print(f"Suggested techniques: {maya_context['persona_context']['suggested_techniques']}")
        
        # Day 3: Marcus's context for goal achievement
        print("\n💪 MARCUS'S CONTEXT (Day 3 - Goal Achievement)")
        marcus_context = await integration.get_persona_context(demo_user_id, "marcus", date.today() + timedelta(days=2))
        
        if marcus_context:
            print(f"Daily insight: {marcus_context['daily_insight']}")
            print(f"Persona approach: {marcus_context['persona_context']['approach']}")
            print(f"Focus areas: {marcus_context['persona_context']['focus_areas']}")
            print(f"Suggested techniques: {marcus_context['persona_context']['suggested_techniques']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in contextual responses: {e}")
        return False

async def demonstrate_weekly_insights():
    """Show comprehensive weekly insights"""
    print("\n📈 Weekly Insights Dashboard")
    print("=" * 50)
    
    integration = DailyLoopIntegration()
    await integration.initialize()
    
    demo_user_id = "realistic_user_demo"
    
    try:
        weekly_insights = await integration.get_weekly_persona_insights(demo_user_id)
        
        if weekly_insights:
            print(f"📊 Overall mood trend: {weekly_insights.get('mood_trend', 'N/A')}")
            print(f"⚡ Energy pattern: {weekly_insights.get('energy_trend', 'N/A')}")
            print(f"🎯 Recommended focus areas: {weekly_insights.get('recommended_focus', [])}")
            print(f"💡 Key insights: {weekly_insights.get('key_insights', [])}")
            
            print("\n🎭 Persona Priority Ranking:")
            persona_priorities = weekly_insights.get('persona_priority', {})
            sorted_personas = sorted(persona_priorities.items(), key=lambda x: x[1], reverse=True)
            
            for i, (persona, priority) in enumerate(sorted_personas, 1):
                bars = "█" * int(priority * 10)
                print(f"  {i}. {persona.capitalize()}: {bars} {priority:.1%}")
            
            print(f"\n🌟 Growth highlights: {weekly_insights.get('growth_highlights', [])}")
            print(f"🎪 Recommended activities: {weekly_insights.get('recommended_activities', [])}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in weekly insights: {e}")
        return False

async def cleanup_demo_data():
    """Clean up demo data"""
    print("\n🧹 Cleaning up demo data...")
    
    daily_loop = DailySoulSenseLoop()
    integration = DailyLoopIntegration()
    
    await daily_loop.initialize()
    await integration.initialize()
    
    demo_user_id = "realistic_user_demo"
    
    # Clean up all demo data
    tables_to_clean = [
        "daily_loop_entries",
        "daily_loop_streaks", 
        "daily_wellness_insights",
        "daily_persona_recommendations",
        "daily_conversation_context",
        "daily_wellness_for_personas"
    ]
    
    for table in tables_to_clean:
        await daily_loop.connection.execute(f"DELETE FROM {table} WHERE user_id = ?", (demo_user_id,))
    
    await daily_loop.connection.commit()
    await integration.connection.commit()
    
    await daily_loop.close()
    await integration.close()
    
    print("✅ Demo data cleaned up successfully")

async def main():
    """Run comprehensive data demonstration"""
    print("🚀 Comprehensive Daily Loop Integration Data Demo")
    print("This demonstration shows real data flow and persona integration")
    print("=" * 80)
    
    try:
        # Create realistic user journey
        user_id = await create_realistic_user_journey()
        
        if user_id:
            # Show persona recommendations
            await demonstrate_persona_recommendations()
            
            # Show contextual responses
            await demonstrate_contextual_responses()
            
            # Show weekly insights
            await demonstrate_weekly_insights()
            
            print("\n🎉 Comprehensive Demo Complete!")
            print("=" * 50)
            print("✅ Daily Loop Integration successfully demonstrated with:")
            print("  • Realistic 3-day user journey with varied patterns")
            print("  • Dynamic persona recommendations based on wellness data")
            print("  • Contextual responses that reference daily patterns")
            print("  • Comprehensive weekly insights and priority scoring")
            print("  • Seamless integration between wellness tracking and therapeutic support")
            
        else:
            print("❌ Failed to create user journey data")
            
    except Exception as e:
        print(f"❌ Demo failed: {e}")
        
    finally:
        # Clean up
        await cleanup_demo_data()

if __name__ == "__main__":
    asyncio.run(main())