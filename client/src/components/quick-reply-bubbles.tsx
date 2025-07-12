import React from 'react';
import { Button } from '@/components/ui/button';

interface QuickReplyBubblesProps {
  persona: 'dr_sarah' | 'alex' | 'marcus' | 'maya';
  onReplySelect: (reply: string) => void;
  className?: string;
}

const replyOptions = {
  dr_sarah: [
    "That makes sense",
    "Tell me more about that",
    "How did that feel?",
    "Can you help me understand?",
    "Thank you for sharing"
  ],
  maya: [
    "I hear you",
    "That resonates with me",
    "Help me breathe through this",
    "Say that more gently",
    "I'm listening"
  ],
  alex: [
    "I totally get that!",
    "That's so valid",
    "Tell me everything",
    "You're not alone",
    "Thanks for trusting me"
  ],
  marcus: [
    "What's the next step?",
    "That's progress",
    "How can we tackle this?",
    "Break that down for me",
    "You've got this"
  ]
};

export function QuickReplyBubbles({ persona, onReplySelect, className = "" }: QuickReplyBubblesProps) {
  const replies = replyOptions[persona] || replyOptions.dr_sarah;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {replies.map((reply, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onReplySelect(reply)}
          className="text-xs px-3 py-1 rounded-full border-purple-200/50 text-purple-600 hover:bg-purple-50 hover:border-purple-300 bg-white/60 transition-all"
        >
          {reply}
        </Button>
      ))}
    </div>
  );
}