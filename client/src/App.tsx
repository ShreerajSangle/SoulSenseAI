import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import UnifiedHome from "@/pages/unified-home";
import EnhancedMemoryScreen from "@/pages/enhanced-memory-screen";
import EnhancedDiaryScreen from "@/pages/enhanced-diary-screen";
import EnhancedProfileScreen from "@/pages/enhanced-profile-screen";
import ChatSession from "@/pages/chat-session";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={UnifiedHome} />
      <Route path="/memory" component={EnhancedMemoryScreen} />
      <Route path="/diary" component={EnhancedDiaryScreen} />
      <Route path="/profile" component={EnhancedProfileScreen} />
      <Route path="/chat/session/:sessionId" component={ChatSession} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="soulsense-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
