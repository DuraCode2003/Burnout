"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Inbox, Users, TrendingUp } from "lucide-react";

interface AdminEmptyStateProps {
  message?: string;
  suggestion?: string;
  icon?: "alert" | "inbox" | "users" | "trending";
  action?: {
    label: string;
    onClick: () => void;
  };
}

const icons = {
  alert: AlertTriangle,
  inbox: Inbox,
  users: Users,
  trending: TrendingUp,
};

const defaultMessages = {
  alert: {
    message: "Not enough data yet",
    suggestion: "Students need to check in for data to appear in reports",
  },
  inbox: {
    message: "No data available",
    suggestion: "Check back later when students have submitted their check-ins",
  },
  users: {
    message: "No students found",
    suggestion: "Ensure students have registered and consented to data sharing",
  },
  trending: {
    message: "No trends to display",
    suggestion: "Historical data will appear as students continue using the system",
  },
};

export function AdminEmptyState({
  message,
  suggestion,
  icon = "inbox",
  action,
}: AdminEmptyStateProps) {
  const Icon = icons[icon];
  const defaults = defaultMessages[icon];

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Icon */}
      <motion.div
        className="w-20 h-20 rounded-2xl bg-bg-elevated border border-border-subtle flex items-center justify-center mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
      >
        <Icon className="w-10 h-10 text-text-muted" />
      </motion.div>

      {/* Message */}
      <h3 className="text-lg font-semibold font-sora text-text-primary mb-2 text-center">
        {message ?? defaults.message}
      </h3>

      {/* Suggestion */}
      <p className="text-sm text-text-secondary text-center max-w-md mb-6">
        {suggestion ?? defaults.suggestion}
      </p>

      {/* Action Button */}
      {action && (
        <motion.button
          onClick={action.onClick}
          className="px-6 py-3 rounded-xl bg-gradient-admin text-white font-semibold shadow-glow-admin hover:opacity-90 transition-opacity"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {action.label}
        </motion.button>
      )}

      {/* Additional Context */}
      <motion.div
        className="mt-8 p-4 rounded-xl bg-bg-elevated border border-border-subtle max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-text-secondary">
              <strong className="text-text-primary">Why am I seeing this?</strong>
              <br />
              Admin dashboards only show anonymized, aggregated data. Data appears
              after students complete their check-ins and consent to data sharing.
              This typically takes 24-48 hours after initial student onboarding.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default AdminEmptyState;
