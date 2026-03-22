"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Hash,
  User,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle,
} from "lucide-react";
import type { Alert, AlertType } from "@/types/counselor";
import { RiskBadge } from "./RiskBadge";

interface ResolvedAlertCardProps {
  alert: Alert;
  index?: number;
}

const cardVariants = {
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

export function ResolvedAlertCard({ alert, index = 0 }: ResolvedAlertCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isRed = alert.tier === "RED";
  const isOrange = alert.tier === "ORANGE";
  const isYellow = alert.tier === "YELLOW";

  const getBorderColor = () => {
    if (isRed) return "border-l-gray-500";
    if (isOrange) return "border-l-gray-500";
    return "border-l-gray-500";
  };

  const getBadgeOpacity = () => {
    if (isRed) return "opacity-50";
    if (isOrange) return "opacity-50";
    return "opacity-50";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const calculateResolutionTime = () => {
    const created = new Date(alert.createdAt);
    const resolved = alert.resolvedAt ? new Date(alert.resolvedAt) : new Date(alert.createdAt);
    const diffMs = resolved.getTime() - created.getTime();
    const diffHours = Math.max(0, diffMs / 3600000);

    if (diffHours < 1) {
      const minutes = Math.round(diffHours * 60);
      return `${minutes}m`;
    }
    if (diffHours < 24) {
      return `${diffHours.toFixed(1)}h`;
    }
    const days = (diffHours / 24).toFixed(1);
    return `${days}d`;
  };

  const getTierBadgeConfig = () => {
    if (isRed) {
      return { label: "RED", color: "text-gray-400", bg: "bg-gray-500/20" };
    }
    if (isOrange) {
      return { label: "ORANGE", color: "text-gray-400", bg: "bg-gray-500/20" };
    }
    return { label: "YELLOW", color: "text-gray-400", bg: "bg-gray-500/20" };
  };

  const badge = getTierBadgeConfig();

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <div
        className={`p-5 rounded-2xl bg-bg-card border border-border-subtle ${getBorderColor()} border-l-4 opacity-75 hover:opacity-100 transition-all duration-300 cursor-pointer`}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.color} ${getBadgeOpacity()}`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {badge.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-success/20 text-success border border-success/30">
              <CheckCircle className="w-3.5 h-3.5" />
              Resolved
            </span>
          </div>

          <div className="flex items-center gap-2 text-text-muted">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">
                Resolved {formatTimeAgo(alert.resolvedAt || alert.createdAt)}
              </span>
            </div>
            <button
              className="p-1 rounded hover:bg-bg-elevated transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Student Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center border border-border-subtle">
            {alert.student.isAnonymous ? (
              <Hash className="w-4 h-4 text-text-muted" />
            ) : (
              <User className="w-4 h-4 text-text-muted" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {alert.student.isAnonymous
                ? alert.student.anonymousId
                : alert.student.name}
            </p>
            <p className="text-xs text-text-muted truncate">
              {alert.student.department || "Student"}
            </p>
          </div>
        </div>

        {/* Resolution Info */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-success">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                Resolved in {calculateResolutionTime()}
              </span>
            </div>
            {alert.actions.length > 0 && (
              <div className="flex items-center gap-1.5 text-text-muted">
                <FileText className="w-3.5 h-3.5" />
                <span className="text-xs">{alert.actions.length} actions</span>
              </div>
            )}
          </div>

          <p className="text-xs text-text-muted">
            {new Date(alert.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Expanded Detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 p-4 rounded-xl bg-bg-elevated border border-border-subtle overflow-hidden"
          >
            <div className="space-y-3">
              {/* Trigger Reason */}
              {alert.triggers.length > 0 && (
                <div>
                  <p className="text-xs text-text-muted mb-1">Trigger</p>
                  <p className="text-sm text-text-secondary">
                    {alert.triggers[0].description}
                  </p>
                </div>
              )}

              {/* Burnout Score */}
              <div>
                <p className="text-xs text-text-muted mb-1">Burnout Score</p>
                <p className="text-lg font-bold font-sora text-text-primary">
                  {Math.round(alert.riskIndicators.burnoutScore)}
                  <span className="text-sm text-text-muted font-normal">/100</span>
                </p>
              </div>

              {/* Actions Timeline */}
              {alert.actions.length > 0 && (
                <div>
                  <p className="text-xs text-text-muted mb-2">Actions Taken</p>
                  <div className="space-y-1">
                    {alert.actions.map((action, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                        <CheckCircle className="w-3 h-3 text-success" />
                        <span>{action.actionType.replace("_", " ")}</span>
                        <span className="text-text-muted">
                          {new Date(action.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Counselor Note Preview */}
              {alert.notes.length > 0 && (
                <div>
                  <p className="text-xs text-text-muted mb-1">Latest Note</p>
                  <blockquote className="text-sm text-text-secondary italic border-l-2 border-border-subtle pl-3 py-1">
                    {alert.notes[alert.notes.length - 1].content}
                  </blockquote>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ResolvedAlertCard;
