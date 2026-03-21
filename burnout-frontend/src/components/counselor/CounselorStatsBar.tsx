"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import type { CounselorStats as CounselorStatsType } from "@/types/counselor";

interface CounselorStatsBarProps {
  stats: CounselorStatsType | null;
  loading?: boolean;
}

export function CounselorStatsBar({ stats, loading = false }: CounselorStatsBarProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-bg-card animate-shimmer"
          />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Alerts",
      value: stats.queue.total,
      icon: Bell,
      color: "text-accent-counselor-light",
      bg: "bg-accent-counselor/10",
      accent: "border-accent-counselor/30",
    },
    {
      label: "Urgent (RED)",
      value: stats.queue.red,
      icon: AlertTriangle,
      color: "text-danger",
      bg: "bg-danger/10",
      accent: "border-danger/30",
      highlight: stats.queue.red > 0,
    },
    {
      label: "Needs Attention",
      value: stats.queue.orange,
      icon: Clock,
      color: "text-[#f97316]",
      bg: "bg-[#f97316]/10",
      accent: "border-[#f97316]/30",
    },
    {
      label: "Monitoring",
      value: stats.queue.yellow,
      icon: TrendingUp,
      color: "text-[#eab308]",
      bg: "bg-[#eab308]/10",
      accent: "border-[#eab308]/30",
    },
    {
      label: "Assigned to Me",
      value: stats.queue.assignedToMe,
      icon: Users,
      color: "text-accent-counselor",
      bg: "bg-accent-counselor/10",
      accent: "border-accent-counselor/30",
    },
    {
      label: "Resolved (7d)",
      value: stats.metrics.alertsResolved,
      icon: CheckCircle,
      color: "text-success",
      bg: "bg-success/10",
      accent: "border-success/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`relative p-4 rounded-2xl bg-bg-card border ${stat.accent} transition-all duration-300 ${
              stat.highlight ? "card-glow-urgent" : "card-glow-counselor"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              {stat.highlight && (
                <motion.div
                  className="w-2 h-2 rounded-full bg-danger"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
            <p className="text-2xl font-bold font-sora text-text-primary mb-0.5">
              {stat.value}
            </p>
            <p className="text-xs text-text-muted">{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ElementType;
  color?: string;
}

export function MetricCard({
  label,
  value,
  subValue,
  icon: Icon,
  color = "text-accent-counselor-light",
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="p-4 rounded-2xl bg-bg-card border border-border-subtle card-glow-counselor"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-accent-counselor/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-accent-counselor-light" />
        </div>
        <span className="text-sm text-text-muted">{label}</span>
      </div>
      <p className="text-2xl font-bold font-sora text-text-primary">{value}</p>
      {subValue && <p className="text-xs text-text-secondary mt-1">{subValue}</p>}
    </motion.div>
  );
}

export default CounselorStatsBar;
