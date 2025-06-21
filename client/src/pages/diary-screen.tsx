import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BookOpen, 
  Plus, 
  Heart, 
  Target, 
  Brain, 
  Search,
  Calendar,
  Smile,
  Edit,
  Trash2,
  Eye
} from "lucide-react";

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMood, setFilterMood] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "mood" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
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
  const userId = "anonymous";

  const emotionOptions = [
    "Happy", "Sad", "Anxious", "Excited", "Grateful", "Frustrated", 
    "Peaceful", "Angry", "Content", "Worried", "Hopeful", "Tired"
  ];

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
      setIsEditDialogOpen(false);
      setEditingEntry(null);
      toast({
        title: "Entry updated",
        description: "Your diary entry has been updated successfully.",
      });
    }
  });

  // Delete diary entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/diary-entries/${id}`, "DELETE");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary-entries"] });
      setIsViewDialogOpen(false);
      setSelectedEntry(null);
      toast({
        title: "Entry deleted",
        description: "Your diary entry has been deleted.",
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

  const openEntryForEdit = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };

  const openEntryForView = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setIsViewDialogOpen(true);
  };

  // Filter and sort entries
  const filteredAndSortedEntries = entries
    .filter((entry: DiaryEntry) => {
      const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entry.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesMood = filterMood === "all" || 
                         (filterMood === "high" && entry.moodRating >= 8) ||
                         (filterMood === "medium" && entry.moodRating >= 4 && entry.moodRating < 8) ||
                         (filterMood === "low" && entry.moodRating < 4);
      
      return matchesSearch && matchesMood;
    })
    .sort((a: DiaryEntry, b: DiaryEntry) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "mood") {
        comparison = a.moodRating - b.moodRating;
      } else if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getMoodColor = (rating: number) => {
    if (rating >= 8) return "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400";
    if (rating >= 6) return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400";
    if (rating >= 4) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-block p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-2xl">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Personal Journal
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Reflect on your thoughts, emotions, and daily experiences in your private sanctuary
            </p>
            
            {/* Action Button */}
            <div className="flex justify-center mt-8">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-2xl px-8 py-3 rounded-2xl text-lg font-semibold transform hover:scale-105 transition-all duration-300">
                    <Plus className="w-5 h-5" />
                    New Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-3xl">
                  <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-6 mb-6">
                    <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-center">
                      Create New Journal Entry
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-8 py-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="title" className="text-lg font-semibold text-slate-700 dark:text-slate-300">Title</Label>
                        <Input
                          id="title"
                          value={newEntry.title}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="What's on your mind today?"
                          className="mt-2 border-2 border-purple-200 dark:border-purple-800 focus:border-purple-500 rounded-xl h-12 text-lg"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-lg font-semibold text-slate-700 dark:text-slate-300">Mood Rating: {newEntry.moodRating[0]}/10</Label>
                        <div className="mt-4">
                          <Slider
                            value={newEntry.moodRating}
                            onValueChange={(value) => setNewEntry(prev => ({ ...prev, moodRating: value }))}
                            max={10}
                            min={1}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="content" className="text-lg font-semibold text-slate-700 dark:text-slate-300">Content</Label>
                      <Textarea
                        id="content"
                        value={newEntry.content}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Share your thoughts, feelings, and experiences..."
                        rows={6}
                        className="mt-2 border-2 border-purple-200 dark:border-purple-800 focus:border-purple-500 rounded-xl text-lg resize-none"
                      />
                    </div>

                    <div>
                      <Label className="text-lg font-semibold text-slate-700 dark:text-slate-300">Emotions</Label>
                      <div className="flex flex-wrap gap-3 mt-4">
                        {emotionOptions.map(emotion => (
                          <Badge
                            key={emotion}
                            variant={newEntry.emotions.includes(emotion) ? "default" : "outline"}
                            className={`cursor-pointer transition-all duration-300 px-4 py-2 text-sm font-medium rounded-2xl ${
                              newEntry.emotions.includes(emotion) 
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transform hover:scale-105" 
                                : "bg-white dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-slate-700 dark:text-slate-300"
                            }`}
                            onClick={() => handleEmotionToggle(emotion)}
                          >
                            {emotion}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="gratitude" className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Heart className="w-5 h-5 text-pink-500" />
                          Gratitude
                        </Label>
                        <Textarea
                          id="gratitude"
                          value={newEntry.gratitude}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, gratitude: e.target.value }))}
                          placeholder="What are you grateful for today?"
                          rows={3}
                          className="mt-2 border-2 border-pink-200 dark:border-pink-800 focus:border-pink-500 rounded-xl resize-none"
                        />
                      </div>

                      <div>
                        <Label htmlFor="goals" className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Target className="w-5 h-5 text-indigo-500" />
                          Goals & Intentions
                        </Label>
                        <Textarea
                          id="goals"
                          value={newEntry.goals}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, goals: e.target.value }))}
                          placeholder="What do you want to focus on or achieve?"
                          rows={3}
                          className="mt-2 border-2 border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 rounded-xl resize-none"
                        />
                      </div>

                      <div>
                        <Label htmlFor="reflections" className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Brain className="w-5 h-5 text-purple-500" />
                          Reflections
                        </Label>
                        <Textarea
                          id="reflections"
                          value={newEntry.reflections}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, reflections: e.target.value }))}
                          placeholder="Any insights or lessons learned?"
                          rows={3}
                          className="mt-2 border-2 border-purple-200 dark:border-purple-800 focus:border-purple-500 rounded-xl resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-center gap-4 pt-6">
                      <Button 
                        onClick={handleCreateEntry} 
                        disabled={createEntryMutation.isPending}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-2xl text-lg font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300"
                      >
                        {createEntryMutation.isPending ? "Saving..." : "Save Entry"}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="border-2 border-slate-300 dark:border-slate-600 px-8 py-3 rounded-2xl text-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-purple-200 dark:border-purple-800">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 border-slate-200 dark:border-slate-700 rounded-xl h-12"
                />
              </div>
              
              <Select value={filterMood} onValueChange={setFilterMood}>
                <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 rounded-xl h-12">
                  <SelectValue placeholder="Filter by mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Moods</SelectItem>
                  <SelectItem value="high">High (8-10)</SelectItem>
                  <SelectItem value="medium">Medium (4-7)</SelectItem>
                  <SelectItem value="low">Low (1-3)</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: "date" | "mood" | "title") => setSortBy(value)}>
                <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 rounded-xl h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="mood">Mood</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 rounded-xl h-12">
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Entries Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400 text-lg">Loading your diary entries...</p>
            </div>
          ) : filteredAndSortedEntries.length === 0 ? (
            <div className="text-center py-16 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl">
              <BookOpen className="w-20 h-20 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">No entries found</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
                {searchQuery || filterMood !== "all" ? "Try adjusting your filters" : "Start your journey by creating your first diary entry"}
              </p>
              {!searchQuery && filterMood === "all" && (
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)} 
                  className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  Create First Entry
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedEntries.map((entry: DiaryEntry) => (
                <Card 
                  key={entry.id} 
                  className="group hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 rounded-3xl overflow-hidden transform hover:scale-105"
                  onClick={() => openEntryForView(entry)}
                >
                  <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2 text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {entry.title}
                      </CardTitle>
                      <Badge className={`${getMoodColor(entry.moodRating)} font-semibold`}>
                        {entry.moodRating}/10
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(entry.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-3 mb-4">
                      {entry.content}
                    </p>
                    
                    {entry.emotions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {entry.emotions.slice(0, 3).map((emotion: string) => (
                          <Badge key={emotion} variant="secondary" className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                            {emotion}
                          </Badge>
                        ))}
                        {entry.emotions.length > 3 && (
                          <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-700">
                            +{entry.emotions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEntryForView(entry);
                          }}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEntryForEdit(entry);
                          }}
                          className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 hover:text-orange-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEntryMutation.mutate(entry.id);
                          }}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Smile className="w-5 h-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Entry Viewing Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-3xl">
          <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-6">
            <DialogTitle className="flex items-center justify-between text-2xl">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {selectedEntry?.title}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedEntry) {
                      openEntryForEdit(selectedEntry);
                      setIsViewDialogOpen(false);
                    }
                  }}
                  className="border-2 border-orange-200 hover:bg-orange-50 text-orange-600 rounded-xl"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => selectedEntry && deleteEntryMutation.mutate(selectedEntry.id)}
                  className="bg-red-500 hover:bg-red-600 rounded-xl"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedEntry && (
            <div className="space-y-6 py-6">
              <div className="flex items-center gap-4">
                <Badge className={`${getMoodColor(selectedEntry.moodRating)} text-lg px-4 py-2`}>
                  Mood: {selectedEntry.moodRating}/10
                </Badge>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {new Date(selectedEntry.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                  })}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl">
                <h4 className="font-semibold mb-4 text-lg text-slate-700 dark:text-slate-300">Content</h4>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedEntry.content}
                </p>
              </div>

              {selectedEntry.emotions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-4 text-lg text-slate-700 dark:text-slate-300">Emotions</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedEntry.emotions.map((emotion: string) => (
                      <Badge key={emotion} variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1">
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntry.gratitude && (
                <div className="bg-pink-50 dark:bg-pink-900/20 p-6 rounded-2xl">
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg text-pink-700 dark:text-pink-300">
                    <Heart className="w-5 h-5" />
                    Gratitude
                  </h4>
                  <p className="text-pink-700 dark:text-pink-300">{selectedEntry.gratitude}</p>
                </div>
              )}

              {selectedEntry.goals && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl">
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg text-indigo-700 dark:text-indigo-300">
                    <Target className="w-5 h-5" />
                    Goals & Intentions
                  </h4>
                  <p className="text-indigo-700 dark:text-indigo-300">{selectedEntry.goals}</p>
                </div>
              )}

              {selectedEntry.reflections && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl">
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg text-purple-700 dark:text-purple-300">
                    <Brain className="w-5 h-5" />
                    Reflections
                  </h4>
                  <p className="text-purple-700 dark:text-purple-300">{selectedEntry.reflections}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}