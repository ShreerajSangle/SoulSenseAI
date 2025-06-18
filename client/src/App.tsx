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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PersonaSelector} />
      <Route path="/chat" component={EnhancedChatScreen} />
      <Route path="/chat/:persona" component={EnhancedChatScreen} />
      <Route path="/memory" component={MemoryScreen} />
      <Route path="/diary" component={() => <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold text-slate-800 mb-2">Diary Feature</h2><p className="text-slate-600">Coming soon...</p></div></div>} />
      <Route path="/profile" component={() => <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold text-slate-800 mb-2">Profile Feature</h2><p className="text-slate-600">Coming soon...</p></div></div>} />
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
