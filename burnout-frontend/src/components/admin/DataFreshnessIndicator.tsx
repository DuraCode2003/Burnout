"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, RefreshCw } from "lucide-react";

interface DataFreshnessIndicatorProps {
  lastUpdated: Date | null;
  onRefresh?: () => void;
  autoRefreshInterval?: number; // in minutes
}

interface FreshnessState {
  label: string;
  color: "success" | "warning" | "danger";
  dotColor: string;
}

const getFreshnessState = (minutes: number): FreshnessState => {
  if (minutes < 5) {
    return {
      label: "Live",
      color: "success",
      dotColor: "bg-success",
    };
  } else if (minutes < 15) {
    return {
      label: "Recent",
      color: "warning",
      dotColor: "bg-warning",
    };
  } else {
    return {
      label: "Stale",
      color: "danger",
      dotColor: "bg-danger",
    };
  }
};

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export function DataFreshnessIndicator({
  lastUpdated,
  onRefresh,
  autoRefreshInterval = 5,
}: DataFreshnessIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState("Just now");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimeAgo = () => {
      setTimeAgo(getTimeAgo(lastUpdated));
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  if (!lastUpdated) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-subtle">
        <Clock className="w-3.5 h-3.5 text-text-muted" />
        <span className="text-xs text-text-muted">Loading...</span>
      </div>
    );
  }

  const minutesSinceUpdate = Math.floor(
    (new Date().getTime() - lastUpdated.getTime()) / 60000
  );
  const freshness = getFreshnessState(minutesSinceUpdate);

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Freshness indicator */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-subtle ${
          freshness.color === "success"
            ? "border-success/30"
            : freshness.color === "warning"
            ? "border-warning/30"
            : "border-danger/30"
        }`}
      >
        {/* Status dot */}
        <span className="relative flex h-2 w-2">
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${freshness.dotColor} animate-ping`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${freshness.dotColor}`}
          />
        </span>

        {/* Text */}
        <span className="text-xs text-text-secondary">
          <span
            className={`font-medium ${
              freshness.color === "success"
                ? "text-success"
                : freshness.color === "warning"
                ? "text-warning"
                : "text-danger"
            }`}
          >
            {freshness.label}
          </span>
          <span className="text-text-muted ml-1">• {timeAgo}</span>
        </span>
      </div>

      {/* Refresh button */}
      {onRefresh && (
        <motion.button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-accent-admin-light hover:text-accent-cyan hover:bg-bg-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isRefreshing ? 1 : 1.02 }}
          whileTap={{ scale: isRefreshing ? 1 : 0.98 }}
          title={`Auto-refreshes every ${autoRefreshInterval} minutes`}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>Refresh</span>
        </motion.button>
      )}
    </motion.div>
  );
}

export default DataFreshnessIndicator;
