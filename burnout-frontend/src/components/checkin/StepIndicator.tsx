'use client';

import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

const DEFAULT_LABELS = ['Mood', 'Sleep', 'Stress', 'Note', 'Result'];

export function StepIndicator({
  currentStep,
  totalSteps,
  stepLabels = DEFAULT_LABELS,
}: StepIndicatorProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-3">
        <motion.span
          key={`step-${currentStep}`}
          className="text-sm font-medium text-text-secondary"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          Step {currentStep + 1} of {totalSteps}
        </motion.span>
        <motion.span
          key={`label-${currentStep}`}
          className="text-sm font-semibold text-text-primary"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {stepLabels[currentStep]}
        </motion.span>
      </div>

      <div className="relative h-2 bg-bg-surface rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        <div className="absolute inset-0 flex items-center justify-between px-2">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <motion.div
                key={index}
                className="relative z-10"
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-accent-indigo shadow-glow-indigo'
                      : isCompleted
                        ? 'bg-accent-indigo'
                        : 'bg-bg-elevated border border-border-subtle'
                  }`}
                  animate={
                    isActive
                      ? {
                          boxShadow: [
                            '0 0 0px rgba(99, 102, 241, 0)',
                            '0 0 20px rgba(99, 102, 241, 0.6)',
                            '0 0 0px rgba(99, 102, 241, 0)',
                          ],
                        }
                      : {}
                  }
                  transition={
                    isActive
                      ? { duration: 1.5, repeat: Infinity }
                      : { duration: 0.3 }
                  }
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StepIndicator;
