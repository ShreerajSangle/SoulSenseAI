import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Download, Copy, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SessionRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: {
    name: string;
    emoji: string;
  };
  sessionData: {
    emotionalThemes: string[];
    keyInsights: string[];
    goalsSet: string[];
    breathingExercises: number;
    duration: string;
  };
}

export function SessionRecapModal({ isOpen, onClose, persona, sessionData }: SessionRecapModalProps) {
  const { toast } = useToast();
  const [isSaved, setIsSaved] = useState(false);

  const generateRecapText = () => {
    const { emotionalThemes, keyInsights, goalsSet, breathingExercises, duration } = sessionData;
    
    let recap = `✨ Session Recap with ${persona.name} ${persona.emoji}\n\n`;
    
    if (emotionalThemes.length > 0) {
      recap += `💭 Today we explored: ${emotionalThemes.join(', ')}\n\n`;
    }
    
    if (keyInsights.length > 0) {
      recap += `🌟 Key insights:\n${keyInsights.map(insight => `• ${insight}`).join('\n')}\n\n`;
    }
    
    if (goalsSet.length > 0) {
      recap += `🎯 Goals set:\n${goalsSet.map(goal => `• ${goal}`).join('\n')}\n\n`;
    }
    
    if (breathingExercises > 0) {
      recap += `🌬️ You practiced ${breathingExercises} breathing exercise${breathingExercises > 1 ? 's' : ''}\n\n`;
    }
    
    recap += `⏰ Session duration: ${duration}\n\n`;
    recap += `💜 Remember: You're doing great by taking care of your emotional wellbeing. Every step forward matters.`;
    
    return recap;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateRecapText());
    toast({
      title: "Copied to clipboard",
      description: "Your session recap has been copied successfully.",
    });
  };

  const handleSave = () => {
    // In a real app, this would save to localStorage or database
    localStorage.setItem(`session-recap-${Date.now()}`, generateRecapText());
    setIsSaved(true);
    toast({
      title: "Session saved",
      description: "Your recap has been saved for future reference.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-purple-800">
            <Star className="h-5 w-5" />
            Session Recap
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center p-4 bg-white/60 rounded-lg border border-purple-200/50">
            <div className="text-2xl mb-2">{persona.emoji}</div>
            <p className="text-purple-700 font-medium">
              Great session with {persona.name}!
            </p>
          </div>

          {sessionData.emotionalThemes.length > 0 && (
            <div>
              <h4 className="font-medium text-purple-800 mb-2">💭 Today we explored:</h4>
              <div className="flex flex-wrap gap-2">
                {sessionData.emotionalThemes.map((theme, index) => (
                  <Badge key={index} variant="outline" className="border-purple-200 text-purple-600">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {sessionData.keyInsights.length > 0 && (
            <div>
              <h4 className="font-medium text-purple-800 mb-2">🌟 Key insights:</h4>
              <ul className="space-y-1">
                {sessionData.keyInsights.map((insight, index) => (
                  <li key={index} className="text-sm text-purple-600 flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sessionData.goalsSet.length > 0 && (
            <div>
              <h4 className="font-medium text-purple-800 mb-2">🎯 Goals set:</h4>
              <ul className="space-y-1">
                {sessionData.goalsSet.map((goal, index) => (
                  <li key={index} className="text-sm text-purple-600 flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-center p-3 bg-gradient-to-r from-purple-100/50 to-pink-100/50 rounded-lg">
            <p className="text-sm text-purple-700 italic">
              💜 Remember: You're doing great by taking care of your emotional wellbeing. Every step forward matters.
            </p>
          </div>

          <div className="flex justify-between gap-2 pt-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isSaved}
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <Download className="h-3 w-3 mr-1" />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
            </div>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}