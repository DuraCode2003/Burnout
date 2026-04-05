import { motion } from 'framer-motion';
import Image from 'next/image';
import lumaLogo from '@/assets/luma-logo.png';

interface DailyTipCardProps {
  tip: string;
  category: string;
}

const categoryConfig = {
  breathing: {
    label: 'Breathing',
    color: '#6366f1',
    glow: 'shadow-glow-indigo',
  },
  sleep: {
    label: 'Sleep',
    color: '#8b5cf6',
    glow: 'shadow-glow-violet',
  },
  exercise: {
    label: 'Exercise',
    color: '#10b981',
    glow: 'shadow-glow-emerald',
  },
  mindfulness: {
    label: 'Mindfulness',
    color: '#a855f7',
    glow: 'shadow-glow-violet',
  },
  break: {
    label: 'Break',
    color: '#f59e0b',
    glow: 'shadow-glow-amber',
  },
  social: {
    label: 'Social',
    color: '#3b82f6',
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
      className="card-glow p-card relative overflow-hidden group h-full bg-bg-card/40 backdrop-blur-xl border border-white/5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      whileHover={{ y: -4 }}
    >
      {/* Dynamic Aurora-style Background Glow */}
      <motion.div
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-20 pointer-events-none blur-3xl"
        style={{
          background: `radial-gradient(circle, ${config.color} 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              className="relative w-14 h-14 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-110 border border-white/10"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.5,
              }}
            >
              <div 
                className="absolute inset-0 opacity-40 bg-gradient-to-tr"
                style={{ backgroundImage: `linear-gradient(to top right, ${config.color}, transparent)` }}
              />
              <Image 
                src={lumaLogo} 
                alt="Luma AI Logo" 
                fill 
                sizes="56px"
                className="object-cover relative z-10 p-2" 
              />
            </motion.div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-400">
                  Insight from Luma
                </h3>
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black text-indigo-400 uppercase tracking-tighter">
                  AI Powered
                </span>
              </div>
              <p
                className="text-lg font-bold font-sora text-white leading-tight"
              >
                {config.label}
              </p>
            </div>
          </div>
        </div>

        <motion.div 
          className="flex-1 px-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <p className="text-text-primary text-base font-medium leading-relaxed italic opacity-95">
            "{tip}"
          </p>
        </motion.div>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: config.color }}
              animate={{ 
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <span className="text-[10px] uppercase tracking-wider font-bold text-text-secondary/50">
              Wellness Strategy • {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
          </div>
          <motion.button 
            className="text-[10px] uppercase tracking-widest font-black text-text-secondary/40 hover:text-white transition-colors"
            whileHover={{ x: 3 }}
          >
            Share →
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default DailyTipCard;
