import { useState } from "react";
import { Clock, BookOpen, User, BarChart3, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface UnifiedNavigationProps {
  onHistoryToggle: () => void;
  onJournalToggle: () => void;
  onProfileToggle: () => void;
  onInsightsToggle: () => void;
  isHistoryOpen: boolean;
  isJournalOpen: boolean;
  isProfileOpen: boolean;
  isInsightsOpen: boolean;
  unreadCount?: number;
}

export function UnifiedNavigation({
  onHistoryToggle,
  onJournalToggle, 
  onProfileToggle,
  onInsightsToggle,
  isHistoryOpen,
  isJournalOpen,
  isProfileOpen,
  isInsightsOpen,
  unreadCount = 0
}: UnifiedNavigationProps) {
  return (
    <div className="fixed top-6 right-6 z-50">
      {/* Floating Action Menu */}
      <div className="flex flex-col gap-3">
        {/* Brand Icon */}
        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>

        {/* Navigation Icons */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-3 shadow-xl border border-white/50">
          <div className="flex flex-col gap-2">
            {/* Session History */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onHistoryToggle}
                  className={`w-10 h-10 rounded-xl transition-all duration-200 ${
                    isHistoryOpen 
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                      : 'text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-purple-900 text-white">
                Session History
              </TooltipContent>
            </Tooltip>

            {/* Journal */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onJournalToggle}
                  className={`w-10 h-10 rounded-xl transition-all duration-200 relative ${
                    isJournalOpen 
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                      : 'text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-pink-500 text-white rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-purple-900 text-white">
                Journal & Reflections
              </TooltipContent>
            </Tooltip>

            {/* Insights Dashboard */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onInsightsToggle}
                  className={`w-10 h-10 rounded-xl transition-all duration-200 ${
                    isInsightsOpen 
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                      : 'text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-purple-900 text-white">
                Progress Insights
              </TooltipContent>
            </Tooltip>

            {/* Profile Settings */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onProfileToggle}
                  className={`w-10 h-10 rounded-xl transition-all duration-200 ${
                    isProfileOpen 
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                      : 'text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-purple-900 text-white">
                Preferences
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}