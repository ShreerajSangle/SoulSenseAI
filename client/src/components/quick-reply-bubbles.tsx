import React from 'react';
import { Button } from '@/components/ui/button';

interface QuickReplyBubblesProps {
  persona: 'dr_sarah' | 'alex' | 'marcus' | 'maya' | 'sarah';
  onReplySelect: (reply: string) => void;
  className?: string;
  lastAiMessage?: string;
  userEmotion?: string;
}

// Adaptive quick replies that change based on conversation context and emotional tone
const getAdaptiveReplies = (persona: string, lastAiMessage: string, userEmotion: string) => {
  const baseReplies = {
    sarah: {
      supportive: ["I feel heard", "That helps", "Tell me more", "Can you reframe that?", "I need to process this"],
      anxious: ["Help me calm down", "I'm still worried", "What if...", "That's scary", "I need grounding"],
      sad: ["That's heavy", "I'm still hurting", "How do I cope?", "This is hard", "I feel alone"],
      neutral: ["Tell me more", "How does that feel?", "What comes up for you?", "I'm listening", "Thank you"]
    },
    maya: {
      supportive: ["Let's breathe together", "I feel centered", "That's beautiful", "Say that softer", "I'm present"],
      anxious: ["Help me ground", "I need stillness", "Can we slow down?", "Breathe with me", "I'm scattered"],
      sad: ["Hold space for me", "I need gentleness", "That's tender", "Comfort me", "I'm fragile"],
      neutral: ["I hear you", "Share your wisdom", "What's alive in me?", "Guide me deeper", "I'm listening"]
    },
    alex: {
      supportive: ["You get me!", "That's so real", "I feel less alone", "Say that with joy", "You're the best"],
      anxious: ["I'm freaking out", "Talk me through this", "I need reassurance", "What if I can't?", "I'm scared"],
      sad: ["I'm really down", "This sucks", "Cheer me up?", "I feel empty", "I need a hug"],
      neutral: ["Tell me everything", "That's so you", "What's really going on?", "I'm here for it", "Real talk"]
    },
    marcus: {
      supportive: ["What's next?", "Let's do this", "I'm motivated", "Give me a plan", "I'm ready"],
      anxious: ["How do I handle this?", "What's my strategy?", "Break it down", "I need direction", "What would you do?"],
      sad: ["How do I bounce back?", "I feel stuck", "What's my path forward?", "I need hope", "Help me rebuild"],
      neutral: ["What's the next step?", "How can I grow?", "What's my focus?", "Challenge me", "Let's strategize"]
    }
  };

  const personaReplies = baseReplies[persona as keyof typeof baseReplies] || baseReplies.sarah;
  const emotionReplies = personaReplies[userEmotion as keyof typeof personaReplies] || personaReplies.neutral;
  
  // Add context-aware replies based on AI message content
  const contextualReplies = [];
  if (lastAiMessage.includes('breath') || lastAiMessage.includes('breathing')) {
    contextualReplies.push("That helped", "Can we do another?", "I still feel tense");
  }
  if (lastAiMessage.includes('goal') || lastAiMessage.includes('step')) {
    contextualReplies.push("What's next?", "I'm ready", "That's overwhelming");
  }
  if (lastAiMessage.includes('feeling') || lastAiMessage.includes('emotion')) {
    contextualReplies.push("Exactly", "Not quite", "It's complicated", "I can't tell");
  }

  // Combine and shuffle for variety
  return [...contextualReplies.slice(0, 2), ...emotionReplies.slice(0, 3)];
};

// Fallback for legacy persona names
const replyOptions = {
  dr_sarah: ["Tell me more", "How does that feel?", "I'm listening", "That helps", "Thank you"],
  maya: ["I hear you", "That resonates", "Help me breathe", "I'm present", "Guide me"],
  alex: ["I totally get that!", "That's so valid", "You get me", "I'm here for it", "Real talk"],
  marcus: ["What's next?", "Let's do this", "Break it down", "I'm ready", "Challenge me"]
};

export function QuickReplyBubbles({ 
  persona, 
  onReplySelect, 
  className = "",
  lastAiMessage = "",
  userEmotion = "neutral"
}: QuickReplyBubblesProps) {
  // Use adaptive replies if we have context, otherwise fallback to static
  const replies = lastAiMessage 
    ? getAdaptiveReplies(persona.replace('dr_', ''), lastAiMessage, userEmotion)
    : (replyOptions[persona] || replyOptions.dr_sarah);

  return (
    <div className={`animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ${className}`}>
      <p className="text-therapeutic-caption mb-2">Quick replies:</p>
      <div className="flex flex-wrap gap-2">
        {replies.map((reply, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onReplySelect(reply)}
            className="btn-therapeutic-ghost text-xs px-3 py-1.5 whitespace-nowrap animate-therapeutic-fade"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {reply}
          </Button>
        ))}
      </div>
    </div>
  );
}