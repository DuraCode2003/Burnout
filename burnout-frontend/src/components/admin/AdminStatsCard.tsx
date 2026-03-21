"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AdminStatsCardProps {
  label: string;
  value: number;
  subValue?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  accentColor?: "cyan" | "blue" | "emerald" | "amber" | "red";
  suffix?: string;
  prefix?: string;
}

const accentColors = {
  cyan: {
    bg: "rgba(6, 182, 212, 0.15)",
    border: "rgba(6, 182, 212, 0.3)",
    text: "text-accent-cyan",
    gradient: "from-accent-cyan to-accent-admin",
  },
  blue: {
    bg: "rgba(14, 165, 233, 0.15)",
    border: "rgba(14, 165, 233, 0.3)",
    text: "text-accent-admin-light",
    gradient: "from-accent-admin-light to-accent-admin",
  },
  emerald: {
    bg: "rgba(16, 185, 129, 0.15)",
    border: "rgba(16, 185, 129, 0.3)",
    text: "text-success",
    gradient: "from-success to-emerald-400",
  },
  amber: {
    bg: "rgba(245, 158, 11, 0.15)",
    border: "rgba(245, 158, 11, 0.3)",
    text: "text-warning",
    gradient: "from-warning to-amber-400",
  },
  red: {
    bg: "rgba(239, 68, 68, 0.15)",
    border: "rgba(239, 68, 68, 0.3)",
    text: "text-danger",
    gradient: "from-danger to-red-400",
  },
};

function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
}: {
  value: number;
  suffix?: string;
  prefix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      current += increment;

      if (stepCount >= steps || current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}
      {value % 1 === 0
        ? Math.round(displayValue).toLocaleString()
        : displayValue.toFixed(1)}
      {suffix}
    </span>
  );
}

export function AdminStatsCard({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  accentColor = "cyan",
  suffix = "",
  prefix = "",
}: AdminStatsCardProps) {
  const colors = accentColors[accentColor];

  return (
    <motion.div
      className="relative p-6 bg-bg-card rounded-2xl border border-border-subtle overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {/* Glow effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
      />

      {/* Border glow */}
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        style={{
          boxShadow: `0 0 40px ${colors.bg.replace("0.15", "0.3")}`,
        }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-text-secondary mb-1">
              {label}
            </p>
            <motion.div
              className="text-3xl font-bold font-sora text-text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <AnimatedCounter value={value} suffix={suffix} prefix={prefix} />
            </motion.div>
            {subValue && (
              <motion.p
                className="text-xs text-text-muted mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {subValue}
              </motion.p>
            )}
          </div>

          <motion.div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
            }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
          >
            <Icon className={`w-6 h-6 ${colors.text}`} />
          </motion.div>
        </div>

        {/* Trend */}
        {trend && (
          <motion.div
            className={`flex items-center gap-1.5 text-sm font-medium ${
              trend.isPositive ? "text-success" : "text-danger"
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-base">
              {trend.isPositive ? "↑" : "↓"}
            </span>
            <span>{Math.abs(trend.value).toFixed(0)}%</span>
            <span className="text-text-muted font-normal">
              {trend.label}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default AdminStatsCard;
