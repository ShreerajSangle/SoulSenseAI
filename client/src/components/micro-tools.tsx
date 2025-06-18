import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Heart, Eye, Hand, Brain, CheckCircle } from "lucide-react";

// Breathing Exercise Component
interface BreathingExerciseProps {
  onComplete: (duration: number, effectiveness?: number) => void;
  onClose: () => void;
}

export function BreathingExercise({ onComplete, onClose }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(4);
  const [totalTime, setTotalTime] = useState(0);
  const [technique, setTechnique] = useState<'4-7-8' | '4-4-4' | 'box'>('4-7-8');
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();

  const techniques = {
    '4-7-8': { inhale: 4, hold: 7, exhale: 8, rest: 0, name: "4-7-8 Relaxation" },
    '4-4-4': { inhale: 4, hold: 4, exhale: 4, rest: 0, name: "4-4-4 Calming" },
    'box': { inhale: 4, hold: 4, exhale: 4, rest: 4, name: "Box Breathing" }
  };

  const currentTechnique = techniques[technique];

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Move to next phase
            setPhase(currentPhase => {
              const phases: Array<keyof typeof currentTechnique> = ['inhale', 'hold', 'exhale', 'rest'];
              const currentIndex = phases.indexOf(currentPhase);
              const nextPhase = phases[(currentIndex + 1) % phases.length];
              
              if (nextPhase === 'inhale') {
                setCycleCount(prev => prev + 1);
              }
              
              return nextPhase;
            });
            return currentTechnique[phase];
          }
          return prev - 1;
        });
        setTotalTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, phase, currentTechnique]);

  const startExercise = () => {
    setIsActive(true);
    startTimeRef.current = Date.now();
    setTimeLeft(currentTechnique.inhale);
    setPhase('inhale');
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const resetExercise = () => {
    setIsActive(false);
    setPhase('inhale');
    setCycleCount(0);
    setTimeLeft(currentTechnique.inhale);
    setTotalTime(0);
  };

  const finishExercise = () => {
    const duration = Math.floor(totalTime / 60);
    onComplete(duration);
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale': return 'text-blue-600';
      case 'hold': return 'text-purple-600';
      case 'exhale': return 'text-green-600';
      case 'rest': return 'text-gray-600';
    }
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale': return 'Breathe in slowly...';
      case 'hold': return 'Hold your breath...';
      case 'exhale': return 'Breathe out slowly...';
      case 'rest': return 'Rest and prepare...';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Breathing Exercise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            {Object.entries(techniques).map(([key, tech]) => (
              <Button
                key={key}
                variant={technique === key ? "default" : "outline"}
                size="sm"
                onClick={() => setTechnique(key as keyof typeof techniques)}
                disabled={isActive}
              >
                {tech.name}
              </Button>
            ))}
          </div>
          
          <div className="text-center space-y-4">
            <div className={`text-6xl font-light ${getPhaseColor()}`}>
              {timeLeft}
            </div>
            <div className={`text-lg ${getPhaseColor()}`}>
              {getPhaseInstruction()}
            </div>
            <div className="text-sm text-gray-600">
              Cycle {cycleCount} • {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            {!isActive ? (
              <Button onClick={startExercise} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                {cycleCount > 0 ? 'Resume' : 'Start'}
              </Button>
            ) : (
              <Button onClick={pauseExercise} variant="outline" className="flex items-center gap-2">
                <Pause className="w-4 h-4" />
                Pause
              </Button>
            )}
            <Button onClick={resetExercise} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          {cycleCount >= 3 && (
            <div className="text-center space-y-2">
              <p className="text-sm text-green-600">Great progress! You've completed {cycleCount} cycles.</p>
              <Button onClick={finishExercise} className="bg-green-600 hover:bg-green-700">
                Finish Exercise
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Grounding Technique Component
interface GroundingTechniqueProps {
  onComplete: (duration: number, effectiveness?: number) => void;
  onClose: () => void;
}

export function GroundingTechnique({ onComplete, onClose }: GroundingTechniqueProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const [startTime] = useState(Date.now());
  const [technique, setTechnique] = useState<'5-4-3-2-1' | 'body-scan' | 'grounding-statements'>('5-4-3-2-1');

  const techniques = {
    '5-4-3-2-1': {
      name: "5-4-3-2-1 Technique",
      description: "Use your senses to ground yourself in the present moment",
      steps: [
        { prompt: "Name 5 things you can SEE around you", icon: Eye, count: 5 },
        { prompt: "Name 4 things you can TOUCH or feel", icon: Hand, count: 4 },
        { prompt: "Name 3 things you can HEAR", icon: "👂", count: 3 },
        { prompt: "Name 2 things you can SMELL", icon: "👃", count: 2 },
        { prompt: "Name 1 thing you can TASTE", icon: "👅", count: 1 }
      ]
    },
    'body-scan': {
      name: "Body Scan",
      description: "Notice physical sensations throughout your body",
      steps: [
        { prompt: "How do your feet feel right now?", icon: "🦶", count: 1 },
        { prompt: "Notice your legs and how they're positioned", icon: "🦵", count: 1 },
        { prompt: "How does your back feel against your chair?", icon: "🪑", count: 1 },
        { prompt: "Notice your shoulders - are they tense or relaxed?", icon: "💪", count: 1 },
        { prompt: "How does your face feel? Your jaw, your forehead?", icon: "😌", count: 1 }
      ]
    },
    'grounding-statements': {
      name: "Grounding Statements",
      description: "Remind yourself of facts about the present moment",
      steps: [
        { prompt: "My name is...", icon: "👤", count: 1 },
        { prompt: "I am sitting/standing in...", icon: "📍", count: 1 },
        { prompt: "Today is... (day, date, year)", icon: "📅", count: 1 },
        { prompt: "I am safe because...", icon: "🛡️", count: 1 },
        { prompt: "After this, I will...", icon: "⏭️", count: 1 }
      ]
    }
  };

  const currentTechnique = techniques[technique];
  const currentStepData = currentTechnique.steps[currentStep];

  const handleResponse = (response: string) => {
    const newResponses = [...responses, response];
    setResponses(newResponses);
    
    if (currentStep < currentTechnique.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const completeExercise = () => {
    const duration = Math.floor((Date.now() - startTime) / 60000);
    onComplete(duration);
  };

  const isComplete = currentStep >= currentTechnique.steps.length;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          Grounding Exercise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(techniques).map(([key, tech]) => (
              <Button
                key={key}
                variant={technique === key ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setTechnique(key as keyof typeof techniques);
                  setCurrentStep(0);
                  setResponses([]);
                }}
                disabled={responses.length > 0}
              >
                {tech.name}
              </Button>
            ))}
          </div>

          <div className="text-center">
            <h3 className="font-medium">{currentTechnique.name}</h3>
            <p className="text-sm text-gray-600">{currentTechnique.description}</p>
          </div>

          <Progress value={(currentStep / currentTechnique.steps.length) * 100} className="h-2" />

          {!isComplete ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {typeof currentStepData.icon === 'string' ? currentStepData.icon : '🎯'}
                </div>
                <p className="font-medium">{currentStepData.prompt}</p>
              </div>

              <GroundingInput
                onSubmit={handleResponse}
                placeholder="Type your response here..."
                expectedCount={currentStepData.count}
              />

              <div className="text-center text-sm text-gray-500">
                Step {currentStep + 1} of {currentTechnique.steps.length}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <div>
                <h3 className="font-medium text-green-700">Exercise Complete!</h3>
                <p className="text-sm text-gray-600">
                  You've successfully completed the {currentTechnique.name} exercise.
                </p>
              </div>
              <Button onClick={completeExercise} className="bg-green-600 hover:bg-green-700">
                Finish & Rate Effectiveness
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// CBT Journal Component
interface CBTJournalProps {
  onComplete: (duration: number, effectiveness?: number) => void;
  onClose: () => void;
}

export function CBTJournal({ onComplete, onClose }: CBTJournalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [startTime] = useState(Date.now());

  const steps = [
    {
      title: "Situation",
      prompt: "Describe the situation that triggered these thoughts or feelings:",
      placeholder: "What happened? Where were you? Who was involved?"
    },
    {
      title: "Thoughts",
      prompt: "What thoughts went through your mind?",
      placeholder: "What did you think about yourself, others, or the situation?"
    },
    {
      title: "Feelings",
      prompt: "What emotions did you experience?",
      placeholder: "How did you feel? Rate the intensity (1-10)"
    },
    {
      title: "Body Sensations",
      prompt: "What physical sensations did you notice?",
      placeholder: "Tension, racing heart, butterflies, etc."
    },
    {
      title: "Evidence For",
      prompt: "What evidence supports your thoughts?",
      placeholder: "What facts or experiences support this thinking?"
    },
    {
      title: "Evidence Against",
      prompt: "What evidence challenges your thoughts?",
      placeholder: "What facts contradict or question this thinking?"
    },
    {
      title: "Balanced Thought",
      prompt: "What would be a more balanced, realistic thought?",
      placeholder: "Considering all evidence, what's a more helpful way to think about this?"
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEntryChange = (value: string) => {
    setEntries(prev => ({
      ...prev,
      [currentStepData.title]: value
    }));
  };

  const completeJournal = () => {
    const duration = Math.floor((Date.now() - startTime) / 60000);
    onComplete(duration);
  };

  const isComplete = currentStep >= steps.length;
  const canProceed = entries[currentStepData?.title]?.trim().length > 0;

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-500" />
          CBT Thought Record
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isComplete ? (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{currentStep + 1}/{steps.length}</Badge>
                <h3 className="font-medium">{currentStepData.title}</h3>
              </div>

              <Progress value={((currentStep + 1) / steps.length) * 100} className="h-2" />

              <div>
                <p className="text-sm font-medium mb-2">{currentStepData.prompt}</p>
                <Textarea
                  value={entries[currentStepData.title] || ''}
                  onChange={(e) => handleEntryChange(e.target.value)}
                  placeholder={currentStepData.placeholder}
                  className="min-h-[120px]"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-between">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              
              {currentStep === steps.length - 1 ? (
                <Button 
                  onClick={completeJournal}
                  disabled={!canProceed}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Complete Journal
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  disabled={!canProceed}
                >
                  Next
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <h3 className="font-medium text-green-700">Journal Complete!</h3>
              <p className="text-sm text-gray-600">
                You've worked through your thoughts and feelings systematically.
              </p>
            </div>
            <Button onClick={completeJournal} className="bg-green-600 hover:bg-green-700">
              Finish & Rate Effectiveness
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper component for grounding input
interface GroundingInputProps {
  onSubmit: (response: string) => void;
  placeholder: string;
  expectedCount: number;
}

function GroundingInput({ onSubmit, placeholder, expectedCount }: GroundingInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        onKeyPress={handleKeyPress}
        className="min-h-[80px]"
      />
      <Button onClick={handleSubmit} disabled={!value.trim()} className="w-full">
        Continue
      </Button>
    </div>
  );
}