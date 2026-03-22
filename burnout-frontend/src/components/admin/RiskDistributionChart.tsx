"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";

interface RiskDistributionChartProps {
  high: number;
  medium: number;
  low: number;
  highPercent: number;
  mediumPercent: number;
  lowPercent: number;
}

const COLORS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    payload: { percent: number };
  }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percent = data.payload.percent.toFixed(1);

    return (
      <motion.div
        className="bg-bg-card border border-border-default rounded-xl p-4 shadow-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="text-sm font-medium text-text-primary">
            {data.name}
          </span>
        </div>
        <p className="text-2xl font-bold" style={{ color: data.color }}>
          {data.value.toLocaleString()}
        </p>
        <p className="text-xs text-text-secondary mt-1">
          {percent}% of total
        </p>
      </motion.div>
    );
  }
  return null;
};

const CustomLegend = ({
  payload,
}: {
  payload?: Array<{ value: string; color: string }>;
}) => {
  if (!payload) return null;

  const labels = {
    high: "High Risk",
    medium: "Medium Risk",
    low: "Low Risk",
  };

  return (
    <div className="flex items-center justify-center gap-6 mt-4">
      {payload.map((entry, index) => (
        <motion.div
          key={entry.value}
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-text-secondary">
            {labels[entry.value.toLowerCase() as keyof typeof labels] || entry.value}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export function RiskDistributionChart({
  high,
  medium,
  low,
  highPercent,
  mediumPercent,
  lowPercent,
}: RiskDistributionChartProps) {
  const data = [
    { name: "high", value: high, percent: highPercent, color: COLORS.high },
    { name: "medium", value: medium, percent: mediumPercent, color: COLORS.medium },
    { name: "low", value: low, percent: lowPercent, color: COLORS.low },
  ].filter((d) => d.value > 0);

  const total = high + medium + low;

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

    return (
      <g>
        <path
          d={props.path}
          fill={fill}
          style={{
            filter: "drop-shadow(0 0 8px rgba(0,0,0,0.3))",
            transform: "scale(1.05)",
            transformOrigin: `${cx}px ${cy}px`,
          }}
        />
      </g>
    );
  };

  return (
    <motion.div
      className="card-glow-admin p-6 bg-bg-card rounded-2xl border border-border-subtle"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold font-sora text-text-primary">
          Risk Distribution
        </h3>
        <div className="text-right">
          <p className="text-xs text-text-secondary">Total Students</p>
          <p className="text-xl font-bold font-sora text-text-primary">
            {total.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
              activeShape={renderActiveShape}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{ transition: "all 0.3s ease" }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Stats below chart */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border-subtle">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-2xl font-bold font-sora" style={{ color: COLORS.high }}>
            {highPercent.toFixed(1)}%
          </p>
          <p className="text-xs text-text-secondary mt-1">High Risk</p>
        </motion.div>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-2xl font-bold font-sora" style={{ color: COLORS.medium }}>
            {mediumPercent.toFixed(1)}%
          </p>
          <p className="text-xs text-text-secondary mt-1">Medium Risk</p>
        </motion.div>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-2xl font-bold font-sora" style={{ color: COLORS.low }}>
            {lowPercent.toFixed(1)}%
          </p>
          <p className="text-xs text-text-secondary mt-1">Low Risk</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default RiskDistributionChart;
