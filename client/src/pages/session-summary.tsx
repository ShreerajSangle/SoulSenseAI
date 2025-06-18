import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Lightbulb, CheckSquare, Calendar } from "lucide-react";
import { useLocation } from "wouter";

export default function SessionSummary() {
  const [, setLocation] = useLocation();

  // Mock data - in a real app, this would come from props or API
  const sessionData = {
    keyTopics: [
      "Work-related anxiety and deadline stress",
      "Catastrophic thinking patterns",
      "CBT evidence examination technique"
    ],
    techniquesUsed: [
      {
        name: "Evidence Examination",
        description: "Challenge anxious thoughts by examining supporting evidence"
      }
    ],
    homework: [
      "Practice evidence examination when anxious thoughts arise",
      "Keep a thought diary for 3 days",
      "Schedule next session for continued support"
    ]
  };

  const handleScheduleNext = () => {
    // In a real app, this would open a scheduling interface
    console.log("Schedule next session");
  };

  const handleReturnHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full animate-slide-up">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Session Complete</h2>
            <p className="text-slate-600">Here's a summary of today's session</p>
          </div>

          <div className="space-y-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Key Topics Discussed
                </h3>
                <ul className="space-y-2 text-blue-700">
                  {sessionData.keyTopics.map((topic, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      {topic}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Techniques Introduced
                </h3>
                <div className="space-y-3">
                  {sessionData.techniquesUsed.map((technique, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Lightbulb className="text-green-600 mt-1 w-4 h-4" />
                      <div>
                        <p className="font-medium text-green-800">{technique.name}</p>
                        <p className="text-sm text-green-700">{technique.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
                  <CheckSquare className="w-5 h-5 mr-2" />
                  Homework & Next Steps
                </h3>
                <ul className="space-y-2 text-purple-700">
                  {sessionData.homework.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <CheckSquare className="w-4 h-4 mr-3 text-purple-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="flex space-x-4">
              <Button 
                onClick={handleScheduleNext}
                className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Next Session
              </Button>
              <Button 
                onClick={handleReturnHome}
                variant="outline"
                className="flex-1"
              >
                Return Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
