import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Brain, Heart, CheckCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AssessmentQuestion {
  id: string;
  text: string;
  options: { value: number; label: string }[];
}

const PHQ9_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "little_interest",
    text: "Little interest or pleasure in doing things",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: "feeling_down",
    text: "Feeling down, depressed, or hopeless",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: "sleep_problems",
    text: "Trouble falling or staying asleep, or sleeping too much",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: "feeling_tired",
    text: "Feeling tired or having little energy",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: "poor_appetite",
    text: "Poor appetite or overeating",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: "feeling_bad",
    text: "Feeling bad about yourself or that you are a failure or have let yourself or your family down",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: "trouble_concentrating",
    text: "Trouble concentrating on things, such as reading the newspaper or watching television",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: "moving_slowly",
    text: "Moving or speaking so slowly that other people could have noticed, or being so fidgety or restless that you have been moving around a lot more than usual",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: "question9",
    text: "Thoughts that you would be better off dead, or thoughts of hurting yourself in some way",
    options: [
      { value: 0, label: "Not at all" },
      { value: 1, label: "Several days" },
      { value: 2, label: "More than half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  }
];

const GAD7_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "feeling_nervous",
    text: "Feeling nervous, anxious, or on edge",
    options: [
      { value: 0, label: "Not at all sure" },
      { value: 1, label: "Several days" },
      { value: 2, label: "Over half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: "not_able_to_stop_worrying",
    text: "Not being able to stop or control worrying",
    options: [
      { value: 0, label: "Not at all sure" },
      { value: 1, label: "Several days" },
      { value: 2, label: "Over half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: "worrying_too_much",
    text: "Worrying too much about different things",
    options: [
      { value: 0, label: "Not at all sure" },
      { value: 1, label: "Several days" },
      { value: 2, label: "Over half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: "trouble_relaxing",
    text: "Trouble relaxing",
    options: [
      { value: 0, label: "Not at all sure" },
      { value: 1, label: "Several days" },
      { value: 2, label: "Over half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: "being_restless",
    text: "Being so restless that it's hard to sit still",
    options: [
      { value: 0, label: "Not at all sure" },
      { value: 1, label: "Several days" },
      { value: 2, label: "Over half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: "becoming_easily_annoyed",
    text: "Becoming easily annoyed or irritable",
    options: [
      { value: 0, label: "Not at all sure" },
      { value: 1, label: "Several days" },
      { value: 2, label: "Over half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  },
  {
    id: "feeling_afraid",
    text: "Feeling afraid as if something awful might happen",
    options: [
      { value: 0, label: "Not at all sure" },
      { value: 1, label: "Several days" },
      { value: 2, label: "Over half the days" },
      { value: 3, label: "Nearly every day" }
    ]
  }
];

export default function ClinicalAssessment() {
  const [assessmentType, setAssessmentType] = useState<"phq9" | "gad7" | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const questions = assessmentType === "phq9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS;

  const submitAssessment = useMutation({
    mutationFn: async (data: { responses: Record<string, number> }) => {
      const endpoint = assessmentType === "phq9" ? "/api/clinical/phq9" : "/api/clinical/gad7";
      const response = await apiRequest(endpoint, "POST", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setResults(data);
      toast({
        title: "Assessment Complete",
        description: "Your clinical assessment has been processed with evidence-based analysis.",
      });
    },
    onError: (error) => {
      toast({
        title: "Assessment Failed",
        description: "Unable to process assessment. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAnswer = (value: number) => {
    const questionId = questions[currentQuestion].id;
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Assessment complete
      submitAssessment.mutate({ responses });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "minimal": return "text-green-600";
      case "mild": return "text-yellow-600";
      case "moderate": return "text-orange-600";
      case "moderately_severe": return "text-red-500";
      case "severe": return "text-red-700";
      default: return "text-gray-600";
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case "minimal": return "bg-green-50 border-green-200";
      case "mild": return "bg-yellow-50 border-yellow-200";
      case "moderate": return "bg-orange-50 border-orange-200";
      case "moderately_severe": return "bg-red-50 border-red-200";
      case "severe": return "bg-red-100 border-red-300";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  if (results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Assessment Complete</CardTitle>
              <CardDescription className="text-gray-600">
                Clinical analysis with evidence-based recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Results */}
              <div className={`p-6 rounded-xl border-2 ${getSeverityBg(results.severity)}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {assessmentType === "phq9" ? "Depression" : "Anxiety"} Assessment
                    </h3>
                    <p className="text-gray-600">{results.assessmentDate && new Date(results.assessmentDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800">{results.totalScore}</div>
                    <div className={`text-sm font-medium capitalize ${getSeverityColor(results.severity)}`}>
                      {results.severity.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                {results.suicideRisk && (
                  <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
                    <div className="flex items-center text-red-800">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Important Safety Notice</span>
                    </div>
                    <p className="text-red-700 mt-2 text-sm">
                      Your responses indicate thoughts of self-harm. Please reach out for immediate support:
                      <br />• Crisis Text Line: Text HOME to 741741
                      <br />• National Suicide Prevention Lifeline: 988
                    </p>
                  </div>
                )}
              </div>

              {/* Clinical Reasoning */}
              {results.clinicalReasoning && (
                <Card className="border border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-purple-800">
                      <Brain className="w-5 h-5 mr-2" />
                      Clinical Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Clinical Justification</h4>
                      <p className="text-gray-700 text-sm">{results.clinicalReasoning.clinicalJustification}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Evidence Base</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {results.clinicalReasoning.evidenceBase?.map((evidence: string, index: number) => (
                          <li key={index} className="text-gray-700 text-sm">{evidence}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Intervention Rationale</h4>
                      <p className="text-gray-700 text-sm">{results.clinicalReasoning.interventionRationale}</p>
                    </div>

                    {results.clinicalReasoning.recommendedInterventions && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Recommended Interventions</h4>
                        <div className="flex flex-wrap gap-2">
                          {results.clinicalReasoning.recommendedInterventions.map((intervention: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                              {intervention.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Persona Suggestions Box */}
              {results.recommendedPersonas && results.recommendedPersonas.length > 0 && (
                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-purple-800 text-lg">Recommended Support</CardTitle>
                    <CardDescription>Based on your assessment, these personas may be most helpful</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {results.recommendedPersonas.map((persona: any) => (
                        <div key={persona.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div>
                            <div className="font-medium text-gray-800">{persona.name}</div>
                            <div className="text-sm text-gray-600">{persona.reason}</div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => window.location.href = `/chat?persona=${persona.id}`}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Start Session
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Goal Suggestions */}
              {results.suggestedGoals && results.suggestedGoals.length > 0 && (
                <Card className="border-pink-200 bg-pink-50">
                  <CardHeader>
                    <CardTitle className="text-pink-800 text-lg">Suggested Goals</CardTitle>
                    <CardDescription>Consider these therapeutic goals based on your assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {results.suggestedGoals.map((goal: string, index: number) => (
                        <div key={index} className="flex items-center p-2 bg-white rounded border">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mr-3 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{goal}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="flex-1"
                >
                  Home
                </Button>
                <Button 
                  onClick={() => {
                    setAssessmentType(null);
                    setCurrentQuestion(0);
                    setResponses({});
                    setResults(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Take Another Assessment
                </Button>
                <Button 
                  onClick={() => window.location.href = '/therapeutic-journey'}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Start Therapeutic Journey
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (assessmentType && currentQuestion < questions.length) {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const question = questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-xl text-gray-800">
                  {assessmentType === "phq9" ? "Depression Screening (PHQ-9)" : "Anxiety Screening (GAD-7)"}
                </CardTitle>
                <span className="text-sm text-gray-600">
                  {currentQuestion + 1} of {questions.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-800 leading-relaxed">
                    Question {currentQuestion + 1} of {questions.length}
                  </h3>
                  <span className="text-sm text-purple-600 font-medium">
                    {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
                  </span>
                </div>
                <h4 className="text-base text-gray-600 mb-2">
                  Over the last 2 weeks, how often have you been bothered by:
                </h4>
                <p className="text-lg text-gray-700 font-medium mb-6">
                  {question.text}
                </p>
              </div>

              <RadioGroup 
                value={responses[question.id]?.toString() || ""}
                onValueChange={(value) => handleAnswer(parseInt(value))}
                className="space-y-4"
              >
                {question.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                    <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                    <Label 
                      htmlFor={`option-${option.value}`} 
                      className="flex-1 cursor-pointer text-gray-700"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between items-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => currentQuestion > 0 ? setCurrentQuestion(prev => prev - 1) : setAssessmentType(null)}
                  className="px-6"
                >
                  {currentQuestion > 0 ? "Previous" : "Back"}
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={responses[question.id] === undefined || submitAssessment.isPending}
                  className="px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {currentQuestion === questions.length - 1 
                    ? (submitAssessment.isPending ? "Processing..." : "Complete Assessment")
                    : "Next"
                  }
                </Button>
              </div>

              <div className="text-xs text-gray-500 mt-6 p-3 bg-gray-50 rounded-lg">
                This assessment uses validated clinical screening tools. Results provide insight into symptom severity but do not constitute a diagnosis. Professional evaluation is recommended for comprehensive assessment.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl text-gray-800">Clinical Assessment</CardTitle>
            <CardDescription className="text-gray-600 max-w-2xl mx-auto">
              Take a validated clinical screening to understand your mental health status with evidence-based analysis and personalized recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border border-purple-200 hover:border-purple-300 transition-colors cursor-pointer group" 
                    onClick={() => setAssessmentType("phq9")}>
                <CardHeader>
                  <CardTitle className="text-purple-800 group-hover:text-purple-900">
                    PHQ-9 Depression Screening
                  </CardTitle>
                  <CardDescription>
                    9-question assessment for depression symptoms over the past 2 weeks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Validated clinical screening tool</li>
                    <li>• Assesses mood, interest, and daily functioning</li>
                    <li>• Provides severity rating and clinical reasoning</li>
                    <li>• 5-minute completion time</li>
                  </ul>
                  <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Start PHQ-9 Assessment
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-pink-200 hover:border-pink-300 transition-colors cursor-pointer group" 
                    onClick={() => setAssessmentType("gad7")}>
                <CardHeader>
                  <CardTitle className="text-pink-800 group-hover:text-pink-900">
                    GAD-7 Anxiety Screening
                  </CardTitle>
                  <CardDescription>
                    7-question assessment for anxiety symptoms over the past 2 weeks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Reliable anxiety disorder screening</li>
                    <li>• Evaluates worry, nervousness, and restlessness</li>
                    <li>• Evidence-based severity assessment</li>
                    <li>• 3-minute completion time</li>
                  </ul>
                  <Button className="w-full mt-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
                    Start GAD-7 Assessment
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">About Clinical Assessments</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
                <div>
                  <h4 className="font-medium text-purple-800 mb-2">Evidence-Based</h4>
                  <p>These assessments use validated clinical screening tools widely used in healthcare settings worldwide.</p>
                </div>
                <div>
                  <h4 className="font-medium text-pink-800 mb-2">Clinical Reasoning</h4>
                  <p>Results include detailed clinical analysis explaining the assessment methodology and evidence base.</p>
                </div>
                <div>
                  <h4 className="font-medium text-purple-800 mb-2">Personalized Care</h4>
                  <p>Receive tailored intervention recommendations based on your specific symptom profile and severity.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}