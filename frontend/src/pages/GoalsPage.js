import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Target, Calendar, CheckCircle, Circle, Trash2, Edit3 } from 'lucide-react';

const GoalsPage = ({ user }) => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const response = await fetch(`/api/goals/${user.user_id}`);
      if (response.ok) {
        const goalsData = await response.json();
        setGoals(goalsData);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const filteredGoals = goals.filter(goal => {
    if (filter === 'active') return !goal.is_completed;
    if (filter === 'completed') return goal.is_completed;
    return true;
  });

  const toggleGoalCompletion = async (goalId, currentStatus) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_completed: !currentStatus,
          progress_percentage: !currentStatus ? 100 : 0
        })
      });

      if (response.ok) {
        setGoals(goals.map(goal => 
          goal.id === goalId 
            ? { ...goal, is_completed: !currentStatus, progress_percentage: !currentStatus ? 100 : 0 }
            : goal
        ));
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const deleteGoal = async (goalId) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setGoals(goals.filter(goal => goal.id !== goalId));
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      wellness: 'bg-green-100 text-green-800',
      emotional: 'bg-purple-100 text-purple-800',
      spiritual: 'bg-indigo-100 text-indigo-800',
      physical: 'bg-orange-100 text-orange-800',
      social: 'bg-blue-100 text-blue-800',
      professional: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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

  const NewGoalModal = ({ onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('wellness');
    const [personaId, setPersonaId] = useState('marcus');
    const [targetDate, setTargetDate] = useState('');
    const [actionSteps, setActionSteps] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
      if (!title.trim() || !description.trim()) return;

      setSaving(true);
      try {
        const response = await fetch('/api/goals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            category: category,
            persona_id: personaId,
            target_date: targetDate || null,
            action_steps: actionSteps.split('\n').map(step => step.trim()).filter(step => step),
            progress_percentage: 0,
            is_completed: false
          })
        });

        if (response.ok) {
          onSave();
          onClose();
        } else {
          alert('Error creating goal');
        }
      } catch (error) {
        console.error('Error creating goal:', error);
        alert('Error creating goal');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create New Goal</h2>
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
                Goal Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="What do you want to achieve?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows="3"
                placeholder="Describe your goal in detail..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="wellness">Wellness</option>
                  <option value="emotional">Emotional</option>
                  <option value="spiritual">Spiritual</option>
                  <option value="physical">Physical</option>
                  <option value="social">Social</option>
                  <option value="professional">Professional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coaching Persona
                </label>
                <select
                  value={personaId}
                  onChange={(e) => setPersonaId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="marcus">Marcus - Life Coach</option>
                  <option value="sarah">Dr. Sarah - Therapist</option>
                  <option value="maya">Maya - Spiritual Guide</option>
                  <option value="alex">Alex - Peer Support</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Date (optional)
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action Steps (one per line)
              </label>
              <textarea
                value={actionSteps}
                onChange={(e) => setActionSteps(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows="4"
                placeholder="List the specific steps you'll take to achieve this goal..."
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
              disabled={!title.trim() || !description.trim() || saving}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Create Goal'}
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
              <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
            </div>
            <button
              onClick={() => setShowNewGoalModal(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>New Goal</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Goals</p>
                <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Target className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {goals.filter(g => g.is_completed).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {goals.length > 0 ? Math.round((goals.filter(g => g.is_completed).length / goals.length) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            All Goals
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'active' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'completed' 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Goals List */}
        <div className="space-y-6">
          {filteredGoals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No goals found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'Create your first goal to start your wellness journey.'
                  : `No ${filter} goals found. Try switching to a different filter.`}
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => setShowNewGoalModal(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Create First Goal
                </button>
              )}
            </div>
          ) : (
            filteredGoals.map(goal => (
              <div key={goal.id} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleGoalCompletion(goal.id, goal.is_completed)}
                      className={`mt-1 transition-colors ${
                        goal.is_completed 
                          ? 'text-green-600 hover:text-green-700' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {goal.is_completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                    </button>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 ${
                        goal.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {goal.title}
                      </h3>
                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {goal.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(goal.category)}`}>
                          {goal.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPersonaColor(goal.persona_id)}`}>
                          {goal.persona_id}
                        </span>
                        {goal.target_date && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span>{formatDate(goal.target_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium text-gray-900">
                      {goal.progress_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Steps */}
                {goal.action_steps && goal.action_steps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Action Steps:</h4>
                    <ul className="space-y-1">
                      {goal.action_steps.map((step, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Goal Modal */}
      {showNewGoalModal && (
        <NewGoalModal
          onClose={() => setShowNewGoalModal(false)}
          onSave={fetchGoals}
        />
      )}
    </div>
  );
};

export default GoalsPage;