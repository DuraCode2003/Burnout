'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface StressDonutProps {
  low: number;
  medium: number;
  high: number;
  isLoading?: boolean;
}

const COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0];
  const total = payload.reduce((acc, p) => acc + p.value, 0);
  const percentage = ((data.value / total) * 100).toFixed(0);

  return (
    <motion.div
      className="glass-card p-3 min-w-[120px]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <span className="text-sm text-text-secondary">{data.name}: </span>
        <span className="text-sm font-semibold">{data.value} days ({percentage}%)</span>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-[200px] text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <span className="text-5xl mb-3">😌</span>
      <p className="text-sm text-text-secondary">No stress data yet</p>
    </motion.div>
  );
}

export function StressDonut({ low, medium, high, isLoading = false }: StressDonutProps) {
  const total = low + medium + high;
  const hasData = total > 0;

  const data = useMemo(
    () => [
      { name: 'Low', value: low, color: COLORS.low },
      { name: 'Medium', value: medium, color: COLORS.medium },
      { name: 'High', value: high, color: COLORS.high },
    ],
    [low, medium, high]
  );

  if (isLoading) {
    return (
      <motion.div
        className="card-glow p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="h-[200px] flex items-center justify-center">
          <div className="animate-pulse w-32 h-32 rounded-full bg-bg-elevated" />
        </div>
      </motion.div>
    );
  }

  if (!hasData) {
    return (
      <motion.div
        className="card-glow p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold font-sora text-text-primary mb-4">
          Stress Distribution
        </h2>
        <EmptyState />
      </motion.div>
    );
  }

  const averageStress = ((low * 3 + medium * 5 + high * 8) / total).toFixed(1);

  return (
    <motion.div
      className="card-glow p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h2 className="text-lg font-semibold font-sora text-text-primary mb-4">
        Stress Distribution
      </h2>

      <div className="flex items-center gap-6">
        <div className="w-[160px] h-[160px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-out"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#0a0e1a"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1">
          <div className="space-y-3">
            {data.map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(0);

              return (
                <motion.div
                  key={item.name}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-text-secondary flex-1">
                    {item.name}
                  </span>
                  <span className="text-sm font-semibold text-text-primary">
                    {item.value} days
                  </span>
                  <span className="text-xs text-text-muted w-10 text-right">
                    {percentage}%
                  </span>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            className="mt-4 pt-4 border-t border-border-subtle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-xs text-text-secondary">
              Avg. stress level: <span className="font-semibold text-text-primary">{averageStress}</span>/10
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default StressDonut;
