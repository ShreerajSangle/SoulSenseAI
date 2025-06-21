import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Brain, MessageCircle, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ModelMetrics {
  vocabularySize: number;
  trainingExamples: number;
  testQuestions: number;
  coverage: number;
}

interface ComparisonResult {
  userMessage: string;
  cakeChat: {
    response: string;
    confidence: number;
    generationMethod: string;
    emotionalAdaptation: string;
  };
  gpt: {
    response: string;
    emotionalTone: string;
    therapeuticElements: string[];
  };
  evaluation: {
    cakeChatScore: number;
    gptScore: number;
    comparison: string;
    metrics: {
      contextualRelevance: { cakeChat: number; gpt: number };
      emotionalAdaptability: { cakeChat: number; gpt: number };
      naturalness: { cakeChat: number; gpt: number };
      factualAccuracy: { cakeChat: number; gpt: number };
    };
  };
}

interface BatchEvaluation {
  totalQuestions: number;
  averageScores: { cakeChat: number; gpt: number };
  winCounts: { cakeChat: number; gpt: number; ties: number };
  winPercentages: { cakeChat: number; gpt: number; ties: number };
  evaluations: Array<{
    question: string;
    cakeChatResponse: string;
    gptResponse: string;
    evaluation: any;
  }>;
}

