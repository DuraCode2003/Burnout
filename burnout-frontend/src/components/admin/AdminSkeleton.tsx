"use client";

import React from "react";
import { motion } from "framer-motion";

export function AdminStatsSkeleton() {
  return (
    <motion.div
      className="card-glow-admin p-6 bg-bg-card rounded-2xl border border-border-subtle"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-bg-elevated animate-shimmer" />
        <div className="w-16 h-6 rounded-full bg-bg-elevated animate-shimmer" />
      </div>
      <div className="space-y-2">
        <div className="w-24 h-8 rounded bg-bg-elevated animate-shimmer" />
        <div className="w-32 h-4 rounded bg-bg-elevated animate-shimmer" />
      </div>
    </motion.div>
  );
}

export function ChartSkeleton() {
  return (
    <motion.div
      className="card-glow-admin p-6 bg-bg-card rounded-2xl border border-border-subtle"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="w-48 h-6 rounded bg-bg-elevated animate-shimmer mb-4" />
      <div className="w-full h-64 rounded bg-bg-elevated animate-shimmer" />
    </motion.div>
  );
}

export function TableSkeleton() {
  return (
    <motion.div
      className="card-glow-admin p-6 bg-bg-card rounded-2xl border border-border-subtle"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="w-48 h-6 rounded bg-bg-elevated animate-shimmer mb-4" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 rounded bg-bg-elevated animate-shimmer" />
        ))}
      </div>
    </motion.div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <AdminStatsSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <TableSkeleton />
    </div>
  );
}

export default AdminDashboardSkeleton;
