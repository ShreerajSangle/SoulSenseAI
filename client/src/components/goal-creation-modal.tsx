import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Target, Calendar, Check, X } from "lucide-react";

interface Goal {
  id: string;
  text: string;
  type: "today" | "this_week" | "small_step";
  completed: boolean;
  createdAt: Date;
}

interface GoalCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: (goal: Goal) => void;
  persona: "sarah" | "alex" | "maya" | "marcus";
}

const GOAL_SUGGESTIONS = {
  sarah: {
    today: ["Take 10 minutes for self-reflection", "Practice one grounding technique", "Write down three things I'm grateful for"],
    this_week: ["Start a mood journaling practice", "Reach out to one supportive friend", "Try a new relaxation technique"],
    small_step: ["Take three deep breaths", "Step outside for fresh air", "Drink a glass of water mindfully"]
  },
  alex: {
    today: ["Send a funny meme to a friend", "Do something that makes me smile", "Listen to my favorite upbeat song"],
    this_week: ["Plan a fun activity with friends", "Try a new hobby or interest", "Watch a movie that makes me laugh"],
    small_step: ["Text someone I care about", "Look at photos that make me happy", "Dance to one song"]
  },
  maya: {
    today: ["Spend 5 minutes in mindful breathing", "Notice three beautiful things around me", "Set an intention for the day"],
    this_week: ["Start a daily meditation practice", "Connect with nature daily", "Practice loving-kindness meditation"],
    small_step: ["Take one mindful breath", "Feel my feet on the ground", "Notice the sounds around me"]
  },
  marcus: {
    today: ["Review and update my priorities", "Take one action toward my main goal", "Organize my workspace"],
    this_week: ["Create a weekly action plan", "Schedule time for skill development", "Network with one new person"],
    small_step: ["Write down my top priority", "Clear my desk", "Set tomorrow's main focus"]
  }
};

const PERSONA_ENCOURAGEMENT = {
  sarah: "Setting gentle, achievable goals helps build momentum and self-compassion.",
  alex: "Yes! Small wins add up to big changes. You've got this! 🌟",
  maya: "Every mindful intention plants a seed of positive transformation.",
  marcus: "Strategic goal-setting creates clarity and drives meaningful progress."
};

export function GoalCreationModal({ isOpen, onClose, onGoalCreated, persona }: GoalCreationModalProps) {
  const [goalType, setGoalType] = useState<"today" | "this_week" | "small_step">("today");
  const [customGoal, setCustomGoal] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState("");

  const suggestions = GOAL_SUGGESTIONS[persona];
  const encouragement = PERSONA_ENCOURAGEMENT[persona];

  const handleCreateGoal = () => {
    const goalText = customGoal.trim() || selectedSuggestion;
    if (!goalText) return;

    const newGoal: Goal = {
      id: Date.now().toString(),
      text: goalText,
      type: goalType,
      completed: false,
      createdAt: new Date()
    };

    onGoalCreated(newGoal);
    setCustomGoal("");
    setSelectedSuggestion("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border border-purple-200/50 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-800">Set a Goal</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{encouragement}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Goal Type Selection */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { type: "small_step", label: "Right Now", icon: "⚡" },
              { type: "today", label: "Today", icon: "☀️" },
              { type: "this_week", label: "This Week", icon: "🗓️" }
            ].map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => setGoalType(type as any)}
                className={`p-2 rounded-lg border text-sm transition-all ${
                  goalType === type
                    ? "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 text-purple-700"
                    : "border-gray-200 hover:border-purple-200 hover:bg-purple-50/50"
                }`}
              >
                <div>{icon}</div>
                <div className="font-medium">{label}</div>
              </button>
            ))}
          </div>

          {/* Goal Suggestions */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">Suggestions:</p>
            <div className="space-y-1">
              {suggestions[goalType].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedSuggestion(suggestion);
                    setCustomGoal("");
                  }}
                  className={`w-full text-left p-2 rounded-lg text-sm border transition-all ${
                    selectedSuggestion === suggestion
                      ? "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 text-purple-700"
                      : "border-gray-100 hover:border-purple-200 hover:bg-purple-50/30"
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Goal Input */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">Or create your own:</p>
            <Input
              value={customGoal}
              onChange={(e) => {
                setCustomGoal(e.target.value);
                setSelectedSuggestion("");
              }}
              placeholder="What would you like to achieve?"
              className="border-purple-200/50 focus:border-purple-300"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGoal}
              disabled={!customGoal.trim() && !selectedSuggestion}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Check className="h-4 w-4 mr-1" />
              Create Goal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}