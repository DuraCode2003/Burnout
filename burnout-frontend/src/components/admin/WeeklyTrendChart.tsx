"use client";

import React, { useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";
import { WeeklyTrend } from "@/types/admin";

interface WeeklyTrendChartProps {
  data: WeeklyTrend[];
}

type Period = "4w" | "8w" | "12w";

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        className="bg-bg-card border border-border-default rounded-xl p-4 shadow-xl min-w-[180px]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <p className="text-sm font-semibold text-text-primary mb-3">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-4 text-xs mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="text-text-secondary">{p.name}</span>
            </div>
            <span className="text-text-primary font-medium">
              {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
            </span>
          </div>
        ))}
      </motion.div>
    );
  }
  return null;
};

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const [period, setPeriod] = useState<Period>("8w");

  const getPeriodData = () => {
    const weeks = period === "4w" ? 4 : period === "8w" ? 8 : 12;
    return data.slice(-weeks);
  };

  const periodData = getPeriodData();

  const chartData = periodData.map((d) => ({
    ...d,
    moodScaled: d.avgMoodScore * 10,
  }));

  return (
    <motion.div
      className="card-glow-admin p-6 bg-bg-card rounded-2xl border border-border-subtle"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold font-sora text-text-primary">
            Weekly Trends
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Burnout, mood, and participation over time
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-elevated border border-border-subtle">
          {(["4w", "8w", "12w"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                period === p
                  ? "bg-gradient-admin text-white shadow-glow-admin"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="burnoutGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.1)"
              vertical={false}
            />

            <XAxis
              dataKey="weekLabel"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8" }}
            />

            <YAxis
              yAxisId="left"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8" }}
              domain={[0, 100]}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8" }}
              hide
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              formatter={(value) => (
                <span className="text-sm text-text-secondary">{value}</span>
              )}
            />

            {/* Burnout Score - Area */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="avgBurnoutScore"
              name="Avg Burnout"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#burnoutGradient)"
              dot={{ fill: "#ef4444", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6 }}
            />

            {/* Mood Score - Line (scaled) */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="moodScaled"
              name="Avg Mood"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6 }}
            />

            {/* Check-in Count - Bar */}
            <Bar
              yAxisId="right"
              dataKey="checkinCount"
              name="Check-ins"
              fill="rgba(6, 182, 212, 0.5)"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />

            {/* Burnout Threshold Reference Line */}
            <ReferenceLine
              yAxisId="left"
              y={70}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{
                value: "Threshold",
                position: "right",
                fill: "#ef4444",
                fontSize: 11,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default WeeklyTrendChart;
