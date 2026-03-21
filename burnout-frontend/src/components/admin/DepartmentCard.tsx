"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus, Users, Activity, TrendingUp } from "lucide-react";
import { DepartmentStats } from "@/types/admin";

interface DepartmentCardProps {
  department: DepartmentStats;
}

const riskColors = {
  HIGH: {
    glow: "shadow-[0_0_40px_rgba(239,68,68,0.2)]",
    border: "border-danger/30",
    badge: "bg-danger/15 text-danger border-danger/30",
  },
  MEDIUM: {
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.2)]",
    border: "border-warning/30",
    badge: "bg-warning/15 text-warning border-warning/30",
  },
  LOW: {
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.2)]",
    border: "border-success/30",
    badge: "bg-success/15 text-success border-success/30",
  },
};

const trendIcons = {
  up: { icon: ArrowUpRight, color: "text-danger" },
  down: { icon: ArrowDownRight, color: "text-success" },
  stable: { icon: Minus, color: "text-text-secondary" },
};

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 70) return "#ef4444";
    if (s >= 40) return "#f59e0b";
    return "#10b981";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold font-sora text-text-primary">
          {score.toFixed(0)}
        </span>
      </div>
    </div>
  );
}

export function DepartmentCard({ department }: DepartmentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = riskColors[department.riskLevel];
  const TrendIcon = trendIcons[department.trend].icon;
  const trendColor = trendIcons[department.trend].color;

  return (
    <motion.div
      className={`relative p-5 bg-bg-card rounded-2xl border ${colors.border} cursor-pointer transition-all duration-300 hover:${colors.glow}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold font-sora text-text-primary truncate">
            {department.department}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors.badge}`}
            >
              {department.riskLevel}
            </span>
            <span className="text-xs text-text-secondary">
              {department.studentCount.toLocaleString()} students
            </span>
          </div>
        </div>
        <ScoreRing score={department.avgBurnoutScore} />
      </div>

      {/* Check-in Rate Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-text-secondary">Check-in Rate</span>
          <span className="text-text-primary font-medium">
            {department.checkinRate.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-bg-elevated overflow-hidden">
          <motion.div
            className="h-full bg-gradient-admin rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(department.checkinRate, 100)}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Trend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
          <span className={`text-sm font-medium ${trendColor}`}>
            {department.trend === "up"
              ? "Increasing"
              : department.trend === "down"
              ? "Decreasing"
              : "Stable"}
          </span>
        </div>
        <span className="text-xs text-text-muted">
          vs last month
        </span>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="mt-4 pt-4 border-t border-border-subtle"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent-admin-light" />
                <div>
                  <p className="text-xs text-text-secondary">Avg Mood</p>
                  <p className="text-sm font-semibold text-text-primary">6.5/10</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-accent-cyan" />
                <div>
                  <p className="text-xs text-text-secondary">Active This Week</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {Math.round(department.studentCount * (department.checkinRate / 100))}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-warning" />
                <div>
                  <p className="text-xs text-text-secondary">Stress Level</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {(department.avgBurnoutScore / 10).toFixed(1)}/10
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-success" />
                <div>
                  <p className="text-xs text-text-secondary">Low Risk</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {Math.round(department.studentCount * 0.6)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default DepartmentCard;
