import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Heart, Lightbulb, Target, Wind } from 'lucide-react';

interface MiniJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEntryCreated: (entry: JournalEntry) => void;
  persona: 'dr_sarah' | 'alex' | 'marcus' | 'maya';
}

interface JournalEntry {
  id: string;
  text: string;
  mood: string;
  timestamp: Date;
  persona: string;
}

const moodOptions = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😢', label: 'Sad', value: 'sad' },
  { emoji: '😴', label: 'Tired', value: 'tired' },
  { emoji: '😠', label: 'Frustrated', value: 'frustrated' },
  { emoji: '🧠', label: 'Thoughtful', value: 'thoughtful' },
  { emoji: '🌟', label: 'Hopeful', value: 'hopeful' },
  { emoji: '😰', label: 'Anxious', value: 'anxious' },
  { emoji: '💪', label: 'Motivated', value: 'motivated' }
];

export function MiniJournalModal({ isOpen, onClose, onEntryCreated, persona }: MiniJournalModalProps) {
  const [entryText, setEntryText] = useState('');
  const [selectedMood, setSelectedMood] = useState('');

  const handleSave = () => {
    if (!entryText.trim() || !selectedMood) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      text: entryText.trim(),
      mood: selectedMood,
      timestamp: new Date(),
      persona
    };

    onEntryCreated(entry);
    setEntryText('');
    setSelectedMood('');
    onClose();
  };

  const getPersonaPrompt = () => {
    switch (persona) {
      case 'dr_sarah':
        return "What emotions or thoughts would you like to reflect on today?";
      case 'maya':
        return "Take a moment to breathe and notice what's present in your heart...";
      case 'alex':
        return "Hey! What's going on in your world right now?";
      case 'marcus':
        return "What insights or goals are on your mind today?";
      default:
        return "What would you like to reflect on?";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50 animate-in zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-800">
            <BookOpen className="h-5 w-5" />
            Mini Journal Entry
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-therapeutic-caption italic text-therapeutic-accent">
            {getPersonaPrompt()}
          </p>

          <Textarea
            placeholder="Write a few lines about how you're feeling..."
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            className="min-h-[100px] sm:min-h-[120px] border-purple-200/50 focus:ring-purple-400/30 bg-white/80 transition-all duration-200 focus:border-purple-400"
            autoFocus
          />

          <div>
            <p className="text-therapeutic-caption font-medium text-therapeutic-accent mb-2">How are you feeling?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {moodOptions.map((mood) => (
                <Badge
                  key={mood.value}
                  variant={selectedMood === mood.value ? "default" : "outline"}
                  className={`cursor-pointer p-2 flex flex-col items-center gap-1 h-auto transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400/30 ${
                    selectedMood === mood.value
                      ? 'bg-purple-500 text-white border-purple-500 shadow-md'
                      : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-600'
                  }`}
                  onClick={() => setSelectedMood(mood.value)}
                >
                  <span className="text-lg">{mood.emoji}</span>
                  <span className="text-xs">{mood.label}</span>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!entryText.trim() || !selectedMood}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              Save Entry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}