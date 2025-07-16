import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface DynamicTypingIndicatorProps {
  persona: {
    id: string;
    name: string;
    avatar: string;
    emoji: string;
  };
  isVisible: boolean;
  className?: string;
}

export function DynamicTypingIndicator({ persona, isVisible, className = "" }: DynamicTypingIndicatorProps) {
  const [dots, setDots] = useState("");
  const [stage, setStage] = useState<'typing' | 'thinking' | 'paused'>('typing');

  useEffect(() => {
    if (!isVisible) return;

    // Get persona-specific typing pattern
    const getTypingPattern = () => {
      switch (persona.id) {
        case 'alex':
          // Alex types quickly with short pauses
          return {
            typingSpeed: 150,
            pauseDuration: 800,
            thinkingDuration: 300
          };
        case 'maya':
          // Maya types slowly with longer pauses for reflection
          return {
            typingSpeed: 400,
            pauseDuration: 1500,
            thinkingDuration: 1000
          };
        case 'sarah':
          // Sarah types thoughtfully with moderate pace
          return {
            typingSpeed: 250,
            pauseDuration: 1200,
            thinkingDuration: 600
          };
        case 'marcus':
          // Marcus types with confidence, steady rhythm
          return {
            typingSpeed: 200,
            pauseDuration: 900,
            thinkingDuration: 400
          };
        default:
          return {
            typingSpeed: 300,
            pauseDuration: 1000,
            thinkingDuration: 500
          };
      }
    };

    const pattern = getTypingPattern();
    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    const startTypingCycle = () => {
      // Typing phase
      setStage('typing');
      intervalId = setInterval(() => {
        setDots(prev => {
          if (prev.length >= 3) return "";
          return prev + "•";
        });
      }, pattern.typingSpeed);

      // After some typing, pause to "think"
      timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        setStage('thinking');
        setDots("💭");
        
        // Thinking phase
        setTimeout(() => {
          setStage('paused');
          setDots("");
          
          // Short pause then resume typing
          setTimeout(() => {
            if (isVisible) startTypingCycle();
          }, pattern.pauseDuration);
        }, pattern.thinkingDuration);
      }, pattern.typingSpeed * 8); // Type for a while before thinking
    };

    startTypingCycle();

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isVisible, persona.id]);

  if (!isVisible) return null;

  const getPersonaTypingText = () => {
    switch (persona.id) {
      case 'alex':
        return stage === 'thinking' ? "Alex is finding the right words..." : `Alex is typing${dots}`;
      case 'maya':
        return stage === 'thinking' ? "Maya is reflecting..." : `Maya is writing${dots}`;
      case 'sarah':
        return stage === 'thinking' ? "Dr. Sarah is considering..." : `Dr. Sarah is responding${dots}`;
      case 'marcus':
        return stage === 'thinking' ? "Marcus is gathering thoughts..." : `Marcus is typing${dots}`;
      default:
        return `${persona.name} is typing${dots}`;
    }
  };

  return (
    <div className={`flex items-center gap-3 p-4 animate-in fade-in-0 slide-in-from-left-2 duration-300 ${className}`}>
      <Avatar className="w-8 h-8 ring-2 ring-therapeutic-primary/20">
        <AvatarImage src={persona.avatar} alt={persona.name} />
        <AvatarFallback className="bg-gradient-to-br from-therapeutic-primary to-therapeutic-secondary text-white text-sm">
          {persona.emoji}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-therapeutic-primary/10">
          <div className="flex items-center gap-2">
            {stage === 'thinking' ? (
              <div className="animate-pulse">
                <span className="text-lg">💭</span>
              </div>
            ) : (
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-therapeutic-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-therapeutic-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-therapeutic-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            )}
            
            <span className={`text-sm text-gray-600 transition-opacity duration-300 ${
              stage === 'paused' ? 'opacity-50' : 'opacity-100'
            }`}>
              {getPersonaTypingText()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}