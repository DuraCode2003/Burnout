'use client';

import { motion } from 'framer-motion';
import type { BreathingExercise } from '@/types';
import { BREATHING_EXERCISES } from '@/utils/constants';

interface ExerciseSelectorProps {
  exercises?: typeof BREATHING_EXERCISES;
  onSelect: (exercise: (typeof BREATHING_EXERCISES)[number]) => void;
  selected?: (typeof BREATHING_EXERCISES)[number] | null;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getDifficultyLabel(cycles: number): string {
  if (cycles <= 3) return 'Beginner';
  if (cycles <= 5) return 'Intermediate';
  return 'Advanced';
}

export function ExerciseSelector({
  exercises = BREATHING_EXERCISES,
  onSelect,
  selected,
}: ExerciseSelectorProps) {
  return (
    <div className="w-full">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold font-sora text-text-primary mb-2">
          Choose Your Practice
        </h2>
        <p className="text-text-secondary">
          Select a breathing exercise that fits your needs
        </p>
      </motion.div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {exercises.map((exercise, index) => {
          const isSelected = selected?.id === exercise.id;

          return (
            <motion.button
              key={exercise.id}
              onClick={() => onSelect(exercise)}
              className={`flex-shrink-0 w-[280px] p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden ${
                isSelected
                  ? 'border-accent-indigo bg-gradient-accent'
                  : 'border-border-subtle bg-bg-card hover:border-border-default'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSelected && (
                <motion.div
                  className="absolute inset-0 bg-gradient-accent opacity-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                />
              )}

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    className="flex items-center justify-center w-14 h-14 rounded-2xl bg-bg-elevated"
                    animate={
                      isSelected
                        ? {
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                          }
                        : {}
                    }
                    transition={
                      isSelected
                        ? { duration: 2, repeat: Infinity }
                        : { duration: 0.3 }
                    }
                  >
                    <span className="text-3xl">{exercise.icon}</span>
                  </motion.div>

                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-bg-elevated text-text-secondary'
                    }`}
                  >
                    {formatDuration(exercise.duration)}
                  </div>
                </div>

                <h3
                  className={`text-lg font-bold font-sora mb-1 ${
                    isSelected ? 'text-white' : 'text-text-primary'
                  }`}
                >
                  {exercise.name}
                </h3>

                <p
                  className={`text-sm mb-4 ${
                    isSelected ? 'text-white/80' : 'text-text-secondary'
                  }`}
                >
                  {exercise.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs ${
                        isSelected ? 'text-white/60' : 'text-text-muted'
                      }`}
                    >
                      {getDifficultyLabel(exercise.cycles)}
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((dot) => (
                        <div
                          key={dot}
                          className={`w-1.5 h-1.5 rounded-full ${
                            dot <= Math.ceil(exercise.cycles / 2)
                              ? isSelected
                                ? 'bg-white'
                                : 'bg-accent-indigo'
                              : isSelected
                                ? 'bg-white/30'
                                : 'bg-bg-elevated'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <span
                    className={`text-xs ${
                      isSelected ? 'text-white/60' : 'text-text-muted'
                    }`}
                  >
                    {exercise.cycles} cycles
                  </span>
                </div>
              </div>

              {isSelected && (
                <motion.div
                  className="absolute -bottom-1 -right-1 w-20 h-20 bg-white/10 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default ExerciseSelector;
