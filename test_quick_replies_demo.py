#!/usr/bin/env python3
"""
SoulSense AI - Dynamic Quick Replies Demo
Complete test of the context-aware suggestion system
"""

import asyncio
import sys
import os
import json
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

async def demo_quick_replies():
    print("🌟 SoulSense Dynamic Quick Replies Demo")
    print("=" * 60)
    
    from core.quick_reply_engine import QuickReplyEngine, IntentType
    
    engine = QuickReplyEngine()
    
    # Test scenarios with different personas and contexts
    scenarios = [
        {
            "persona": "maya",
            "message": "I'm feeling really anxious and my mind is racing",
            "context": {"duration_minutes": 3, "phase": "start"}
        },
        {
            "persona": "sarah", 
            "message": "I keep having negative thoughts about myself",
            "context": {"duration_minutes": 8, "phase": "exploration"}
        },
        {
            "persona": "alex",
            "message": "I just got promoted at work! I'm so excited!",
            "context": {"duration_minutes": 5, "phase": "middle"}
        },
        {
            "persona": "marcus",
            "message": "I want to get healthier but I don't know where to start",
            "context": {"duration_minutes": 12, "phase": "deepening"}
        },
        {
            "persona": "maya",
            "message": "I feel disconnected from myself lately",
            "context": {"duration_minutes": 15, "phase": "resolution"}
        }
    ]
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n📝 Scenario {i}: {scenario['persona'].title()}")
        print(f"User Message: \"{scenario['message']}\"")
        print(f"Context: {scenario['context']}")
        
        # Classify intent
        intent = engine.classify_intent(scenario['message'])
        print(f"Detected Intent: {intent.value}")
        
        # Generate quick replies
        quick_replies = engine.generate_quick_replies(
            persona_id=scenario['persona'],
            user_message=scenario['message'],
            conversation_history=[],
            conversation_context=scenario['context']
        )
        
        print("Dynamic Quick Replies:")
        for j, reply in enumerate(quick_replies, 1):
            action_desc = ""
            if reply.action_data:
                action_desc = f" | {reply.action_data}"
            
            print(f"  {j}. {reply.emoji} \"{reply.text}\" ")
            print(f"     Action: {reply.action_type}{action_desc}")
            print(f"     Priority: {reply.priority}/5")
        
        print("-" * 50)
    
    # Test persona-specific patterns
    print("\n🎭 Persona Personality Tests")
    print("=" * 30)
    
    test_message = "I'm feeling stressed about everything"
    
    for persona in ["maya", "sarah", "alex", "marcus"]:
        replies = engine.generate_quick_replies(
            persona_id=persona,
            user_message=test_message,
            conversation_history=[],
            conversation_context={"duration_minutes": 5}
        )
        
        print(f"\n{persona.title()}'s response to stress:")
        for reply in replies:
            print(f"  {reply.emoji} {reply.text} ({reply.action_type})")
    
    print("\n" + "=" * 60)
    print("🎉 Dynamic Quick Replies Demo Complete!")
    print("\nKey Features Demonstrated:")
    print("✅ Context-aware intent classification")
    print("✅ Persona-specific suggestion styles") 
    print("✅ Action-oriented quick replies")
    print("✅ Priority-based suggestion ranking")
    print("✅ Emotional alignment with user state")

if __name__ == "__main__":
    asyncio.run(demo_quick_replies())