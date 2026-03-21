"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Hash, User } from "lucide-react";
import type { ResolvedAlert } from "@/types/counselor";
import { RiskBadge } from "./RiskBadge";

interface ResolvedAlertCardProps {
  alert: ResolvedAlert;
  index?: number;
}

export function ResolvedAlertCard({ alert, index = 0 }: ResolvedAlertCardProps) {
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

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01 }}
      className="group relative bg-bg-card rounded-2xl border border-border-subtle transition-all duration-300 hover:border-accent-counselor/30"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <RiskBadge tier={alert.tier} size="sm" />
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
              alert.resolutionType === "RESOLVED"
                ? "bg-success/10 text-success border border-success/30"
                : "bg-purple-500/10 text-purple-400 border border-purple-500/30"
            }`}>
              {alert.resolutionType === "RESOLVED" ? "Resolved" : "Escalated"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-text-muted">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs">
              {new Date(alert.resolvedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
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

        {/* Resolution Info */}
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {alert.daysOpen} {alert.daysOpen === 1 ? "day" : "days"} open
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-text-secondary">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">{alert.totalActions} actions</span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-text-muted mb-0.5">Resolved by</p>
            <p className="text-sm font-medium text-text-primary">
              {alert.resolvedByName}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ResolvedAlertCard;
