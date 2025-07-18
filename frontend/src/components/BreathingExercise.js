import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';

const BreathingExercise = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('inhale');
  const [timeRemaining, setTimeRemaining] = useState(4);
  const [cycle, setCycle] = useState(0);
  const [technique, setTechnique] = useState('box');
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const techniques = {
    box: {
      name: 'Box Breathing',
      description: 'Equal 4-count breathing for balance and focus',
      pattern: { inhale: 4, hold: 4, exhale: 4, rest: 4 },
      phases: ['inhale', 'hold', 'exhale', 'rest']
    },
    '4-7-8': {
      name: '4-7-8 Breathing',
      description: 'Calming breath for relaxation and sleep',
      pattern: { inhale: 4, hold: 7, exhale: 8 },
      phases: ['inhale', 'hold', 'exhale']
    },
    triangle: {
      name: 'Triangle Breathing',
      description: 'Three-part breath for anxiety relief',
      pattern: { inhale: 4, hold: 4, exhale: 4 },
      phases: ['inhale', 'hold', 'exhale']
    },
    coherent: {
      name: 'Coherent Breathing',
      description: '5-second cycles for heart rate variability',
      pattern: { inhale: 5, exhale: 5 },
      phases: ['inhale', 'exhale']
    }
  };

  const currentTechnique = techniques[technique];
  const currentPattern = currentTechnique.pattern;

  useEffect(() => {
    let interval;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      // Move to next phase
      const currentPhaseIndex = currentTechnique.phases.indexOf(currentPhase);
      const nextPhaseIndex = (currentPhaseIndex + 1) % currentTechnique.phases.length;
      const nextPhase = currentTechnique.phases[nextPhaseIndex];
      
      setCurrentPhase(nextPhase);
      setTimeRemaining(currentPattern[nextPhase]);
      
      // Increment cycle when we complete all phases
      if (nextPhaseIndex === 0) {
        setCycle(prev => prev + 1);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining, currentPhase, currentPattern, currentTechnique.phases]);

  const handleStart = () => {
    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentPhase(currentTechnique.phases[0]);
    setTimeRemaining(currentPattern[currentTechnique.phases[0]]);
    setCycle(0);
    setSessionStartTime(null);
  };

  const handleTechniqueChange = (newTechnique) => {
    setTechnique(newTechnique);
    handleReset();
  };

  const getPhaseInstruction = () => {
    const instructions = {
      inhale: 'Breathe in slowly through your nose',
      hold: 'Hold your breath gently',
      exhale: 'Breathe out slowly through your mouth',
      rest: 'Rest and prepare for the next breath'
    };
    return instructions[currentPhase] || 'Breathe naturally';
  };

  const getPhaseColor = () => {
    const colors = {
      inhale: 'from-green-400 to-emerald-500',
      hold: 'from-blue-400 to-blue-500',
      exhale: 'from-purple-400 to-purple-500',
      rest: 'from-gray-400 to-gray-500'
    };
    return colors[currentPhase] || 'from-gray-400 to-gray-500';
  };

  const calculateProgress = () => {
    const totalTime = currentPattern[currentPhase];
    const elapsed = totalTime - timeRemaining;
    return (elapsed / totalTime) * 100;
  };

  const saveSession = async () => {
    if (!sessionStartTime) return;

    const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
    
    try {
      await fetch('/api/breathing/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          technique: technique,
          duration: duration,
          rounds_completed: cycle,
          persona_id: 'maya', // Default to Maya for breathing exercises
          effectiveness_rating: null,
          user_notes: null
        })
      });
    } catch (error) {
      console.error('Error saving breathing session:', error);
    }
  };

  const handleClose = () => {
    if (sessionStartTime) {
      saveSession();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={24} className="text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🌬️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Breathing Exercise</h2>
          <p className="text-gray-600">Find your calm through mindful breathing</p>
        </div>

        {/* Technique Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose a technique:
          </label>
          <select
            value={technique}
            onChange={(e) => handleTechniqueChange(e.target.value)}
            disabled={isActive}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
          >
            {Object.entries(techniques).map(([key, tech]) => (
              <option key={key} value={key}>
                {tech.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {currentTechnique.description}
          </p>
        </div>

        {/* Breathing Circle */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32 mb-4">
            <div className="absolute inset-0 rounded-full bg-gray-200"></div>
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-r ${getPhaseColor()}`}
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, ${
                  50 + (calculateProgress() / 100) * 50 * Math.cos((calculateProgress() / 100) * 2 * Math.PI - Math.PI / 2)
                }% ${
                  50 + (calculateProgress() / 100) * 50 * Math.sin((calculateProgress() / 100) * 2 * Math.PI - Math.PI / 2)
                }%, 50% 50%)`
              }}
            ></div>
            <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-800">{timeRemaining}</span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 capitalize mb-1">
              {currentPhase === 'rest' ? 'Rest' : currentPhase}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              {getPhaseInstruction()}
            </p>
            <p className="text-xs text-gray-500">
              Cycle: {cycle} • Technique: {currentTechnique.name}
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm text-gray-600">{Math.round(calculateProgress())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full bg-gradient-to-r ${getPhaseColor()} transition-all duration-1000`}
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-3">
          {!isActive ? (
            <button
              onClick={handleStart}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <Play size={20} />
              <span>Start Breathing</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handlePause}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-full font-semibold transition-colors flex items-center space-x-2"
              >
                <Pause size={16} />
                <span>Pause</span>
              </button>
              <button
                onClick={handleReset}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-full font-semibold transition-colors flex items-center space-x-2"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>
          )}
        </div>

        {/* Session Stats */}
        {sessionStartTime && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Session time:</span>
              <span>{Math.floor((Date.now() - sessionStartTime) / 1000)}s</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Completed cycles:</span>
              <span>{cycle}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreathingExercise;