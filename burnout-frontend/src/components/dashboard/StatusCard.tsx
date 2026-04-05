'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatDate } from '@/utils/helpers';

interface StatusCardProps {
  lastCheckin: string | null;
  streak: number;
  hasCheckedInToday?: boolean;
}

export function StatusCard({
  lastCheckin,
  streak,
  hasCheckedInToday = false,
}: StatusCardProps) {
  const isTodayCheckedIn = hasCheckedInToday;

  return (
    <motion.div
      className="card-glow p-card flex flex-col h-full bg-bg-card/40 backdrop-blur-xl border border-white/5 shadow-2xl relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      {/* Subtle top-right glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <h2 className="text-sm uppercase tracking-widest font-bold font-sora text-text-secondary mb-8 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse" />
        Activity Summary
      </h2>

      <div className="space-y-4">
        <motion.div
          className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors group"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500"
              whileHover={{ rotate: 12 }}
            >
              <span className="text-xl">🔥</span>
            </motion.div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-text-secondary/60">Current Streak</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold font-sora text-white">{streak}</span>
                <span className="text-xs font-medium text-text-secondary">days</span>
              </div>
            </div>
          </div>

          {streak >= 7 && (
            <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-lg shadow-amber-500/20">
              Week Warrior
            </div>
          )}
        </motion.div>

        <motion.div
          className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] transition-colors group"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all duration-500"
            >
              <span className="text-xl">📝</span>
            </motion.div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-text-secondary/60">Last Check-in</p>
              <p className="text-sm font-bold text-white">
                {isTodayCheckedIn
                  ? 'Today'
                  : lastCheckin
                    ? formatDate(lastCheckin, 'relative')
                    : 'Never'}
              </p>
            </div>
          </div>

          {isTodayCheckedIn && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <span className="w-1 h-1 rounded-full bg-teal-400" />
              Verified
            </div>
          )}
        </motion.div>

        {!isTodayCheckedIn && (
          <motion.div
            className="pt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/checkin" className="block">
              <motion.button
                className="w-full py-4 px-6 rounded-2xl font-bold font-sora text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 overflow-hidden relative group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <motion.span
                  className="relative z-10"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3 }}
                >
                  ✨
                </motion.span>
                <span className="relative z-10 uppercase tracking-widest">Check in now</span>
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default StatusCard;
