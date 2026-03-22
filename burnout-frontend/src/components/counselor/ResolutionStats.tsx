"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";

interface ResolutionStatsData {
  totalResolved: number;
  avgResolutionHours: number;
  redResolved: number;
  orangeResolved: number;
  yellowResolved: number;
  fastestResolutionHours: number;
  slowestResolutionHours: number;
  thisWeekCount: number;
  lastWeekCount: number;
}

interface ResolutionStatsProps {
  stats: ResolutionStatsData | null;
  loading?: boolean;
}

const statCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

export function ResolutionStats({ stats, loading = false }: ResolutionStatsProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-bg-card animate-shimmer" />
        ))}
      </div>
    );
  }

  const weekTrend =
    stats.lastWeekCount > 0
      ? ((stats.thisWeekCount - stats.lastWeekCount) / stats.lastWeekCount) * 100
      : 0;

  const statCards = [
    {
      label: "Total Resolved",
      value: stats.totalResolved,
      icon: CheckCircle,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Avg Resolution",
      value: formatHours(stats.avgResolutionHours),
      icon: Clock,
      color: "text-accent-counselor",
      bg: "bg-accent-counselor/10",
    },
    {
      label: "RED Resolved",
      value: stats.redResolved,
      icon: AlertTriangle,
      color: "text-gray-400",
      bg: "bg-gray-500/10",
    },
    {
      label: "ORANGE Resolved",
      value: stats.orangeResolved,
      icon: AlertTriangle,
      color: "text-gray-400",
      bg: "bg-gray-500/10",
    },
    {
      label: "YELLOW Resolved",
      value: stats.yellowResolved,
      icon: AlertTriangle,
      color: "text-gray-400",
      bg: "bg-gray-500/10",
    },
    {
      label: "This Week",
      value: stats.thisWeekCount,
      subValue: weekTrend !== 0 ? `${weekTrend > 0 ? "+" : ""}${weekTrend.toFixed(0)}%` : null,
      subValuePositive: weekTrend >= 0,
      icon: CheckCircle,
      color: "text-text-primary",
      bg: "bg-bg-elevated",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            variants={statCardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.08 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`p-4 rounded-xl bg-bg-card border border-border-subtle transition-all duration-300`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              {stat.subValue && (
                <span
                  className={`text-xs font-semibold ${
                    stat.subValuePositive ? "text-success" : "text-danger"
                  }`}
                >
                  {stat.subValue}
                </span>
              )}
            </div>
            <p className="text-xl font-bold font-sora text-text-primary">
              {stat.value}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

function formatHours(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  }
  if (hours < 24) {
    return `${hours.toFixed(1)}h`;
  }
  const days = (hours / 24).toFixed(1);
  return `${days}d`;
}

export default ResolutionStats;
