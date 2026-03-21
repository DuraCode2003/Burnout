'use client';

import { motion } from 'framer-motion';
import { formatDate, getMoodEmojiChar } from '@/utils/helpers';
import type { MoodValue } from '@/types';

interface DayData {
  date: string;
  mood: MoodValue;
  sleepHours: number;
  stressLevel: number;
  notes?: string;
}

interface BestWorstDaysProps {
  best: DayData | null;
  worst: DayData | null;
  isLoading?: boolean;
}

function DayCard({
  type,
  data,
  delay,
}: {
  type: 'best' | 'worst';
  data: DayData;
  delay: number;
}) {
  const isBest = type === 'best';
  const color = isBest ? '#10b981' : '#ef4444';
  const bgColor = isBest ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
  const borderColor = isBest ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
  const gradient = isBest
    ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
    : 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';

  return (
    <motion.div
      className={`flex-1 p-5 rounded-2xl border ${isBest ? 'card-glow-success' : 'card-glow-danger'}`}
      style={{
        background: bgColor,
        borderColor,
      }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: gradient }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: delay + 0.1 }}
        >
          <span className="text-lg">{isBest ? '🌟' : '😔'}</span>
        </motion.div>
        <span
          className="text-sm font-semibold"
          style={{ color }}
        >
          {isBest ? 'Best Day' : 'Worst Day'}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <motion.span
          className="text-4xl"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: delay + 0.2 }}
        >
          {getMoodEmojiChar(data.mood)}
        </motion.span>
        <div>
          <div
            className="text-2xl font-bold font-sora"
            style={{ color }}
          >
            {data.mood}/10
          </div>
          <div className="text-xs text-text-secondary">
            {formatDate(data.date, 'short')}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary">Sleep</span>
          <span className="text-text-primary font-medium">
            {data.sleepHours.toFixed(1)}h
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary">Stress</span>
          <span
            className="font-medium"
            style={{ color: data.stressLevel <= 4 ? '#10b981' : data.stressLevel <= 7 ? '#f59e0b' : '#ef4444' }}
          >
            {data.stressLevel}/10
          </span>
        </div>
      </div>

      {data.notes && (
        <motion.div
          className="mt-3 pt-3 border-t"
          style={{ borderColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
        >
          <p className="text-xs text-text-secondary line-clamp-2">
            &ldquo;{data.notes}&rdquo;
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      className="flex-1 p-5 rounded-2xl border border-border-subtle bg-bg-surface/50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-center">
        <span className="text-4xl mb-2 block">📅</span>
        <p className="text-sm text-text-secondary">Not enough data</p>
      </div>
    </motion.div>
  );
}

export function BestWorstDays({ best, worst, isLoading = false }: BestWorstDaysProps) {
  if (isLoading) {
    return (
      <motion.div
        className="card-glow p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="h-[180px] flex items-center justify-center">
          <div className="animate-pulse w-full h-32 bg-bg-elevated rounded-2xl" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card-glow p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h2 className="text-lg font-semibold font-sora text-text-primary mb-4">
        Best & Worst Days
      </h2>

      <div className="flex gap-4">
        {best ? (
          <DayCard type="best" data={best} delay={0.5} />
        ) : (
          <EmptyState />
        )}

        {worst ? (
          <DayCard type="worst" data={worst} delay={0.6} />
        ) : (
          <EmptyState />
        )}
      </div>

      {best && worst && best.sleepHours > worst.sleepHours && (
        <motion.div
          className="mt-4 p-3 rounded-xl bg-bg-surface/50 border border-border-subtle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-xs text-text-secondary text-center">
            💡 <span className="font-medium text-text-primary">Insight:</span> Your best days had{' '}
            <span className="text-success font-medium">
              {(best.sleepHours - worst.sleepHours).toFixed(1)}h more sleep
            </span>{' '}
            on average
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default BestWorstDays;
