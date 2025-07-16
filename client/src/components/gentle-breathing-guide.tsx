import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wind, Pause, RotateCcw, X } from "lucide-react";

interface BreathingGuideProps {
  persona: "sarah" | "alex" | "maya" | "marcus";
  onComplete?: () => void;
  onCancel?: () => void;
  className?: string;
}

const BREATHING_PATTERNS = {
  basic: { inhale: 4, hold: 4, exhale: 6, rounds: 5 },
  anxiety: { inhale: 4, hold: 7, exhale: 8, rounds: 4 },
  quick: { inhale: 3, hold: 3, exhale: 4, rounds: 3 }
};

const PERSONA_GUIDANCE = {
  sarah: {
    intro: "Let's take a few deep breaths together. This will help calm your nervous system.",
    inhale: "Breathe in slowly through your nose...",
    hold: "Hold this breath gently...",
    exhale: "Now breathe out slowly, releasing the tension...",
    complete: "Beautiful. Notice how that feels in your body. You're doing great."
  },
  alex: {
    intro: "Hey, let's pause and breathe together for a sec. This always helps me reset!",
    inhale: "Big breath in through your nose...",
    hold: "Hold it... you've got this...",
    exhale: "And let it all out... ahhhh, that's better!",
    complete: "Nice work! See how much better that feels? You're stronger than you know. 💙"
  },
  maya: {
    intro: "Let's return to our breath - the sacred rhythm that connects us to peace.",
    inhale: "Breathe in light and calm...",
    hold: "Feel this moment of stillness...",
    exhale: "Release what no longer serves you...",
    complete: "Feel the gentle wisdom of your breath. You carry peace within you always."
  },
  marcus: {
    intro: "Time for a strategic breathing reset. This will sharpen your focus.",
    inhale: "Inhale with intention and purpose...",
    hold: "Hold steady - building your resilience...",
    exhale: "Exhale stress and doubt...",
    complete: "Excellent. You're now centered and ready to tackle whatever comes next."
  }
};

export function GentleBreathingGuide({ persona, onComplete, onCancel, className = "" }: BreathingGuideProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [count, setCount] = useState(4);
  const [round, setRound] = useState(1);
  const [pattern] = useState(BREATHING_PATTERNS.basic);
  
  const guidance = PERSONA_GUIDANCE[persona] || PERSONA_GUIDANCE.dr_sarah;

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          // Move to next phase
          if (phase === "inhale") {
            setPhase("hold");
            return pattern.hold;
          } else if (phase === "hold") {
            setPhase("exhale");
            return pattern.exhale;
          } else {
            // Complete round
            if (round >= pattern.rounds) {
              setIsActive(false);
              setPhase("inhale");
              setRound(1);
              onComplete?.();
              return pattern.inhale;
            } else {
              setRound(r => r + 1);
              setPhase("inhale");
              return pattern.inhale;
            }
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, round, pattern, onComplete]);

  const handleStart = () => {
    setIsActive(true);
    setPhase("inhale");
    setCount(pattern.inhale);
    setRound(1);
  };

  const handleStop = () => {
    setIsActive(false);
    setPhase("inhale");
    setCount(pattern.inhale);
    setRound(1);
  };

  const handleCancel = () => {
    setIsActive(false);
    setPhase("inhale");
    setCount(pattern.inhale);
    setRound(1);
    onCancel?.();
  };

  return (
    <Card className={`bg-gradient-to-br from-purple-50/80 to-pink-50/80 border-purple-200/50 animate-in fade-in-0 slide-in-from-bottom-3 duration-300 ${className}`}>
      <CardContent className="p-4 space-y-4">
        {/* Close Button */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 p-0 transition-all duration-200"
            title="Close breathing exercise"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <Wind className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {isActive ? (
              <span className="font-medium">
                {phase === "inhale" && (guidance?.inhale || "Breathe in slowly...")}
                {phase === "hold" && (guidance?.hold || "Hold your breath...")}
                {phase === "exhale" && (guidance?.exhale || "Breathe out gently...")}
              </span>
            ) : (
              guidance?.intro || "Let's take a moment to breathe together."
            )}
          </p>
        </div>

        {isActive && (
          <div className="text-center space-y-3">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 opacity-30"></div>
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 transition-transform duration-1000"
                style={{
                  transform: `scale(${phase === "inhale" ? 1.2 : phase === "hold" ? 1.2 : 0.8})`
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{count}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 capitalize">
              {phase} • Round {round} of {pattern.rounds}
            </p>
          </div>
        )}

        <div className="flex justify-center gap-2">
          {!isActive ? (
            <Button
              onClick={handleStart}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 text-white px-6 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            >
              <Wind className="h-4 w-4 mr-2" />
              Start Breathing
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleStop}>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
              <Button variant="outline" size="sm" onClick={handleStart}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Restart
              </Button>
            </div>
          )}
        </div>

        {!isActive && round > 1 && (
          <p className="text-xs text-center text-gray-600 leading-relaxed">
            {guidance.complete}
          </p>
        )}
      </CardContent>
    </Card>
  );
}