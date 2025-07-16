import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Tag, Search } from 'lucide-react';

const JournalPage = ({ user }) => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState('all');
  const [selectedPersona, setSelectedPersona] = useState('all');

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    try {
      const response = await fetch(`/api/journal/entries/${user.user_id}`);
      if (response.ok) {
        const entriesData = await response.json();
        setEntries(entriesData);
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = selectedMood === 'all' || entry.mood === selectedMood;
    const matchesPersona = selectedPersona === 'all' || entry.persona_id === selectedPersona;
    
    return matchesSearch && matchesMood && matchesPersona;
  });

  const moods = ['happy', 'sad', 'anxious', 'calm', 'excited', 'frustrated', 'hopeful', 'overwhelmed', 'grateful'];
  const personas = ['sarah', 'maya', 'alex', 'marcus'];

  const getMoodColor = (mood) => {
    const colors = {
      happy: 'bg-yellow-100 text-yellow-800',
      sad: 'bg-blue-100 text-blue-800',
      anxious: 'bg-red-100 text-red-800',
      calm: 'bg-green-100 text-green-800',
      excited: 'bg-orange-100 text-orange-800',
      frustrated: 'bg-purple-100 text-purple-800',
      hopeful: 'bg-pink-100 text-pink-800',
      overwhelmed: 'bg-gray-100 text-gray-800',
      grateful: 'bg-emerald-100 text-emerald-800'
    };
    return colors[mood] || 'bg-gray-100 text-gray-800';
  };

  const getPersonaColor = (personaId) => {
    const colors = {
      sarah: 'bg-blue-100 text-blue-800',
      maya: 'bg-purple-100 text-purple-800',
      alex: 'bg-orange-100 text-orange-800',
      marcus: 'bg-green-100 text-green-800'
    };
    return colors[personaId] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const NewEntryModal = ({ onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mood, setMood] = useState('calm');
    const [personaId, setPersonaId] = useState('sarah');
    const [tags, setTags] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
      if (!content.trim()) return;

      setSaving(true);
      try {
        const response = await fetch('/api/journal/entry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title || null,
            content: content.trim(),
            mood: mood,
            persona_id: personaId,
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            is_private: true
          })
        });

        if (response.ok) {
          onSave();
          onClose();
        } else {
          alert('Error saving journal entry');
        }
      } catch (error) {
        console.error('Error saving journal entry:', error);
        alert('Error saving journal entry');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">New Journal Entry</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Give your entry a title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How are you feeling?
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {moods.map(moodOption => (
                  <option key={moodOption} value={moodOption}>
                    {moodOption.charAt(0).toUpperCase() + moodOption.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Associated Persona
              </label>
              <select
                value={personaId}
                onChange={(e) => setPersonaId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="sarah">Dr. Sarah - Clinical Therapist</option>
                <option value="maya">Maya - Spiritual Guide</option>
                <option value="alex">Alex - Peer Support Friend</option>
                <option value="marcus">Marcus - Life Coach</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows="8"
                placeholder="Write your thoughts, feelings, or reflections..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="growth, reflection, anxiety, gratitude..."
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim() || saving}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
            </div>
            <button
              onClick={() => setShowNewEntryModal(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>New Entry</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Search entries..."
              />
            </div>

            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Moods</option>
              {moods.map(mood => (
                <option key={mood} value={mood}>
                  {mood.charAt(0).toUpperCase() + mood.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Personas</option>
              {personas.map(persona => (
                <option key={persona} value={persona}>
                  {persona.charAt(0).toUpperCase() + persona.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Journal Entries */}
        <div className="space-y-6">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No journal entries found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedMood !== 'all' || selectedPersona !== 'all' 
                  ? 'Try adjusting your filters or search terms.'
                  : 'Start your journaling journey by creating your first entry.'}
              </p>
              <button
                onClick={() => setShowNewEntryModal(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create First Entry
              </button>
            </div>
          ) : (
            filteredEntries.map(entry => (
              <div key={entry.id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {entry.title && (
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{entry.title}</h3>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatDate(entry.timestamp)}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(entry.mood)}`}>
                        {entry.mood}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPersonaColor(entry.persona_id)}`}>
                        {entry.persona_id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="prose max-w-none mb-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex items-center space-x-2 mb-4">
                    <Tag size={14} className="text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Entry Modal */}
      {showNewEntryModal && (
        <NewEntryModal
          onClose={() => setShowNewEntryModal(false)}
          onSave={fetchEntries}
        />
      )}
    </div>
  );
};

export default JournalPage;