'use client';

import { motion, AnimatePresence } from 'framer-motion';

type BreathingPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

interface PhaseGuideProps {
  phase: BreathingPhase;
  instruction: string;
  timeRemaining: number;
}

const phaseConfig = {
  idle: {
    label: 'Ready',
    color: '#6366f1',
    gradient: 'from-accent-indigo to-accent-violet',
  },
  inhale: {
    label: 'Inhale',
    color: '#6366f1',
    gradient: 'from-accent-indigo to-accent-violet',
  },
  hold: {
    label: 'Hold',
    color: '#8b5cf6',
    gradient: 'from-accent-violet to-accent-purple',
  },
  exhale: {
    label: 'Exhale',
    color: '#a855f7',
    gradient: 'from-accent-purple to-accent-indigo',
  },
};

export function PhaseGuide({ phase, instruction, timeRemaining }: PhaseGuideProps) {
  const config = phaseConfig[phase];

  return (
    <div className="text-center mb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          className="mb-4"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <motion.h2
            className={`text-4xl xs:text-5xl font-bold font-sora bg-gradient-accent bg-clip-text text-transparent`}
            style={{
              backgroundImage: `linear-gradient(135deg, ${config.color}, ${config.color}cc)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            animate={{
              textShadow: [
                '0 0 20px rgba(99, 102, 241, 0.3)',
                '0 0 40px rgba(99, 102, 241, 0.5)',
                '0 0 20px rgba(99, 102, 241, 0.3)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {config.label.toUpperCase()}
          </motion.h2>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.p
          key={`instruction-${phase}`}
          className="text-text-secondary text-lg mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {instruction}
        </motion.p>
      </AnimatePresence>

      <motion.div
        className="flex items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex gap-1">
          {Array.from({ length: Math.ceil(timeRemaining / 2) }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-accent-indigo"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default PhaseGuide;
