import { Button } from "@/components/ui/button";
import { MessageCircle, ThumbsUp, HelpCircle, Heart, Lightbulb, Brain, Target, Smile } from "lucide-react";

interface QuickReplyBubblesProps {
  onReplySelect: (reply: string) => void;
  personaId?: string;
  messageType?: 'advice' | 'support' | 'question' | 'general';
  className?: string;
}

// Persona-specific replies tailored to therapeutic conversations
const personaReplies = {
  sarah: [
    { text: "Can you reframe that for me?", icon: Brain },
    { text: "That makes sense", icon: ThumbsUp },
    { text: "I need to process this", icon: Heart },
    { text: "Help me understand", icon: HelpCircle }
  ],
  maya: [
    { text: "Say that in a softer way", icon: Heart },
    { text: "That feels right", icon: ThumbsUp },
    { text: "Help me breathe through this", icon: MessageCircle },
    { text: "I'm grateful", icon: Heart }
  ],
  marcus: [
    { text: "Give me a plan", icon: Target },
    { text: "What's the next step?", icon: Lightbulb },
    { text: "That's actionable", icon: ThumbsUp },
    { text: "I'm ready to try", icon: Target }
  ],
  alex: [
    { text: "Say that with a joke 😄", icon: Smile },
    { text: "That's so relatable", icon: Heart },
    { text: "Same energy", icon: ThumbsUp },
    { text: "Thanks for keeping it real", icon: MessageCircle }
  ]
};

const replyOptions = {
  advice: [
    { text: "That makes sense", icon: ThumbsUp },
    { text: "Tell me more", icon: MessageCircle },
    { text: "Can you explain differently?", icon: HelpCircle },
    { text: "Thank you", icon: Heart }
  ],
  support: [
    { text: "That helps", icon: Heart },
    { text: "I understand", icon: ThumbsUp },
    { text: "Tell me more", icon: MessageCircle },
    { text: "What should I do next?", icon: Lightbulb }
  ],
  question: [
    { text: "Yes, that's right", icon: ThumbsUp },
    { text: "Not exactly", icon: HelpCircle },
    { text: "Can you clarify?", icon: MessageCircle },
    { text: "I'm not sure", icon: HelpCircle }
  ],
  general: [
    { text: "That makes sense", icon: ThumbsUp },
    { text: "Thank you", icon: Heart },
    { text: "Tell me more", icon: MessageCircle },
    { text: "How can I apply this?", icon: Lightbulb }
  ]
};

export default function QuickReplyBubbles({ onReplySelect, personaId, messageType = 'general', className = '' }: QuickReplyBubblesProps) {
  // Use persona-specific replies if available, otherwise fall back to message type
  const replies = personaId && personaReplies[personaId as keyof typeof personaReplies] 
    ? personaReplies[personaId as keyof typeof personaReplies]
    : replyOptions[messageType];

  return (
    <div className={`flex flex-wrap gap-2 mt-3 ${className}`}>
      {replies.map((reply, index) => {
        const Icon = reply.icon;
        return (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onReplySelect(reply.text)}
            className="flex items-center gap-2 bg-white/70 dark:bg-gray-800/70 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-xs px-3 py-1 h-auto rounded-full transition-all duration-200 hover:scale-105"
          >
            <Icon className="h-3 w-3" />
            {reply.text}
          </Button>
        );
      })}
    </div>
  );
}