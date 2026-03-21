'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { getMoodEmoji } from '@/utils/helpers';
import type { MoodValue } from '@/types';

interface MoodStepProps {
  onSelect: (mood: MoodValue) => void;
  selected?: MoodValue | null;
}

const MOOD_OPTIONS: { value: MoodValue; emoji: string; label: string }[] = [
  { value: 1, emoji: '😫', label: 'Terrible' },
  { value: 2, emoji: '😢', label: 'Very Bad' },
  { value: 3, emoji: '😞', label: 'Bad' },
  { value: 4, emoji: '😕', label: 'Not Great' },
  { value: 5, emoji: '😐', label: 'Okay' },
  { value: 6, emoji: '😌', label: 'Alright' },
  { value: 7, emoji: '🙂', label: 'Good' },
  { value: 8, emoji: '😊', label: 'Very Good' },
  { value: 9, emoji: '😄', label: 'Great' },
  { value: 10, emoji: '🤩', label: 'Excellent' },
];

export function MoodStep({ onSelect, selected }: MoodStepProps) {
  const handleSelect = (value: MoodValue) => {
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
          How are you feeling?
        </motion.h2>
        <motion.p
          className="text-text-secondary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Select the emoji that best matches your mood right now
        </motion.p>
      </div>

      <div className="grid grid-cols-5 gap-3 xs:gap-4">
        {MOOD_OPTIONS.map((option, index) => {
          const isSelected = selected === option.value;
          const moodConfig = getMoodEmoji(option.value);

          return (
            <motion.button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="relative flex flex-col items-center gap-2 p-3 xs:p-4 rounded-xl bg-bg-surface/50 border border-border-subtle hover:border-border-default transition-colors"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{
                opacity: 1,
                scale: isSelected ? 1.1 : 1,
                y: isSelected ? -12 : 0,
              }}
              transition={{
                delay: index * 0.05,
                duration: 0.3,
                type: 'spring',
                stiffness: 300,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isSelected ? (
                  <motion.span
                    key="selected-emoji"
                    className="text-3xl xs:text-4xl"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {option.emoji}
                  </motion.span>
                ) : (
                  <motion.span
                    key="normal-emoji"
                    className="text-3xl xs:text-4xl"
                    initial={{ scale: 1 }}
                    animate={{ scale: 1 }}
                  >
                    {option.emoji}
                  </motion.span>
                )}
              </AnimatePresence>

              <motion.span
                className="text-xs text-text-secondary hidden xs:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: isSelected ? 1 : 0.7 }}
              >
                {option.label}
              </motion.span>

              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `linear-gradient(135deg, ${moodConfig.color}20, ${moodConfig.color}10)`,
                    border: `2px solid ${moodConfig.color}`,
                    boxShadow: `0 0 30px ${moodConfig.color}40`,
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.p
        className="text-center text-xs text-text-muted mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Tap to select • Auto-advances in 600ms
      </motion.p>
    </motion.div>
  );
}

export default MoodStep;
