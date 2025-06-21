import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Persona } from "@shared/schema";

interface TopNavBarProps {
  persona?: Persona;
  onBack?: () => void;
}

export function TopNavBar({ persona, onBack }: TopNavBarProps) {
  const [location] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  return (
    <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-4 py-3 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
              <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </Button>
          )}
          
          {persona && (
            <>
              <Avatar className="w-10 h-10">
                <AvatarImage src={persona.avatarUrl} alt={persona.name} />
                <AvatarFallback>{persona.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-slate-800 dark:text-slate-200">{persona.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Online</p>
              </div>
            </>
          )}
        </div>
        
        <nav className="flex space-x-1">
          <Link href="/chat">
            <Button 
              variant={isActive("/chat") ? "default" : "ghost"} 
              size="sm"
              className={isActive("/chat") ? 
                "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/70" : 
                "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }
            >
              Chat
            </Button>
          </Link>
          <Link href="/session-history">
            <Button 
              variant={isActive("/session-history") ? "default" : "ghost"} 
              size="sm"
              className={isActive("/session-history") ? 
                "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/70" : 
                "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }
            >
              History
            </Button>
          </Link>
          <Link href="/diary">
            <Button 
              variant={isActive("/diary") ? "default" : "ghost"} 
              size="sm"
              className={isActive("/diary") ? 
                "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/70" : 
                "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }
            >
              Journal
            </Button>
          </Link>
          <Link href="/profile">
            <Button 
              variant={isActive("/profile") ? "default" : "ghost"} 
              size="sm"
              className={isActive("/profile") ? 
                "bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/70" : 
                "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }
            >
              Profile
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
