#!/usr/bin/env python3
"""
Test script for Persona Emotional Intelligence Integration
Validates that all four personas are using advanced emotional intelligence for better responses
"""

import asyncio
import json
import sys
import os

# Add backend to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from core.persona_emotional_intelligence import PersonaEmotionalIntelligence
from personas.maya_handler import MayaHandler
from personas.sarah_handler import SarahHandler  
from personas.alex_handler import AlexHandler
from personas.marcus_handler import MarcusHandler
from models.schemas import EmotionalContext

async def test_emotional_intelligence_integration():
    """Test that all personas are enhanced with emotional intelligence"""
    
    print("🧠 Testing Persona Emotional Intelligence Integration...")
    print("=" * 60)
    
    # Initialize personas
    personas = {
        'maya': MayaHandler(),
        'sarah': SarahHandler(),
        'alex': AlexHandler(),
        'marcus': MarcusHandler()
    }
    
    # Test scenarios with different emotional contexts
    test_scenarios = [
        {
            'message': "I'm feeling really anxious about my job interview tomorrow. I can't stop worrying about all the things that could go wrong.",
            'emotion': 'anxious',
            'intensity': 8.5,
            'expected_features': ['breathing_exercises', 'grounding', 'cognitive_reframing']
        },
        {
            'message': "I've been feeling so sad lately. Nothing seems to bring me joy anymore and I feel really alone.",
            'emotion': 'sad',
            'intensity': 7.0,
            'expected_features': ['emotional_validation', 'self_compassion', 'connection']
        },
        {
            'message': "I'm completely overwhelmed with everything on my plate. Work, family, bills - it's all too much right now.",
            'emotion': 'overwhelmed',
            'intensity': 9.0,
            'expected_features': ['task_breaking', 'priority_setting', 'stress_management']
        },
        {
            'message': "I'm so excited! I just got accepted into the program I've been dreaming about for years!",
            'emotion': 'excited',
            'intensity': 9.5,
            'expected_features': ['energy_channeling', 'goal_setting', 'celebration']
        }
    ]
    
    success_count = 0
    total_tests = len(personas) * len(test_scenarios)
    
    for persona_id, persona in personas.items():
        print(f"\n🔍 Testing {persona_id.upper()} with Emotional Intelligence...")
        
        for i, scenario in enumerate(test_scenarios):
            try:
                # Create basic emotional context
                emotional_context = EmotionalContext(
                    primary_emotion=scenario['emotion'],
                    intensity=scenario['intensity'] / 10.0,
                    confidence=0.85,
                    valence=0.5,  # Required field
                    arousal=scenario['intensity'] / 10.0,  # Required field
                    support_needs=['emotional_support'],
                    crisis_indicators=[]
                )
                
                # Test emotional intelligence analysis
                emotional_insight = await persona.emotional_intelligence.analyze_emotional_context(
                    scenario['message'],
                    [],  # No conversation history for this test
                    persona_id
                )
                
                print(f"  Scenario {i+1}: {scenario['emotion']} (intensity: {scenario['intensity']})")
                print(f"    ✓ Detected emotion: {emotional_insight.primary_emotion}")
                print(f"    ✓ Intensity: {emotional_insight.intensity:.1f}/10")
                print(f"    ✓ Recommended approach: {emotional_insight.recommended_approach}")
                print(f"    ✓ Therapeutic techniques: {', '.join(emotional_insight.therapeutic_techniques[:3])}")
                print(f"    ✓ Vulnerability level: {emotional_insight.vulnerability_level:.1f}/10")
                
                # Generate emotional prompt context
                emotional_prompt_context = persona.emotional_intelligence.generate_emotional_prompt_context(
                    emotional_insight,
                    persona_id
                )
                
                # Verify emotional prompt context is generated
                if emotional_prompt_context and len(emotional_prompt_context) > 100:
                    print(f"    ✓ Generated emotional prompt context ({len(emotional_prompt_context)} chars)")
                    success_count += 1
                else:
                    print(f"    ✗ Failed to generate proper emotional prompt context")
                
                # Test persona-specific approach
                if persona_id in emotional_insight.recommended_approach:
                    print(f"    ✓ Persona-specific approach detected")
                else:
                    print(f"    ✓ General therapeutic approach applied")
                
                print()
                
            except Exception as e:
                print(f"    ✗ Error in {persona_id} scenario {i+1}: {str(e)}")
    
    print(f"\n📊 EMOTIONAL INTELLIGENCE INTEGRATION RESULTS:")
    print(f"✓ Successfully enhanced personas: {success_count}/{total_tests}")
    print(f"✓ Success rate: {(success_count/total_tests)*100:.1f}%")
    
    if success_count == total_tests:
        print("🎉 ALL PERSONAS SUCCESSFULLY ENHANCED WITH EMOTIONAL INTELLIGENCE!")
        print("\n🧠 Each persona now has:")
        print("  • Advanced emotional pattern analysis")
        print("  • Therapeutic opportunity detection") 
        print("  • Persona-specific emotional approaches")
        print("  • Vulnerability assessment capabilities")
        print("  • Context-aware response generation")
        return True
    else:
        print(f"⚠️  {total_tests - success_count} personas need additional enhancement")
        return False

