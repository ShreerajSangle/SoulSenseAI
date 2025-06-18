import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MoodSelectorProps {
  onMoodSelect: (mood: string) => void;
  onSkip: () => void;
}

const moods = [
  { emoji: "😊", label: "Great", description: "Feeling positive and energized" },
  { emoji: "😐", label: "Okay", description: "Neutral, just getting by" },
  { emoji: "😔", label: "Down", description: "Feeling sad or low" },
  { emoji: "😰", label: "Anxious", description: "Worried or stressed" },
  { emoji: "😤", label: "Frustrated", description: "Angry or irritated" },
];

export function MoodSelector({ onMoodSelect, onSkip }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodClick = (mood: string) => {
    setSelectedMood(mood);
    setTimeout(() => onMoodSelect(mood), 150);
  };

  return (
    <Card className="max-w-md mx-auto animate-slide-up">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">How are you feeling today?</h3>
          <p className="text-sm text-slate-600">This helps me better understand and support you</p>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-6">
          {moods.map((mood) => (
            <button
              key={mood.emoji}
              onClick={() => handleMoodClick(mood.emoji)}
              className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50 ${
                selectedMood === mood.emoji 
                  ? "border-indigo-500 bg-indigo-100" 
                  : "border-slate-200 bg-white"
              }`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <div className="text-left">
                <div className="font-medium text-slate-800">{mood.label}</div>
                <div className="text-sm text-slate-600">{mood.description}</div>
              </div>
            </button>
          ))}
        </div>

        <Button 
          variant="ghost" 
          onClick={onSkip}
          className="w-full text-slate-500 hover:text-slate-700"
        >
          Skip for now
        </Button>
      </CardContent>
    </Card>
  );
}