import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

interface EmojiSelectorProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

const EMOJI_CATEGORIES = {
  emotions: {
    label: "Emotions",
    emojis: ["😊", "😢", "😔", "😌", "😤", "😰", "😍", "🤗", "😮‍💨", "🥺", "😓", "🙂", "😐", "😕", "😟", "😧", "😨"]
  },
  wellness: {
    label: "Wellness",
    emojis: ["🧘‍♀️", "🧘‍♂️", "💆‍♀️", "💆‍♂️", "🌱", "🌿", "🌸", "☀️", "🌙", "⭐", "💚", "💙", "💜", "🤍", "✨", "🕯️", "🔮"]
  },
  support: {
    label: "Support",
    emojis: ["🤝", "🫂", "💪", "👍", "🙏", "❤️", "💛", "🧡", "💖", "💝", "🌟", "✊", "👏", "🤞", "🍀", "🌈", "🎯"]
  },
  activities: {
    label: "Activities", 
    emojis: ["📝", "📚", "🎵", "🎨", "🏃‍♀️", "🏃‍♂️", "🚶‍♀️", "🚶‍♂️", "🛌", "☕", "🍵", "🎧", "📱", "💻", "🏠", "🌳", "🌊"]
  }
};

export default function EmojiSelector({ onEmojiSelect, className = "" }: EmojiSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 w-9 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors"
      >
        <Smile className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Emoji Panel */}
          <div className="absolute bottom-full right-0 mb-2 z-50 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 w-72 max-h-80 overflow-y-auto">
            <div className="space-y-3">
              {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                <div key={key}>
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    {category.label}
                  </h3>
                  <div className="grid grid-cols-8 gap-1">
                    {category.emojis.map((emoji, index) => (
                      <button
                        key={`${key}-${index}`}
                        onClick={() => handleEmojiClick(emoji)}
                        className="w-8 h-8 text-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded transition-colors flex items-center justify-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}