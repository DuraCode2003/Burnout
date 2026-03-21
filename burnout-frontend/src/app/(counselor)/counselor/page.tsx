"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import counselorService from "@/services/counselorService";
import { CounselorStatsBar } from "@/components/counselor/CounselorStatsBar";
import { AlertCard } from "@/components/counselor/AlertCard";
import { RiskBadge } from "@/components/counselor/RiskBadge";
import { AlertFilters, AlertSort, AlertTier, AlertStatus } from "@/types/counselor";
import { CounselorStats as CounselorStatsType } from "@/types/counselor";
import {
  Filter,
  RefreshCw,
  AlertTriangle,
  Inbox,
  Clock,
  TrendingUp,
} from "lucide-react";
import type { Alert } from "@/types/counselor";

export default function CounselorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<CounselorStatsType | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filters, setFilters] = useState<AlertFilters>({});
  const [sort, setSort] = useState<AlertSort>({ field: "createdAt", order: "desc" });
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [statsData, alertsData] = await Promise.all([
        counselorService.getStats(),
        counselorService.getAlerts(filters, sort),
      ]);

      setStats(statsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error("Failed to fetch counselor data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const toggleTierFilter = (tier: AlertTier) => {
    setFilters((prev) => {
      const current = prev.tier || [];
      const updated = current.includes(tier)
        ? current.filter((t) => t !== tier)
        : [...current, tier];
      return { ...prev, tier: updated.length > 0 ? updated : undefined };
    });
  };

  const clearFilters = () => {
    setFilters({});
    setSort({ field: "createdAt", order: "desc" });
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="w-64 h-8 rounded-lg bg-bg-elevated animate-shimmer" />
            <div className="w-40 h-4 rounded bg-bg-elevated animate-shimmer" />
          </div>
          <div className="w-32 h-10 rounded-xl bg-bg-elevated animate-shimmer" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-bg-card animate-shimmer" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-bg-card animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold font-sora text-text-primary">
            Alert Queue
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-4 h-4 text-text-muted" />
            <span className="text-sm text-text-secondary">
              {stats?.queue.total ?? 0} active alerts
              {stats?.queue.urgent ? (
                <span className="text-danger ml-2 font-medium">
                  • {stats.queue.urgent} urgent
                </span>
              ) : null}
            </span>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-1 text-sm text-accent-counselor-light hover:text-accent-counselor transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
            showFilters || hasActiveFilters
              ? "bg-accent-counselor/10 border-accent-counselor/30 text-accent-counselor-light"
              : "bg-bg-elevated border-border-subtle text-text-secondary hover:text-text-primary"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-accent-counselor" />
          )}
        </button>
      </motion.div>

      {/* Stats Bar */}
      <CounselorStatsBar stats={stats} loading={loading} />

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 rounded-2xl bg-bg-card border border-border-subtle"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Filter Alerts</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-accent-counselor-light hover:text-accent-counselor"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-text-secondary">Tier:</span>
            {(["RED", "ORANGE", "YELLOW"] as AlertTier[]).map((tier) => (
              <button
                key={tier}
                onClick={() => toggleTierFilter(tier)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filters.tier?.includes(tier)
                    ? "bg-accent-counselor/20 text-accent-counselor-light border border-accent-counselor/30"
                    : "bg-bg-elevated text-text-secondary border border-border-subtle hover:border-border-default"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Alerts Grid */}
      {alerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((alert, index) => (
            <AlertCard key={alert.id} alert={alert} index={index} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-bg-elevated flex items-center justify-center border border-border-subtle">
            <Inbox className="w-10 h-10 text-text-muted" />
          </div>
          <h3 className="text-xl font-bold font-sora text-text-primary mb-2">
            All Caught Up!
          </h3>
          <p className="text-text-secondary mb-6">
            {hasActiveFilters
              ? "No alerts match your current filters"
              : "No active alerts requiring attention"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-6 py-2 rounded-xl bg-gradient-counselor text-white font-medium shadow-glow-counselor hover:opacity-90 transition-opacity"
            >
              Clear Filters
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
