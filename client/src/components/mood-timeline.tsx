import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Brain, Smile, Frown, Zap, Cloud } from "lucide-react";

interface MoodEntry {
  timestamp: Date;
  emotion: string;
  intensity: number;
  context: string;
  personaId: string;
}

interface MoodTimelineProps {
  userId: string;
  className?: string;
}

export function MoodTimeline({ userId, className = "" }: MoodTimelineProps) {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMoodTimeline();
  }, [userId, selectedPeriod]);

  const fetchMoodTimeline = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/mood-timeline?userId=${userId}&period=${selectedPeriod}`);
      if (response.ok) {
        const data = await response.json();
        setMoodEntries(data.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        })));
      }
    } catch (error) {
      console.error('Error fetching mood timeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEmotionIcon = (emotion: string) => {
    const iconMap: { [key: string]: any } = {
      joy: Smile,
      love: Heart,
      sadness: Frown,
      anxiety: Zap,
      anger: Cloud,
      peace: Brain,
      hope: Heart
    };
    
    const IconComponent = iconMap[emotion] || Brain;
    return <IconComponent className="h-4 w-4" />;
  };

  const getEmotionColor = (emotion: string) => {
    const colorMap: { [key: string]: string } = {
      joy: "bg-yellow-100 text-yellow-800 border-yellow-200",
      love: "bg-pink-100 text-pink-800 border-pink-200",
      sadness: "bg-blue-100 text-blue-800 border-blue-200",
      anxiety: "bg-orange-100 text-orange-800 border-orange-200",
      anger: "bg-red-100 text-red-800 border-red-200",
      peace: "bg-green-100 text-green-800 border-green-200",
      hope: "bg-purple-100 text-purple-800 border-purple-200",
      neutral: "bg-gray-100 text-gray-800 border-gray-200"
    };
    
    return colorMap[emotion] || colorMap.neutral;
  };

  const getPersonaName = (personaId: string) => {
    const names: { [key: string]: string } = {
      sarah: "Dr. Sarah",
      maya: "Maya",
      alex: "Alex",
      marcus: "Marcus"
    };
    return names[personaId] || personaId;
  };

  const groupEntriesByDay = (entries: MoodEntry[]) => {
    const grouped: { [key: string]: MoodEntry[] } = {};
    
    entries.forEach(entry => {
      const dateKey = entry.timestamp.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });
    
    return grouped;
  };

  const groupedEntries = groupEntriesByDay(moodEntries);
  const sortedDates = Object.keys(groupedEntries).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  if (isLoading) {
    return (
      <Card className={`mood-timeline-card ${className}`}>
        <CardHeader>
          <CardTitle className="text-therapeutic-h3 flex items-center gap-2">
            <Heart className="h-5 w-5 text-therapeutic-primary" />
            Mood Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`mood-timeline-card ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-therapeutic-h3 flex items-center gap-2">
            <Heart className="h-5 w-5 text-therapeutic-primary" />
            Mood Timeline
          </CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedPeriod === 'week' 
                  ? 'bg-therapeutic-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedPeriod === 'month' 
                  ? 'bg-therapeutic-primary text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedDates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-therapeutic-body">Start chatting to see your mood timeline</p>
          </div>
        ) : (
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {sortedDates.map(dateKey => {
              const entries = groupedEntries[dateKey];
              const date = new Date(dateKey);
              
              return (
                <div key={dateKey} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-therapeutic-primary"></div>
                    <h4 className="text-therapeutic-h4 text-gray-700">
                      {date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </h4>
                  </div>
                  
                  <div className="ml-5 space-y-2">
                    {entries.map((entry, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors"
                      >
                        <div className={`p-1.5 rounded-full ${getEmotionColor(entry.emotion)}`}>
                          {getEmotionIcon(entry.emotion)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getEmotionColor(entry.emotion)}`}
                            >
                              {entry.emotion}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              with {getPersonaName(entry.personaId)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 truncate">
                            {entry.context}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-therapeutic-primary opacity-60"></div>
                              <span className="text-xs text-gray-500">
                                Intensity: {Math.round(entry.intensity * 100)}%
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {entry.timestamp.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}