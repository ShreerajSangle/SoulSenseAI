import React from 'react';
import { Button } from '@/components/ui/button';

interface QuickReplyBubblesProps {
  persona: 'dr_sarah' | 'alex' | 'marcus' | 'maya' | 'sarah';
  onReplySelect: (reply: string) => void;
  className?: string;
  lastAiMessage?: string;
  userEmotion?: string;
  conversationHistory?: any[];
}

// Adaptive quick replies that change based on conversation context and emotional tone
const getAdaptiveReplies = (persona: string, lastAiMessage: string, userEmotion: string, conversationHistory?: any[]) => {
  // Analyze conversation patterns for more human-like responses
  const recentMessages = conversationHistory?.slice(-6) || [];
  const hasAskedQuestions = recentMessages.some(msg => msg.content?.includes('?'));
  const hasSharedPersonal = recentMessages.some(msg => msg.sender === 'user' && (msg.content?.includes('I feel') || msg.content?.includes('I think')));
  const conversationLength = recentMessages.length;
  
  const baseReplies = {
    sarah: {
      supportive: hasSharedPersonal 
        ? ["That resonates deeply", "I'm honored you shared that", "Your insight is powerful", "That takes courage"] 
        : ["I feel heard", "That helps", "Tell me more", "That makes sense"],
      anxious: conversationLength > 4 
        ? ["I'm still processing this", "Can we slow down?", "I need a moment", "This feels overwhelming"]
        : ["Help me calm down", "I'm still worried", "What if...", "That's scary"],
      sad: hasAskedQuestions
        ? ["I don't know yet", "It's complicated", "I'm not sure how", "That's what I'm figuring out"]
        : ["That's heavy", "I'm still hurting", "How do I cope?", "This is hard"],
      neutral: ["Tell me more", "How does that feel?", "What comes up for you?", "I'm listening", "Thank you"]
    },
    maya: {
      supportive: conversationLength > 6
        ? ["This feels sacred", "I'm grateful for this space", "Something is shifting in me", "This is beautiful medicine"]
        : ["Let's breathe together", "That resonates deeply", "I feel your presence", "Share your wisdom"],
      anxious: hasSharedPersonal
        ? ["My nervous system feels activated", "Help me find my ground", "I need your calming energy", "Can we create sacred space?"]
        : ["Guide me to stillness", "I need grounding", "Help me breathe", "My heart is racing"],
      sad: recentMessages.some(msg => msg.content?.includes('breath') || msg.content?.includes('chakra'))
        ? ["That practice helped", "I feel a gentle shift", "Something is opening", "My heart feels lighter"]
        : ["Hold space for this sadness", "I need tenderness", "My soul feels heavy", "Comfort my heart"],
      neutral: ["What does my breath tell me?", "Share your wisdom", "I'm listening deeply", "Guide me home to myself", "What's alive in me now?"]
    },
    alex: {
      supportive: hasAskedQuestions
        ? ["Exactly! You totally get it", "This is why I love talking to you", "You always know what to say", "I knew you'd understand"]
        : ["You get me!", "That's so real", "I feel less alone", "You're the best"],
      anxious: conversationLength > 4
        ? ["Ugh, I'm spiraling again", "Why is this so hard?", "I hate feeling like this", "Talk me down please"]
        : ["I'm freaking out", "Talk me through this", "I need reassurance", "I'm scared"],
      sad: recentMessages.some(msg => msg.content?.toLowerCase().includes('hug') || msg.content?.toLowerCase().includes('support'))
        ? ["That actually helped", "I needed to hear that", "You always know what to say", "I'm feeling a bit better"]
        : ["I'm really down", "This sucks", "Cheer me up?", "I need a hug"],
      neutral: ["Tell me everything", "That's so you", "What's really going on?", "I'm here for it", "Real talk"]
    },
    marcus: {
      supportive: recentMessages.some(msg => msg.content?.toLowerCase().includes('goal') || msg.content?.toLowerCase().includes('action'))
        ? ["I'm fired up now", "Let's take this further", "What's the next level?", "I can feel the momentum"]
        : ["I'm motivated now", "Let's make it happen", "That's the energy", "I'm ready to grow"],
      anxious: hasSharedPersonal
        ? ["How do I get past my own head?", "I keep getting in my way", "Why do I always doubt myself?", "How do I trust the process?"]
        : ["How do I overcome this?", "What's my next move?", "I need a strategy", "Help me push through"],
      sad: conversationLength > 6
        ? ["I'm tired of feeling stuck", "When will I see progress?", "How do others push through this?", "I need a new approach"]
        : ["Help me bounce back", "What would you do?", "I need motivation", "Give me strength"],
      neutral: ["What's the plan?", "How do I level up?", "What should I focus on?", "Challenge me", "I'm ready"]
    }
  };

  const personaReplies = baseReplies[persona as keyof typeof baseReplies] || baseReplies.sarah;
  const emotionReplies = personaReplies[userEmotion as keyof typeof personaReplies] || personaReplies.neutral;
  
  // Advanced contextual analysis for human-like flow
  const contextualReplies = [];
  
  // Analyze AI message patterns for natural follow-ups
  if (lastAiMessage.includes('breath') || lastAiMessage.includes('breathing')) {
    if (recentMessages.some(msg => msg.content?.includes('anxious') || msg.content?.includes('stress'))) {
      contextualReplies.push("That helped a bit", "I'm still tense", "Can we try something else?");
    } else {
      contextualReplies.push("That was nice", "I feel more centered", "Can we do another?");
    }
  }
  
  if (lastAiMessage.includes('?')) {
    // AI asked a question - provide natural responses
    contextualReplies.push("Good question", "Let me think...", "I'm not sure", "That's hard to answer");
  }
  
  if (lastAiMessage.includes('proud') || lastAiMessage.includes('progress') || lastAiMessage.includes('growth')) {
    contextualReplies.push("Thank you for seeing that", "I needed to hear that", "That means a lot");
  }
  
  if (lastAiMessage.includes('understand') || lastAiMessage.includes('hear you')) {
    contextualReplies.push("You really do get it", "Exactly", "That's exactly right");
  }

  // Progressive conversation flow based on length
  if (conversationLength > 8) {
    contextualReplies.push("This has been really helpful", "I'm processing a lot", "Thank you for being here");
  }

  // Intelligent reply deduplication and natural clustering
  const allReplies = [...contextualReplies, ...emotionReplies];
  const uniqueReplies = Array.from(new Set(allReplies));
  
  // Ensure we don't repeat recently used quick replies
  const recentReplies = recentMessages
    .filter(msg => msg.sender === 'user')
    .map(msg => msg.content)
    .slice(-3);
  
  const freshReplies = uniqueReplies.filter(reply => 
    !recentReplies.some(recent => recent?.toLowerCase().includes(reply.toLowerCase()))
  );
  
  // Return most relevant 4-5 replies for optimal UX
  return freshReplies.slice(0, Math.min(5, freshReplies.length));
};

// Fallback for legacy persona names
const replyOptions = {
  dr_sarah: ["Tell me more", "How does that feel?", "I'm listening", "That helps", "Thank you"],
  maya: ["How is my breath?", "Guide me deeper", "I feel your presence", "Help me ground", "What's alive in me?"],
  alex: ["I totally get that!", "That's so valid", "You get me", "I'm here for it", "Real talk"],
  marcus: ["What's next?", "Let's do this", "Break it down", "I'm ready", "Challenge me"]
};

export function QuickReplyBubbles({ 
  persona, 
  onReplySelect, 
  className = "",
  lastAiMessage = "",
  userEmotion = "neutral",
  conversationHistory = []
}: QuickReplyBubblesProps) {
  // Use adaptive replies if we have context, otherwise fallback to static
  const replies = lastAiMessage 
    ? getAdaptiveReplies(persona.replace('dr_', ''), lastAiMessage, userEmotion, conversationHistory)
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