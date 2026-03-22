"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { AlertType } from "@/types/counselor";

interface AlertFilterTabsProps {
  activeFilter: AlertType | "ALL";
  onChange: (filter: AlertType | "ALL") => void;
  counts: {
    all: number;
    red: number;
    orange: number;
    yellow: number;
  };
}

const tabVariants = {
  inactive: { scale: 1 },
  active: { scale: 1.05 },
  hover: { scale: 1.08 },
};

const badgeVariants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: { type: "spring", stiffness: 500, damping: 25 },
  },
};

export function AlertFilterTabs({
  activeFilter,
  onChange,
  counts,
}: AlertFilterTabsProps) {
  const tabs = [
    {
      key: "ALL" as const,
      label: "All",
      count: counts.all,
      color: "text-text-secondary",
      activeColor: "text-accent-counselor",
      bgColor: "bg-accent-counselor/10",
      borderColor: "border-accent-counselor/30",
      icon: null,
    },
    {
      key: "RED" as const,
      label: "RED",
      count: counts.red,
      color: "text-danger",
      activeColor: "text-white",
      bgColor: "bg-danger",
      borderColor: "border-danger/30",
      icon: AlertTriangle,
    },
    {
      key: "ORANGE" as const,
      label: "ORANGE",
      count: counts.orange,
      color: "text-[#f97316]",
      activeColor: "text-white",
      bgColor: "bg-[#f97316]",
      borderColor: "border-[#f97316]/30",
      icon: AlertTriangle,
    },
    {
      key: "YELLOW" as const,
      label: "YELLOW",
      count: counts.yellow,
      color: "text-[#eab308]",
      activeColor: "text-white",
      bgColor: "bg-[#eab308]",
      borderColor: "border-[#eab308]/30",
      icon: null,
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((tab) => {
        const isActive = activeFilter === tab.key;
        const Icon = tab.icon;

        return (
          <motion.button
            key={tab.key}
            variants={tabVariants}
            initial="inactive"
            animate={isActive ? "active" : "inactive"}
            whileHover="hover"
            onClick={() => onChange(tab.key)}
            className={`relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 border ${
              isActive
                ? `${tab.bgColor} ${tab.activeColor} ${tab.borderColor} shadow-lg`
                : `bg-bg-elevated ${tab.color} border-border-subtle hover:border-border-default`
            }`}
          >
            <div className="flex items-center gap-2">
              {Icon && isActive && (
                <Icon className="w-4 h-4" />
              )}
              <span>{tab.label}</span>
              <motion.span
                className={`flex items-center justify-center min-w-[20px] px-1.5 py-0.5 text-xs rounded-full ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-bg-card text-text-muted"
                }`}
                variants={badgeVariants}
                initial="hidden"
                animate="visible"
              >
                {tab.count}
              </motion.span>
            </div>
            {isActive && (
              <motion.div
                className="absolute -bottom-1 left-1/2 w-8 h-0.5 -translate-x-1/2 rounded-full bg-gradient-counselor"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export default AlertFilterTabs;