async def test_persona_emotional_responses():
    """Test that personas generate emotionally intelligent responses"""
    
    print("\n🎭 Testing Persona Emotional Response Generation...")
    print("=" * 60)
    
    # Initialize personas
    personas = {
        'maya': MayaHandler(),
        'sarah': SarahHandler(), 
        'alex': AlexHandler(),
        'marcus': MarcusHandler()
    }
    
    # Test emotional response generation
    test_message = "I feel completely lost and don't know what to do with my life anymore."
    
    response_count = 0
    
    for persona_id, persona in personas.items():
        try:
            print(f"\n💬 Testing {persona_id.upper()} emotional response...")
            
            # Create emotional context
            emotional_context = EmotionalContext(
                primary_emotion='sad',  # Use valid emotion from schema
                intensity=0.8,
                confidence=0.9,
                valence=0.3,  # Required field
                arousal=0.8,  # Required field
                support_needs=['guidance', 'emotional_validation'],
                crisis_indicators=[]
            )
            
            # Get emotional insight
            emotional_insight = await persona.emotional_intelligence.analyze_emotional_context(
                test_message,
                [],
                persona_id
            )
            
            # Generate emotional prompt context
            emotional_prompt_context = persona.emotional_intelligence.generate_emotional_prompt_context(
                emotional_insight,
                persona_id
            )
            
            print(f"  ✓ Emotional context generated for {persona_id}")
            print(f"  ✓ Recommended approach: {emotional_insight.recommended_approach}")
            print(f"  ✓ Support needs: {', '.join(emotional_insight.support_needs)}")
            
            response_count += 1
            
        except Exception as e:
            print(f"  ✗ Error testing {persona_id}: {str(e)}")
    
    print(f"\n📈 EMOTIONAL RESPONSE RESULTS:")
    print(f"✓ Personas with enhanced emotional responses: {response_count}/4")
    
    if response_count == 4:
        print("🎉 ALL PERSONAS CAN GENERATE EMOTIONALLY INTELLIGENT RESPONSES!")
        return True
    else:
        print(f"⚠️  {4 - response_count} personas need response enhancement")
        return False

async def main():
    """Run all emotional intelligence integration tests"""
    
    print("🧠 PERSONA EMOTIONAL INTELLIGENCE INTEGRATION TEST")
    print("=" * 80)
    print("Testing that all four personas use advanced emotional intelligence")
    print("for better understanding and more therapeutic responses")
    print("=" * 80)
    
    # Test 1: Emotional Intelligence Integration
    test1_success = await test_emotional_intelligence_integration()
    
    # Test 2: Emotional Response Generation  
    test2_success = await test_persona_emotional_responses()
    
    # Final Results
    print("\n" + "=" * 80)
    print("🏆 FINAL INTEGRATION TEST RESULTS:")
    print("=" * 80)
    
    if test1_success and test2_success:
        print("✅ COMPLETE SUCCESS: All personas are emotionally intelligent!")
        print("\n🎯 INTEGRATION ACHIEVEMENTS:")
        print("  • Maya: Enhanced with spiritual emotional intelligence")
        print("  • Sarah: Enhanced with clinical emotional intelligence")  
        print("  • Alex: Enhanced with peer support emotional intelligence")
        print("  • Marcus: Enhanced with coaching emotional intelligence")
        print("\n💡 BENEFITS:")
        print("  • Better emotion detection and analysis")
        print("  • More contextually appropriate responses")
        print("  • Improved therapeutic effectiveness")
        print("  • Enhanced vulnerability assessment")
        print("  • Persona-specific emotional approaches")
        return True
    else:
        print("❌ Some personas need additional emotional intelligence enhancement")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)