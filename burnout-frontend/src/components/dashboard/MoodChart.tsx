'use client';

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getMoodEmojiChar } from '@/utils/helpers';
import type { MoodValue } from '@/types';

interface MoodDataPoint {
  date: string;
  mood: number;
  stress: number;
  dayLabel: string;
}

interface MoodChartProps {
  data: MoodDataPoint[];
  isLoading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const moodData = payload.find(p => p.dataKey === 'mood');
  const stressData = payload.find(p => p.dataKey === 'stress');

  return (
    <motion.div
      className="glass-card p-4 min-w-[160px]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-xs text-text-secondary mb-2">{label}</p>
      {moodData && (
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{getMoodEmojiChar(moodData.value as MoodValue)}</span>
          <span className="text-sm text-text-primary">
            Mood: <span className="font-semibold">{moodData.value}/10</span>
          </span>
        </div>
      )}
      {stressData && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">
            Stress: <span className="font-semibold" style={{ color: stressData.color }}>
              {stressData.value}/10
            </span>
          </span>
        </div>
      )}
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-[240px] text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-6xl mb-4"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        📊
      </motion.div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">
        No data yet
      </h3>
      <p className="text-sm text-text-secondary max-w-[260px]">
        Start checking in daily to see your mood and stress trends over time
      </p>
    </motion.div>
  );
}

export function MoodChart({ data, isLoading = false }: MoodChartProps) {
  const hasData = data && data.length > 0;

  if (isLoading) {
    return (
      <motion.div
        className="card-glow p-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="h-[240px] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-full h-4 bg-bg-elevated rounded" />
            <div className="w-3/4 h-4 bg-bg-elevated rounded" />
            <div className="w-1/2 h-4 bg-bg-elevated rounded" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (!hasData) {
    return (
      <motion.div
        className="card-glow p-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold font-sora text-text-primary mb-4">
          Mood Trends
        </h2>
        <EmptyState />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card-glow p-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold font-sora text-text-primary">
          Mood Trends
        </h2>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-indigo" />
            <span className="text-text-secondary">Mood</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-text-secondary">Stress</span>
          </div>
        </div>
      </div>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="rgba(148, 163, 184, 0.1)"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="dayLabel"
              stroke="#475569"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />

            <YAxis
              stroke="#475569"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 10]}
              tickCount={6}
              dx={-5}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="mood"
              stroke="#6366f1"
              strokeWidth={3}
              fill="url(#moodGradient)"
              animationDuration={1500}
              animationEasing="ease-in-out"
              dot={{
                fill: '#6366f1',
                strokeWidth: 2,
                stroke: '#0a0e1a',
                r: 5,
              }}
              activeDot={{
                r: 7,
                strokeWidth: 2,
                stroke: '#0a0e1a',
                fill: '#8b5cf6',
              }}
            />

            <Area
              type="monotone"
              dataKey="stress"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="4 4"
              fill="url(#stressGradient)"
              animationDuration={1500}
              animationEasing="ease-in-out"
              dot={{
                fill: '#f59e0b',
                strokeWidth: 2,
                stroke: '#0a0e1a',
                r: 4,
              }}
              activeDot={{
                r: 6,
                strokeWidth: 2,
                stroke: '#0a0e1a',
                fill: '#fbbf24',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default MoodChart;
