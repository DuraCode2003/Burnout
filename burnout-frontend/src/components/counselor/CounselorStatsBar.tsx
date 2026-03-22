"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import type { CounselorStats as CounselorStatsType } from "@/types/counselor";

interface CounselorStatsBarProps {
  stats: CounselorStatsType | null;
  loading?: boolean;
}

const statVariants = {
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

export function CounselorStatsBar({ stats, loading = false }: CounselorStatsBarProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl bg-bg-card animate-shimmer"
          />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: "Active Alerts",
      value: stats.queue.total,
      icon: Bell,
      color: "text-accent-counselor",
      bg: "bg-accent-counselor/10",
      borderColor: "border-accent-counselor/30",
      accentColor: "#14b8a6",
    },
    {
      label: "Urgent",
      value: stats.queue.urgent,
      subValue: `${stats.queue.red} RED`,
      icon: AlertTriangle,
      color: "text-danger",
      bg: "bg-danger/10",
      borderColor: "border-danger/30",
      accentColor: "#ef4444",
      pulsing: stats.queue.urgent > 0,
    },
    {
      label: "Resolved Today",
      value: stats.metrics.alertsResolved,
      icon: CheckCircle,
      color: "text-success",
      bg: "bg-success/10",
      borderColor: "border-success/30",
      accentColor: "#10b981",
    },
    {
      label: "Avg Response",
      value: formatResponseTime(stats.metrics.avgResponseTime),
      icon: Clock,
      color: "text-warning",
      bg: "bg-warning/10",
      borderColor: "border-warning/30",
      accentColor: "#f59e0b",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            variants={statVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`relative p-4 rounded-xl bg-bg-card border ${stat.borderColor} transition-all duration-300 ${
              stat.pulsing ? "animate-pulse-glow" : ""
            }`}
            style={{
              boxShadow: stat.pulsing
                ? `0 0 20px ${stat.accentColor}40`
                : "none",
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div
                className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}
              >
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              {stat.pulsing && (
                <motion.div
                  className="w-2 h-2 rounded-full bg-danger"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <motion.p
                className="text-2xl font-bold font-sora text-text-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {stat.value}
              </motion.p>
              {stat.subValue && (
                <span className="text-xs text-text-muted">{stat.subValue}</span>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-0.5">{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

function formatResponseTime(hours: number): string {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  }
  if (hours < 24) {
    return `${Math.round(hours)}h`;
  }
  const days = (hours / 24).toFixed(1);
  return `${days}d`;
}

export default CounselorStatsBar;
