'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { BREATHING_EXERCISES } from '@/utils/constants';
import type { BreathingExercise } from '@/types';

type BreathingPhase = 'idle' | 'inhale' | 'hold' | 'exhale';
type SessionState = 'idle' | 'running' | 'paused' | 'complete';

interface PhaseConfig {
  name: BreathingPhase;
  duration: number;
  instruction: string;
}

interface UseBreathingSessionReturn {
  phase: BreathingPhase;
  phaseProgress: number;
  timeInPhase: number;
  currentCycle: number;
  totalCycles: number;
  isRunning: boolean;
  isComplete: boolean;
  currentPhaseConfig: PhaseConfig;
  currentInstruction: string;
  selectedExercise: BreathingExercise;
  start: () => void;
  pause: () => void;
  reset: () => void;
  selectExercise: (exercise: BreathingExercise) => void;
}

export function useBreathingSession(
  initialExercise: BreathingExercise = BREATHING_EXERCISES[0]
): UseBreathingSessionReturn {
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise>(initialExercise);
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [phase, setPhase] = useState<BreathingPhase>('idle');
  const [phaseProgress, setPhaseProgress] = useState(100);
  const [timeInPhase, setTimeInPhase] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const phases: PhaseConfig[] = selectedExercise.phases.map((p) => ({
    name: p.name.toLowerCase() as BreathingPhase,
    duration: p.duration,
    instruction: p.instruction,
  }));

  const currentPhaseIndex = phases.findIndex((p) => p.name === phase);
  const currentPhaseConfig = phases[currentPhaseIndex] || phases[0];

  const isComplete = currentCycle >= selectedExercise.cycles && sessionState !== 'running';

  const advancePhase = useCallback(() => {
    const nextIndex = (currentPhaseIndex + 1) % phases.length;
    const nextPhase = phases[nextIndex];

    if (nextPhase.name === 'inhale') {
      setCurrentCycle((prev) => prev + 1);
    }

    setPhase(nextPhase.name);
    setTimeInPhase(0);
    setPhaseProgress(100);
  }, [currentPhaseIndex, phases]);

  const tick = useCallback(() => {
    setTimeInPhase((prev) => {
      const newTime = prev + 0.1;
      const progress =
        ((currentPhaseConfig.duration - newTime) / currentPhaseConfig.duration) * 100;

      if (newTime >= currentPhaseConfig.duration) {
        advancePhase();
        return 0;
      }

      setPhaseProgress(progress);
      return newTime;
    });
  }, [currentPhaseConfig, advancePhase]);

  useEffect(() => {
    if (sessionState === 'running' && phase !== 'idle') {
      intervalRef.current = setInterval(tick, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionState, phase, tick]);

  useEffect(() => {
    if (isComplete && sessionState === 'running') {
      setSessionState('complete');
      setPhase('idle');
    }
  }, [isComplete, sessionState]);

  const start = useCallback(() => {
    if (phase === 'idle') {
      setPhase(phases[0].name);
      setTimeInPhase(0);
      setPhaseProgress(100);
      setCurrentCycle(0);
    }
    setSessionState('running');
  }, [phase, phases]);

  const pause = useCallback(() => {
    setSessionState('paused');
  }, []);

  const reset = useCallback(() => {
    setSessionState('idle');
    setPhase('idle');
    setPhaseProgress(100);
    setCurrentCycle(0);
    setTimeInPhase(0);
  }, []);

  const selectExercise = useCallback((exercise: BreathingExercise) => {
    setSelectedExercise(exercise);
    reset();
  }, [reset]);

  const currentInstruction = currentPhaseConfig.instruction;

  return {
    phase,
    phaseProgress,
    timeInPhase,
    currentCycle,
    totalCycles: selectedExercise.cycles,
    isRunning: sessionState === 'running',
    isComplete: sessionState === 'complete',
    currentPhaseConfig,
    currentInstruction,
    selectedExercise,
    start,
    pause,
    reset,
    selectExercise,
  };
}

export default useBreathingSession;
