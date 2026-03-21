"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { AlertTier } from "@/types/counselor";

interface RiskBadgeProps {
  tier: AlertTier;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  pulsing?: boolean;
}

const tierConfig = {
  RED: {
    color: "#ef4444",
    bg: "bg-danger/10",
    border: "border-danger/30",
    text: "text-danger",
    glow: "shadow-glow-urgent",
    label: "URGENT",
    icon: AlertTriangle,
  },
  ORANGE: {
    color: "#f97316",
    bg: "bg-[#f97316]/10",
    border: "border-[#f97316]/30",
    text: "text-[#f97316]",
    glow: "shadow-glow-orange",
    label: "Attention",
    icon: AlertTriangle,
  },
  YELLOW: {
    color: "#eab308",
    bg: "bg-[#eab308]/10",
    border: "border-[#eab308]/30",
    text: "text-[#eab308]",
    glow: "shadow-glow-yellow",
    label: "Monitoring",
    icon: Minus,
  },
};

export function RiskBadge({
  tier,
  size = "md",
  showLabel = true,
  pulsing = false,
}: RiskBadgeProps) {
  const config = tierConfig[tier];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const iconSize = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 rounded-full ${config.bg} ${config.text} border ${config.border} ${sizeClasses[size]} ${pulsing ? "animate-pulse" : ""}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Icon className={iconSize[size]} />
      {showLabel && (
        <span className="font-semibold">{config.label}</span>
      )}
    </motion.div>
  );
}

interface RiskLevelBadgeProps {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  size?: "sm" | "md" | "lg";
}

const riskLevelConfig = {
  LOW: {
    color: "#10b981",
    bg: "bg-success/10",
    border: "border-success/30",
    text: "text-success",
    label: "Low",
  },
  MEDIUM: {
    color: "#f59e0b",
    bg: "bg-warning/10",
    border: "border-warning/30",
    text: "text-warning",
    label: "Medium",
  },
  HIGH: {
    color: "#f97316",
    bg: "bg-[#f97316]/10",
    border: "border-[#f97316]/30",
    text: "text-[#f97316]",
    label: "High",
  },
  CRITICAL: {
    color: "#ef4444",
    bg: "bg-danger/10",
    border: "border-danger/30",
    text: "text-danger",
    label: "Critical",
  },
};

export function RiskLevelBadge({ level, size = "md" }: RiskLevelBadgeProps) {
  const config = riskLevelConfig[level];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full ${config.bg} ${config.text} border ${config.border} ${sizeClasses[size]}`}
    >
      <span className="font-medium">{config.label}</span>
    </div>
  );
}

interface TrendIndicatorProps {
  trend: "improving" | "stable" | "declining";
  showLabel?: boolean;
}

export function TrendIndicator({ trend, showLabel = true }: TrendIndicatorProps) {
  const config = {
    improving: {
      icon: TrendingDown,
      color: "text-success",
      label: "Improving",
    },
    stable: {
      icon: Minus,
      color: "text-text-muted",
      label: "Stable",
    },
    declining: {
      icon: TrendingUp,
      color: "text-danger",
      label: "Declining",
    },
  };

  const Icon = config[trend].icon;

  return (
    <div className={`flex items-center gap-1.5 ${config[trend].color}`}>
      <Icon className="w-4 h-4" />
      {showLabel && <span className="text-sm">{config[trend].label}</span>}
    </div>
  );
}

export default RiskBadge;
