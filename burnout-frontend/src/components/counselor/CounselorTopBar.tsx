"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Bell, Menu, Shield, HeartHandshake } from "lucide-react";

interface CounselorTopBarProps {
  onMenuClick: () => void;
}

export function CounselorTopBar({ onMenuClick }: CounselorTopBarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-bg-surface/80 backdrop-blur-lg border-b border-border-subtle">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden sm:flex items-center gap-3">
            <motion.div
              className="w-8 h-8 rounded-lg bg-gradient-counselor flex items-center justify-center shadow-glow-counselor"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <HeartHandshake className="w-4 h-4 text-white" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold font-sora text-text-primary">
                Counselor Portal
              </h1>
              <p className="text-xs text-text-muted">
                Student Wellbeing Support System
              </p>
            </div>
          </div>
        </div>

        {/* Right: Status + User */}
        <div className="flex items-center gap-4">
          {/* Privacy Reminder */}
          <motion.div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-subtle"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Shield className="w-4 h-4 text-accent-counselor-light" />
            <span className="text-xs text-text-secondary">
              Privacy-First: Only view alerts, not student profiles
            </span>
          </motion.div>

          {/* User Avatar */}
          <div className="flex items-center gap-3 pl-4 border-l border-border-subtle">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-text-primary">
                {user?.name || "Counselor"}
              </p>
              <p className="text-xs text-text-muted">
                {user?.email || ""}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-counselor flex items-center justify-center shadow-glow-counselor">
              <Bell className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default CounselorTopBar;
