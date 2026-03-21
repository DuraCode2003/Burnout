'use client';

import { useMemo } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import { getMoodEmojiChar } from '@/utils/helpers';
import type { MoodValue, RiskLevel } from '@/types';

interface MoodTrendDataPoint {
  date: string;
  dayLabel: string;
  mood: number;
  burnoutScore?: number;
  riskLevel?: RiskLevel;
}

interface MoodTrendChartProps {
  data: MoodTrendDataPoint[];
  period: number;
  isLoading?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
    payload: MoodTrendDataPoint;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const moodData = payload.find((p) => p.dataKey === 'mood');
  const burnoutData = payload.find((p) => p.dataKey === 'burnoutScore');

  return (
    <motion.div
      className="glass-card p-4 min-w-[180px]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-xs text-text-secondary mb-3">{label}</p>

      {moodData && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">
            {getMoodEmojiChar(moodData.value as MoodValue)}
          </span>
          <div>
            <span className="text-sm text-text-secondary">Mood: </span>
            <span className="text-sm font-semibold text-accent-indigo">
              {moodData.value}/10
            </span>
          </div>
        </div>
      )}

      {burnoutData && (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: burnoutData.color }}
          />
          <div>
            <span className="text-sm text-text-secondary">Burnout: </span>
            <span className="text-sm font-semibold" style={{ color: burnoutData.color }}>
              {burnoutData.value}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-[300px] text-center"
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
        Not enough data
      </h3>
      <p className="text-sm text-text-secondary max-w-[260px]">
        Complete at least 7 days of check-ins to see your mood and burnout trends
      </p>
    </motion.div>
  );
}

export function MoodTrendChart({ data, period, isLoading = false }: MoodTrendChartProps) {
  const hasEnoughData = data && data.length >= 3;

  const riskThresholds = useMemo(() => {
    return [
      { value: 33, color: '#10b981', label: 'Low Risk' },
      { value: 66, color: '#f59e0b', label: 'Moderate Risk' },
    ];
  }, []);

  if (isLoading) {
    return (
      <motion.div
        className="card-glow p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-full h-4 bg-bg-elevated rounded" />
            <div className="w-3/4 h-4 bg-bg-elevated rounded" />
            <div className="w-1/2 h-4 bg-bg-elevated rounded" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (!hasEnoughData) {
    return (
      <motion.div
        className="card-glow p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold font-sora text-text-primary mb-4">
          Mood & Burnout Trends
        </h2>
        <EmptyState />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card-glow p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold font-sora text-text-primary">
          Mood & Burnout Trends
        </h2>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-indigo" />
            <span className="text-text-secondary">Mood</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-violet" />
            <span className="text-text-secondary">Burnout Score</span>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="moodAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
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
              yAxisId="left"
              stroke="#475569"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 10]}
              tickCount={6}
              dx={-5}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#475569"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickCount={5}
              dx={5}
            />

            <Tooltip content={<CustomTooltip />} />

            {riskThresholds.map((threshold, index) => (
              <ReferenceLine
                key={index}
                yAxisId="right"
                y={threshold.value}
                stroke={threshold.color}
                strokeDasharray="4 4"
                opacity={0.5}
                label={{
                  value: threshold.label,
                  position: 'right',
                  fill: threshold.color,
                  fontSize: 10,
                }}
              />
            ))}

            <Area
              yAxisId="left"
              type="monotone"
              dataKey="mood"
              stroke="#6366f1"
              strokeWidth={3}
              fill="url(#moodAreaGradient)"
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

            <Line
              yAxisId="right"
              type="monotone"
              dataKey="burnoutScore"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{
                fill: '#8b5cf6',
                strokeWidth: 2,
                stroke: '#0a0e1a',
                r: 4,
              }}
              activeDot={{
                r: 6,
                strokeWidth: 2,
                stroke: '#0a0e1a',
                fill: '#a855f7',
              }}
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default MoodTrendChart;
