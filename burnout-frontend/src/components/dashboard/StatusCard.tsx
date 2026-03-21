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
      className="card-glow p-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h2 className="text-lg font-semibold font-sora text-text-primary mb-4">
        Today's Status
      </h2>

      <div className="space-y-4">
        <motion.div
          className="flex items-center justify-between p-4 rounded-xl bg-bg-surface/50"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-bg-elevated"
              whileHover={{ scale: 1.1, rotate: 12 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <span className="text-2xl">🔥</span>
            </motion.div>
            <div>
              <p className="text-sm text-text-secondary">Current Streak</p>
              <motion.p
                className="text-2xl font-bold font-sora text-text-primary"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: 0.4,
                }}
              >
                {streak} <span className="text-sm font-normal text-text-secondary">days</span>
              </motion.p>
            </div>
          </div>

          {streak >= 7 && (
            <motion.div
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                color: '#0a0e1a',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              🏆 Week Warrior
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="flex items-center justify-between p-4 rounded-xl bg-bg-surface/50"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-bg-elevated"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <span className="text-2xl">📝</span>
            </motion.div>
            <div>
              <p className="text-sm text-text-secondary">Last Check-in</p>
              <p className="text-sm font-medium text-text-primary">
                {isTodayCheckedIn
                  ? 'Today'
                  : lastCheckin
                    ? formatDate(lastCheckin, 'relative')
                    : 'Never'}
              </p>
            </div>
          </div>

          {isTodayCheckedIn && (
            <motion.div
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
            >
              ✓ Done
            </motion.div>
          )}
        </motion.div>

        {!isTodayCheckedIn && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/checkin" className="block">
              <motion.button
                className="w-full py-3 px-4 rounded-xl font-medium font-sora text-white bg-gradient-accent flex items-center justify-center gap-2"
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)',
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  ✨
                </motion.span>
                Check in now
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default StatusCard;
