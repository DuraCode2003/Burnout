'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BREATHING_EXERCISES } from '@/utils/constants';
import type { BreathingExercise } from '@/types';

interface SessionCompleteProps {
  exercise: (typeof BREATHING_EXERCISES)[number];
  duration: number;
  cycles: number;
  onClose: () => void;
  preStressLevel?: number;
  postStressLevel?: number;
}

interface AnimatedCheckmarkProps {
  onComplete?: () => void;
}

function AnimatedCheckmark({ onComplete }: AnimatedCheckmarkProps) {
  return (
    <motion.svg
      className="w-24 h-24 text-success"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        delay: 0.2,
      }}
      onAnimationComplete={onComplete}
    >
      <motion.circle
        cx="50"
        cy="50"
        r="46"
        stroke="currentColor"
        fill="none"
        strokeWidth="8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.3 }}
      />
      <motion.path
        d="M30 50 L45 65 L70 35"
        stroke="white"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, pathOffset: 1 }}
        animate={{ pathLength: 1, pathOffset: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.8 }}
      />
    </motion.svg>
  );
}

export function SessionComplete({
  exercise,
  duration,
  cycles,
  onClose,
  preStressLevel,
  postStressLevel,
}: SessionCompleteProps) {
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [feelingCalmer, setFeelingCalmer] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const stressReduction =
    preStressLevel && postStressLevel
      ? preStressLevel - postStressLevel
      : 0;

  const handleSubmitFeedback = async (feelsCalmer: boolean) => {
    setFeelingCalmer(feelsCalmer);
    setIsSubmitting(true);

    try {
      await fetch('http://localhost:8080/api/breathing/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          duration: duration * cycles,
          completed: true,
          preStressLevel: preStressLevel || undefined,
          postStressLevel: postStressLevel || undefined,
          feltCalmer: feelsCalmer,
        }),
      });
    } catch (error) {
      console.error('Failed to log breathing session:', error);
    } finally {
      setIsSubmitting(false);
      setTimeout(onClose, 500);
    }
  };

  return (
    <motion.div
      className="w-full max-w-md mx-auto text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <AnimatedCheckmark onComplete={() => setShowCheckmark(true)} />
      </div>

      {showCheckmark && (
        <>
          <motion.h2
            className="text-3xl font-bold font-sora text-text-primary mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Session Complete
          </motion.h2>

          <motion.p
            className="text-text-secondary mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Great job taking time for yourself
          </motion.p>

          <motion.div
            className="grid grid-cols-3 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="p-4 rounded-xl bg-bg-surface/50 border border-border-subtle">
              <div className="text-2xl font-bold text-accent-indigo mb-1">
                {cycles}
              </div>
              <div className="text-xs text-text-secondary">Cycles</div>
            </div>

            <div className="p-4 rounded-xl bg-bg-surface/50 border border-border-subtle">
              <div className="text-2xl font-bold text-accent-violet mb-1">
                {formatDuration(duration * cycles)}
              </div>
              <div className="text-xs text-text-secondary">Duration</div>
            </div>

            <div className="p-4 rounded-xl bg-bg-surface/50 border border-border-subtle">
              <div className="text-2xl font-bold text-success mb-1">
                {stressReduction > 0 ? `-${stressReduction}` : '0'}
              </div>
              <div className="text-xs text-text-secondary">Stress</div>
            </div>
          </motion.div>

          {feelingCalmer === null ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-text-secondary mb-4">
                Do you feel calmer now?
              </p>
              <div className="flex gap-3 justify-center">
                <motion.button
                  onClick={() => handleSubmitFeedback(false)}
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl font-medium font-sora text-text-secondary bg-bg-surface border border-border-subtle hover:border-border-default transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Not really
                </motion.button>

                <motion.button
                  onClick={() => handleSubmitFeedback(true)}
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl font-medium font-sora text-white bg-gradient-accent hover:shadow-glow-indigo-lg transition-shadow disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Yes, I do
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="p-4 rounded-xl bg-success/10 border border-success/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 }}
            >
              <p className="text-success">
                {feelingCalmer
                  ? "Wonderful! Keep practicing when you need to reset."
                  : "That's okay. Breathing exercises work better with practice."}
              </p>
            </motion.div>
          )}

          <motion.button
            onClick={onClose}
            className="mt-6 text-text-secondary hover:text-text-primary transition-colors text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Skip feedback →
          </motion.button>
        </>
      )}
    </motion.div>
  );
}

export default SessionComplete;
