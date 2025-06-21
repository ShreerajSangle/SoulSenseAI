import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import ConversationHub from "@/pages/conversation-hub";
import PersonaSelector from "@/pages/persona-selector";
import ChatScreen from "@/pages/chat-screen";
import EnhancedChatScreen from "@/pages/enhanced-chat-screen";
import MemoryScreen from "@/pages/memory-screen";
import SessionSummary from "@/pages/session-summary";
import DiaryScreen from "@/pages/diary-screen";
import RedesignedProfile from "@/pages/redesigned-profile";
import ClinicalAssessment from "@/pages/clinical-assessment";
import TherapeuticJourney from "@/pages/therapeutic-journey";
import NotFound from "@/pages/not-found";
import ReplikaQualityDemo from "@/pages/replika-quality-demo";
import SpecializedPersonaDemo from "@/pages/specialized-persona-demo";
import SoulSenseAIDemo from "@/pages/soulsense-ai-demo";
import ModelComparison from "@/pages/model-comparison";
import AdvancedChat from "@/pages/advanced-chat";
import SessionHistory from "@/pages/session-history";
import GPT4oChat from "@/pages/gpt4o-chat";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ConversationHub} />
      <Route path="/personas" component={PersonaSelector} />
      <Route path="/chat" component={EnhancedChatScreen} />
      <Route path="/chat/:persona" component={EnhancedChatScreen} />
      <Route path="/replika-demo" component={ReplikaQualityDemo} />
      <Route path="/specialized-demo" component={SpecializedPersonaDemo} />
      <Route path="/soulsense-demo" component={SoulSenseAIDemo} />
      <Route path="/memory" component={MemoryScreen} />
      <Route path="/diary" component={DiaryScreen} />
      <Route path="/profile" component={RedesignedProfile} />
      <Route path="/clinical-assessment" component={ClinicalAssessment} />
      <Route path="/therapeutic-journey" component={TherapeuticJourney} />
      <Route path="/session-summary" component={SessionSummary} />
      <Route path="/session-history" component={SessionHistory} />
      <Route path="/model-comparison" component={ModelComparison} />
      <Route path="/advanced-chat/:persona" component={AdvancedChat} />
      <Route path="/gpt4o-chat" component={GPT4oChat} />
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
