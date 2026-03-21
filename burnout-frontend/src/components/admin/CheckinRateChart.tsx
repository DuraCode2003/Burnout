"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { DailyCheckin } from "@/types/admin";

interface CheckinRateChartProps {
  data: DailyCheckin[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: DailyCheckin;
  }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const date = new Date(data.date);
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return (
      <motion.div
        className="bg-bg-card border border-border-default rounded-xl p-4 shadow-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <p className="text-sm font-semibold text-text-primary mb-1">
          {dayName}
        </p>
        <p className="text-xs text-text-secondary mb-3">{formattedDate}</p>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-gradient-admin" />
          <span className="text-text-secondary text-xs">Check-ins:</span>
          <span className="text-text-primary font-medium text-sm">
            {data.checkinCount.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-text-secondary text-xs">Participation:</span>
          <span
            className={`font-semibold text-sm ${
              data.participationPercent >= 60
                ? "text-success"
                : data.participationPercent >= 30
                ? "text-warning"
                : "text-danger"
            }`}
          >
            {data.participationPercent.toFixed(1)}%
          </span>
        </div>
      </motion.div>
    );
  }
  return null;
};

const getBarColor = (percent: number) => {
  if (percent >= 60) return "#10b981";
  if (percent >= 30) return "#f59e0b";
  return "#ef4444";
};

export function CheckinRateChart({ data }: CheckinRateChartProps) {
  const averageParticipation =
    data.reduce((sum, d) => sum + d.participationPercent, 0) /
    (data.length || 1);

  const chartData = data.map((d) => {
    const date = new Date(d.date);
    return {
      ...d,
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      monthDay: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });

  // Show last 14 days for better visibility
  const displayData = chartData.slice(-14);

  return (
    <motion.div
      className="card-glow-admin p-6 bg-bg-card rounded-2xl border border-border-subtle"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold font-sora text-text-primary">
            Check-in Participation
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Daily participation rate over last 14 days
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-bg-elevated border border-border-subtle">
          <span className="text-xs text-text-secondary">Average:</span>
          <span
            className={`text-sm font-bold ${
              averageParticipation >= 60
                ? "text-success"
                : averageParticipation >= 30
                ? "text-warning"
                : "text-danger"
            }`}
          >
            {averageParticipation.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.1)"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8" }}
            />

            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8" }}
              unit="%"
              domain={[0, 100]}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Target Reference Line */}
            <ReferenceLine
              y={60}
              stroke="#10b981"
              strokeDasharray="4 4"
              label={{
                value: "Target (60%)",
                position: "right",
                fill: "#10b981",
                fontSize: 11,
              }}
            />

            <Bar dataKey="participationPercent" name="Participation %" radius={[4, 4, 0, 0]}>
              {displayData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.participationPercent)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Color Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-xs text-text-secondary">Good (&gt;60%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-xs text-text-secondary">Moderate (30-60%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-danger" />
          <span className="text-xs text-text-secondary">Low (&lt;30%)</span>
        </div>
      </div>
    </motion.div>
  );
}

export default CheckinRateChart;
