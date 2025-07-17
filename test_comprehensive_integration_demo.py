#!/usr/bin/env python3
"""
Comprehensive Daily Loop Integration Demo
Demonstrates the complete integration between daily wellness patterns and persona responses
"""

import asyncio
import json
from datetime import datetime, date, timedelta
from backend.core.daily_loop import DailySoulSenseLoop
from backend.core.daily_loop_integration import DailyLoopIntegration
from backend.personas.maya_handler import MayaHandler
from backend.personas.sarah_handler import SarahHandler
from backend.personas.alex_handler import AlexHandler
from backend.personas.marcus_handler import MarcusHandler
from backend.core.emotion_engine import EmotionEngine
from backend.core.memory_system import MemorySystem

async def demo_daily_loop_persona_integration():
    """Demo showing how daily patterns influence persona responses"""
    print("🌟 Daily Loop + Persona Integration Demo")
    print("=" * 60)
    
    # Initialize all systems
    daily_loop = DailySoulSenseLoop()
    integration = DailyLoopIntegration()
    maya_handler = MayaHandler()
    sarah_handler = SarahHandler()
    alex_handler = AlexHandler()
    marcus_handler = MarcusHandler()
    emotion_engine = EmotionEngine()
    memory_system = MemorySystem()
    
    await daily_loop.initialize()
    await integration.initialize()
    await emotion_engine.initialize()
    await memory_system.initialize()
    
    demo_user_id = "demo_user_integration"
    
    try:
        # Scenario 1: User has a stressful morning and declining energy
        print("\n📋 SCENARIO 1: Stressful Morning + Low Energy")
        print("User completes morning check-in with high stress and low energy")
        
        # Create morning entry
        await daily_loop.complete_loop_activity(
            user_id=demo_user_id,
            loop_type="morning_checkin",
            mood_rating=3.5,
            energy_level=2.0,
            stress_level=8.5,
            gratitude_notes="Grateful for my morning coffee",
            goals_for_day="Just survive the day and try to reduce stress",
            reflection_notes="Woke up with intense anxiety about work deadlines",
            selected_persona="sarah"
        )
        
        # Get persona recommendations
        maya_context = await integration.get_persona_context(demo_user_id, "maya")
        sarah_context = await integration.get_persona_context(demo_user_id, "sarah")
        
        print(f"\n🪷 Maya's recommendation: {'✅ HIGHLY RECOMMENDED' if maya_context['recommendations']['is_recommended'] else '❌ Not recommended'}")
        print(f"   Confidence: {maya_context['recommendations']['confidence']:.2f}")
        print(f"   Approach: {maya_context['persona_context']['approach']}")
        print(f"   Suggested techniques: {maya_context['persona_context']['suggested_techniques']}")
        
        print(f"\n👩‍⚕️ Sarah's recommendation: {'✅ HIGHLY RECOMMENDED' if sarah_context['recommendations']['is_recommended'] else '❌ Not recommended'}")
        print(f"   Confidence: {sarah_context['recommendations']['confidence']:.2f}")
        print(f"   Approach: {sarah_context['persona_context']['approach']}")
        print(f"   Focus areas: {sarah_context['persona_context']['focus_areas']}")
        
        # Scenario 2: User messages Maya about feeling overwhelmed
        print("\n💬 SCENARIO 2: User Chats with Maya")
        user_message = "I'm feeling so overwhelmed and anxious right now. Everything feels like too much."
        
        # Analyze emotion
        emotional_context = await emotion_engine.analyze_emotion(user_message)
        memory = await memory_system.get_conversation_memory(demo_user_id, "maya")
        
        # Generate Maya's response with daily context
        maya_response = await maya_handler.generate_response(
            user_message,
            [],
            emotional_context,
            memory,
            maya_context
        )
        
        print(f"\n🪷 Maya's contextual response:")
        print(f"   \"{maya_response.content}\"")
        print(f"   Activated features: {maya_response.features_activated}")
        print(f"   Suggestions: {maya_response.suggestions}")
        
        # Scenario 3: Midday improvement
        print("\n📋 SCENARIO 3: Midday Improvement")
        print("User does breathing exercises and reports feeling better")
        
        # Create midday entry
        await daily_loop.complete_loop_activity(
            user_id=demo_user_id,
            loop_type="midday_pulse",
            mood_rating=6.0,
            energy_level=5.5,
            stress_level=5.0,
            gratitude_notes="Grateful for the breathing exercises with Maya",
            reflection_notes="Feeling much more centered after our breathing session",
            selected_persona="maya"
        )
        
        # Get updated context
        updated_maya_context = await integration.get_persona_context(demo_user_id, "maya")
        marcus_context = await integration.get_persona_context(demo_user_id, "marcus")
        
        print(f"\n🪷 Updated Maya context:")
        print(f"   Mood trend: {updated_maya_context['daily_insight']['mood_trend']}")
        print(f"   Energy pattern: {updated_maya_context['daily_insight']['energy_pattern']}")
        print(f"   Conversation context: {updated_maya_context['daily_insight']['conversation_context']}")
        
        print(f"\n💪 Marcus becomes relevant:")
        print(f"   Recommended: {'✅ YES' if marcus_context['recommendations']['is_recommended'] else '❌ No'}")
        print(f"   Confidence: {marcus_context['recommendations']['confidence']:.2f}")
        print(f"   Approach: {marcus_context['persona_context']['approach']}")
        
        # Scenario 4: User switches to Marcus for goal setting
        print("\n💬 SCENARIO 4: User Switches to Marcus")
        user_message_marcus = "I'm feeling better now. Can you help me set some goals for the rest of the day?"
        
        # Analyze emotion
        emotional_context_marcus = await emotion_engine.analyze_emotion(user_message_marcus)
        memory_marcus = await memory_system.get_conversation_memory(demo_user_id, "marcus")
        
        # Generate Marcus's response with daily context
        marcus_response = await marcus_handler.generate_response(
            user_message_marcus,
            [],
            emotional_context_marcus,
            memory_marcus,
            marcus_context
        )
        
        print(f"\n💪 Marcus's contextual response:")
        print(f"   \"{marcus_response.content}\"")
        print(f"   Activated features: {marcus_response.features_activated}")
        print(f"   Suggestions: {marcus_response.suggestions}")
        
        # Scenario 5: Evening reflection with progress
        print("\n📋 SCENARIO 5: Evening Reflection")
        print("User reflects on the day with accomplishments")
        
        # Create evening entry
        await daily_loop.complete_loop_activity(
            user_id=demo_user_id,
            loop_type="evening_reflection",
            mood_rating=7.5,
            energy_level=6.0,
            stress_level=3.5,
            gratitude_notes="Grateful for Maya's breathing guidance and Marcus's goal setting",
            challenges_faced="Morning anxiety was really tough",
            accomplishments="Completed 3 breathing sessions, set clear goals, finished work project",
            reflection_notes="What started as a terrible day turned into a productive and peaceful one",
            selected_persona="alex"
        )
        
        # Get final daily analysis
        final_analysis = await integration.analyze_daily_patterns(demo_user_id)
        
        print(f"\n📊 Final Daily Analysis:")
        print(f"   Mood journey: {final_analysis.mood_trend}")
        print(f"   Energy pattern: {final_analysis.energy_pattern}")
        print(f"   Stress indicators: {final_analysis.stress_indicators}")
        print(f"   Gratitude themes: {final_analysis.gratitude_themes}")
        print(f"   Accomplishments: {final_analysis.accomplishment_highlights}")
        print(f"   Recommended personas: {final_analysis.recommended_personas}")
        
        # Scenario 6: Next day - patterns inform greeting
        print("\n📋 SCENARIO 6: Next Day Continuation")
        print("User returns and patterns influence persona greeting")
        
        # Simulate next day
        tomorrow = date.today() + timedelta(days=1)
        
        # Create new morning entry
        await daily_loop.complete_loop_activity(
            user_id=demo_user_id,
            loop_type="morning_checkin",
            mood_rating=6.5,
            energy_level=7.0,
            stress_level=4.0,
            gratitude_notes="Grateful for yesterday's turnaround and the support I received",
            goals_for_day="Continue the positive momentum from yesterday",
            reflection_notes="Feeling optimistic and ready to build on yesterday's success",
            selected_persona="marcus",
            date_param=tomorrow
        )
        
        # Get context for new day
        new_day_context = await integration.get_persona_context(demo_user_id, "marcus", tomorrow)
        
        print(f"\n💪 Marcus on the new day:")
        print(f"   Recent patterns: {new_day_context.get('recent_patterns', {})}")
        print(f"   Recommended: {'✅ YES' if new_day_context['recommendations']['is_recommended'] else '❌ No'}")
        print(f"   Confidence: {new_day_context['recommendations']['confidence']:.2f}")
        
        # Generate greeting with context
        greeting_message = "Good morning! How are you feeling today?"
        emotional_context_greeting = await emotion_engine.analyze_emotion(greeting_message)
        memory_greeting = await memory_system.get_conversation_memory(demo_user_id, "marcus")
        
        marcus_greeting = await marcus_handler.generate_response(
            greeting_message,
            [],
            emotional_context_greeting,
            memory_greeting,
            new_day_context
        )
        
        print(f"\n💪 Marcus's contextual greeting:")
        print(f"   \"{marcus_greeting.content}\"")
        
        print("\n🎉 Integration Demo Complete!")
        print("The system successfully:")
        print("✅ Tracked daily wellness patterns")
        print("✅ Recommended appropriate personas based on patterns")
        print("✅ Provided contextual responses using daily insights")
        print("✅ Maintained continuity across days")
        print("✅ Adapted persona priorities based on user progress")
        
        return True
        
    except Exception as e:
        print(f"❌ Demo failed with error: {e}")
        return False
        
    finally:
        # Clean up
        await daily_loop.connection.execute("DELETE FROM daily_loop_entries WHERE user_id = ?", (demo_user_id,))
        await daily_loop.connection.execute("DELETE FROM daily_loop_streaks WHERE user_id = ?", (demo_user_id,))
        await daily_loop.connection.execute("DELETE FROM daily_wellness_insights WHERE user_id = ?", (demo_user_id,))
        await daily_loop.connection.commit()
        
        await daily_loop.close()
        await integration.close()
        await emotion_engine.close()
        await memory_system.close()

