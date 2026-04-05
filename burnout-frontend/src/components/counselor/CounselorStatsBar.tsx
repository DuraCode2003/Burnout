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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse"
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
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      accentColor: "#6366f1",
    },
    {
      label: "Urgent RED",
      value: stats.queue.urgent,
      subValue: `${stats.queue.red} Critical`,
      icon: AlertTriangle,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
      accentColor: "#f43f5e",
      pulsing: stats.queue.urgent > 0,
    },
    {
      label: "Resolved Today",
      value: stats.metrics.alertsResolved,
      icon: CheckCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      accentColor: "#10b981",
    },
    {
      label: "Avg Response",
      value: formatResponseTime(stats.metrics.avgResponseTime),
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      accentColor: "#f59e0b",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            variants={statVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className={`group relative p-5 rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/5 overflow-hidden transition-all duration-500 ${
              stat.pulsing ? "shadow-[0_0_20px_rgba(244,63,94,0.1)]" : ""
            }`}
          >
            {/* Background Accent Glow */}
            <div 
              className="absolute -right-4 -top-4 w-16 h-16 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 rounded-full"
              style={{ backgroundColor: stat.accentColor }}
            />
            
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}
              >
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              {stat.pulsing && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-rose-500"
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-[8px] font-black uppercase tracking-wider text-rose-400">Live</span>
                </div>
              )}
            </div>

            <div className="relative z-10">
              <div className="flex items-baseline gap-2">
                <motion.h3
                  className="text-2xl font-black font-sora text-white tracking-tight"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {stat.value}
                </motion.h3>
                {stat.subValue && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 whitespace-nowrap">
                    {stat.subValue}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mt-1">
                {stat.label}
              </p>
            </div>
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
