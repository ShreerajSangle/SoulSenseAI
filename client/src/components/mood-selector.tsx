import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MoodSelectorProps {
  onMoodSelect: (mood: string) => void;
  onSkip: () => void;
}

const moods = [
  { emoji: "😊", label: "Happy", value: "happy" },
  { emoji: "😐", label: "Neutral", value: "neutral" },
  { emoji: "😔", label: "Sad", value: "sad" },
  { emoji: "😰", label: "Anxious", value: "anxious" },
  { emoji: "😤", label: "Frustrated", value: "frustrated" },
  { emoji: "😴", label: "Tired", value: "tired" }
];

export function MoodSelector({ onMoodSelect, onSkip }: MoodSelectorProps) {
  return (
    <Card className="border-blue-200 bg-blue-50 animate-slide-up max-w-md mx-auto">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2 text-center">
          How are you feeling today?
        </h3>
        <p className="text-sm text-blue-700 mb-4 text-center">
          This helps me understand how to best support you
        </p>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          {moods.map((mood) => (
            <button
              key={mood.value}
              onClick={() => onMoodSelect(mood.value)}
              className="p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
            >
              <div className="text-2xl mb-1">{mood.emoji}</div>
              <div className="text-xs text-blue-700">{mood.label}</div>
            </button>
          ))}
        </div>
        
        <Button 
          variant="ghost" 
          onClick={onSkip}
          className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-100"
        >
          Skip for now
        </Button>
      </CardContent>
    </Card>
  );
}