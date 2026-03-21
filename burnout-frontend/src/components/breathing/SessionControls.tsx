'use client';

import { motion } from 'framer-motion';

interface SessionControlsProps {
  isRunning: boolean;
  cyclesCompleted: number;
  totalCycles: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  canStart?: boolean;
}

export function SessionControls({
  isRunning,
  cyclesCompleted,
  totalCycles,
  onStart,
  onPause,
  onReset,
  canStart = true,
}: SessionControlsProps) {
  const progress = (cyclesCompleted / totalCycles) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-center gap-2 mb-6">
        {Array.from({ length: totalCycles }).map((_, index) => {
          const isCompleted = index < cyclesCompleted;
          const isCurrent = index === cyclesCompleted;

          return (
            <motion.div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                isCompleted
                  ? 'bg-accent-indigo'
                  : isCurrent
                    ? 'bg-accent-indigo animate-pulse'
                    : 'bg-bg-elevated'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
            />
          );
        })}
      </div>

      <div className="text-center mb-6">
        <span className="text-text-secondary text-sm">
          Cycle {Math.min(cyclesCompleted + 1, totalCycles)} of {totalCycles}
        </span>
        <div className="w-full h-1 bg-bg-elevated rounded-full mt-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <motion.button
          onClick={onReset}
          className="p-4 rounded-xl bg-bg-surface/50 border border-border-subtle hover:border-border-default transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <svg
            className="w-6 h-6 text-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </motion.button>

        <motion.button
          onClick={isRunning ? onPause : onStart}
          disabled={!canStart && !isRunning}
          className="relative px-12 py-5 rounded-2xl font-semibold font-sora text-white bg-gradient-accent hover:shadow-glow-indigo-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: canStart || isRunning ? 1 : 0.5, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-accent-hover"
            initial={{ opacity: 0 }}
            animate={{ opacity: isRunning ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          />

          <span className="relative z-10 flex items-center gap-3">
            {isRunning ? (
              <>
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                {cyclesCompleted > 0 ? 'Resume' : 'Start'}
              </>
            )}
          </span>
        </motion.button>

        <motion.div
          className="w-[60px]"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        />
      </div>
    </div>
  );
}

export default SessionControls;
