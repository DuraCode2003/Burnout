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
      <motion.div className="card-glow p-card h-[320px] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4 w-full">
          <div className="w-48 h-48 rounded-full border-4 border-bg-elevated border-t-accent-indigo animate-spin" />
          <div className="w-1/2 h-4 bg-bg-elevated rounded" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="card-glow p-card h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold font-sora text-text-primary">
            Student Risk Breakdown
          </h2>
          <p className="text-xs text-text-secondary mt-1">Active alerts by risk severity</p>
        </div>
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
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                dataKey="count"
                nameKey="level"
                stroke="none"
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    style={{ filter: `drop-shadow(0px 4px 8px ${entry.color}40)` }} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}

export default StudentRiskChart;
