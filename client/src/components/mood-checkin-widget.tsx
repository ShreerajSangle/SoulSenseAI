import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Smile, Meh, Frown, Heart, Zap, CloudRain, Sun, Moon } from "lucide-react";

interface MoodCheckInProps {
  type: 'check_in' | 'check_out';
  onComplete: (data: MoodCheckInData) => void;
  onSkip: () => void;
}

export interface MoodCheckInData {
  moodRating: number;
  emotions: string[];
  notes?: string;
  triggers?: string[];
  type: 'check_in' | 'check_out';
}

const moodScale = [
  { value: 1, icon: Frown, label: "Very Low", color: "text-red-500" },
  { value: 2, icon: CloudRain, label: "Low", color: "text-orange-500" },
  { value: 3, icon: Meh, label: "Neutral", color: "text-yellow-500" },
  { value: 4, icon: Sun, label: "Good", color: "text-green-500" },
  { value: 5, icon: Smile, label: "Excellent", color: "text-blue-500" }
];

const emotionOptions = [
  { name: "anxious", icon: "😰", color: "bg-red-100" },
  { name: "sad", icon: "😢", color: "bg-blue-100" },
  { name: "angry", icon: "😡", color: "bg-red-200" },
  { name: "happy", icon: "😊", color: "bg-yellow-100" },
  { name: "excited", icon: "🤩", color: "bg-purple-100" },
  { name: "calm", icon: "😌", color: "bg-green-100" },
  { name: "confused", icon: "😕", color: "bg-gray-100" },
  { name: "hopeful", icon: "🌟", color: "bg-blue-100" },
  { name: "grateful", icon: "🙏", color: "bg-pink-100" },
  { name: "overwhelmed", icon: "😵", color: "bg-orange-100" }
];

const commonTriggers = [
  "work stress", "relationships", "health concerns", "finances", 
  "family issues", "social situations", "sleep problems", "news/media",
  "perfectionism", "loneliness", "change/transitions", "self-doubt"
];

export function MoodCheckInWidget({ type, onComplete, onSkip }: MoodCheckInProps) {
  const [step, setStep] = useState(1);
  const [moodRating, setMoodRating] = useState<number>(3);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);

  const isCheckIn = type === 'check_in';
  const title = isCheckIn ? "How are you feeling today?" : "How was your session?";
  const subtitle = isCheckIn ? "Let's start by checking in on your mood" : "Reflect on how you're feeling now";

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleComplete = () => {
    const data: MoodCheckInData = {
      moodRating,
      emotions: selectedEmotions,
      notes: notes.trim() || undefined,
      triggers: selectedTriggers.length > 0 ? selectedTriggers : undefined,
      type
    };
    onComplete(data);
  };

  const renderMoodSelector = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      
      <div className="flex justify-between items-center px-4">
        {moodScale.map(({ value, icon: Icon, label, color }) => (
          <button
            key={value}
            onClick={() => setMoodRating(value)}
            className={`flex flex-col items-center p-3 rounded-lg transition-all ${
              moodRating === value 
                ? 'bg-blue-50 border-2 border-blue-200 scale-110' 
                : 'hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Icon className={`w-8 h-8 mb-1 ${color}`} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
      
      <div className="flex gap-2 justify-center">
        <Button variant="outline" onClick={onSkip}>
          Skip for now
        </Button>
        <Button onClick={() => setStep(2)}>
          Continue
        </Button>
      </div>
    </div>
  );

  const renderEmotionSelector = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">What emotions are you experiencing?</h3>
        <p className="text-sm text-gray-600">Select all that apply</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {emotionOptions.map(({ name, icon, color }) => (
          <button
            key={name}
            onClick={() => toggleEmotion(name)}
            className={`flex items-center gap-2 p-3 rounded-lg text-left transition-all ${
              selectedEmotions.includes(name)
                ? 'bg-blue-100 border-2 border-blue-300'
                : `${color} border border-gray-200 hover:border-gray-300`
            }`}
          >
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-medium capitalize">{name}</span>
          </button>
        ))}
      </div>
      
      <div className="flex gap-2 justify-center">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button onClick={() => setStep(3)}>
          Continue
        </Button>
      </div>
    </div>
  );

  const renderNotesAndTriggers = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Any thoughts you'd like to share? (optional)
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isCheckIn 
              ? "What's on your mind as you start this session?" 
              : "How do you feel after our conversation?"
            }
            className="min-h-[80px]"
          />
        </div>
        
        {isCheckIn && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              What might be affecting your mood today? (optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {commonTriggers.map((trigger) => (
                <button
                  key={trigger}
                  onClick={() => toggleTrigger(trigger)}
                  className={`p-2 text-xs rounded-md text-left transition-all ${
                    selectedTriggers.includes(trigger)
                      ? 'bg-blue-100 border border-blue-300'
                      : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {trigger}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 justify-center">
        <Button variant="outline" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button onClick={handleComplete} className="bg-blue-600 hover:bg-blue-700">
          Complete Check-in
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          {isCheckIn ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-blue-500" />
          )}
          <CardTitle className="text-lg">
            {isCheckIn ? "Session Check-in" : "Session Check-out"}
          </CardTitle>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map((stepNum) => (
            <div
              key={stepNum}
              className={`h-1 flex-1 rounded-full ${
                step >= stepNum ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {step === 1 && renderMoodSelector()}
        {step === 2 && renderEmotionSelector()}
        {step === 3 && renderNotesAndTriggers()}
      </CardContent>
    </Card>
  );
}