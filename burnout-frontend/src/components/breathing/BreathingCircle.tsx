'use client';

import { motion } from 'framer-motion';

type BreathingPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

interface BreathingCircleProps {
  phase: BreathingPhase;
  duration: number;
  progress: number;
  exerciseColor?: string;
}

export function BreathingCircle({
  phase,
  duration,
  progress,
  exerciseColor = '#6366f1',
}: BreathingCircleProps) {
  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getPhaseScale = () => {
    switch (phase) {
      case 'inhale':
        return 1.4;
      case 'hold':
        return 1.2;
      case 'exhale':
        return 1;
      default:
        return 1;
    }
  };

  const getPhaseOpacity = () => {
    switch (phase) {
      case 'inhale':
        return 1;
      case 'hold':
        return 0.9;
      case 'exhale':
        return 0.6;
      default:
        return 0.4;
    }
  };

  const getGradient = () => {
    switch (phase) {
      case 'inhale':
        return `radial-gradient(circle, ${exerciseColor} 0%, #8b5cf6 50%, transparent 70%)`;
      case 'hold':
        return `radial-gradient(circle, ${exerciseColor} 0%, ${exerciseColor} 60%, transparent 80%)`;
      case 'exhale':
        return `radial-gradient(circle, ${exerciseColor}40 0%, ${exerciseColor}20 50%, transparent 70%)`;
      default:
        return `radial-gradient(circle, ${exerciseColor}30 0%, transparent 70%)`;
    }
  };

  return (
    <div className="relative flex items-center justify-center w-[320px] h-[320px]">
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: getGradient(),
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {[1, 2, 3, 4].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border-2"
          style={{
            borderColor: `${exerciseColor}${Math.round((1 - ring / 5) * 255).toString(16).padStart(2, '0')}`,
          }}
          animate={{
            scale: getPhaseScale() + (ring * 0.1),
            opacity: getPhaseOpacity() * (1 - ring * 0.15),
          }}
          transition={{
            duration: duration,
            ease: 'easeInOut',
            delay: ring * 0.1,
          }}
          initial={{ scale: 1, opacity: 0.3 }}
        />
      ))}

      <motion.div
        className="relative z-10 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${exerciseColor}, ${exerciseColor}cc)`,
          boxShadow: `0 0 60px ${exerciseColor}60, 0 0 120px ${exerciseColor}30`,
        }}
        animate={{
          scale: getPhaseScale(),
          opacity: getPhaseOpacity(),
        }}
        transition={{
          duration: duration,
          ease: 'easeInOut',
        }}
        initial={{ scale: 1, opacity: 0.5 }}
      />

      <svg
        className="absolute z-20 w-[300px] h-[300px] -rotate-90"
        viewBox="0 0 300 300"
      >
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={exerciseColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={exerciseColor} stopOpacity="1" />
          </linearGradient>
        </defs>

        <circle
          cx="150"
          cy="150"
          r="140"
          fill="none"
          stroke="rgba(148, 163, 184, 0.1)"
          strokeWidth="4"
        />

        <motion.circle
          cx="150"
          cy="150"
          r="140"
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>

      <motion.div
        className="absolute z-30 flex flex-col items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-6xl font-bold font-sora text-white"
          animate={{
            scale: phase === 'inhale' ? 1.1 : 1,
          }}
          transition={{
            duration: duration / 2,
            ease: 'easeInOut',
          }}
        >
          {Math.ceil(duration * (1 - progress / 100))}
        </motion.div>
        <span className="text-sm text-white/60 mt-1">seconds</span>
      </motion.div>
    </div>
  );
}

export default BreathingCircle;
