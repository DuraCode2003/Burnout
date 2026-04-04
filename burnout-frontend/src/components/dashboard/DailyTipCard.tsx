'use client';

import { motion } from 'framer-motion';

interface DailyTipCardProps {
  tip: string;
  category: string;
}

const categoryConfig = {
  breathing: {
    icon: '🧘',
    label: 'Breathing',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    glow: 'shadow-glow-indigo',
  },
  sleep: {
    icon: '🌙',
    label: 'Sleep',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    glow: 'shadow-glow-violet',
  },
  exercise: {
    icon: '💪',
    label: 'Exercise',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    glow: 'shadow-glow-emerald',
  },
  mindfulness: {
    icon: '🧠',
    label: 'Mindfulness',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    glow: 'shadow-glow-violet',
  },
  break: {
    icon: '☕',
    label: 'Break',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    glow: 'shadow-glow-amber',
  },
  social: {
    icon: '👥',
    label: 'Social',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    glow: 'shadow-glow-indigo',
  },
};

type DailyTipCategory = keyof typeof categoryConfig;

const categoryAliases: Record<string, DailyTipCategory> = {
  breathing: 'breathing',
  breathwork: 'breathing',
  sleep: 'sleep',
  rest: 'sleep',
  exercise: 'exercise',
  physical: 'exercise',
  fitness: 'exercise',
  mindfulness: 'mindfulness',
  meditation: 'mindfulness',
  focus: 'mindfulness',
  'stress management': 'mindfulness',
  break: 'break',
  breaks: 'break',
  general: 'mindfulness',
  social: 'social',
  connection: 'social',
};

function normalizeCategory(category: string): DailyTipCategory {
  const normalized = category.trim().toLowerCase();
  return categoryAliases[normalized] ?? 'mindfulness';
}

export function DailyTipCard({ tip, category }: DailyTipCardProps) {
  const config = categoryConfig[normalizeCategory(category)];

  return (
    <motion.div
      className="card-glow p-card relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10"
        style={{
          background: `radial-gradient(circle, ${config.color} 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            className="flex items-center justify-center w-12 h-12 rounded-xl"
            style={{
              background: config.bgColor,
              border: `1px solid ${config.borderColor}`,
            }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.5,
            }}
          >
            <span className="text-2xl">{config.icon}</span>
          </motion.div>
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider">
              Daily Tip
            </p>
            <p
              className="text-sm font-semibold"
              style={{ color: config.color }}
            >
              {config.label}
            </p>
          </div>
        </div>

        <motion.p
          className="text-text-primary leading-relaxed"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          {tip}
        </motion.p>

        <motion.div
          className="mt-4 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: config.color }}
          />
          <span className="text-xs text-text-secondary">
            Tip of the day
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default DailyTipCard;
