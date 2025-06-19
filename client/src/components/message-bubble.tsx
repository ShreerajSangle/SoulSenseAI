import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Message, Persona } from "@shared/schema";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
  persona?: Persona;
  isUser?: boolean;
}

export function MessageBubble({ message, persona, isUser }: MessageBubbleProps) {
  const isAI = message.sender === "ai";
  
  return (
    <div className={`flex items-start space-x-3 ${isUser ? "justify-end" : ""}`}>
      {isAI && persona && (
        <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
          <AvatarImage src={persona.avatarUrl} alt={persona.name} />
          <AvatarFallback>{persona.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
        isAI 
          ? "message-bubble-ai rounded-tl-sm" 
          : "message-bubble-user text-white rounded-tr-sm"
      }`}>
        <p className={isAI ? "text-slate-700" : "text-white"}>
          {message.content}
        </p>
        
        <div className={`flex items-center justify-between mt-3 ${
          isAI ? "flex-row" : "flex-row-reverse"
        }`}>
          <div className={`text-xs ${
            isAI ? "text-slate-500" : "text-indigo-200"
          }`}>
            {format(new Date(message.timestamp), "h:mm a")}
          </div>
          
          {/* Emotion detection badge removed */}
        </div>
      </div>
    </div>
  );
}