def display_integration_benefits():
    """Display the benefits of the daily loop integration"""
    print("\n🌟 Daily Loop Integration Benefits")
    print("=" * 50)
    
    benefits = [
        "🎯 Personalized Persona Recommendations: System suggests the most suitable persona based on current mood and energy patterns",
        "🧠 Contextual Responses: Personas reference daily wellness patterns in their responses for more relevant support",
        "📈 Progress Tracking: Continuous monitoring of mood, energy, and stress trends across conversations",
        "🔄 Adaptive Support: Persona priorities adjust based on user's changing needs throughout the day",
        "💡 Insight-Driven Interactions: Daily patterns inform conversation topics and therapeutic approaches",
        "🌱 Continuity Across Sessions: Previous day insights influence next day interactions for seamless support",
        "⚡ Smart Feature Activation: Persona-specific features activate based on detected patterns and needs",
        "🎨 Tailored Therapeutic Approaches: Each persona adapts their communication style based on daily context"
    ]
    
    for benefit in benefits:
        print(f"  {benefit}")
    
    print("\n🔮 Future Enhancements:")
    enhancements = [
        "📊 Weekly Pattern Analysis: Identify longer-term trends and seasonal variations",
        "🎪 Persona Collaboration: Enable personas to reference each other's interactions",
        "🔔 Proactive Check-ins: System-initiated conversations based on concerning patterns",
        "📱 Smart Notifications: Timely reminders based on optimal interaction windows",
        "🌈 Mood Prediction: Anticipate difficult days and prepare supportive responses",
        "🎯 Goal Integration: Connect daily loop patterns with longer-term therapeutic goals"
    ]
    
    for enhancement in enhancements:
        print(f"  {enhancement}")

async def main():
    """Run the comprehensive integration demo"""
    print("🚀 Starting Comprehensive Daily Loop Integration Demo")
    print("This demo shows how daily wellness patterns enhance persona interactions")
    print("=" * 80)
    
    # Show integration benefits
    display_integration_benefits()
    
    # Run the demo
    success = await demo_daily_loop_persona_integration()
    
    if success:
        print("\n🎉 Demo completed successfully!")
        print("The Daily Loop Integration system is fully operational and enhancing persona interactions.")
    else:
        print("\n❌ Demo encountered issues. Please check the output above.")

if __name__ == "__main__":
    asyncio.run(main())