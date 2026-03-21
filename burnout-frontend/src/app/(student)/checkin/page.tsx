'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { StepIndicator } from '@/components/checkin/StepIndicator';
import { MoodStep } from '@/components/checkin/MoodStep';
import { SleepStep } from '@/components/checkin/SleepStep';
import { StressStep } from '@/components/checkin/StressStep';
import { NoteStep } from '@/components/checkin/NoteStep';
import { ResultCard } from '@/components/checkin/ResultCard';
import { calculateBurnoutRisk } from '@/utils/helpers';
import { api } from '@/services/api';
import type { MoodValue, StressLevel } from '@/types';

type Step = 'mood' | 'sleep' | 'stress' | 'note' | 'result';

const STEPS: Step[] = ['mood', 'sleep', 'stress', 'note', 'result'];
const STEP_LABELS = ['Mood', 'Sleep', 'Stress', 'Note', 'Complete'];

interface CheckInData {
  mood: MoodValue | null;
  sleepHours: number;
  stressLevel: StressLevel | null;
  note: string;
}

export default function CheckInPage() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<CheckInData>({
    mood: null,
    sleepHours: 7,
    stressLevel: null,
    note: '',
  });
  const [result, setResult] = useState<{
    score: number;
    riskLevel: 'low' | 'medium' | 'high';
    suggestion: string;
  } | null>(null);

  const currentStep = STEPS[currentStepIndex];
  const totalSteps = STEPS.length;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const handleMoodSelect = (mood: MoodValue) => {
    setData((prev) => ({ ...prev, mood }));
    setTimeout(() => {
      nextStep();
    }, 600);
  };

  const handleSleepSelect = (hours: number) => {
    setData((prev) => ({ ...prev, sleepHours: hours }));
  };

  const handleStressSelect = (level: StressLevel) => {
    setData((prev) => ({ ...prev, stressLevel: level }));
  };

  const handleNoteSubmit = (note: string) => {
    setData((prev) => ({ ...prev, note }));
    submitCheckIn();
  };

  const handleNoteSkip = () => {
    submitCheckIn();
  };

  const nextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setDirection(1);
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const calculateResult = () => {
    const moodScore = data.mood || 5;
    const stressLevel = data.stressLevel || 5;
    const sleepHours = data.sleepHours;

    const assessmentScore = (10 - moodScore) * 10 + stressLevel * 10 + (8 - sleepHours) * 5;
    const normalizedScore = Math.min(100, Math.max(0, assessmentScore));

    const riskLevel = calculateBurnoutRisk(moodScore, stressLevel, sleepHours, normalizedScore);

    const suggestions = {
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

    const randomSuggestion =
      suggestions[riskLevel][Math.floor(Math.random() * suggestions[riskLevel].length)];

    return {
      score: normalizedScore,
      riskLevel,
      suggestion: randomSuggestion,
    };
  };

  const submitCheckIn = async () => {
    setIsSubmitting(true);

    try {
      const payload = {
        mood: data.mood,
        stressLevel: data.stressLevel,
        sleepHours: data.sleepHours,
        sleepQuality: Math.round(data.sleepHours >= 7 ? 6 : data.sleepHours >= 5 ? 4 : 2),
        notes: data.note || undefined,
        energyLevel: data.mood ? Math.round((data.mood / 10) * 10) : 5,
        socialInteraction: false,
        exerciseToday: false,
        caffeineIntake: 'medium' as const,
        tags: [],
      };

      const response = await api.post('/api/mood', payload);

      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to submit check-in');
      }

      const result = calculateResult();
      setResult(result);
      nextStep();
    } catch (error) {
      console.error('Error submitting check-in:', error);
      const result = calculateResult();
      setResult(result);
      nextStep();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    router.push('/dashboard');
  };

  const canGoBack = currentStepIndex > 0 && currentStep !== 'result';
  const canProceed = () => {
    switch (currentStep) {
      case 'mood':
        return data.mood !== null;
      case 'sleep':
        return data.sleepHours > 0;
      case 'stress':
        return data.stressLevel !== null;
      case 'note':
        return true;
      default:
        return false;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canGoBack) {
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoBack]);

  return (
    <div className="max-w-2xl mx-auto">
            <motion.header
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-4 mb-4">
                {canGoBack && (
                  <motion.button
                    onClick={prevStep}
                    className="p-2 rounded-xl bg-bg-surface border border-border-subtle hover:border-border-default transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
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
                  </motion.button>
                )}

                <div>
                  <h1 className="text-2xl xs:text-3xl font-bold font-sora text-text-primary">
                    Daily Check-in
                  </h1>
                  <p className="text-text-secondary text-sm">
                    Take a moment to reflect on your day
                  </p>
                </div>
              </div>
            </motion.header>

            <StepIndicator
              currentStep={currentStepIndex}
              totalSteps={totalSteps}
              stepLabels={STEP_LABELS}
            />

            <div className="relative min-h-[400px]">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                {currentStep === 'mood' && (
                  <motion.div
                    key="mood"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.3 },
                    }}
                  >
                    <MoodStep
                      onSelect={handleMoodSelect}
                      selected={data.mood}
                    />
                  </motion.div>
                )}

                {currentStep === 'sleep' && (
                  <motion.div
                    key="sleep"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.3 },
                    }}
                  >
                    <SleepStep
                      onSelect={handleSleepSelect}
                      value={data.sleepHours}
                    />
                  </motion.div>
                )}

                {currentStep === 'stress' && (
                  <motion.div
                    key="stress"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.3 },
                    }}
                  >
                    <StressStep
                      onSelect={handleStressSelect}
                      selected={data.stressLevel}
                    />
                  </motion.div>
                )}

                {currentStep === 'note' && (
                  <motion.div
                    key="note"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.3 },
                    }}
                  >
                    <NoteStep
                      onSubmit={handleNoteSubmit}
                      onSkip={handleNoteSkip}
                      initialValue={data.note}
                    />
                  </motion.div>
                )}

                {currentStep === 'result' && result && (
                  <motion.div
                    key="result"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 300, damping: 30 },
                      opacity: { duration: 0.3 },
                    }}
                  >
                    <ResultCard
                      score={result.score}
                      riskLevel={result.riskLevel}
                      suggestion={result.suggestion}
                      onDone={handleDone}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {currentStep !== 'result' && currentStep !== 'note' && canProceed() && (
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={nextStep}
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-xl font-medium font-sora text-white bg-gradient-accent hover:shadow-glow-indigo-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Continue'}
                </button>
              </motion.div>
            )}
    </div>
  );
}
