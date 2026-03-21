'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import moodService, { type MoodEntryRequest } from '@/services/moodService';
import type { MoodValue, StressLevel, SleepQualityValue } from '@/types';
import { calculateBurnoutRisk } from '@/utils/helpers';

type CheckInStep = 'mood' | 'sleep' | 'stress' | 'note' | 'complete';

interface CheckInFormData {
  mood: MoodValue | null;
  sleepHours: number;
  sleepQuality: SleepQualityValue;
  stressLevel: StressLevel | null;
  notes: string;
  energyLevel: number;
  socialInteraction: boolean;
  exerciseToday: boolean;
  caffeineIntake: 'none' | 'low' | 'medium' | 'high';
  tags: string[];
}

interface CheckInResult {
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  suggestion: string;
}

interface UseCheckInReturn {
  step: CheckInStep;
  stepIndex: number;
  formData: CheckInFormData;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: CheckInStep) => void;
  updateField: <K extends keyof CheckInFormData>(field: K, value: CheckInFormData[K]) => void;
  submit: () => Promise<CheckInResult | null>;
  isSubmitting: boolean;
  error: string | null;
  result: CheckInResult | null;
  canProceed: boolean;
  reset: () => void;
}

const STEPS: CheckInStep[] = ['mood', 'sleep', 'stress', 'note', 'complete'];

const SUGGESTIONS = {
  low: [
    "Great job maintaining balance! Keep up your healthy habits.",
    "Consider trying a new breathing exercise to maintain your wellbeing.",
    "You're doing well! Maybe share some positive energy with a friend.",
  ],
  medium: [
    "Try a 5-minute breathing exercise to help reduce stress.",
    "Consider taking short breaks throughout your study sessions.",
    "Aim for 7-8 hours of sleep tonight to help recovery.",
  ],
  high: [
    "Consider speaking with a counselor or trusted person about how you're feeling.",
    "Try the 4-7-8 breathing exercise before bed tonight.",
    "Take a break from screens and go for a short walk outside.",
  ],
};

export function useCheckIn(): UseCheckInReturn {
  const router = useRouter();
  const [step, setStep] = useState<CheckInStep>('mood');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckInResult | null>(null);

  const [formData, setFormData] = useState<CheckInFormData>({
    mood: null,
    sleepHours: 7,
    sleepQuality: 5,
    stressLevel: null,
    notes: '',
    energyLevel: 5,
    socialInteraction: false,
    exerciseToday: false,
    caffeineIntake: 'medium',
    tags: [],
  });

  const stepIndex = useMemo(() => STEPS.indexOf(step), [step]);

  const nextStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex < STEPS.length - 1) {
      setStep(STEPS[currentIndex + 1]);
    }
  }, [step]);

  const prevStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1]);
    }
  }, [step]);

  const goToStep = useCallback((newStep: CheckInStep) => {
    setStep(newStep);
  }, []);

  const updateField = useCallback(<K extends keyof CheckInFormData>(
    field: K,
    value: CheckInFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const canProceed = useMemo(() => {
    switch (step) {
      case 'mood':
        return formData.mood !== null;
      case 'sleep':
        return formData.sleepHours > 0;
      case 'stress':
        return formData.stressLevel !== null;
      case 'note':
        return true;
      case 'complete':
        return false;
      default:
        return false;
    }
  }, [step, formData]);

  const submit = useCallback(async (): Promise<CheckInResult | null> => {
    if (!formData.mood || !formData.stressLevel) {
      setError('Please complete all required fields');
      return null;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: MoodEntryRequest = {
        mood: formData.mood,
        stressLevel: formData.stressLevel,
        sleepHours: formData.sleepHours,
        sleepQuality: formData.sleepQuality,
        notes: formData.notes || undefined,
        energyLevel: formData.energyLevel,
        socialInteraction: formData.socialInteraction,
        exerciseToday: formData.exerciseToday,
        caffeineIntake: formData.caffeineIntake,
        tags: formData.tags,
      };

      await moodService.addMoodEntry(payload);

      const riskLevel = calculateBurnoutRisk(
        formData.mood,
        formData.stressLevel,
        formData.sleepHours,
        50
      );

      const score =
        (10 - formData.mood) * 10 +
        formData.stressLevel * 10 +
        (8 - formData.sleepHours) * 5;

      const normalizedScore = Math.min(100, Math.max(0, score));

      const suggestions = SUGGESTIONS[riskLevel];
      const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

      const checkInResult: CheckInResult = {
        score: normalizedScore,
        riskLevel,
        suggestion,
      };

      setResult(checkInResult);
      setStep('complete');

      return checkInResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit check-in';
      setError(errorMessage);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  const reset = useCallback(() => {
    setStep('mood');
    setFormData({
      mood: null,
      sleepHours: 7,
      sleepQuality: 5,
      stressLevel: null,
      notes: '',
      energyLevel: 5,
      socialInteraction: false,
      exerciseToday: false,
      caffeineIntake: 'medium',
      tags: [],
    });
    setError(null);
    setResult(null);
    setIsSubmitting(false);
  }, []);

  return {
    step,
    stepIndex,
    formData,
    nextStep,
    prevStep,
    goToStep,
    updateField,
    submit,
    isSubmitting,
    error,
    result,
    canProceed,
    reset,
  };
}

export default useCheckIn;
