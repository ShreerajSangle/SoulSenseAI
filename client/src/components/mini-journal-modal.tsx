import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Save, Heart, Brain, Star, Coffee } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface MiniJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: {
    id: string;
    name: string;
    color: string;
  };
  conversationId?: number;
}

const journalPrompts = [
  "How am I feeling right now?",
  "What's on my mind today?",
  "One thing I'm grateful for is...",
  "I'm worried about...",
  "Something that made me smile today was...",
  "I want to remember...",
  "Right now I need...",
  "I'm proud of myself for..."
];

const moodTags = [
  { name: "Grateful", icon: Heart, color: "pink" },
  { name: "Anxious", icon: Brain, color: "orange" },
  { name: "Hopeful", icon: Star, color: "yellow" },
  { name: "Tired", icon: Coffee, color: "brown" },
  { name: "Peaceful", icon: Heart, color: "green" },
  { name: "Overwhelmed", icon: Brain, color: "red" }
];

export default function MiniJournalModal({ isOpen, onClose, persona, conversationId }: MiniJournalModalProps) {
  const [entry, setEntry] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleMoodToggle = (mood: string) => {
    setSelectedMoods(prev => 
      prev.includes(mood) 
        ? prev.filter(m => m !== mood)
        : [...prev, mood]
    );
  };

  const handlePromptSelect = (prompt: string) => {
    setEntry(prev => prev ? `${prev}\n\n${prompt} ` : `${prompt} `);
    textareaRef.current?.focus();
  };

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/journal-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to save entry');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Journal entry saved",
        description: "Your reflection has been saved privately.",
      });
      setEntry("");
      setSelectedMoods([]);
      onClose();
    },
    onError: () => {
      toast({
        title: "Error saving entry",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    if (!entry.trim()) return;
    
    saveMutation.mutate({
      content: entry,
      moods: selectedMoods,
      personaId: persona.id,
      conversationId: conversationId || null,
      userId: "anonymous"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-purple-200 dark:border-purple-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <BookOpen className="h-5 w-5" style={{ color: persona.color }} />
            Quick Journal Entry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Prompt Suggestions */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600 dark:text-gray-400">
              Need inspiration? Try one of these:
            </Label>
            <div className="flex flex-wrap gap-2">
              {journalPrompts.slice(0, 4).map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePromptSelect(prompt)}
                  className="text-xs bg-white/70 dark:bg-gray-800/70 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-700"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          {/* Journal Entry */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600 dark:text-gray-400">
              Your thoughts:
            </Label>
            <Textarea
              ref={textareaRef}
              placeholder="Write your thoughts and feelings here... This is your private space."
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className="min-h-[100px] resize-none bg-white/60 dark:bg-gray-800/60 border-purple-200 dark:border-purple-700 focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-600"
            />
          </div>

          {/* Mood Tags */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600 dark:text-gray-400">
              How are you feeling? (optional)
            </Label>
            <div className="flex flex-wrap gap-2">
              {moodTags.map((mood) => {
                const Icon = mood.icon;
                const isSelected = selectedMoods.includes(mood.name);
                return (
                  <Button
                    key={mood.name}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleMoodToggle(mood.name)}
                    className={`flex items-center gap-1 text-xs ${
                      isSelected 
                        ? `bg-${mood.color}-500 hover:bg-${mood.color}-600` 
                        : `border-${mood.color}-200 hover:bg-${mood.color}-50`
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {mood.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!entry.trim() || saveMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}