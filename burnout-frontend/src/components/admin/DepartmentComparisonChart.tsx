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
import { DepartmentStats } from "@/types/admin";

interface DepartmentComparisonChartProps {
  departments: DepartmentStats[];
  campusAverage?: number;
}

const riskColors = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#10b981",
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: DepartmentStats;
  }>;
}) => {
  if (active && payload && payload.length) {
    const dept = payload[0].payload;
    return (
      <motion.div
        className="bg-bg-card border border-border-default rounded-xl p-4 shadow-xl min-w-[200px]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <p className="text-sm font-semibold text-text-primary mb-3">
          {dept.department}
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-text-secondary">Avg Score:</span>
            <span
              className={`text-sm font-bold ${
                dept.avgBurnoutScore >= 70
                  ? "text-danger"
                  : dept.avgBurnoutScore >= 40
                  ? "text-warning"
                  : "text-success"
              }`}
            >
              {dept.avgBurnoutScore.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-text-secondary">Students:</span>
            <span className="text-sm text-text-primary">
              {dept.studentCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-text-secondary">Risk Level:</span>
            <span
              className={`text-sm font-semibold ${
                dept.riskLevel === "HIGH"
                  ? "text-danger"
                  : dept.riskLevel === "MEDIUM"
                  ? "text-warning"
                  : "text-success"
              }`}
            >
              {dept.riskLevel}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-text-secondary">Check-in Rate:</span>
            <span className="text-sm text-text-primary">
              {dept.checkinRate.toFixed(0)}%
            </span>
          </div>
        </div>
      </motion.div>
    );
  }
  return null;
};

export function DepartmentComparisonChart({
  departments,
  campusAverage,
}: DepartmentComparisonChartProps) {
  const sortedDepartments = [...departments].sort(
    (a, b) => b.avgBurnoutScore - a.avgBurnoutScore
  );

  const chartData = sortedDepartments.map((dept) => ({
    ...dept,
    name:
      dept.department.length > 15
        ? dept.department.substring(0, 15) + "..."
        : dept.department,
    fullName: dept.department,
  }));

  const avgScore =
    campusAverage ??
    departments.reduce((sum, d) => sum + d.avgBurnoutScore, 0) /
      (departments.length || 1);

  return (
    <motion.div
      className="card-glow-admin p-6 bg-bg-card rounded-2xl border border-border-subtle"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold font-sora text-text-primary">
            Department Comparison
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Average burnout scores by department
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-subtle">
          <span className="text-xs text-text-secondary">Campus Avg:</span>
          <span
            className={`text-sm font-bold ${
              avgScore >= 70
                ? "text-danger"
                : avgScore >= 40
                ? "text-warning"
                : "text-success"
            }`}
          >
            {avgScore.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.1)"
              horizontal={false}
            />

            <XAxis
              type="number"
              domain={[0, 100]}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8" }}
              unit=" pts"
            />

            <YAxis
              type="category"
              dataKey="name"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8" }}
              width={100}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Campus Average Reference Line */}
            <ReferenceLine
              x={avgScore}
              stroke="#6366f1"
              strokeDasharray="4 4"
              label={{
                value: "Campus Avg",
                position: "top",
                fill: "#6366f1",
                fontSize: 11,
              }}
            />

            <Bar dataKey="avgBurnoutScore" name="Avg Score" radius={[0, 4, 4, 0]} barSize={24}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={riskColors[entry.riskLevel]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default DepartmentComparisonChart;
