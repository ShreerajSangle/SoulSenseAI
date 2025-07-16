import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";

interface EmojiSelectorProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

const MOOD_EMOJIS = {
  "Happy": ["😊", "😄", "🥰", "✨", "🌟", "💖"],
  "Sad": ["😢", "😔", "💔", "😞", "😭", "🥺"],
  "Anxious": ["😰", "😟", "😬", "😵‍💫", "🫨", "😣"],
  "Angry": ["😠", "😡", "😤", "🙄", "😒", "😮‍💨"],
  "Excited": ["🤩", "🥳", "🎉", "🔥", "⚡", "🚀"],
  "Calm": ["😌", "🧘‍♀️", "🕊️", "🌸", "🍃", "💙"],
  "Grateful": ["🙏", "💝", "🤗", "🌺", "☀️", "🌈"],
  "Confused": ["🤔", "😵", "🫤", "😕", "🤷‍♀️", "❓"]
};

export function EnhancedEmojiSelector({ onEmojiSelect, className = "" }: EmojiSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 bg-purple-100/80 text-purple-600 hover:bg-purple-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400/30 ${className}`}
        >
          <Smile className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 sm:w-80 p-3 sm:p-4 bg-white/95 backdrop-blur-sm border border-purple-200/50 shadow-xl rounded-2xl animate-in fade-in-0 zoom-in-95 duration-200"
        side="top"
        align="start"
        sideOffset={8}
      >
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-purple-700 text-center mb-3">How are you feeling?</h4>
          {Object.entries(MOOD_EMOJIS).map(([mood, emojis]) => (
            <div key={mood} className="space-y-1.5">
              <p className="text-xs text-purple-600 font-medium">{mood}</p>
              <div className="flex flex-wrap gap-1.5">
                {emojis.map((emoji, index) => (
                  <button
                    key={`${mood}-${index}`}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-lg sm:text-xl hover:scale-110 active:scale-95 transition-all duration-150 p-1.5 rounded-lg hover:bg-purple-50 active:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
                    title={`${mood} - ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}