export default function ModelComparison() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [testMessage, setTestMessage] = useState('');
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [batchEvaluation, setBatchEvaluation] = useState<BatchEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationProgress, setEvaluationProgress] = useState(0);
  const { toast } = useToast();

  const initializeCakeChat = async () => {
    setIsInitializing(true);
    try {
      const response = await apiRequest('/api/cakechat/initialize', {
        method: 'POST'
      });

      if (response.success) {
        setIsInitialized(true);
        setMetrics(response.metrics);
        toast({
          title: "CakeChat Initialized",
          description: "Model loaded successfully with training data",
        });
      }
    } catch (error) {
      toast({
        title: "Initialization Failed",
        description: "Failed to initialize CakeChat engine",
        variant: "destructive"
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const compareModels = async () => {
    if (!testMessage.trim()) {
      toast({
        title: "Enter a message",
        description: "Please enter a test message to compare responses",
        variant: "destructive"
      });
      return;
    }

    setIsComparing(true);
    try {
      const response = await apiRequest('/api/cakechat/compare', {
        method: 'POST',
        body: JSON.stringify({
          userMessage: testMessage,
          conversationHistory: [],
          personaId: 'sarah'
        })
      });

      if (response.success) {
        setComparison(response.comparison);
        toast({
          title: "Comparison Complete",
          description: "Both models have generated responses for evaluation",
        });
      }
    } catch (error) {
      toast({
        title: "Comparison Failed",
        description: "Failed to compare model responses",
        variant: "destructive"
      });
    } finally {
      setIsComparing(false);
    }
  };

  const runBatchEvaluation = async () => {
    setIsEvaluating(true);
    setEvaluationProgress(0);
    
    try {
      const response = await apiRequest('/api/cakechat/batch-evaluate', {
        method: 'POST',
        body: JSON.stringify({
          questionCount: 20,
          personaId: 'sarah'
        })
      });

      if (response.success) {
        setBatchEvaluation(response.batchEvaluation);
        setEvaluationProgress(100);
        toast({
          title: "Batch Evaluation Complete",
          description: `Evaluated ${response.batchEvaluation.totalQuestions} test questions`,
        });
      }
    } catch (error) {
      toast({
        title: "Evaluation Failed",
        description: "Failed to complete batch evaluation",
        variant: "destructive"
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWinnerBadge = (comparison: string) => {
    if (comparison.includes('CakeChat')) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800">CakeChat Wins</Badge>;
    } else if (comparison.includes('GPT')) {
      return <Badge variant="secondary" className="bg-purple-100 text-purple-800">GPT Wins</Badge>;
    } else {
      return <Badge variant="outline">Tie</Badge>;
    }
  };

  useEffect(() => {
    const checkInitialization = async () => {
      try {
        const response = await apiRequest('/api/cakechat/metrics');
        if (response.success) {
          setIsInitialized(true);
          setMetrics(response.metrics);
        }
      } catch (error) {
        // CakeChat not yet initialized
      }
    };

    checkInitialization();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Model Comparison Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Compare CakeChat dialogue generation with GPT-based conversational AI
        </p>
      </div>

      {!isInitialized ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Initialize CakeChat Engine
            </CardTitle>
            <CardDescription>
              Load the CakeChat model with training datasets for dialogue generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={initializeCakeChat} 
              disabled={isInitializing}
              className="w-full"
            >
              {isInitializing ? 'Initializing...' : 'Initialize CakeChat Model'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Model Metrics */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Model Statistics</CardTitle>
              <CardDescription>CakeChat training data and coverage metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{metrics?.vocabularySize.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Vocabulary Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics?.trainingExamples.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Training Examples</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{metrics?.testQuestions.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Test Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{((metrics?.coverage || 0) * 100).toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Coverage</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="individual" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="individual">Individual Comparison</TabsTrigger>
              <TabsTrigger value="batch">Batch Evaluation</TabsTrigger>
            </TabsList>

            <TabsContent value="individual" className="space-y-6">
              {/* Individual Message Testing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Test Individual Messages
                  </CardTitle>
                  <CardDescription>
                    Compare how both models respond to a specific message
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter a test message to compare responses..."
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button 
                    onClick={compareModels} 
                    disabled={isComparing || !testMessage.trim()}
                    className="w-full"
                  >
                    {isComparing ? 'Comparing Models...' : 'Compare Responses'}
                  </Button>
                </CardContent>
              </Card>

              {/* Comparison Results */}
              {comparison && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* CakeChat Response */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blue-700 dark:text-blue-300">CakeChat Response</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          Confidence: {(comparison.cakeChat.confidence * 100).toFixed(0)}%
                        </Badge>
                        <Badge variant="secondary">
                          {comparison.cakeChat.generationMethod}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {comparison.cakeChat.response}
                      </p>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Emotional Adaptation:</span>
                          <Badge variant="outline" className="ml-2">
                            {comparison.cakeChat.emotionalAdaptation}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* GPT Response */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-purple-700 dark:text-purple-300">GPT Response</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          Emotional Tone: {comparison.gpt.emotionalTone}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {comparison.gpt.response}
                      </p>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Therapeutic Elements:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {comparison.gpt.therapeuticElements.map((element, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {element}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Evaluation Metrics */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Evaluation Results
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getWinnerBadge(comparison.evaluation.comparison)}
                        <span className="text-sm text-gray-600">
                          {comparison.evaluation.comparison}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Overall Scores</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>CakeChat:</span>
                              <span className={`font-medium ${getScoreColor(comparison.evaluation.cakeChatScore)}`}>
                                {(comparison.evaluation.cakeChatScore * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>GPT:</span>
                              <span className={`font-medium ${getScoreColor(comparison.evaluation.gptScore)}`}>
                                {(comparison.evaluation.gptScore * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3">Detailed Metrics</h4>
                          <div className="space-y-2 text-sm">
                            {Object.entries(comparison.evaluation.metrics).map(([metric, scores]) => (
                              <div key={metric}>
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                  <span>{metric.replace(/([A-Z])/g, ' $1').trim()}</span>
                                </div>
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <Progress 
                                      value={scores.cakeChat * 100} 
                                      className="h-2 bg-blue-100" 
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <Progress 
                                      value={scores.gpt * 100} 
                                      className="h-2 bg-purple-100" 
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="batch" className="space-y-6">
              {/* Batch Evaluation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Batch Evaluation
                  </CardTitle>
                  <CardDescription>
                    Test multiple questions to compare overall model performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEvaluating && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Evaluating questions...</span>
                        <span>{evaluationProgress}%</span>
                      </div>
                      <Progress value={evaluationProgress} />
                    </div>
                  )}
                  <Button 
                    onClick={runBatchEvaluation} 
                    disabled={isEvaluating}
                    className="w-full"
                  >
                    {isEvaluating ? 'Running Evaluation...' : 'Start Batch Evaluation (20 questions)'}
                  </Button>
                </CardContent>
              </Card>

              {/* Batch Results */}
              {batchEvaluation && (
                <div className="space-y-6">
                  {/* Summary Statistics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Evaluation Summary</CardTitle>
                      <CardDescription>
                        Results from {batchEvaluation.totalQuestions} test questions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Average Scores</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>CakeChat:</span>
                              <span className={`font-medium ${getScoreColor(batchEvaluation.averageScores.cakeChat)}`}>
                                {(batchEvaluation.averageScores.cakeChat * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>GPT:</span>
                              <span className={`font-medium ${getScoreColor(batchEvaluation.averageScores.gpt)}`}>
                                {(batchEvaluation.averageScores.gpt * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3">Win Counts</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>CakeChat:</span>
                              <span className="font-medium text-blue-600">
                                {batchEvaluation.winCounts.cakeChat}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>GPT:</span>
                              <span className="font-medium text-purple-600">
                                {batchEvaluation.winCounts.gpt}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Ties:</span>
                              <span className="font-medium text-gray-600">
                                {batchEvaluation.winCounts.ties}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3">Win Percentages</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>CakeChat:</span>
                              <span className="font-medium text-blue-600">
                                {batchEvaluation.winPercentages.cakeChat.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>GPT:</span>
                              <span className="font-medium text-purple-600">
                                {batchEvaluation.winPercentages.gpt.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Ties:</span>
                              <span className="font-medium text-gray-600">
                                {batchEvaluation.winPercentages.ties.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Results */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Results</CardTitle>
                      <CardDescription>Individual question evaluations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {batchEvaluation.evaluations.map((evaluation, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-sm">{evaluation.question}</h5>
                              {evaluation.evaluation.cakeChatScore > evaluation.evaluation.gptScore ? (
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                              ) : evaluation.evaluation.gptScore > evaluation.evaluation.cakeChatScore ? (
                                <XCircle className="h-4 w-4 text-purple-600" />
                              ) : (
                                <div className="h-4 w-4 rounded-full bg-gray-300" />
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-blue-700">CakeChat:</span>
                                <p className="text-gray-600 mt-1">{evaluation.cakeChatResponse}</p>
                              </div>
                              <div>
                                <span className="font-medium text-purple-700">GPT:</span>
                                <p className="text-gray-600 mt-1">{evaluation.gptResponse}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}