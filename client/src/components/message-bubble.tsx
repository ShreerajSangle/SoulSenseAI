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
  const isUserMessage = message.sender === "user" || isUser;
  
  return (
    <div className={`flex items-start gap-3 mb-4 ${isUserMessage ? "justify-end" : "justify-start"}`}>
      {/* AI Avatar - Only show for AI messages */}
      {isAI && persona && (
        <Avatar className="w-10 h-10 flex-shrink-0 mt-1">
          <AvatarImage src={persona.avatarUrl} alt={persona.name} />
          <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-semibold">
            {persona.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      )}
      
      {/* Message Bubble */}
      <div className={`max-w-[75%] lg:max-w-md px-4 py-3 rounded-2xl relative ${
        isUserMessage 
          ? "message-bubble-user text-white rounded-tr-sm ml-auto" 
          : "message-bubble-ai rounded-tl-sm"
      }`}>
        <p className={`text-sm leading-relaxed ${
          isUserMessage ? "text-white" : "text-slate-700 dark:text-gray-100"
        }`}>
          {message.content}
        </p>
        
        {/* Timestamp */}
        <div className={`flex items-center mt-2 ${
          isUserMessage ? "justify-end" : "justify-start"
        }`}>
          <div className={`text-xs font-medium ${
            isUserMessage 
              ? "text-white/80" 
              : "text-slate-500 dark:text-gray-400"
          }`}>
            {format(new Date(message.timestamp), "h:mm a")}
          </div>
        </div>
        
        {/* Message tail */}
        <div className={`absolute top-0 w-3 h-3 ${
          isUserMessage 
            ? "-right-1 bg-gradient-to-br from-indigo-500 to-purple-600 transform rotate-45" 
            : "-left-1 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-600 dark:to-gray-700 transform rotate-45"
        }`} />
      </div>
      
      {/* User Avatar - Only show for user messages */}
      {isUserMessage && (
        <Avatar className="w-10 h-10 flex-shrink-0 mt-1">
          <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-semibold">
            You
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
