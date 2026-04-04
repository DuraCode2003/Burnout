"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Hash,
  User,
  ArrowRight,
  Clock,
  TrendingUp,
  Lock,
} from "lucide-react";
import type { Alert } from "@/types/counselor";

interface AlertCardProps {
  alert: Alert;
  index?: number;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.2 },
  },
};

const combinedVariants = {
  ...cardVariants,
};

export function AlertCard({ alert, index = 0, selectable = false, selected = false, onToggleSelect }: AlertCardProps) {
  const router = useRouter();

  const isRed = alert.tier === "RED";
  const isOrange = alert.tier === "ORANGE";
  const isYellow = alert.tier === "YELLOW";
  const isUrgent = alert.isUrgent || isRed;

  const getBorderColor = () => {
    if (isRed) return "border-l-danger";
    if (isOrange) return "border-l-[#f97316]";
    if (isYellow) return "border-l-[#eab308]";
    return "border-l-accent-counselor";
  };

  const getBgTint = () => {
    if (isRed) return "bg-danger/5";
    if (isOrange) return "bg-[#f97316]/5";
    if (isYellow) return "bg-[#eab308]/5";
    return "";
  };

  const getBadgeConfig = () => {
    if (isRed) {
      return {
        label: "URGENT",
        bgColor: "bg-danger",
        textColor: "text-white",
        icon: AlertTriangle,
      };
    }
    if (isOrange) {
      return {
        label: "PRIORITY",
        bgColor: "bg-[#f97316]",
        textColor: "text-white",
        icon: AlertTriangle,
      };
    }
    return {
      label: "MONITOR",
      bgColor: "bg-[#eab308]",
      textColor: "text-white",
      icon: TrendingUp,
    };
  };

  const getHeader = () => {
    if (isRed) return "Immediate attention required";
    if (isOrange) return "Consistent downward trend";
    return "Sub-baseline pattern detected";
  };

  const getActionButton = () => {
    if (isRed) {
      return {
        label: "Respond Now",
        bgColor: "bg-gradient-urgent",
        showIcon: true,
      };
    }
    return {
      label: "View Details",
      bgColor: "bg-bg-elevated",
      showIcon: true,
    };
  };

  const badge = getBadgeConfig();
  const actionButton = getActionButton();
  const BadgeIcon = badge.icon;

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

  const handleClick = () => {
    router.push(`/counselor/alert/${alert.id}`);
  };

  return (
    <motion.div
      variants={combinedVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={handleClick}
      className={`group relative p-5 rounded-2xl bg-bg-card ${getBgTint()} border ${getBorderColor()} border-l-4 border-border-subtle cursor-pointer transition-all duration-300 hover:border-opacity-50`}
      style={{
        animationDelay: `${index * 0.1}s`,
      }}
    >
      {/* Urgent Glow Overlay */}
      {isUrgent && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-danger/5 to-transparent pointer-events-none" />
      )}

      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {selectable && (
            <div 
              className="mr-1 mt-0.5"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleSelect) onToggleSelect(alert.id);
              }}
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selected ? 'bg-accent-counselor border-accent-counselor' : 'border-border-strong hover:border-accent-counselor'}`}>
                {selected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </div>
            </div>
          )}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${badge.bgColor} ${badge.textColor}`}
          >
            <BadgeIcon className="w-3.5 h-3.5" />
            {badge.label}
          </span>
          {alert.student.isAnonymous && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-bg-elevated text-text-muted border border-border-subtle">
              <Lock className="w-3 h-3" />
              Anonymous
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-text-muted">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs">{formatTimeAgo(alert.createdAt)}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-text-primary mb-1">
        {getHeader()}
      </h3>

      {/* Student Info */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-bg-elevated flex items-center justify-center border border-border-subtle">
          {alert.student.isAnonymous ? (
            <Hash className="w-4 h-4 text-text-muted" />
          ) : (
            <User className="w-4 h-4 text-accent-counselor-light" />
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

      {/* Trigger Reason */}
      {alert.triggers.length > 0 && (
        <div className="mb-3">
          <p className="text-sm text-text-secondary line-clamp-2">
            {alert.triggers[0].description}
          </p>
        </div>
      )}

      {/* Footer Row */}
      <div className="flex items-center justify-between pt-3 border-t border-border-subtle/50">
        <div className="flex items-center gap-3">
          {/* Burnout Score */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                alert.riskIndicators.burnoutScore >= 75
                  ? "bg-danger"
                  : alert.riskIndicators.burnoutScore >= 50
                  ? "bg-warning"
                  : "bg-success"
              }`}
            />
            <span className="text-xs text-text-secondary">Score:</span>
            <span
              className={`text-sm font-bold font-sora ${
                alert.riskIndicators.burnoutScore >= 75
                  ? "text-danger"
                  : alert.riskIndicators.burnoutScore >= 50
                  ? "text-warning"
                  : "text-success"
              }`}
            >
              {Math.round(alert.riskIndicators.burnoutScore)}
            </span>
          </div>

          {/* Mood Trend */}
          <div className="flex items-center gap-1.5">
            <TrendingUp
              className={`w-3.5 h-3.5 ${
                alert.riskIndicators.moodTrend === "declining"
                  ? "text-danger rotate-180"
                  : alert.riskIndicators.moodTrend === "improving"
                  ? "text-success"
                  : "text-text-muted"
              }`}
            />
            <span className="text-xs text-text-secondary capitalize">
              {alert.riskIndicators.moodTrend}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            isRed
              ? "bg-gradient-urgent text-white shadow-lg"
              : "bg-bg-elevated text-text-secondary group-hover:text-text-primary"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          {actionButton.label}
          {actionButton.showIcon && <ArrowRight className="w-3.5 h-3.5" />}
        </motion.button>
      </div>


    </motion.div>
  );
}

export default AlertCard;
