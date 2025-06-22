import { Button } from "@/components/ui/button";
import { MessageCircle, ThumbsUp, HelpCircle, Heart, Lightbulb } from "lucide-react";

interface QuickReplyBubblesProps {
  onReplySelect: (reply: string) => void;
  messageType?: 'advice' | 'support' | 'question' | 'general';
  className?: string;
}

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

export default function QuickReplyBubbles({ onReplySelect, messageType = 'general', className = '' }: QuickReplyBubblesProps) {
  const replies = replyOptions[messageType];

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