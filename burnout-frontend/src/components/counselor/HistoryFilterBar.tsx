"use client";

import React from "react";
import { motion } from "framer-motion";
import type { AlertType } from "@/types/counselor";

export type HistoryPeriod = "WEEK" | "MONTH" | "ALL";

interface HistoryFilterBarProps {
  period: HistoryPeriod;
  onPeriodChange: (period: HistoryPeriod) => void;
  alertTypeFilter: AlertType | "ALL";
  onAlertTypeChange: (type: AlertType | "ALL") => void;
  resultsCount: number;
}

const periodOptions: { key: HistoryPeriod; label: string }[] = [
  { key: "WEEK", label: "This Week" },
  { key: "MONTH", label: "This Month" },
  { key: "ALL", label: "All Time" },
];

const alertTypeOptions: { key: AlertType | "ALL"; label: string; color: string }[] = [
  { key: "ALL", label: "All Types", color: "text-text-secondary" },
  { key: "RED", label: "RED", color: "text-gray-400" },
  { key: "ORANGE", label: "ORANGE", color: "text-gray-400" },
  { key: "YELLOW", label: "YELLOW", color: "text-gray-400" },
];

const tabVariants = {
  inactive: { scale: 1 },
  active: { scale: 1.05 },
  hover: { scale: 1.08 },
};

export function HistoryFilterBar({
  period,
  onPeriodChange,
  alertTypeFilter,
  onAlertTypeChange,
  resultsCount,
}: HistoryFilterBarProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Period Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {periodOptions.map((option) => {
            const isActive = period === option.key;

            return (
              <motion.button
                key={option.key}
                variants={tabVariants}
                initial="inactive"
                animate={isActive ? "active" : "inactive"}
                whileHover="hover"
                onClick={() => onPeriodChange(option.key)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 border ${
                  isActive
                    ? "bg-gradient-counselor text-white border-accent-counselor/30 shadow-glow-counselor"
                    : "bg-bg-elevated text-text-secondary border-border-subtle hover:border-border-default"
                }`}
              >
                {option.label}
              </motion.button>
            );
          })}
        </div>

        <div className="text-sm text-text-muted">
          Showing{" "}
          <span className="font-semibold text-text-primary">{resultsCount}</span>{" "}
          resolved alert{resultsCount !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Alert Type Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-text-muted mr-2">Filter by type:</span>
        {alertTypeOptions.map((option) => {
          const isActive = alertTypeFilter === option.key;

          return (
            <motion.button
              key={option.key}
              variants={tabVariants}
              initial="inactive"
              animate={isActive ? "active" : "inactive"}
              whileHover="hover"
              onClick={() => onAlertTypeChange(option.key)}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-300 border ${
                isActive
                  ? `bg-gray-500/20 ${option.color} border-gray-500/30`
                  : "bg-bg-elevated text-text-muted border-border-subtle hover:border-border-default"
              }`}
            >
              {option.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default HistoryFilterBar;
