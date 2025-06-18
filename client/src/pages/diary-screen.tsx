import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, Search, Filter, BookOpen, Heart, Brain, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DiaryEntry {
  id: number;
  userId: string;
  title: string;
  content: string;
  moodRating: number;
  emotions: string[];
  gratitude?: string;
  goals?: string;
  reflections?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export default function DiaryScreen() {
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMood, setFilterMood] = useState<string>("");
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    moodRating: [5],
    emotions: [] as string[],
    gratitude: "",
    goals: "",
    reflections: "",
    tags: [] as string[]
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = "anonymous"; // TODO: Replace with actual user ID from auth

  // Fetch diary entries
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["/api/diary-entries", userId],
    queryFn: async () => {
      const response = await apiRequest(`/api/diary-entries?userId=${userId}`, "GET");
      return await response.json();
    }
  });

  // Create diary entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (entryData: typeof newEntry) => {
      const response = await apiRequest("/api/diary-entries", "POST", {
        ...entryData,
        userId,
        moodRating: entryData.moodRating[0]
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary-entries"] });
      setIsCreateDialogOpen(false);
      resetNewEntry();
      toast({
        title: "Entry saved",
        description: "Your diary entry has been saved successfully.",
      });
    }
  });

  // Update diary entry mutation
  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<DiaryEntry> & { id: number }) => {
      const response = await apiRequest(`/api/diary-entries/${id}`, "PUT", updateData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary-entries"] });
      toast({
        title: "Entry updated",
        description: "Your diary entry has been updated successfully.",
      });
    }
  });

  const resetNewEntry = () => {
    setNewEntry({
      title: "",
      content: "",
      moodRating: [5],
      emotions: [],
      gratitude: "",
      goals: "",
      reflections: "",
      tags: []
    });
  };

  const handleCreateEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both title and content.",
        variant: "destructive"
      });
      return;
    }
    createEntryMutation.mutate(newEntry);
  };

  const handleEmotionToggle = (emotion: string) => {
    setNewEntry(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotion)
        ? prev.emotions.filter(e => e !== emotion)
        : [...prev.emotions, emotion]
    }));
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !newEntry.tags.includes(tag)) {
      setNewEntry(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const filteredEntries = entries.filter((entry: DiaryEntry) => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMood = !filterMood || entry.moodRating.toString() === filterMood;
    return matchesSearch && matchesMood;
  });

  const emotionOptions = [
    "Happy", "Sad", "Anxious", "Excited", "Calm", "Frustrated", 
    "Grateful", "Hopeful", "Overwhelmed", "Peaceful", "Angry", "Content"
  ];

  const getMoodColor = (rating: number) => {
    if (rating >= 8) return "text-green-600 bg-green-100";
    if (rating >= 6) return "text-blue-600 bg-blue-100";
    if (rating >= 4) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">My Diary</h1>
              <p className="text-slate-600">Reflect on your thoughts, emotions, and daily experiences</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Diary Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newEntry.title}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="What's on your mind today?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newEntry.content}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write about your day, thoughts, or feelings..."
                      rows={6}
                    />
                  </div>

                  <div>
                    <Label>Mood Rating: {newEntry.moodRating[0]}/10</Label>
                    <Slider
                      value={newEntry.moodRating}
                      onValueChange={(value) => setNewEntry(prev => ({ ...prev, moodRating: value }))}
                      max={10}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Emotions</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {emotionOptions.map(emotion => (
                        <Button
                          key={emotion}
                          variant={newEntry.emotions.includes(emotion) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleEmotionToggle(emotion)}
                        >
                          {emotion}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="gratitude">Gratitude</Label>
                    <Textarea
                      id="gratitude"
                      value={newEntry.gratitude}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, gratitude: e.target.value }))}
                      placeholder="What are you grateful for today?"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="goals">Goals & Intentions</Label>
                    <Textarea
                      id="goals"
                      value={newEntry.goals}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, goals: e.target.value }))}
                      placeholder="What do you want to focus on or achieve?"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="reflections">Reflections</Label>
                    <Textarea
                      id="reflections"
                      value={newEntry.reflections}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, reflections: e.target.value }))}
                      placeholder="Any insights or lessons learned?"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateEntry} disabled={createEntryMutation.isPending}>
                      {createEntryMutation.isPending ? "Saving..." : "Save Entry"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterMood} onValueChange={setFilterMood}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All moods</SelectItem>
                  <SelectItem value="1">1-2 (Very Low)</SelectItem>
                  <SelectItem value="3">3-4 (Low)</SelectItem>
                  <SelectItem value="5">5-6 (Neutral)</SelectItem>
                  <SelectItem value="7">7-8 (Good)</SelectItem>
                  <SelectItem value="9">9-10 (Excellent)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Entries Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-slate-600 mt-4">Loading your diary entries...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No entries found</h3>
            <p className="text-slate-600 mb-4">
              {searchQuery || filterMood ? "Try adjusting your filters" : "Start your journey by creating your first diary entry"}
            </p>
            {!searchQuery && !filterMood && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create First Entry
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEntries.map((entry: DiaryEntry) => (
              <Card key={entry.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{entry.title}</CardTitle>
                    <Badge className={`ml-2 ${getMoodColor(entry.moodRating)}`}>
                      {entry.moodRating}/10
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    {new Date(entry.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 line-clamp-3 mb-4">{entry.content}</p>
                  
                  {entry.emotions.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {entry.emotions.slice(0, 3).map(emotion => (
                          <Badge key={emotion} variant="secondary" className="text-xs">
                            {emotion}
                          </Badge>
                        ))}
                        {entry.emotions.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{entry.emotions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
                    {entry.gratitude && (
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>Gratitude</span>
                      </div>
                    )}
                    {entry.goals && (
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span>Goals</span>
                      </div>
                    )}
                    {entry.reflections && (
                      <div className="flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        <span>Insights</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}