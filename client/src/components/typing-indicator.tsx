import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Persona } from "@shared/schema";

interface TypingIndicatorProps {
  persona?: Persona;
}

export function TypingIndicator({ persona }: TypingIndicatorProps) {
  return (
    <div className="flex items-start space-x-3">
      {persona && (
        <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
          <AvatarImage src={persona.avatarUrl} alt={persona.name} />
          <AvatarFallback>{persona.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
      )}
      
      <div className="message-bubble-ai px-4 py-3 rounded-2xl rounded-tl-sm">
        <div className="flex space-x-1">
          <div className="typing-dot w-2 h-2 bg-slate-400 rounded-full"></div>
          <div className="typing-dot w-2 h-2 bg-slate-400 rounded-full"></div>
          <div className="typing-dot w-2 h-2 bg-slate-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
