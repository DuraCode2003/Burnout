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
  onAlertsResolved?: () => void;
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

import { counselorService } from "@/services/counselorService";
import toast from "react-hot-toast";

export function AlertQueue({ alerts, filter, isLoading, onAlertsResolved }: AlertQueueProps) {
  const [selectedAlerts, setSelectedAlerts] = React.useState<Set<string>>(new Set());
  const [isResolving, setIsResolving] = React.useState(false);

  // Clear selection when filter changes
  React.useEffect(() => {
    setSelectedAlerts(new Set());
  }, [filter]);

  const handleToggleSelect = React.useCallback((id: string) => {
    setSelectedAlerts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = React.useCallback(() => {
    if (selectedAlerts.size === alerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(alerts.map(a => a.id)));
    }
  }, [alerts, selectedAlerts.size]);

  const handleBulkResolve = async () => {
    if (selectedAlerts.size === 0) return;
    setIsResolving(true);
    try {
      await counselorService.bulkResolveAlerts(Array.from(selectedAlerts), "Bulk resolved from dashboard");
      toast.success(`Successfully resolved ${selectedAlerts.size} alerts`);
      setSelectedAlerts(new Set());
      if (onAlertsResolved) onAlertsResolved();
    } catch (error) {
      toast.error("Failed to bulk resolve alerts");
    } finally {
      setIsResolving(false);
    }
  };
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

  return (
    <div className="space-y-4">
      {selectedAlerts.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-3 px-4 bg-bg-card border border-accent-counselor/30 rounded-xl shadow-glow-counselor"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-primary">
              {selectedAlerts.size} alert{selectedAlerts.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleSelectAll}
              className="text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedAlerts(new Set())}
              className="text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              Clear
            </button>
          </div>
          <button
            onClick={handleBulkResolve}
            disabled={isResolving}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-counselor text-white text-sm font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 transition-all"
          >
            {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Inbox className="w-4 h-4" />}
            Resolve Selected
          </button>
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="space-y-4"
      >
      <AnimatePresence mode="popLayout">
        {sortedAlerts.map((alert, index) => (
          <AlertCard 
            key={alert.id} 
            alert={alert} 
            index={index}
            selectable={true}
            selected={selectedAlerts.has(alert.id)}
            onToggleSelect={handleToggleSelect}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  </div>
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
