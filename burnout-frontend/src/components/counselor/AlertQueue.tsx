"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCard } from "./AlertCard";
import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import type { Alert, AlertType } from "@/types/counselor";

interface AlertQueueProps {
  alerts: Alert[];
  filter: AlertType | "ALL";
  isLoading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const emptyStateVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

export function AlertQueue({ alerts, filter, isLoading }: AlertQueueProps) {
  // Filter alerts
  const filteredAlerts = React.useMemo(() => {
    if (filter === "ALL") return alerts;
    return alerts.filter((alert) => alert.tier === filter);
  }, [alerts, filter]);

  // Sort alerts: RED first, then ORANGE, then YELLOW, then by time
  const sortedAlerts = React.useMemo(() => {
    const tierPriority: Record<AlertType, number> = {
      RED: 0,
      ORANGE: 1,
      YELLOW: 2,
    };

    return [...filteredAlerts].sort((a, b) => {
      // First sort by tier
      const tierDiff = tierPriority[a.tier] - tierPriority[b.tier];
      if (tierDiff !== 0) return tierDiff;

      // Then by urgency
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;

      // Then by creation time (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredAlerts]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-2xl bg-bg-card animate-shimmer"
          />
        ))}
      </div>
    );
  }

  // Empty state
  if (sortedAlerts.length === 0) {
    return (
      <motion.div
        variants={emptyStateVariants}
        initial="hidden"
        animate="visible"
        className="text-center py-16"
      >
        <motion.div
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-bg-elevated flex items-center justify-center border border-border-subtle"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          {filter === "ALL" ? (
            <Inbox className="w-10 h-10 text-text-muted" />
          ) : (
            <AlertTriangle className="w-10 h-10 text-text-muted" />
          )}
        </motion.div>

        <motion.h3
          className="text-xl font-bold font-sora text-text-primary mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {getEmptyStateTitle(filter)}
        </motion.h3>

        <motion.p
          className="text-text-secondary mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {getEmptyStateMessage(filter)}
        </motion.p>

        {filter !== "ALL" && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => {
              // This would need to be passed as a prop or use context
              // For now, just a placeholder
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-counselor text-white font-medium shadow-glow-counselor hover:opacity-90 transition-opacity"
          >
            View All Alerts
          </motion.button>
        )}
      </motion.div>
    );
  }

  // Alert list
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-4"
    >
      <AnimatePresence mode="popLayout">
        {sortedAlerts.map((alert, index) => (
          <AlertCard key={alert.id} alert={alert} index={index} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

function getEmptyStateTitle(filter: AlertType | "ALL"): string {
  switch (filter) {
    case "RED":
      return "No Urgent Alerts";
    case "ORANGE":
      return "No Priority Alerts";
    case "YELLOW":
      return "No Monitoring Alerts";
    default:
      return "All Caught Up!";
  }
}

function getEmptyStateMessage(filter: AlertType | "ALL"): string {
  switch (filter) {
    case "RED":
      return "No urgent alerts requiring immediate attention right now";
    case "ORANGE":
      return "No priority alerts at the moment";
    case "YELLOW":
      return "No alerts currently under monitoring";
    default:
      return "No active alerts requiring attention — great news!";
  }
}

export default AlertQueue;
