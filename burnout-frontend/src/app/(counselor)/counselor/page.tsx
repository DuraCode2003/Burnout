"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import counselorService from "@/services/counselorService";
import { UrgentAlertBanner } from "@/components/counselor/UrgentAlertBanner";
import { CounselorStatsBar } from "@/components/counselor/CounselorStatsBar";
import { AlertFilterTabs } from "@/components/counselor/AlertFilterTabs";
import { AlertQueue } from "@/components/counselor/AlertQueue";
import { CounselorResources } from "@/components/counselor/CounselorResources";
import { StudentRiskChart } from "@/components/counselor/StudentRiskChart";
import { RefreshCw, Filter } from "lucide-react";
import type { Alert, CounselorStats, AlertType } from "@/types/counselor";

export default function CounselorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<CounselorStats | null>(null);
  const [activeFilter, setActiveFilter] = useState<AlertType | "ALL">("ALL");
  const pathname = usePathname();

  // Fetch data
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [alertsData, statsData] = await Promise.all([
        counselorService.getActiveAlerts(),
        counselorService.getCounselorStats(),
      ]);

      setAlerts(alertsData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch counselor data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pathname]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Get urgent alerts (RED tier)
  const urgentAlerts = alerts.filter(
    (alert) => alert.tier === "RED" && alert.status === "ACTIVE"
  );

  // Get filter counts
  const filterCounts = {
    all: alerts.length,
    red: alerts.filter((a) => a.tier === "RED").length,
    orange: alerts.filter((a) => a.tier === "ORANGE").length,
    yellow: alerts.filter((a) => a.tier === "YELLOW").length,
  };

  const riskData = React.useMemo(() => [
    { level: 'High', count: filterCounts.red, color: '#ef4444' },
    { level: 'Medium', count: filterCounts.orange, color: '#f97316' },
    { level: 'Low', count: filterCounts.yellow, color: '#eab308' },
  ], [filterCounts]);

  return (
    <motion.div 
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-3xl font-bold font-sora text-text-primary">
            Alert Queue
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-text-secondary">
              {alerts.length} active alert{alerts.length !== 1 ? "s" : ""}
              {urgentAlerts.length > 0 && (
                <span className="text-danger ml-2 font-medium">
                  • {urgentAlerts.length} urgent
                </span>
              )}
            </span>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-1 text-sm text-accent-counselor-light hover:text-accent-counselor transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Urgent Alert Banner */}
      <AnimatePresence>
        {urgentAlerts.length > 0 && (
          <UrgentAlertBanner 
            urgentAlerts={urgentAlerts} 
            onViewUrgent={() => setActiveFilter("RED")} 
          />
        )}
      </AnimatePresence>

      {/* Stats Bar & Chart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CounselorStatsBar stats={stats} loading={loading} />
        </div>
        <div className="lg:col-span-1">
          <StudentRiskChart data={riskData} isLoading={loading} />
        </div>
      </div>

      {/* Filter Tabs */}
      <AlertFilterTabs
        activeFilter={activeFilter}
        onChange={setActiveFilter}
        counts={filterCounts}
      />

      {/* Alert Queue */}
      <AlertQueue
        alerts={alerts}
        filter={activeFilter}
        isLoading={loading}
        onAlertsResolved={() => fetchData(false)}
      />

      {/* Helpful Resources & FAQs */}
      {!loading && (
        <CounselorResources />
      )}

      {/* Footer Info */}
      {!loading && alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between pt-6 border-t border-border-subtle"
        >
          <p className="text-xs text-text-muted">
            Alerts are sorted by urgency (RED → ORANGE → YELLOW)
          </p>
          <p className="text-xs text-text-muted">
            Auto-refreshes every 60 seconds
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
