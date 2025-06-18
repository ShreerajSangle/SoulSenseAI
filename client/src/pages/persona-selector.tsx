import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, User, Trophy, Leaf } from "lucide-react";
import { usePersonas } from "@/hooks/use-chat";
import { useLocation } from "wouter";
import type { Persona } from "@shared/schema";

const personaIcons = {
  "dr-sarah": User,
  "alex": User,
  "marcus": Trophy,
  "maya": Leaf,
};

const personaColors = {
  "dr-sarah": "border-purple-300 hover:border-purple-500",
  "alex": "border-amber-300 hover:border-amber-500",
  "marcus": "border-red-300 hover:border-red-500",
  "maya": "border-green-300 hover:border-green-500",
};

export default function PersonaSelector() {
  const { data: personas = [], isLoading } = usePersonas();
  const [, setLocation] = useLocation();

  const handlePersonaSelect = (persona: Persona) => {
    setLocation(`/chat/${persona.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Heart className="text-white text-2xl" />
          </div>
          <p className="text-slate-600">Loading personas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Heart className="text-white text-2xl" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 mb-3">SoulSense AI</h1>
            <p className="text-lg text-slate-600">Choose your therapeutic companion for today's session</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {personas.map((persona) => {
            const IconComponent = personaIcons[persona.id as keyof typeof personaIcons] || User;
            const borderColor = personaColors[persona.id as keyof typeof personaColors] || "border-slate-300 hover:border-slate-500";
            
            return (
              <Card
                key={persona.id}
                className={`persona-card cursor-pointer border-2 border-transparent hover:shadow-xl transition-all duration-300 ${borderColor}`}
                onClick={() => handlePersonaSelect(persona)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img 
                      src={persona.avatarUrl} 
                      alt={`${persona.name} - ${persona.role}`}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800">{persona.name}</h3>
                      <p className="font-medium" style={{ color: persona.color }}>{persona.role}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 mb-4">{persona.description}</p>
                  <div className="flex items-center text-sm text-slate-500">
                    <IconComponent className="w-4 h-4 mr-2" />
                    <span>{persona.specialty}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
