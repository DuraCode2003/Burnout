"use client";

import React from "react";
import { motion } from "framer-motion";

interface AdminSkeletonCardProps {
  variant?: "default" | "wide" | "tall";
}

export function AdminSkeletonCard({
  variant = "default",
}: AdminSkeletonCardProps) {
  const heightClass =
    variant === "tall" ? "h-56" : variant === "wide" ? "h-40" : "h-40";

  return (
    <motion.div
      className={`relative p-6 bg-bg-card rounded-2xl border border-border-subtle overflow-hidden ${heightClass}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 shimmer-animation">
          <div
            className="w-full h-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(26,34,53,0) 0%, rgba(31,41,64,0.5) 50%, rgba(26,34,53,0) 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
        </div>
      </div>

      <div className="relative space-y-4">
        {/* Icon placeholder */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-bg-elevated" />
          <div className="w-16 h-6 rounded-full bg-bg-elevated" />
        </div>

        {/* Value placeholder */}
        <div className="space-y-2">
          <div className="w-24 h-8 rounded bg-bg-elevated" />
          <div className="w-32 h-4 rounded bg-bg-elevated" />
        </div>

        {/* Trend placeholder */}
        <div className="w-20 h-5 rounded bg-bg-elevated" />
      </div>
    </motion.div>
  );
}

export function AdminChartSkeleton() {
  return (
    <motion.div
      className="card-glow-admin p-6 bg-bg-card rounded-2xl border border-border-subtle overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="w-40 h-5 rounded bg-bg-elevated" />
          <div className="w-32 h-4 rounded bg-bg-elevated" />
        </div>
        <div className="w-24 h-8 rounded-lg bg-bg-elevated" />
      </div>

      {/* Chart area skeleton */}
      <div className="w-full h-64 rounded-xl bg-bg-elevated" />
    </motion.div>
  );
}

export function AdminTableSkeleton() {
  return (
    <motion.div
      className="card-glow-admin p-6 bg-bg-card rounded-2xl border border-border-subtle overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="w-48 h-5 rounded bg-bg-elevated" />
      </div>

      {/* Table skeleton */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-12 rounded-lg bg-bg-elevated"
            style={{
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="w-64 h-8 rounded-lg bg-bg-elevated" />
          <div className="w-40 h-4 rounded bg-bg-elevated" />
        </div>
        <div className="w-32 h-10 rounded-xl bg-bg-elevated" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <AdminSkeletonCard key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminChartSkeleton />
        <AdminChartSkeleton />
      </div>

      {/* Table */}
      <AdminTableSkeleton />

      {/* Checkin chart */}
      <AdminChartSkeleton />
    </div>
  );
}

export default AdminSkeletonCard;
