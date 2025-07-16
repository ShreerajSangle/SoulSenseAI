import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Heart, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

interface SessionFeedbackDialogProps {
  open: boolean;
  onClose: () => void;
  personaName: string;
  sessionDuration: string;
  onSubmit: (feedback: SessionFeedback) => void;
}

interface SessionFeedback {
  rating: number;
  feedback: string;
  helpfulness: number;
  wouldRecommend: boolean;
}

export function SessionFeedbackDialog({ 
  open, 
  onClose, 
  personaName, 
  sessionDuration,
  onSubmit 
}: SessionFeedbackDialogProps) {
  const [rating, setRating] = useState(0);
  const [helpfulness, setHelpfulness] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = () => {
    const sessionFeedback: SessionFeedback = {
      rating,
      feedback,
      helpfulness,
      wouldRecommend
    };
    
    onSubmit(sessionFeedback);
    
    // Reset form
    setRating(0);
    setHelpfulness(0);
    setFeedback("");
    setWouldRecommend(false);
    
    onClose();
    setLocation("/"); // Navigate to home screen
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (rating: number) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer transition-colors ${
              star <= value 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300 hover:text-yellow-200"
            }`}
            onClick={() => onChange(star)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            Session Complete
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Session Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-2">Session Summary</h3>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Persona:</strong> {personaName}</p>
              <p><strong>Duration:</strong> {sessionDuration}</p>
            </div>
          </div>

          {/* Overall Rating */}
          <StarRating
            value={rating}
            onChange={setRating}
            label="How would you rate this session overall?"
          />

          {/* Helpfulness Rating */}
          <StarRating
            value={helpfulness}
            onChange={setHelpfulness}
            label="How helpful was this conversation?"
          />

          {/* Recommendation */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Would you recommend this experience to others?
            </Label>
            <div className="flex gap-3">
              <Button
                variant={wouldRecommend ? "default" : "outline"}
                size="sm"
                onClick={() => setWouldRecommend(true)}
                className="flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Yes
              </Button>
              <Button
                variant={!wouldRecommend ? "default" : "outline"}
                size="sm"
                onClick={() => setWouldRecommend(false)}
              >
                Not sure
              </Button>
            </div>
          </div>

          {/* Feedback Text */}
          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-sm font-medium">
              Share your thoughts (optional)
            </Label>
            <Textarea
              id="feedback"
              placeholder="What did you like? What could be improved? Any specific insights or breakthroughs?"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={rating === 0}
            >
              Submit Feedback
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                setLocation("/");
              }}
            >
              Skip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}