import os
# Add this block to load .env
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Please install python-dotenv: pip install python-dotenv")
    import sys; sys.exit(1)

import json
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import httpx
from pydantic import BaseModel

class ClaudeClient:
    """Claude API client for SoulSense AI"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY environment variable is required")
        
        self.base_url = "https://openrouter.ai/api/v1"
        self.model = "anthropic/claude-3-haiku"
        self.max_tokens = 1000
        self.temperature = 0.7
        
        # Initialize HTTP client
        self.client = httpx.AsyncClient(
            timeout=30.0,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://soulsense.ai",
                "X-Title": "SoulSense AI"
            }
        )
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        persona_id: str,
        system_prompt: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Send chat completion request to Claude API
        """
        try:
            # Prepare messages
            formatted_messages = []
            
            # Add system prompt if provided
            if system_prompt:
                formatted_messages.append({
                    "role": "system",
                    "content": system_prompt
                })
            
            # Add conversation messages
            formatted_messages.extend(messages)
            
            # Prepare request payload
            payload = {
                "model": self.model,
                "messages": formatted_messages,
                "max_tokens": max_tokens or self.max_tokens,
                "temperature": temperature or self.temperature,
                "stream": False
            }
            
            # Make API request
            response = await self.client.post(
                f"{self.base_url}/chat/completions",
                json=payload
            )
            
            response.raise_for_status()
            data = response.json()
            
            # Extract response
            if "choices" in data and len(data["choices"]) > 0:
                content = data["choices"][0]["message"]["content"]
                
                return {
                    "success": True,
                    "content": content,
                    "usage": data.get("usage", {}),
                    "model": data.get("model", self.model)
                }
            else:
                return {
                    "success": False,
                    "error": "No response from Claude API",
                    "content": "I apologize, but I'm having trouble responding right now. Please try again."
                }
                
        except httpx.HTTPStatusError as e:
            error_msg = f"HTTP error {e.response.status_code}"
            try:
                error_data = e.response.json()
                if "error" in error_data:
                    error_msg = error_data["error"].get("message", error_msg)
            except:
                pass
            
            return {
                "success": False,
                "error": error_msg,
                "content": "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment."
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content": "I apologize, but I'm having trouble connecting right now. Please try again."
            }
    
    def get_persona_system_prompt(self, persona_id: str, user_context: Optional[Dict] = None) -> str:
        """Get system prompt for specific persona"""
        
        base_context = "You are a compassionate AI assistant in the SoulSense mental health application. "
        
        persona_prompts = {
            "sarah": f"""
            {base_context}You are Dr. Sarah, a warm and professional clinical therapist specializing in Cognitive Behavioral Therapy (CBT).
            
            Your approach:
            - Use CBT techniques like cognitive reframing, thought records, and behavioral activation
            - Provide gentle, professional responses (2-3 sentences typically)
            - Ask thoughtful questions to help users explore their thoughts and feelings
            - Validate emotions while helping identify unhelpful thinking patterns
            - Suggest practical coping strategies and homework assignments
            
            Response style:
            - Professional but warm and empathetic
            - Use phrases like "I notice that..." or "It sounds like..."
            - Keep responses concise but meaningful
            - Always validate the user's experience first
            """,
            
            "alex": f"""
            {base_context}You are Alex, a relatable peer support specialist who offers friendship and understanding.
            
            Your approach:
            - Be like a supportive friend who truly gets it
            - Use informal, conversational language with appropriate emojis
            - Share relatable experiences and normalize struggles
            - Use humor therapy when appropriate (but be sensitive)
            - Focus on peer support and mutual understanding
            - Offer encouragement and "you're not alone" messages
            
            Response style:
            - Casual, friendly, and upbeat
            - Use emojis naturally (1-2 per response)
            - Phrases like "I totally get that" or "That's so valid"
            - Keep it real and authentic
            - Be the friend they need right now
            """,
            
            "marcus": f"""
            {base_context}You are Marcus, a confident life coach focused on goal-setting, productivity, and personal achievement.
            
            Your approach:
            - Be action-oriented and solution-focused
            - Help users set SMART goals and create actionable plans
            - Focus on strengths, resilience, and personal growth
            - Use motivational interviewing techniques
            - Provide structure and accountability
            - Help with time management and productivity
            
            Response style:
            - Confident, encouraging, and direct
            - Use phrases like "Let's focus on..." or "Here's what we can do..."
            - Be the coach who believes in their potential
            - Keep responses practical and actionable
            - Challenge users to grow (gently)
            """,
            
            "maya": f"""
            {base_context}You are Maya, a serene mindfulness guide specializing in meditation, breathwork, and spiritual wellness.
            
            Your approach:
            - Guide users through mindfulness and meditation practices
            - Offer breathing exercises and body awareness techniques
            - Focus on present-moment awareness and acceptance
            - Use gentle, soothing language
            - Integrate wisdom from various contemplative traditions
            - Help users connect with their inner wisdom
            
            Response style:
            - Calm, gentle, and spiritually grounded
            - Use phrases like "Take a moment to breathe..." or "Notice what arises..."
            - Speak with wisdom and serenity
            - Keep responses peaceful and centering
            - Be the guide to inner peace
            """
        }
        
        prompt = persona_prompts.get(persona_id, persona_prompts["sarah"])
        
        # Add user context if provided
        if user_context:
            context_additions = []
            if "recent_mood" in user_context:
                context_additions.append(f"The user's recent mood: {user_context['recent_mood']}")
            if "goals" in user_context:
                context_additions.append(f"Current goals: {', '.join(user_context['goals'])}")
            if "memory" in user_context:
                context_additions.append(f"Important context: {user_context['memory']}")
            
            if context_additions:
                prompt += f"\n\nAdditional context for this conversation:\n" + "\n".join(context_additions)
        
        prompt += f"\n\nCurrent date: {datetime.now().strftime('%Y-%m-%d')}"
        prompt += "\n\nRemember to be authentic, helpful, and therapeutically appropriate in all responses."
        
        return prompt
    
    async def get_persona_response(
        self,
        persona_id: str,
        user_message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        user_context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Get response from specific persona"""
        
        # Build conversation messages
        messages = []
        
        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history)
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        # Get system prompt
        system_prompt = self.get_persona_system_prompt(persona_id, user_context)
        
        # Get response from Claude
        response = await self.chat_completion(
            messages=messages,
            persona_id=persona_id,
            system_prompt=system_prompt
        )
        
        return response
    
    async def generate_quick_replies(self, persona_id: str, user_message: str, ai_response: str) -> List[str]:
        """Generate quick reply suggestions based on conversation context"""
        
        persona_quick_replies = {
            "sarah": [
                "Can you reframe that for me?",
                "I need to process this",
                "Help me understand",
                "What would you suggest?"
            ],
            "alex": [
                "That's so relatable",
                "Say that with a joke 😄",
                "I feel seen",
                "Tell me more"
            ],
            "marcus": [
                "Give me a plan",
                "What's the next step?",
                "Help me stay motivated",
                "Let's set a goal"
            ],
            "maya": [
                "Help me breathe through this",
                "Say that in a softer way",
                "I need to center myself",
                "Guide me through this"
            ]
        }
        
        return persona_quick_replies.get(persona_id, persona_quick_replies["sarah"])[:3]
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
    
    def __del__(self):
        """Cleanup on deletion"""
        if hasattr(self, 'client'):
            asyncio.create_task(self.client.aclose())