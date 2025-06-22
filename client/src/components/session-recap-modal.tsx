import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Brain, Target, Wind, BookOpen, Save, Share2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface SessionRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  persona: {
    id: string;
    name: string;
    color: string;
  };
  conversationData: {
    id: number;
    messages: any[];
    emotions: string[];
    topics: string[];
    toolsUsed: string[];
    insights: string[];
  };
}

export default function SessionRecapModal({ isOpen, onClose, persona, conversationData }: SessionRecapModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const generateRecapSummary = () => {
    const { emotions, topics, toolsUsed, insights } = conversationData;
    
    let summary = `Today, you shared your thoughts with ${persona.name}. `;
    
    if (emotions.length > 0) {
      const emotionText = emotions.slice(0, 2).join(" and ");
      summary += `I noticed you were feeling ${emotionText}. `;
    }
    
    if (topics.length > 0) {
      summary += `We talked about ${topics[0]}`;
      if (topics.length > 1) {
        summary += ` and ${topics[1]}`;
      }
      summary += ". ";
    }
    
    if (toolsUsed.includes('breathing')) {
      summary += "You practiced breathing exercises to help center yourself. ";
    }
    
    if (toolsUsed.includes('goals')) {
      summary += "You set some personal goals to work toward. ";
    }
    
    if (toolsUsed.includes('journal')) {
      summary += "You took time to journal your thoughts. ";
    }
    
    summary += "I'm proud of you for taking this time for yourself. Remember, every step forward matters, no matter how small.";
    
    return summary;
  };

  const saveRecapMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/session-recaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to save recap');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Session recap saved",
        description: "Your conversation summary has been saved privately.",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error saving recap",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSaveRecap = () => {
    saveRecapMutation.mutate({
      conversationId: conversationData.id,
      summary: generateRecapSummary(),
      emotions: conversationData.emotions,
      topics: conversationData.topics,
      toolsUsed: conversationData.toolsUsed,
      insights: conversationData.insights,
      userId: "anonymous"
    });
  };

  const getIconForTool = (tool: string) => {
    switch (tool) {
      case 'breathing': return Wind;
      case 'goals': return Target;
      case 'journal': return BookOpen;
      default: return Heart;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-purple-200 dark:border-purple-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <Heart className="h-5 w-5" style={{ color: persona.color }} />
            Session Recap with {persona.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {generateRecapSummary()}
              </p>
            </CardContent>
          </Card>

          {/* Emotions */}
          {conversationData.emotions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Emotions explored today:
              </h4>
              <div className="flex flex-wrap gap-2">
                {conversationData.emotions.map((emotion, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                    {emotion}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tools Used */}
          {conversationData.toolsUsed.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Wellness tools you used:
              </h4>
              <div className="flex flex-wrap gap-2">
                {conversationData.toolsUsed.map((tool, index) => {
                  const Icon = getIconForTool(tool);
                  return (
                    <Badge key={index} variant="outline" className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                      <Icon className="h-3 w-3" />
                      {tool}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Key Insights */}
          {conversationData.insights.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Key insights:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {conversationData.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400"
            >
              Close
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Copy recap to clipboard
                  navigator.clipboard.writeText(generateRecapSummary());
                  toast({
                    title: "Copied to clipboard",
                    description: "Session recap copied successfully.",
                  });
                }}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Copy
              </Button>
              <Button
                onClick={handleSaveRecap}
                disabled={saveRecapMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saveRecapMutation.isPending ? "Saving..." : "Save Recap"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}