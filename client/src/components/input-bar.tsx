import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Smile, Paperclip, Mic } from "lucide-react";

interface InputBarProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function InputBar({ onSendMessage, disabled, placeholder = "Type your message..." }: InputBarProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <footer className="bg-white/90 backdrop-blur-sm border-t border-slate-200 px-4 py-4 sticky bottom-0">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 flex items-center space-x-3">
            <Input
              type="text"
              placeholder={placeholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button type="button" variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
              <Smile className="h-5 w-5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
              <Mic className="h-5 w-5" />
            </Button>
          </div>
          <Button 
            type="submit" 
            disabled={!message.trim() || disabled}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </footer>
  );
}
