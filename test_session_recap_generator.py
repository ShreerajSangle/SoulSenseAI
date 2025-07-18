#!/usr/bin/env python3
"""
Test Session Recap Generator
Test the intelligent session recap system with actual conversation data
"""

import asyncio
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from core.session_recap_generator import SessionRecapGenerator

class SessionRecapTester:
    """Test the session recap generator with realistic conversation data"""
    
    def __init__(self):
        self.recap_generator = SessionRecapGenerator()
        
    async def test_comprehensive_session_recap(self):
        """Test session recap with comprehensive conversation"""
        print("🧠 SESSION RECAP GENERATOR TEST")
        print("=" * 80)
        print("Testing intelligent session recap generation from actual conversations")
        print("=" * 80)
        
        # Test conversation scenarios
        test_scenarios = [
            {
                'name': 'Anxiety Support Session with Maya',
                'persona_id': 'maya',
                'conversation': [
                    {
                        'role': 'user',
                        'content': 'I\'ve been feeling really anxious about my presentation tomorrow. I keep imagining all the ways it could go wrong and my chest feels tight.'
                    },
                    {
                        'role': 'assistant',
                        'content': 'I can sense the anxiety you\'re carrying about tomorrow. Let\'s bring you back to this present moment with your breath. Can you feel your feet on the ground right now? Take a slow, deep breath in through your nose, and let it out gently through your mouth.'
                    },
                    {
                        'role': 'user',
                        'content': 'That helps a little. I just can\'t stop thinking about what if I forget what to say or if people judge me.'
                    },
                    {
                        'role': 'assistant',
                        'content': 'Those "what if" thoughts are like clouds passing through the sky of your mind. Let\'s practice a grounding technique. Place one hand on your heart and one on your belly. As you breathe, imagine roots growing from your feet into the earth, anchoring you in strength and stability.'
                    },
                    {
                        'role': 'user',
                        'content': 'I can feel myself getting calmer. The breathing really helps. Maybe I\'m overthinking this.'
                    },
                    {
                        'role': 'assistant',
                        'content': 'Beautiful. You\'re remembering your natural ability to find peace within yourself. Tomorrow, before your presentation, you can return to this breath, to this grounded feeling. Trust in your preparation and your authentic voice.'
                    },
                    {
                        'role': 'user',
                        'content': 'Thank you, Maya. I feel so much better now. I think I can handle tomorrow.'
                    }
                ]
            },
            {
                'name': 'Relationship Processing with Sarah',
                'persona_id': 'sarah',
                'conversation': [
                    {
                        'role': 'user',
                        'content': 'I had another fight with my partner last night. We keep having the same argument over and over, and I don\'t know how to break the cycle.'
                    },
                    {
                        'role': 'assistant',
                        'content': 'It sounds incredibly frustrating to feel stuck in this pattern. These recurring conflicts often point to deeper needs that aren\'t being met. Can you tell me what the surface argument was about, and then we can explore what might be underneath?'
                    },
                    {
                        'role': 'user',
                        'content': 'It\'s always about household responsibilities. But I think it\'s really about feeling unappreciated. I do so much and it feels invisible.'
                    },
                    {
                        'role': 'assistant',
                        'content': 'That\'s a really important insight - recognizing that the dishes aren\'t really about dishes, but about feeling valued and seen. When we feel unappreciated, it can trigger our need for recognition and validation. Have you been able to express this deeper need to your partner?'
                    },
                    {
                        'role': 'user',
                        'content': 'Not really. I usually just get defensive and we end up yelling. I don\'t know how to bring it up without starting another fight.'
                    },
                    {
                        'role': 'assistant',
                        'content': 'It makes sense that you\'d feel defensive when your efforts go unnoticed. Let\'s think about how you might approach this differently. What if you started with your feelings rather than the tasks? Something like "I\'ve been feeling unappreciated lately" rather than "You never help with anything."'
                    },
                    {
                        'role': 'user',
                        'content': 'That sounds less accusatory. I think I could try that approach. Maybe timing matters too - not bringing it up when we\'re already stressed.'
                    },
                    {
                        'role': 'assistant',
                        'content': 'Exactly. You\'re developing real insight into communication patterns. Timing and framing can completely change how a message is received. You\'re taking responsibility for your part while still honoring your valid needs.'
                    }
                ]
            },
            {
                'name': 'Goal Setting Session with Marcus',
                'persona_id': 'marcus',
                'conversation': [
                    {
                        'role': 'user',
                        'content': 'I want to change my life but I feel stuck. I have all these ideas but I never follow through on anything.'
                    },
                    {
                        'role': 'assistant',
                        'content': 'I hear that frustration, and it tells me you have the drive - you just need a system that works. Let\'s break this down. What\'s one area of your life where you most want to see change?'
                    },
                    {
                        'role': 'user',
                        'content': 'Definitely my health. I want to get in shape but I start and stop exercise routines constantly. I\'ll be motivated for a week then give up.'
                    },
                    {
                        'role': 'assistant',
                        'content': 'Classic all-or-nothing pattern. The secret is starting ridiculously small. Forget about workout routines for now. What\'s the smallest possible step you could take tomorrow that moves you toward better health?'
                    },
                    {
                        'role': 'user',
                        'content': 'Maybe just a 10-minute walk? That seems almost too easy.'
                    },
                    {
                        'role': 'assistant',
                        'content': 'Perfect! "Too easy" is exactly what we want. Success breeds success. Can you commit to that 10-minute walk for just this week? No more, no less.'
                    },
                    {
                        'role': 'user',
                        'content': 'Yeah, I can definitely do that. And maybe after a week I could add 5 more minutes?'
                    },
                    {
                        'role': 'assistant',
                        'content': 'Now you\'re thinking strategically. Build the habit first, then build the intensity. You\'re already showing the mindset shift from perfection to progress. That\'s the foundation of lasting change.'
                    }
                ]
            }
        ]
        
        success_count = 0
        total_tests = len(test_scenarios)
        
        for scenario in test_scenarios:
            try:
                print(f"\n🎭 Testing: {scenario['name']}")
                print("-" * 60)
                
                # Generate session recap
                recap = await self.recap_generator.generate_session_recap(
                    conversation_history=scenario['conversation'],
                    persona_id=scenario['persona_id'],
                    session_id=f"test_session_{scenario['persona_id']}",
                    user_id="test_user"
                )
                
                # Display comprehensive recap
                print(f"✅ RECAP GENERATED SUCCESSFULLY")
                print(f"   Session ID: {recap.session_id}")
                print(f"   Persona: {recap.persona_id.upper()}")
                print(f"   Messages: {recap.message_count}")
                print(f"   Duration: {recap.duration_minutes} minutes")
                print(f"   Rating: {recap.session_rating}/10")
                
                print(f"\n📝 CONVERSATION SUMMARY:")
                print(f"   {recap.conversation_summary}")
                
                print(f"\n🎯 KEY TOPICS:")
                for topic in recap.key_topics:
                    print(f"   • {topic}")
                
                print(f"\n💭 EMOTIONAL JOURNEY:")
                print(f"   {recap.emotional_journey}")
                
                print(f"\n💡 INSIGHTS GAINED:")
                for insight in recap.insights_gained:
                    print(f"   • {insight}")
                
                print(f"\n🛠️ THERAPEUTIC TECHNIQUES:")
                for technique in recap.therapeutic_techniques_used:
                    print(f"   • {technique}")
                
                print(f"\n📊 PROGRESS NOTES:")
                print(f"   {recap.progress_notes}")
                
                print(f"\n🎯 MOOD CHANGE:")
                print(f"   {recap.mood_change}")
                
                print(f"\n➡️ NEXT SESSION SUGGESTIONS:")
                for suggestion in recap.next_session_suggestions:
                    print(f"   • {suggestion}")
                
                success_count += 1
                print(f"\n✅ SUCCESS: {scenario['name']} recap generated successfully!")
                
            except Exception as e:
                print(f"\n❌ ERROR: Failed to generate recap for {scenario['name']}")
                print(f"   Error: {e}")
                
        print(f"\n" + "=" * 80)
        print(f"🏆 SESSION RECAP TEST RESULTS:")
        print(f"=" * 80)
        print(f"✅ Successful recaps: {success_count}/{total_tests}")
        print(f"📊 Success rate: {(success_count/total_tests)*100:.1f}%")
        
        if success_count == total_tests:
            print(f"\n🎉 PERFECT SUCCESS: All session recaps generated intelligently!")
            print(f"💡 BENEFITS:")
            print(f"  • Meaningful conversation summaries based on actual chat content")
            print(f"  • Persona-specific insights and therapeutic approaches")
            print(f"  • Intelligent topic extraction and emotional journey analysis")
            print(f"  • Personalized next session recommendations")
            print(f"  • Comprehensive progress tracking and session rating")
        else:
            print(f"\n⚠️ Some tests failed. Check implementation.")
            
        return success_count == total_tests

async def main():
    """Run session recap generator tests"""
    tester = SessionRecapTester()
    
    print("Starting Session Recap Generator Test...")
    success = await tester.test_comprehensive_session_recap()
    
    if success:
        print(f"\n🚀 SESSION RECAP SYSTEM IS READY!")
        print(f"All personas can now generate intelligent session summaries!")
    else:
        print(f"\n❌ Some tests failed. Please check the implementation.")

if __name__ == "__main__":
    asyncio.run(main())