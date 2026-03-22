"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Bell, ArrowRight } from "lucide-react";
import type { Alert } from "@/types/counselor";

interface UrgentAlertBannerProps {
  urgentAlerts: Alert[];
  onDismiss?: () => void;
  onViewUrgent?: () => void;
}

export function UrgentAlertBanner({
  urgentAlerts,
  onDismiss,
  onViewUrgent,
}: UrgentAlertBannerProps) {
  if (urgentAlerts.length === 0) return null;

  const count = urgentAlerts.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -20, height: 0 }}
      className="mb-6"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-urgent p-4 shadow-glow-urgent">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
          />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Bell className="w-6 h-6 text-white" />
            </motion.div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-5 h-5 text-white" />
                <h3 className="text-lg font-bold font-sora text-white">
                  {count} {count === 1 ? "Urgent Alert" : "Urgent Alerts"}
                </h3>
              </div>
              <p className="text-white/80 text-sm">
                {count === 1
                  ? "Immediate attention required"
                  : `${count} students need immediate support`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
              <span className="text-white/60 text-xs">Response SLA:</span>
              <span className="text-white font-bold text-sm">2 hours</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-danger font-semibold shadow-lg"
              onClick={() => {
                if (onViewUrgent) onViewUrgent();
              }}
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Progress Bar for Urgent Alerts */}
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-white/30"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 7200, ease: "linear" }} // 2 hours in seconds
        />
      </div>
    </motion.div>
  );
}

export default UrgentAlertBanner;
