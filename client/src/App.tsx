import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import UnifiedHome from "@/pages/unified-home";
import MemoryScreen from "@/pages/memory-screen-clean";
import DiaryScreen from "@/pages/diary-screen";
import RedesignedProfile from "@/pages/redesigned-profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={UnifiedHome} />
      <Route path="/memory" component={MemoryScreen} />
      <Route path="/diary" component={DiaryScreen} />
      <Route path="/profile" component={RedesignedProfile} />
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
