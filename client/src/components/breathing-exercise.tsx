import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Play, Pause } from "lucide-react";

interface BreathingExerciseProps {
  isOpen: boolean;
  onClose: () => void;
  persona: {
    id: string;
    name: string;
    color: string;
  };
}

export default function BreathingExercise({ isOpen, onClose, persona }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [count, setCount] = useState(4);
  const [cycle, setCycle] = useState(0);

  // Multiple breathing technique options
  const [selectedTechnique, setSelectedTechnique] = useState<'relaxing' | 'energizing' | 'calming' | 'rescue'>('relaxing');
  
  const breathingTechniques = {
    relaxing: {
      name: "4-7-8 Relaxing",
      pattern: { inhale: 4, hold: 7, exhale: 8 },
      description: "Calms nervous system and reduces anxiety",
      color: "blue"
    },
    energizing: {
      name: "4-4-4 Box Breathing",
      pattern: { inhale: 4, hold: 4, exhale: 4 },
      description: "Balances energy and improves focus",
      color: "green"
    },
    calming: {
      name: "5-5-5 Equal Breathing",
      pattern: { inhale: 5, hold: 5, exhale: 5 },
      description: "Gentle technique for stress relief",
      color: "purple"
    },
    rescue: {
      name: "4-4-6-2 Rescue Breathing",
      pattern: { inhale: 4, hold: 4, exhale: 6 },
      description: "Emergency technique for panic attacks and intense anxiety",
      color: "red"
    }
  } as const;

  const currentTechnique = breathingTechniques[selectedTechnique];
  const pattern = currentTechnique.pattern;

  const getPersonaGuidance = () => {
    switch (persona.id) {
      case 'maya':
        return {
          inhale: "Breathe in slowly... feel the air flowing through you",
          hold: "Hold gently... like a wave pausing at its peak",
          exhale: "Release softly... let go of what no longer serves you"
        };
      case 'sarah':
        return {
          inhale: "Inhale deeply through your nose... grounding yourself",
          hold: "Hold your breath... notice the stillness within",
          exhale: "Exhale slowly through your mouth... releasing tension"
        };
      case 'alex':
        return {
          inhale: "Take a nice deep breath in... you've got this!",
          hold: "Hold it for a moment... feeling centered",
          exhale: "Breathe out all that stress... so much better!"
        };
      case 'marcus':
        return {
          inhale: "Power breath in... filling your lungs with energy",
          hold: "Hold strong... building your focus",
          exhale: "Release with purpose... clearing your mind for action"
        };
      default:
        return {
          inhale: "Breathe in slowly and deeply",
          hold: "Hold your breath gently",
          exhale: "Exhale slowly and completely"
        };
    }
  };

  const guidance = getPersonaGuidance();

  // ESC key handler
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setCount(prev => {
        if (prev > 1) return prev - 1;
        
        // Move to next phase
        if (phase === 'inhale') {
          setPhase('hold');
          return pattern.hold;
        } else if (phase === 'hold') {
          setPhase('exhale');
          return pattern.exhale;
        } else {
          setPhase('inhale');
          setCycle(c => c + 1);
          return pattern.inhale;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, phase, pattern]);

  const startExercise = () => {
    setIsActive(true);
    setPhase('inhale');
    setCount(pattern.inhale);
    setCycle(0);
  };

  const stopExercise = () => {
    setIsActive(false);
    setPhase('inhale');
    setCount(pattern.inhale);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className="w-full max-w-md bg-white dark:bg-gray-900 shadow-xl animate-in zoom-in-95 duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Breathing Exercise with {persona.name}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center space-y-6">
            {/* Technique Selection */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Choose a breathing technique:
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {(['relaxing', 'energizing', 'calming', 'rescue'] as const).map((key) => {
                  const technique = breathingTechniques[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedTechnique(key)}
                      className={`p-3 rounded-lg border text-left transition-all relative ${
                        selectedTechnique === key
                          ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {selectedTechnique === key && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full"></div>
                      )}
                      <div className="font-medium text-sm text-gray-800 dark:text-gray-200">
                        {technique.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {technique.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Breathing Circle Animation */}
            <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
              <div 
                className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ${
                  phase === 'inhale' ? 'scale-110 border-blue-400' :
                  phase === 'hold' ? 'scale-110 border-purple-400' :
                  'scale-75 border-green-400'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${persona.color}20, ${persona.color}10)`
                }}
              />
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {count}
              </div>
            </div>

            {/* Phase Guidance */}
            <div className="space-y-2">
              <div className="text-xl font-medium capitalize text-gray-800 dark:text-gray-200">
                {phase}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 px-4">
                {guidance[phase]}
              </div>
            </div>

            {/* Cycle Counter */}
            {isActive && (
              <div className="text-sm text-gray-500 dark:text-gray-500">
                Cycle {cycle + 1}
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-between gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                💬 Back to Chat
              </Button>
              {!isActive ? (
                <Button
                  onClick={startExercise}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white transition-all hover:scale-105"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Breathing
                </Button>
              ) : (
                <Button
                  onClick={stopExercise}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white transition-all hover:scale-105"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Exercise
                </Button>
              )}
            </div>

            {/* Pattern Info */}
            <div className="text-xs text-gray-500 dark:text-gray-500 pt-2">
              Pattern: {pattern.inhale}-{pattern.hold}-{pattern.exhale}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}