'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';

interface SleepDataPoint {
  date: string;
  dayLabel: string;
  hours: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
}

interface SleepChartProps {
  data: SleepDataPoint[];
  isLoading?: boolean;
}

function getSleepColor(hours: number): string {
  if (hours < 5) return '#ef4444';
  if (hours < 6) return '#f97316';
  if (hours < 7) return '#f59e0b';
  if (hours < 8) return '#84cc16';
  return '#10b981';
}

function getSleepQualityLabel(hours: number): string {
  if (hours < 5) return 'Very Poor';
  if (hours < 6) return 'Poor';
  if (hours < 7) return 'Below Average';
  if (hours < 8) return 'Fair';
  if (hours < 9) return 'Good';
  return 'Excellent';
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: SleepDataPoint;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const color = getSleepColor(data.hours);

  return (
    <motion.div
      className="glass-card p-4 min-w-[140px]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <p className="text-xs text-text-secondary mb-2">{label}</p>
      <p className="text-lg font-semibold" style={{ color }}>
        {data.hours.toFixed(1)} hrs
      </p>
      <p className="text-xs text-text-secondary">
        {getSleepQualityLabel(data.hours)}
      </p>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-[250px] text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <span className="text-5xl mb-3">😴</span>
      <p className="text-sm text-text-secondary">No sleep data yet</p>
    </motion.div>
  );
}

export function SleepChart({ data, isLoading = false }: SleepChartProps) {
  if (isLoading) {
    return (
      <motion.div
        className="card-glow p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="h-[250px] flex items-center justify-center">
          <div className="animate-pulse w-full h-32 bg-bg-elevated rounded" />
        </div>
      </motion.div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <motion.div
        className="card-glow p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold font-sora text-text-primary mb-4">
          Sleep Duration
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
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold font-sora text-text-primary">
          Sleep Duration
        </h2>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span>7+ hrs recommended</span>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
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
              domain={[0, 12]}
              tickCount={7}
              dx={-5}
              label={{
                value: 'Hours',
                angle: -90,
                position: 'insideLeft',
                fill: '#475569',
                fontSize: 10,
              }}
            />

            <ReferenceLine
              y={7}
              stroke="#10b981"
              strokeDasharray="4 4"
              opacity={0.6}
              label={{
                value: 'Recommended',
                position: 'right',
                fill: '#10b981',
                fontSize: 10,
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar
              dataKey="hours"
              animationDuration={1500}
              animationEasing="ease-in-out"
              radius={[6, 6, 0, 0]}
            >
              {data.map((entry, index) => (
                <cell
                  key={`cell-${index}`}
                  fill={getSleepColor(entry.hours)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-between text-xs text-text-muted">
        <span>Min: {Math.min(...data.map((d) => d.hours)).toFixed(1)}h</span>
        <span>
          Avg: {(data.reduce((acc, d) => acc + d.hours, 0) / data.length).toFixed(1)}h
        </span>
        <span>Max: {Math.max(...data.map((d) => d.hours)).toFixed(1)}h</span>
      </div>
    </motion.div>
  );
}

export default SleepChart;
