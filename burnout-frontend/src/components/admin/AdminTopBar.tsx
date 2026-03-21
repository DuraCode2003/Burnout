"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Menu,
  Shield,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";

interface AdminTopBarProps {
  onMenuClick: () => void;
}

export function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <motion.header
      className="sticky top-0 z-30 bg-bg-surface/80 backdrop-blur-xl border-b border-border-subtle"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Cyan glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-accent-admin-light via-accent-cyan to-accent-admin-light opacity-50" />

      <div className="flex items-center justify-between h-16 px-6">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <motion.div
              className="w-9 h-9 rounded-xl bg-gradient-admin flex items-center justify-center shadow-glow-admin"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            >
              <Shield className="w-5 h-5 text-white" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold font-sora text-text-primary">
                Burnout Tracker
              </h1>
              <p className="text-xs text-text-secondary">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Center: Admin Badge */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-bg-card border border-accent-admin/30">
          <Shield className="w-4 h-4 text-accent-admin-light" />
          <span className="text-sm font-semibold text-accent-admin-light">
            Admin Dashboard
          </span>
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-bg-card border border-border-subtle">
            <div className="w-8 h-8 rounded-full bg-gradient-admin flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary">
                {user?.name || "Admin User"}
              </span>
              <span className="text-xs text-accent-admin-light">
                Administrator
              </span>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <motion.div
                  className="absolute right-0 mt-2 w-48 rounded-xl bg-bg-card border border-border-subtle shadow-xl z-50 overflow-hidden"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-4 py-3 border-b border-border-subtle">
                    <p className="text-sm font-medium text-text-primary">
                      {user?.name || "Admin User"}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {user?.email || "admin@university.edu"}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-danger hover:bg-bg-elevated transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </motion.div>
              </>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-card border border-border-subtle text-text-secondary hover:text-danger hover:border-danger/50 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
}

export default AdminTopBar;
