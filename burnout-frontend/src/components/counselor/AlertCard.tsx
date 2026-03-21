"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, User, Hash } from "lucide-react";
import type { Alert } from "@/types/counselor";
import { RiskBadge } from "./RiskBadge";

interface AlertCardProps {
  alert: Alert;
  index?: number;
}

export function AlertCard({ alert, index = 0 }: AlertCardProps) {
  const isUrgent = alert.isUrgent || alert.tier === "RED";
  const isOverdue = alert.responseTimeRemaining !== undefined && alert.responseTimeRemaining < 0;
  const isAssignedToMe = alert.assignedTo;

  const getTimeRemaining = () => {
    if (alert.responseTimeRemaining === undefined) return null;
    if (alert.responseTimeRemaining < 0) {
      return { text: "Overdue", color: "text-danger" };
    }
    const hours = Math.floor(alert.responseTimeRemaining / 3600);
    const minutes = Math.floor((alert.responseTimeRemaining % 3600) / 60);
    if (hours > 0) {
      return { text: `${hours}h ${minutes}m`, color: hours < 1 ? "text-warning" : "text-text-secondary" };
    }
    return { text: `${minutes}m`, color: "text-warning" };
  };

  const timeRemaining = getTimeRemaining();

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: index * 0.05,
      },
    },
  };

  const getGlowClass = () => {
    if (isUrgent) return "card-glow-urgent";
    if (alert.tier === "ORANGE") return "card-glow-orange";
    if (alert.tier === "YELLOW") return "card-glow-yellow";
    return "card-glow-counselor";
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01 }}
      className={`group relative bg-bg-card rounded-2xl border transition-all duration-300 ${getGlowClass()} ${
        isUrgent ? "border-danger/30" : "border-border-subtle"
      }`}
    >
      <Link href={`/counselor/alert/${alert.id}`} className="block p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <RiskBadge tier={alert.tier} pulsing={isUrgent} />
            
            {alert.status === "ESCALATED" && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                Escalated
              </span>
            )}
            
            {isAssignedToMe && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-accent-counselor/10 text-accent-counselor border border-accent-counselor/30">
                Assigned
              </span>
            )}
          </div>

          {timeRemaining && (
            <div className={`flex items-center gap-1.5 ${timeRemaining.color}`}>
              <Clock className="w-4 h-4" />
              <span className="text-sm font-semibold">{timeRemaining.text}</span>
            </div>
          )}
        </div>

        {/* Student Info */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center border border-border-subtle">
            {alert.student.isAnonymous ? (
              <Hash className="w-5 h-5 text-text-muted" />
            ) : (
              <User className="w-5 h-5 text-accent-counselor-light" />
            )}
          </div>
          <div>
            <p className="font-medium text-text-primary">
              {alert.student.isAnonymous
                ? alert.student.anonymousId
                : alert.student.name}
            </p>
            <p className="text-sm text-text-muted">
              {alert.student.department || "Student"}
            </p>
          </div>
        </div>

        {/* Triggers */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {alert.triggers.slice(0, 3).map((trigger, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs rounded-lg bg-bg-elevated border border-border-subtle text-text-secondary"
              >
                {trigger.description}
              </span>
            ))}
            {alert.triggers.length > 3 && (
              <span className="px-2.5 py-1 text-xs rounded-lg bg-bg-elevated border border-border-subtle text-text-muted">
                +{alert.triggers.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Risk Indicators Summary */}
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-text-muted mb-0.5">Burnout Score</p>
              <p className={`text-lg font-bold font-sora ${
                alert.riskIndicators.burnoutScore >= 75
                  ? "text-danger"
                  : alert.riskIndicators.burnoutScore >= 50
                  ? "text-warning"
                  : "text-success"
              }`}>
                {alert.riskIndicators.burnoutScore}
                <span className="text-sm text-text-muted font-normal">/100</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-0.5">Mood Trend</p>
              <p className={`text-sm font-medium ${
                alert.riskIndicators.moodTrend === "declining"
                  ? "text-danger"
                  : alert.riskIndicators.moodTrend === "improving"
                  ? "text-success"
                  : "text-text-secondary"
              }`}>
                {alert.riskIndicators.moodTrend.charAt(0).toUpperCase() +
                  alert.riskIndicators.moodTrend.slice(1)}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-text-muted mb-0.5">Created</p>
            <p className="text-sm text-text-secondary">
              {new Date(alert.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </Link>

      {/* Urgent Overlay */}
      {isOverdue && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-danger pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute top-4 right-4 flex items-center gap-1.5 text-danger">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-bold">OVERDUE</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default AlertCard;
