import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Target, Calendar, Heart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GoalCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: (goal: any) => void;
  persona: {
    id: string;
    name: string;
    color: string;
  };
}

export default function GoalCreationModal({ isOpen, onClose, onGoalCreated, persona }: GoalCreationModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeframe, setTimeframe] = useState("week");
  const [category, setCategory] = useState("");

  const getPersonaCategories = () => {
    switch (persona.id) {
      case 'sarah':
        return [
          { value: 'emotional', label: 'Emotional Wellness', icon: '🧠' },
          { value: 'mindfulness', label: 'Mindfulness Practice', icon: '🧘' },
          { value: 'self-care', label: 'Self-Care', icon: '💆' },
          { value: 'therapy', label: 'Therapy Progress', icon: '📝' }
        ];
      case 'maya':
        return [
          { value: 'meditation', label: 'Meditation', icon: '🧘‍♀️' },
          { value: 'breathing', label: 'Breathing Practice', icon: '🌬️' },
          { value: 'mindfulness', label: 'Mindful Living', icon: '🌿' },
          { value: 'balance', label: 'Life Balance', icon: '⚖️' }
        ];
      case 'alex':
        return [
          { value: 'social', label: 'Social Connection', icon: '👥' },
          { value: 'fun', label: 'Fun & Joy', icon: '🎉' },
          { value: 'habits', label: 'Daily Habits', icon: '✅' },
          { value: 'friendship', label: 'Friendship Goals', icon: '🤝' }
        ];
      case 'marcus':
        return [
          { value: 'career', label: 'Career Growth', icon: '💼' },
          { value: 'fitness', label: 'Physical Fitness', icon: '💪' },
          { value: 'productivity', label: 'Productivity', icon: '⚡' },
          { value: 'learning', label: 'Learning & Skills', icon: '📚' }
        ];
      default:
        return [
          { value: 'wellness', label: 'Overall Wellness', icon: '🌟' },
          { value: 'personal', label: 'Personal Growth', icon: '🌱' }
        ];
    }
  };

  const getPersonaEncouragement = () => {
    switch (persona.id) {
      case 'sarah':
        return "Setting small, achievable goals can help build a foundation for lasting positive change. What would feel manageable for you right now?";
      case 'maya':
        return "Like a gentle stream flowing toward the ocean, let your goal be something that feels natural and sustainable for your spirit.";
      case 'alex':
        return "You've got this! Let's set something fun and doable that'll make you feel awesome when you complete it 💪";
      case 'marcus':
        return "Every big achievement starts with one focused step. Let's create a goal that'll move you closer to where you want to be.";
      default:
        return "What small step would you like to take toward feeling better?";
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !category) return;

    const goal = {
      title: title.trim(),
      description: description.trim(),
      category,
      timeframe,
      personaId: persona.id,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      });

      if (response.ok) {
        const createdGoal = await response.json();
        onGoalCreated(createdGoal);
        
        // Reset form
        setTitle("");
        setDescription("");
        setCategory("");
        setTimeframe("week");
        onClose();
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  if (!isOpen) return null;

  const categories = getPersonaCategories();

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-white dark:bg-gray-900 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Target className="h-5 w-5" style={{ color: persona.color }} />
              Create a Goal
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {getPersonaEncouragement()}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Goal Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              What would you like to achieve?
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Journal for 10 minutes daily"
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-gray-50 dark:bg-gray-800">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      {cat.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timeframe */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeframe
            </Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="bg-gray-50 dark:bg-gray-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom">Custom Period</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Optional Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Additional details (optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any specific notes or motivation for this goal..."
              rows={2}
              className="bg-gray-50 dark:bg-gray-800 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || !category}
              className="flex-1 flex items-center gap-2"
              style={{ backgroundColor: persona.color }}
            >
              <Heart className="h-4 w-4" />
              Create Goal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}