'use client';

import { motion } from 'framer-motion';
import type { StressLevel } from '@/types';

interface StressStepProps {
  onSelect: (level: StressLevel) => void;
  selected?: StressLevel | null;
}

const STRESS_OPTIONS = [
  {
    value: 3 as StressLevel,
    level: 'LOW',
    label: 'Calm',
    emoji: '🌿',
    color: '#10b981',
    description: 'Feeling relaxed and in control',
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  },
  {
    value: 5 as StressLevel,
    level: 'MEDIUM',
    label: 'Moderate',
    emoji: '🌊',
    color: '#f59e0b',
    description: 'Some pressure, but manageable',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  },
  {
    value: 8 as StressLevel,
    level: 'HIGH',
    label: 'Stressed',
    emoji: '🔥',
    color: '#ef4444',
    description: 'Feeling overwhelmed or anxious',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
  },
];

export function StressStep({ onSelect, selected }: StressStepProps) {
  const handleSelect = (value: StressLevel) => {
    onSelect(value);
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-8">
        <motion.h2
          className="text-2xl font-bold font-sora text-text-primary mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          What's your stress level?
        </motion.h2>
        <motion.p
          className="text-text-secondary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Choose the option that best describes how you feel
        </motion.p>
      </div>

      <div className="space-y-4">
        {STRESS_OPTIONS.map((option, index) => {
          const isSelected = selected === option.value;

          return (
            <motion.button
              key={option.level}
              onClick={() => handleSelect(option.value)}
              className="relative w-full p-6 rounded-2xl bg-bg-surface/50 border-2 transition-all duration-300 text-left overflow-hidden"
              style={{
                borderColor: isSelected ? option.color : 'rgba(148, 163, 184, 0.2)',
              }}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isSelected ? 1.02 : 1,
              }}
              transition={{
                delay: index * 0.1,
                duration: 0.4,
                type: 'spring',
                stiffness: 200,
              }}
              whileHover={{
                scale: 1.01,
                borderColor: option.color,
              }}
              whileTap={{ scale: 0.99 }}
            >
              {isSelected && (
                <motion.div
                  className="absolute inset-0 opacity-10"
                  style={{ background: option.gradient }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.1 }}
                  exit={{ opacity: 0 }}
                />
              )}

              <div className="relative flex items-center gap-4">
                <motion.div
                  className="flex items-center justify-center w-16 h-16 rounded-2xl flex-shrink-0"
                  style={{
                    background: isSelected
                      ? option.gradient
                      : 'rgba(31, 41, 64, 0.8)',
                  }}
                  animate={{
                    scale: isSelected ? 1.1 : 1,
                    rotate: isSelected ? [0, 5, -5, 0] : 0,
                  }}
                  transition={{
                    rotate: { duration: 0.5, repeat: isSelected ? Infinity : 0, repeatDelay: 2 },
                  }}
                >
                  <span className="text-3xl">{option.emoji}</span>
                </motion.div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="text-lg font-bold font-sora"
                      style={{ color: isSelected ? option.color : 'text-text-primary' }}
                    >
                      {option.level}
                    </h3>
                    <span
                      className="text-sm px-2 py-0.5 rounded-full"
                      style={{
                        background: isSelected ? `${option.color}20` : 'rgba(148, 163, 184, 0.1)',
                        color: isSelected ? option.color : 'text-text-secondary',
                      }}
                    >
                      {option.label}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {option.description}
                  </p>
                </div>

                {isSelected && (
                  <motion.div
                    className="flex items-center justify-center w-8 h-8 rounded-full"
                    style={{ background: option.color }}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </motion.div>
                )}
              </div>

              {isSelected && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1"
                  style={{ background: option.gradient }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

export default StressStep;
