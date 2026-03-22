"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Phone,
  FileText,
  CheckCircle,
  ArrowUpCircle,
  Eye,
  Clock,
} from "lucide-react";
import type { Alert, AlertAction } from "@/types/counselor";

interface NoteHistoryProps {
  alert: Alert;
}

const actionConfig: Record<
  AlertAction["actionType"],
  {
    icon: React.ElementType;
    color: string;
    bg: string;
    label: string;
  }
> = {
  CONTACTED: {
    icon: Phone,
    color: "text-accent-counselor",
    bg: "bg-accent-counselor/10",
    label: "Contacted Student",
  },
  MESSAGE_SENT: {
    icon: FileText,
    color: "text-accent-counselor-light",
    bg: "bg-accent-counselor/10",
    label: "Message Sent",
  },
  ESCALATED: {
    icon: ArrowUpCircle,
    color: "text-warning",
    bg: "bg-warning/10",
    label: "Escalated",
  },
  RESOLVED: {
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
    label: "Resolved",
  },
  BOOKING_OFFERED: {
    icon: Clock,
    color: "text-text-secondary",
    bg: "bg-bg-elevated",
    label: "Booking Offered",
  },
};

export function NoteHistory({ alert }: NoteHistoryProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
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

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Build timeline entries from alert actions and notes
  const timelineEntries = React.useMemo(() => {
    const entries: Array<{
      id: string;
      type: "action" | "note" | "created";
      timestamp: string;
      title: string;
      description?: string;
      performer?: string;
    }> = [];

    // Alert created
    entries.push({
      id: "created",
      type: "created",
      timestamp: alert.createdAt,
      title: "Alert Created",
      description: `Alert automatically triggered based on detected patterns`,
    });

    // Actions
    alert.actions.forEach((action) => {
      const config = actionConfig[action.actionType];
      entries.push({
        id: action.id,
        type: "action",
        timestamp: action.timestamp,
        title: config.label,
        description: action.notes,
        performer: action.performedByName,
      });
    });

    // Sort by timestamp descending (newest first)
    return entries.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [alert]);

  if (timelineEntries.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-text-primary">
        Activity Timeline ({timelineEntries.length})
      </h4>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border-subtle" />

        {/* Timeline Entries */}
        <div className="space-y-4">
          {timelineEntries.map((entry, index) => {
            const Icon =
              entry.type === "created"
                ? Bell
                : actionConfig[entry.type === "action" ? alert.actions.find(a => a.id === entry.id)?.actionType || "CONTACTED" : "CONTACTED"].icon;
            const config =
              entry.type === "created"
                ? { color: "text-accent-counselor", bg: "bg-accent-counselor/10" }
                : actionConfig[entry.type === "action" ? alert.actions.find(a => a.id === entry.id)?.actionType || "CONTACTED" : "CONTACTED"];

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-10"
              >
                {/* Timeline Dot */}
                <div
                  className={`absolute left-2 w-5 h-5 rounded-full ${config.bg} border-2 border-bg-card flex items-center justify-center z-10`}
                >
                  <Icon className={`w-3 h-3 ${config.color}`} />
                </div>

                {/* Content */}
                <div className="p-3 rounded-lg bg-bg-elevated border border-border-subtle">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="text-sm font-medium text-text-primary">
                      {entry.title}
                    </h5>
                    <span
                      className="text-xs text-text-muted"
                      title={formatFullDate(entry.timestamp)}
                    >
                      {formatTimeAgo(entry.timestamp)}
                    </span>
                  </div>

                  {entry.description && (
                    <p className="text-xs text-text-secondary mt-1">
                      {entry.description}
                    </p>
                  )}

                  {entry.performer && (
                    <p className="text-xs text-text-muted mt-1">
                      by {entry.performer}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default NoteHistory;
