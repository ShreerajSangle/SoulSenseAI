import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PersonaSelector from "@/pages/persona-selector";
import ChatScreen from "@/pages/chat-screen";
import EnhancedChatScreen from "@/pages/enhanced-chat-screen";
import MemoryScreen from "@/pages/memory-screen";
import SessionSummary from "@/pages/session-summary";
import DiaryScreen from "@/pages/diary-screen";
import ProfileScreen from "@/pages/profile-screen";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PersonaSelector} />
      <Route path="/chat" component={EnhancedChatScreen} />
      <Route path="/chat/:persona" component={EnhancedChatScreen} />
      <Route path="/memory" component={MemoryScreen} />
      <Route path="/diary" component={DiaryScreen} />
      <Route path="/profile" component={ProfileScreen} />
      <Route path="/session-summary" component={SessionSummary} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
