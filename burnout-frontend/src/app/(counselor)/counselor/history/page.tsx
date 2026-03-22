"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { History, RefreshCw, Inbox } from "lucide-react";
import counselorService from "@/services/counselorService";
import { HistoryFilterBar, HistoryPeriod } from "@/components/counselor/HistoryFilterBar";
import { ResolutionStats } from "@/components/counselor/ResolutionStats";
import { ResolvedAlertCard } from "@/components/counselor/ResolvedAlertCard";
import { PaginationControls } from "@/components/counselor/PaginationControls";
import type { Alert, AlertType, PaginatedResponse } from "@/types/counselor";

interface ResolutionStatsData {
  totalResolved: number;
  avgResolutionHours: number;
  redResolved: number;
  orangeResolved: number;
  yellowResolved: number;
  fastestResolutionHours: number;
  slowestResolutionHours: number;
  thisWeekCount: number;
  lastWeekCount: number;
}

export default function CounselorHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [period, setPeriod] = useState<HistoryPeriod>("ALL");
  const [alertTypeFilter, setAlertTypeFilter] = useState<AlertType | "ALL">("ALL");
  const [stats, setStats] = useState<ResolutionStatsData | null>(null);

  const pageSize = 20;

  // Fetch resolved alerts
  const fetchAlerts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await counselorService.getResolvedAlerts(
        currentPage - 1,
        pageSize
      );

      setAlerts(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.total || 0);

      // Calculate stats from the alerts
      calculateStats(response.content || []);
    } catch (error) {
      console.error("Failed to fetch resolved alerts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Calculate stats from alerts
  const calculateStats = (alerts: Alert[]) => {
    const totalResolved = alerts.length;
    const redResolved = alerts.filter((a) => a.tier === "RED").length;
    const orangeResolved = alerts.filter((a) => a.tier === "ORANGE").length;
    const yellowResolved = alerts.filter((a) => a.tier === "YELLOW").length;

    // Calculate average resolution time
    let totalHours = 0;
    let minHours = Infinity;
    let maxHours = 0;

    alerts.forEach((alert) => {
      const created = new Date(alert.createdAt);
      const resolved = alert.resolvedAt ? new Date(alert.resolvedAt) : new Date(alert.createdAt); // use resolvedAt instead of updatedAt
      const hours = (resolved.getTime() - created.getTime()) / 3600000;

      totalHours += hours;
      if (hours < minHours) minHours = hours;
      if (hours > maxHours) maxHours = hours;
    });

    const avgHours = totalResolved > 0 ? totalHours / totalResolved : 0;

    // Mock week comparison (in real app, fetch from API)
    const thisWeekCount = Math.floor(totalResolved * 0.4);
    const lastWeekCount = Math.floor(totalResolved * 0.3);

    setStats({
      totalResolved,
      avgResolutionHours: avgHours,
      redResolved,
      orangeResolved,
      yellowResolved,
      fastestResolutionHours: minHours === Infinity ? 0 : minHours,
      slowestResolutionHours: maxHours,
      thisWeekCount,
      lastWeekCount,
    });
  };

  // Filter alerts by type
  const filteredAlerts = alertTypeFilter === "ALL"
    ? alerts
    : alerts.filter((a) => a.tier === alertTypeFilter);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
            Alert History
          </h1>
          <p className="text-text-secondary mt-1">
            Review and track resolved alerts
          </p>
        </div>
        <button
          onClick={() => fetchAlerts(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </motion.div>

      {/* Filter Bar */}
      <HistoryFilterBar
        period={period}
        onPeriodChange={setPeriod}
        alertTypeFilter={alertTypeFilter}
        onAlertTypeChange={setAlertTypeFilter}
        resultsCount={filteredAlerts.length}
      />

      {/* Resolution Stats */}
      <ResolutionStats stats={stats} loading={loading} />

      {/* Alerts List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-bg-card animate-shimmer" />
          ))}
        </div>
      ) : filteredAlerts.length > 0 ? (
        <>
          <div className="space-y-4">
            {filteredAlerts.map((alert, index) => (
              <ResolvedAlertCard key={alert.id} alert={alert} index={index} />
            ))}
          </div>

          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onChange={handlePageChange}
          />
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-bg-elevated flex items-center justify-center border border-border-subtle">
            <History className="w-10 h-10 text-text-muted" />
          </div>
          <h3 className="text-xl font-bold font-sora text-text-primary mb-2">
            No Resolved Alerts
          </h3>
          <p className="text-text-secondary max-w-md mx-auto">
            {alertTypeFilter === "ALL"
              ? "No resolved alerts yet. Alerts you resolve will appear here for future reference."
              : `No resolved ${alertTypeFilter} alerts in this period.`}
          </p>
        </motion.div>
      )}

      {/* Footer Info */}
      {!loading && alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-xs text-text-muted pt-6 border-t border-border-subtle"
        >
          <span>Click any alert to expand details</span>
          <span>•</span>
          <span>Sorted by resolution date (newest first)</span>
        </motion.div>
      )}
    </div>
  );
}
