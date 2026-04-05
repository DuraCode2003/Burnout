'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface RiskData {
  level: string;
  count: number;
  color: string;
}

interface StudentRiskChartProps {
  data: RiskData[];
  isLoading?: boolean;
}

const EmptyState = () => (
  <motion.div
    className="flex flex-col items-center justify-center h-[240px] text-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="text-4xl mb-3 opacity-50">👥</div>
    <h3 className="text-sm font-medium text-text-primary mb-1">No Risk Data</h3>
    <p className="text-xs text-text-secondary max-w-[200px]">
      All students are currently stable or no assessments exist yet.
    </p>
  </motion.div>
);

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card p-3 min-w-[120px] shadow-lg border border-border-default backdrop-blur-md rounded-lg">
        <p className="text-xs font-semibold text-text-primary mb-1">{data.level} Risk</p>
        <p className="text-sm" style={{ color: data.color }}>
          {data.count} Students
        </p>
      </div>
    );
  }
  return null;
};

export function StudentRiskChart({ data, isLoading = false }: StudentRiskChartProps) {
  const hasData = data && data.length > 0 && data.some((d) => d.count > 0);

  if (isLoading) {
    return (
      <div className="h-full min-h-[320px] rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/5 p-6 flex flex-col items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4 w-full">
          <div className="w-32 h-32 rounded-full border-4 border-white/5 border-t-indigo-500 animate-spin" />
          <div className="w-1/3 h-2 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="h-full rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/5 p-6 flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="mb-6">
        <h2 className="text-[10px] font-black font-sora text-white/30 uppercase tracking-[0.25em] mb-1">
          Risk Pulse
        </h2>
        <h3 className="text-lg font-bold text-white tracking-tight">Student Breakdown</h3>
      </div>

      <div className="flex-grow flex items-center justify-center relative min-h-[220px]">
        {!hasData ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={8}
                dataKey="count"
                nameKey="level"
                stroke="none"
                animationDuration={1500}
                startAngle={90}
                endAngle={450}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    fillOpacity={0.8}
                    style={{ filter: `drop-shadow(0px 0px 10px ${entry.color}40)` }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={false} />
            </PieChart>
          </ResponsiveContainer>
        )}
        
        {/* Center Text */}
        {hasData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black font-sora text-white leading-none">
              {data.reduce((acc, curr) => acc + curr.count, 0)}
            </span>
            <span className="text-[8px] font-black text-rose-500/60 uppercase tracking-widest mt-1">
              Active
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        {data.map((item) => (
          <div key={item.level} className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">{item.level}</span>
            </div>
            <span className="text-xs font-black text-white">{item.count}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default StudentRiskChart;
