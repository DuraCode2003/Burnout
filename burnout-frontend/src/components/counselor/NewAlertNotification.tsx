"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Bell, X, ArrowRight } from "lucide-react";
import type { Alert } from "@/types/counselor";

interface NewAlertNotificationProps {
  alert: Alert;
  onDismiss: () => void;
  onClick: () => void;
}

const slideInVariants = {
  hidden: {
    opacity: 0,
    x: 400,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    x: 400,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
};

export function NewAlertNotification({
  alert,
  onDismiss,
  onClick,
}: NewAlertNotificationProps) {
  const isRed = alert.tier === "RED";
  const isOrange = alert.tier === "ORANGE";
  const isYellow = alert.tier === "YELLOW";

  // Auto-dismiss for non-RED alerts after 10 seconds
  useEffect(() => {
    if (!isRed) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isRed, onDismiss]);

  const getBorderColor = () => {
    if (isRed) return "border-danger";
    if (isOrange) return "border-[#f97316]";
    return "border-[#eab308]";
  };

  const getBgGradient = () => {
    if (isRed) return "from-danger/10 to-danger/5";
    if (isOrange) return "from-[#f97316]/10 to-[#f97316]/5";
    return "from-[#eab308]/10 to-[#eab308]/5";
  };

  const getHeading = () => {
    if (isRed) return "New Urgent Alert";
    if (isOrange) return "New Priority Alert";
    return "New Alert";
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={slideInVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed top-4 right-4 z-50 w-full max-w-md"
      >
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${getBgGradient()} border-l-4 ${getBorderColor()} border border-border-subtle shadow-2xl backdrop-blur-lg cursor-pointer`}
          onClick={onClick}
        >
          {/* Animated Background Pattern */}
          {isRed && (
            <motion.div
              className="absolute inset-0 opacity-5"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear",
              }}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ef4444' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          )}

          {/* Content */}
          <div className="relative p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isRed
                      ? "bg-danger/20"
                      : isOrange
                      ? "bg-[#f97316]/20"
                      : "bg-[#eab308]/20"
                  }`}
                >
                  <Bell
                    className={`w-4 h-4 ${
                      isRed
                        ? "text-danger"
                        : isOrange
                        ? "text-[#f97316]"
                        : "text-[#eab308]"
                    }`}
                  />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary">{getHeading()}</h4>
                  <p className="text-xs text-text-muted">
                    {isRed
                      ? "Immediate attention required"
                      : isOrange
                      ? "Needs attention soon"
                      : "Monitoring recommended"}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Student Info */}
            <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-bg-card/50 border border-border-subtle">
              <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center border border-border-subtle">
                <span className="text-sm font-bold text-text-muted">
                  {alert.student.anonymousId.replace("Student #", "#")}
                </span>
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
              {isRed && (
                <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0" />
              )}
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-muted">
                Triggered {new Date(alert.createdAt).toLocaleTimeString()}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isRed
                    ? "bg-danger text-white hover:bg-danger/90"
                    : isOrange
                    ? "bg-[#f97316] text-white hover:bg-[#f97316]/90"
                    : "bg-[#eab308] text-white hover:bg-[#eab308]/90"
                }`}
              >
                <span>View Alert</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Progress Bar for Auto-dismiss (non-RED only) */}
          {!isRed && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 10, ease: "linear" }}
            />
          )}

          {/* RED Alert: No Auto-dismiss Notice */}
          {isRed && (
            <div className="absolute bottom-2 right-4 flex items-center gap-1 text-xs text-danger/60">
              <AlertTriangle className="w-3 h-3" />
              <span>Manual dismiss required</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default NewAlertNotification;
