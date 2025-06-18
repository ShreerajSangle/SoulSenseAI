import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useChat } from "@/hooks/use-chat";
import { TopNavBar } from "@/components/top-nav-bar";
import { MessageBubble } from "@/components/message-bubble";
import { TypingIndicator } from "@/components/typing-indicator";
import { InputBar } from "@/components/input-bar";
import { MoodSelector } from "@/components/mood-selector";
import { CrisisAlert } from "@/components/crisis-alert";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Heart } from "lucide-react";

export default function ChatScreen() {
  const [location, setLocation] = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get persona ID from URL params
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const personaId = searchParams.get('persona');
  
  const { 
    messages, 
    persona, 
    isTyping, 
    messagesLoading, 
    sendMessage, 
    isLoading, 
    error,
    conversationId,
    showMoodSelector,
    handleMoodSelect,
    skipMoodCheck,
    greeting,
    selectedMood
  } = useChat(personaId || undefined);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleBack = () => {
    setLocation("/");
  };

  if (!personaId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">No Persona Selected</h2>
          <p className="text-slate-600 mb-4">Please select a persona to start chatting.</p>
          <button 
            onClick={handleBack}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Select Persona
          </button>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h2>
          <p className="text-slate-600 mb-4">{error.message}</p>
          <button 
            onClick={handleBack}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col chat-container">
      <TopNavBar persona={persona} onBack={handleBack} />

      <main className="flex-1 overflow-y-auto px-4 py-6 messages-container">
        <div className="max-w-4xl mx-auto space-y-4">
          {messagesLoading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-slate-500 mt-2">Loading conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              {persona && (
                <div className="mb-6">
                  <img 
                    src={persona.avatarUrl} 
                    alt={persona.name}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold text-slate-800">{persona.name}</h3>
                  <p className="text-slate-600">{persona.description}</p>
                </div>
              )}
              
              {showMoodSelector ? (
                <MoodSelector 
                  onMoodSelect={handleMoodSelect} 
                  onSkip={skipMoodCheck}
                />
              ) : greeting ? (
                <div className="bg-white rounded-2xl p-6 shadow-sm border max-w-md mx-auto mb-6 animate-slide-up">
                  <p className="text-slate-700">{greeting}</p>
                </div>
              ) : (
                <p className="text-slate-500">Start a conversation by sending a message below.</p>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                persona={persona}
                isUser={message.sender === "user"}
              />
            ))
          )}

          {isTyping && <TypingIndicator persona={persona} />}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      <InputBar onSendMessage={sendMessage} disabled={isLoading} />
    </div>
  );
}
