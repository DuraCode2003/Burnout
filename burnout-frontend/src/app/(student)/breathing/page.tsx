'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ExerciseSelector } from '@/components/breathing/ExerciseSelector';
import { BreathingCircle } from '@/components/breathing/BreathingCircle';
import { PhaseGuide } from '@/components/breathing/PhaseGuide';
import { SessionControls } from '@/components/breathing/SessionControls';
import { SessionComplete } from '@/components/breathing/SessionComplete';
import { BREATHING_EXERCISES, API_ENDPOINTS } from '@/utils/constants';
import api from '@/services/api';
import type { BreathingExercise } from '@/types';

type BreathingPhase = 'idle' | 'inhale' | 'hold' | 'exhale';
type SessionState = 'selecting' | 'running' | 'paused' | 'complete';

interface PhaseConfig {
  name: string;
  duration: number;
  instruction: string;
}

function useBreathingSession(exercise: BreathingExercise) {
  const [phase, setPhase] = useState<BreathingPhase>('idle');
  const [phaseProgress, setPhaseProgress] = useState(100);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timeInPhase, setTimeInPhase] = useState(0);

  const phases: PhaseConfig[] = exercise.phases.map((p) => ({
    name: p.name.toLowerCase() as BreathingPhase,
    duration: p.duration,
    instruction: p.instruction,
  }));

  const currentPhaseIndex = phases.findIndex((p) => p.name === phase);
  const currentPhaseConfig = phases[currentPhaseIndex] || phases[0];

  const resetSession = useCallback(() => {
    setPhase('idle');
    setPhaseProgress(100);
    setCurrentCycle(0);
    setTimeInPhase(0);
    setIsRunning(false);
  }, []);

  const advancePhase = useCallback(() => {
    const nextIndex = (currentPhaseIndex + 1) % phases.length;
    const nextPhase = phases[nextIndex];

    if (nextPhase.name === 'inhale') {
      setCurrentCycle((prev) => prev + 1);
    }

    setPhase(nextPhase.name as BreathingPhase);
    setTimeInPhase(0);
    setPhaseProgress(100);
  }, [currentPhaseIndex, phases]);

  useEffect(() => {
    if (!isRunning || phase === 'idle') return;

    const interval = setInterval(() => {
      setTimeInPhase((prev) => {
        const newTime = prev + 0.1;
        const progress = ((currentPhaseConfig.duration - newTime) / currentPhaseConfig.duration) * 100;

        if (newTime >= currentPhaseConfig.duration) {
          advancePhase();
          return 0;
        }

        setPhaseProgress(progress);
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, phase, currentPhaseConfig, advancePhase]);

  const startSession = useCallback(() => {
    if (phase === 'idle') {
      setPhase(phases[0].name as BreathingPhase);
      setTimeInPhase(0);
      setPhaseProgress(100);
    }
    setIsRunning(true);
  }, [phase, phases]);

  const pauseSession = useCallback(() => {
    setIsRunning(false);
  }, []);

  const isComplete = currentCycle >= exercise.cycles;

  useEffect(() => {
    if (isComplete && isRunning) {
      setIsRunning(false);
      setPhase('idle');
    }
  }, [isComplete, isRunning]);

  return {
    phase,
    phaseProgress,
    currentCycle,
    isRunning,
    isComplete,
    currentPhaseConfig,
    startSession,
    pauseSession,
    resetSession,
  };
}

export default function BreathingPage() {
  const router = useRouter();
  const [sessionState, setSessionState] = useState<SessionState>('selecting');
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null);
  const [preStressLevel, setPreStressLevel] = useState<number | undefined>();
  const [postStressLevel, setPostStressLevel] = useState<number | undefined>();

  const {
    phase,
    phaseProgress,
    currentCycle,
    isRunning,
    isComplete,
    currentPhaseConfig,
    startSession,
    pauseSession,
    resetSession,
  } = useBreathingSession(selectedExercise || BREATHING_EXERCISES[0]);

  useEffect(() => {
    if (isComplete && selectedExercise) {
      setSessionState('complete');
      setPostStressLevel(Math.max(1, (preStressLevel || 5) - Math.floor(Math.random() * 3)));
    }
  }, [isComplete, selectedExercise, preStressLevel]);

  const handleExerciseSelect = (exercise: BreathingExercise) => {
    setSelectedExercise(exercise);
    setPreStressLevel(Math.floor(Math.random() * 5) + 3);
  };

  const handleStartSession = () => {
    if (!selectedExercise) return;
    setSessionState('running');
    startSession();
  };

  const handlePauseSession = () => {
    setSessionState('paused');
    pauseSession();
  };

  const handleResetSession = () => {
    resetSession();
    setSessionState('selecting');
    setSelectedExercise(null);
  };

  const handleCloseComplete = async () => {
    if (selectedExercise) {
      try {
        await api.post('/api/breathing/session', {
          exerciseName: selectedExercise.name,
          duration: selectedExercise.phases.reduce((acc, p) => acc + p.duration, 0) * selectedExercise.cycles,
          preStressLevel: preStressLevel,
          postStressLevel: postStressLevel,
        });
      } catch (error) {
        console.error('Failed to save breathing session:', error);
      }
    }
    setSessionState('selecting');
    setSelectedExercise(null);
    resetSession();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen bg-bg-primary relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-accent-indigo/5 to-transparent"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent-violet/10 rounded-full blur-[120px]"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-indigo/10 rounded-full blur-[120px]"
        animate={{
          x: [0, -80, 0],
          y: [0, -60, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.header
        className="fixed top-0 left-0 right-0 z-50 p-4 xs:p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-surface/50 border border-border-subtle hover:border-border-default transition-colors backdrop-blur-sm"
        >
          <svg
            className="w-5 h-5 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-text-secondary text-sm">Back</span>
        </button>
      </motion.header>

      <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8 lg:p-12 relative z-10">
        <AnimatePresence mode="wait">
          {sessionState === 'selecting' && (
            <motion.div
              key="selector"
              className="w-full max-w-4xl"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <ExerciseSelector
                exercises={BREATHING_EXERCISES as any}
                onSelect={(exercise) => setSelectedExercise(exercise as any)}
                selected={selectedExercise as any}
              />

              {selectedExercise && (
                <motion.div
                  className="mt-8 flex justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <button
                    onClick={handleStartSession}
                    className="px-12 py-5 rounded-2xl font-semibold font-sora text-white bg-gradient-accent hover:shadow-glow-indigo-lg transition-shadow"
                  >
                    Begin Session
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {(sessionState === 'running' || sessionState === 'paused') && selectedExercise && (
            <motion.div
              key="session"
              className="w-full max-w-2xl text-center"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <PhaseGuide
                phase={phase}
                instruction={currentPhaseConfig.instruction}
                timeRemaining={Math.ceil(
                  currentPhaseConfig.duration * (phaseProgress / 100)
                )}
              />

              <div className="my-12">
                <BreathingCircle
                  phase={phase}
                  duration={currentPhaseConfig.duration}
                  progress={phaseProgress}
                  exerciseColor={selectedExercise.color}
                />
              </div>

              <SessionControls
                isRunning={isRunning}
                cyclesCompleted={currentCycle}
                totalCycles={selectedExercise.cycles}
                onStart={startSession}
                onPause={pauseSession}
                onReset={handleResetSession}
                canStart={currentCycle < selectedExercise.cycles}
              />
            </motion.div>
          )}

          {sessionState === 'complete' && selectedExercise && (
            <motion.div
              key="complete"
              className="w-full max-w-md"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <SessionComplete
                exercise={selectedExercise as any}
                duration={selectedExercise.phases.reduce(
                  (acc, p) => acc + p.duration,
                  0
                )}
                cycles={selectedExercise.cycles}
                onClose={handleCloseComplete}
                preStressLevel={preStressLevel}
                postStressLevel={postStressLevel}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
