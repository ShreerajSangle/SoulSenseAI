import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Target, CheckCircle, Circle } from 'lucide-react'
import { goalsAPI } from '../lib/api'

function GoalsPage({ user }) {
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: '', description: '', category: 'personal', target_date: '' })
  const queryClient = useQueryClient()

  const { data: goalsData = { goals: [], total_count: 0, active_count: 0, completed_count: 0 } } = useQuery({
    queryKey: ['goals', user?.id || 'anonymous'],
    queryFn: () => goalsAPI.getUserGoals(user?.id || 'anonymous')
  })

  const createGoalMutation = useMutation({
    mutationFn: (goalData) => goalsAPI.createGoal({
      ...goalData,
      user_id: user?.id || 'anonymous'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals'])
      setShowNewGoal(false)
      setNewGoal({ title: '', description: '', category: 'personal', target_date: '' })
    }
  })

  const updateGoalMutation = useMutation({
    mutationFn: ({ goalId, updates }) => goalsAPI.updateGoal(goalId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['goals'])
    }
  })

  const handleCreateGoal = (e) => {
    e.preventDefault()
    if (!newGoal.title.trim()) return
    
    createGoalMutation.mutate({
      ...newGoal,
      target_date: newGoal.target_date ? new Date(newGoal.target_date).toISOString() : null
    })
  }

  const toggleGoalStatus = (goal) => {
    const newStatus = goal.status === 'completed' ? 'active' : 'completed'
    updateGoalMutation.mutate({
      goalId: goal.id,
      updates: { status: newStatus }
    })
  }

  const getCategoryColor = (category) => {
    const colors = {
      personal: 'bg-lavender-100 text-lavender-700',
      health: 'bg-green-100 text-green-700',
      career: 'bg-blue-100 text-blue-700',
      relationships: 'bg-rose-100 text-rose-700',
      learning: 'bg-yellow-100 text-yellow-700'
    }
    return colors[category] || colors.personal
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-lavender-100 px-4 py-3 flex items-center gap-4 gentle-shadow">
        <Link to="/" className="text-lavender-600 hover:text-lavender-700 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <Target className="w-6 h-6 text-lavender-600" />
        <h1 className="font-rosarivo text-xl text-lavender-900">Goals & Growth</h1>
        <button
          onClick={() => setShowNewGoal(true)}
          className="ml-auto bg-lavender-600 hover:bg-lavender-700 text-white p-2 rounded-full transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* New Goal Modal */}
        {showNewGoal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl gentle-shadow">
              <h2 className="font-rosarivo text-2xl text-lavender-900 mb-4">Create New Goal</h2>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <input
                  type="text"
                  placeholder="What do you want to achieve?"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-lavender-200 rounded-xl px-4 py-3 font-nunito focus:outline-none focus:ring-2 focus:ring-lavender-500"
                  required
                />
                
                <textarea
                  placeholder="Describe your goal in detail (optional)"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-24 border border-lavender-200 rounded-xl px-4 py-3 font-nunito focus:outline-none focus:ring-2 focus:ring-lavender-500 resize-none"
                />
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-nunito text-sm text-lavender-700 mb-2 block">Category</label>
                    <select
                      value={newGoal.category}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-lavender-200 rounded-xl px-4 py-3 font-nunito focus:outline-none focus:ring-2 focus:ring-lavender-500"
                    >
                      <option value="personal">Personal</option>
                      <option value="health">Health</option>
                      <option value="career">Career</option>
                      <option value="relationships">Relationships</option>
                      <option value="learning">Learning</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="font-nunito text-sm text-lavender-700 mb-2 block">Target Date</label>
                    <input
                      type="date"
                      value={newGoal.target_date}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value }))}
                      className="w-full border border-lavender-200 rounded-xl px-4 py-3 font-nunito focus:outline-none focus:ring-2 focus:ring-lavender-500"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={createGoalMutation.isPending}
                    className="bg-lavender-600 hover:bg-lavender-700 disabled:bg-lavender-300 text-white px-6 py-3 rounded-xl font-nunito font-medium transition-colors"
                  >
                    {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewGoal(false)}
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
                {goalsData.active_count}
              </div>
              <div className="font-nunito text-sm text-lavender-600">Active Goals</div>
            </div>
            <div className="text-center">
              <div className="font-nunito text-3xl font-bold text-green-700 mb-1">
                {goalsData.completed_count}
              </div>
              <div className="font-nunito text-sm text-green-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="font-nunito text-3xl font-bold text-blue-700 mb-1">
                {goalsData.completed_count > 0 ? Math.round((goalsData.completed_count / goalsData.total_count) * 100) : 0}%
              </div>
              <div className="font-nunito text-sm text-blue-600">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {goalsData.goals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-lavender-300 mx-auto mb-4" />
              <h3 className="font-rosarivo text-xl text-lavender-700 mb-2">Set your first goal</h3>
              <p className="font-nunito text-lavender-600 mb-6 max-w-md mx-auto">
                Goals give direction to your wellness journey. Start with something meaningful to you.
              </p>
              <button
                onClick={() => setShowNewGoal(true)}
                className="bg-lavender-600 hover:bg-lavender-700 text-white px-6 py-3 rounded-xl font-nunito font-medium transition-colors"
              >
                Create Your First Goal
              </button>
            </div>
          ) : (
            goalsData.goals.map((goal) => (
              <div key={goal.id} className="bg-white rounded-2xl p-6 gentle-shadow border border-lavender-100">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleGoalStatus(goal)}
                    className="mt-1 text-lavender-600 hover:text-lavender-700 transition-colors"
                  >
                    {goal.status === 'completed' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`font-rosarivo text-lg ${
                        goal.status === 'completed' ? 'text-green-700 line-through' : 'text-lavender-900'
                      }`}>
                        {goal.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-nunito ${getCategoryColor(goal.category)}`}>
                        {goal.category}
                      </span>
                    </div>
                    
                    {goal.description && (
                      <p className="font-nunito text-lavender-700 mb-3 leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-lavender-600 font-nunito">
                        Created {new Date(goal.created_at).toLocaleDateString()}
                      </div>
                      {goal.target_date && (
                        <div className="text-sm text-lavender-600 font-nunito">
                          Target: {new Date(goal.target_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-nunito text-lavender-600">Progress</span>
                        <span className="text-sm font-nunito text-lavender-600">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-lavender-100 rounded-full h-2">
                        <div 
                          className="bg-lavender-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default GoalsPage