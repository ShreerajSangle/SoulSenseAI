import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, BookOpen, Search } from 'lucide-react'
import { diaryAPI } from '../lib/api'

function DiaryPage({ user }) {
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [newEntry, setNewEntry] = useState({ title: '', content: '', mood: '' })
  const queryClient = useQueryClient()

  const { data: diaryData = { entries: [], total_count: 0 } } = useQuery({
    queryKey: ['diary', user?.id || 'anonymous'],
    queryFn: () => diaryAPI.getEntries(user?.id || 'anonymous')
  })

  const createEntryMutation = useMutation({
    mutationFn: (entryData) => diaryAPI.createEntry({
      ...entryData,
      user_id: user?.id || 'anonymous'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['diary'])
      setShowNewEntry(false)
      setNewEntry({ title: '', content: '', mood: '' })
    }
  })

  const handleCreateEntry = (e) => {
    e.preventDefault()
    if (!newEntry.content.trim()) return
    
    createEntryMutation.mutate(newEntry)
  }

  const moodEmojis = {
    happy: '😊',
    sad: '😢',
    anxious: '😰',
    calm: '😌',
    excited: '🤗',
    angry: '😠',
    grateful: '🙏'
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-lavender-100 px-4 py-3 flex items-center gap-4 gentle-shadow">
        <Link to="/" className="text-lavender-600 hover:text-lavender-700 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <BookOpen className="w-6 h-6 text-lavender-600" />
        <h1 className="font-rosarivo text-xl text-lavender-900">Personal Journal</h1>
        <button
          onClick={() => setShowNewEntry(true)}
          className="ml-auto bg-lavender-600 hover:bg-lavender-700 text-white p-2 rounded-full transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* New Entry Modal */}
        {showNewEntry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl gentle-shadow">
              <h2 className="font-rosarivo text-2xl text-lavender-900 mb-4">New Journal Entry</h2>
              <form onSubmit={handleCreateEntry} className="space-y-4">
                <input
                  type="text"
                  placeholder="Entry title (optional)"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-lavender-200 rounded-xl px-4 py-3 font-nunito focus:outline-none focus:ring-2 focus:ring-lavender-500"
                />
                
                <textarea
                  placeholder="How are you feeling today? What's on your mind?"
                  value={newEntry.content}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full h-40 border border-lavender-200 rounded-xl px-4 py-3 font-nunito focus:outline-none focus:ring-2 focus:ring-lavender-500 resize-none"
                  required
                />
                
                <div>
                  <label className="font-nunito text-sm text-lavender-700 mb-2 block">Mood</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(moodEmojis).map(([mood, emoji]) => (
                      <button
                        key={mood}
                        type="button"
                        onClick={() => setNewEntry(prev => ({ ...prev, mood }))}
                        className={`px-3 py-2 rounded-full font-nunito text-sm border transition-colors ${
                          newEntry.mood === mood
                            ? 'bg-lavender-600 text-white border-lavender-600'
                            : 'bg-white text-lavender-700 border-lavender-200 hover:border-lavender-400'
                        }`}
                      >
                        {emoji} {mood}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={createEntryMutation.isPending}
                    className="bg-lavender-600 hover:bg-lavender-700 disabled:bg-lavender-300 text-white px-6 py-3 rounded-xl font-nunito font-medium transition-colors"
                  >
                    {createEntryMutation.isPending ? 'Saving...' : 'Save Entry'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewEntry(false)}
                    className="border border-lavender-300 text-lavender-700 hover:bg-lavender-50 px-6 py-3 rounded-xl font-nunito font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="bg-white rounded-2xl p-6 gentle-shadow border border-lavender-100 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="font-nunito text-3xl font-bold text-lavender-700 mb-1">
                {diaryData.total_count}
              </div>
              <div className="font-nunito text-sm text-lavender-600">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="font-nunito text-3xl font-bold text-rose-700 mb-1">7</div>
              <div className="font-nunito text-sm text-rose-600">Days This Week</div>
            </div>
            <div className="text-center">
              <div className="font-nunito text-3xl font-bold text-green-700 mb-1">21</div>
              <div className="font-nunito text-sm text-green-600">Writing Streak</div>
            </div>
          </div>
        </div>

        {/* Entries */}
        <div className="space-y-4">
          {diaryData.entries.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-lavender-300 mx-auto mb-4" />
              <h3 className="font-rosarivo text-xl text-lavender-700 mb-2">Your journal awaits</h3>
              <p className="font-nunito text-lavender-600 mb-6 max-w-md mx-auto">
                Start reflecting on your thoughts and feelings. Writing helps process emotions and track your growth.
              </p>
              <button
                onClick={() => setShowNewEntry(true)}
                className="bg-lavender-600 hover:bg-lavender-700 text-white px-6 py-3 rounded-xl font-nunito font-medium transition-colors"
              >
                Write Your First Entry
              </button>
            </div>
          ) : (
            diaryData.entries.map((entry) => (
              <div key={entry.id} className="bg-white rounded-2xl p-6 gentle-shadow border border-lavender-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    {entry.title && (
                      <h3 className="font-rosarivo text-lg text-lavender-900 mb-1">{entry.title}</h3>
                    )}
                    <div className="flex items-center gap-3 text-sm text-lavender-600">
                      <span className="font-nunito">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                      {entry.mood && (
                        <span className="bg-lavender-100 px-2 py-1 rounded-full font-nunito">
                          {moodEmojis[entry.mood]} {entry.mood}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="font-nunito text-lavender-800 leading-relaxed">
                  {entry.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default DiaryPage