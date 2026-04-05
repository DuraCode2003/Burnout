"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  History,
  HeartHandshake,
  X,
  LogOut,
  ArrowLeft,
  User,
  Shield,
} from "lucide-react";

interface CounselorSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoute: string;
  unreadCount?: number;
}

const navItems = [
  {
    label: "Alert Queue",
    href: "/counselor",
    icon: Bell,
    description: "Active alerts",
  },
  {
    label: "History",
    href: "/counselor/history",
    icon: History,
    description: "Resolved alerts",
  },
];

export function CounselorSidebar({
  isOpen,
  onClose,
  activeRoute,
  unreadCount = 0,
}: CounselorSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-bg-surface border-r border-border-subtle">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-counselor flex items-center justify-center shadow-glow-counselor"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <HeartHandshake className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-sm font-bold font-sora text-text-primary">
              Counselor Portal
            </h2>
            <p className="text-xs text-accent-counselor-light">
              Student Wellbeing Team
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.href;
          const hasBadge = item.href === "/counselor" && unreadCount > 0;

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-counselor text-white shadow-glow-counselor"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? "text-white" : "text-text-secondary group-hover:text-accent-counselor-light"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                  {isActive && (
                    <p className="text-xs text-white/80 truncate">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasBadge && unreadCount > 0 && (
                    <motion.span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        isActive
                          ? "bg-white text-accent-counselor"
                          : "bg-danger text-white"
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </motion.span>
                  )}
                  {isActive && (
                    <motion.div
                      className="w-2 h-2 rounded-full bg-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="px-4 py-4 border-t border-border-subtle">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-card border border-border-subtle mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-counselor flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {user?.name || "Counselor"}
            </p>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-accent-counselor-light" />
              <p className="text-xs text-accent-counselor-light">Counselor</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger hover:bg-bg-elevated transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.aside
              className="fixed left-0 top-0 h-full w-72 bg-bg-surface z-50 lg:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default CounselorSidebar;
