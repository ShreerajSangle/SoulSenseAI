import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
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
  Eye,
  ArrowLeft,
  Sparkles,
  PenTool,
  Filter,
  TrendingUp
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

const moodEmojis = {
  1: "😢", 2: "😔", 3: "😐", 4: "😊", 5: "😄"
};

const moodColors = {
  1: "from-red-500 to-pink-500",
  2: "from-orange-500 to-amber-500", 
  3: "from-yellow-500 to-orange-500",
  4: "from-green-500 to-emerald-500",
  5: "from-blue-500 to-purple-500"
};

export default function EnhancedDiaryScreen() {
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMood, setFilterMood] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "mood" | "title">("date");
  const [, setLocation] = useLocation();

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: entries = [], isLoading } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/diary-entries"],
    queryFn: async () => {
      const response = await fetch("/api/diary-entries?userId=anonymous");
      return response.json();
    }
  });

  const createEntryMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/diary-entries", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary-entries"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Entry created successfully!" });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/diary-entries/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary-entries"] });
      setIsEditDialogOpen(false);
      toast({ title: "Entry updated successfully!" });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/diary-entries/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary-entries"] });
      setIsViewDialogOpen(false);
      toast({ title: "Entry deleted successfully!" });
    },
  });

  const filteredEntries = entries
    .filter((entry: DiaryEntry) => {
      const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           entry.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMood = filterMood === "all" || entry.moodRating.toString() === filterMood;
      return matchesSearch && matchesMood;
    })
    .sort((a: DiaryEntry, b: DiaryEntry) => {
      if (sortBy === "date") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "mood") return b.moodRating - a.moodRating;
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

  const averageMood = entries.length > 0 
    ? entries.reduce((sum: number, entry: DiaryEntry) => sum + entry.moodRating, 0) / entries.length 
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your diary entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Personal Diary
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Reflect, write, and track your emotional journey</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {entries.length} Entries
              </Badge>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl">
                    <Plus className="h-4 w-4 mr-2" />
                    New Entry
                  </Button>
                </DialogTrigger>
                <DiaryEntryDialog
                  isOpen={isCreateDialogOpen}
                  onClose={() => setIsCreateDialogOpen(false)}
                  onSubmit={(data) => createEntryMutation.mutate(data)}
                  isLoading={createEntryMutation.isPending}
                />
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            Your Personal
            <span className="block bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Reflection Space
            </span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Capture your thoughts, track your mood, and reflect on your daily experiences in a safe, private space.
          </p>
        </div>

        {/* Insights Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PenTool className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{entries.length}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Entries</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Smile className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {averageMood > 0 ? averageMood.toFixed(1) : "—"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Avg Mood</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {entries.filter((entry: DiaryEntry) => 
                  new Date(entry.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">This Week</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {entries.length > 1 ? "+" : "—"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Growth</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="border-0 shadow-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-2xl border-gray-300 dark:border-gray-600"
                />
              </div>
              <Select value={filterMood} onValueChange={setFilterMood}>
                <SelectTrigger className="w-full md:w-40 rounded-2xl">
                  <SelectValue placeholder="Filter by mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Moods</SelectItem>
                  <SelectItem value="5">😄 Excellent</SelectItem>
                  <SelectItem value="4">😊 Good</SelectItem>
                  <SelectItem value="3">😐 Neutral</SelectItem>
                  <SelectItem value="2">😔 Poor</SelectItem>
                  <SelectItem value="1">😢 Very Poor</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-32 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="mood">Mood</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Diary Entries */}
        {filteredEntries.length === 0 ? (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {entries.length === 0 ? "Start Your Diary Journey" : "No entries found"}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {entries.length === 0 
                  ? "Begin documenting your thoughts, feelings, and daily reflections in your personal space."
                  : "Try adjusting your search or filter criteria to find the entries you're looking for."
                }
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 rounded-2xl font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                {entries.length === 0 ? "Write First Entry" : "Create New Entry"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEntries.map((entry: DiaryEntry) => {
              const moodGradient = moodColors[entry.moodRating as keyof typeof moodColors] || "from-gray-500 to-gray-600";
              const moodEmoji = moodEmojis[entry.moodRating as keyof typeof moodEmojis] || "😐";
              
              return (
                <Card
                  key={entry.id}
                  className="group border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  onClick={() => {
                    setSelectedEntry(entry);
                    setIsViewDialogOpen(true);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
                          {entry.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(entry.createdAt), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                      <div className={`w-12 h-12 bg-gradient-to-br ${moodGradient} rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                        {moodEmoji}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                      {entry.content}
                    </p>
                    
                    {entry.emotions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.emotions.slice(0, 3).map((emotion, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            {emotion}
                          </Badge>
                        ))}
                        {entry.emotions.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200">
                            +{entry.emotions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* View Entry Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedEntry.title}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteEntryMutation.mutate(selectedEntry.id)}
                      disabled={deleteEntryMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    Mood: {moodEmojis[selectedEntry.moodRating as keyof typeof moodEmojis]} {selectedEntry.moodRating}/5
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {format(new Date(selectedEntry.createdAt), 'MMMM d, yyyy at h:mm a')}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Content</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedEntry.content}</p>
                </div>
                {selectedEntry.gratitude && (
                  <div>
                    <h4 className="font-medium mb-2">Gratitude</h4>
                    <p className="text-gray-600">{selectedEntry.gratitude}</p>
                  </div>
                )}
                {selectedEntry.goals && (
                  <div>
                    <h4 className="font-medium mb-2">Goals</h4>
                    <p className="text-gray-600">{selectedEntry.goals}</p>
                  </div>
                )}
                {selectedEntry.reflections && (
                  <div>
                    <h4 className="font-medium mb-2">Reflections</h4>
                    <p className="text-gray-600">{selectedEntry.reflections}</p>
                  </div>
                )}
                {selectedEntry.emotions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Emotions</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.emotions.map((emotion, index) => (
                        <Badge key={index} variant="outline">{emotion}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DiaryEntryDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSubmit={(data) => updateEntryMutation.mutate({ id: selectedEntry?.id, ...data })}
          isLoading={updateEntryMutation.isPending}
          initialData={selectedEntry}
        />
      </Dialog>
    </div>
  );
}

// Diary Entry Dialog Component
function DiaryEntryDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading, 
  initialData 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  initialData?: DiaryEntry | null;
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
    moodRating: initialData?.moodRating || 3,
    emotions: initialData?.emotions?.join(", ") || "",
    gratitude: initialData?.gratitude || "",
    goals: initialData?.goals || "",
    reflections: initialData?.reflections || "",
    tags: initialData?.tags?.join(", ") || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      emotions: formData.emotions.split(",").map(e => e.trim()).filter(Boolean),
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{initialData ? "Edit Entry" : "New Diary Entry"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Entry title..."
            required
            className="rounded-2xl"
          />
        </div>
        
        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write your thoughts..."
            required
            rows={6}
            className="rounded-2xl"
          />
        </div>
        
        <div>
          <Label>Mood Rating: {formData.moodRating}/5 {moodEmojis[formData.moodRating as keyof typeof moodEmojis]}</Label>
          <Slider
            value={[formData.moodRating]}
            onValueChange={(value) => setFormData({ ...formData, moodRating: value[0] })}
            max={5}
            min={1}
            step={1}
            className="mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="emotions">Emotions (comma separated)</Label>
          <Input
            id="emotions"
            value={formData.emotions}
            onChange={(e) => setFormData({ ...formData, emotions: e.target.value })}
            placeholder="happy, excited, grateful..."
            className="rounded-2xl"
          />
        </div>
        
        <div>
          <Label htmlFor="gratitude">Gratitude</Label>
          <Textarea
            id="gratitude"
            value={formData.gratitude}
            onChange={(e) => setFormData({ ...formData, gratitude: e.target.value })}
            placeholder="What are you grateful for today?"
            rows={2}
            className="rounded-2xl"
          />
        </div>
        
        <div>
          <Label htmlFor="goals">Goals</Label>
          <Textarea
            id="goals"
            value={formData.goals}
            onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
            placeholder="Goals for today or tomorrow..."
            rows={2}
            className="rounded-2xl"
          />
        </div>
        
        <div>
          <Label htmlFor="reflections">Reflections</Label>
          <Textarea
            id="reflections"
            value={formData.reflections}
            onChange={(e) => setFormData({ ...formData, reflections: e.target.value })}
            placeholder="Thoughts and reflections..."
            rows={2}
            className="rounded-2xl"
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-2xl"
          >
            {isLoading ? "Saving..." : (initialData ? "Update Entry" : "Create Entry")}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="rounded-2xl">
            Cancel
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}