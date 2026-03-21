"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import counselorService from "@/services/counselorService";
import { ResolvedAlertCard } from "@/components/counselor/ResolvedAlertCard";
import { History, RefreshCw, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import type { ResolvedAlert } from "@/types/counselor";

export default function CounselorHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<ResolvedAlert[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 20;

  const fetchAlerts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await counselorService.getResolvedAlerts(page, limit);
      setAlerts(data.alerts);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch resolved alerts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="w-48 h-8 rounded-lg bg-bg-elevated animate-shimmer" />
            <div className="w-32 h-4 rounded bg-bg-elevated animate-shimmer" />
          </div>
          <div className="w-32 h-10 rounded-xl bg-bg-elevated animate-shimmer" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-bg-card animate-shimmer" />
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
            Resolved Alerts
          </h1>
          <p className="text-text-secondary mt-1">
            {total} alerts resolved • Page {page} of {totalPages}
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

      {/* Alerts Grid */}
      {alerts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alerts.map((alert, index) => (
              <ResolvedAlertCard key={alert.id} alert={alert} index={index} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 pt-6"
            >
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-xl font-medium transition-colors ${
                        page === pageNum
                          ? "bg-gradient-counselor text-white shadow-glow-counselor"
                          : "bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-sm font-medium">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
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
          <p className="text-text-secondary">
            Resolved alerts will appear here
          </p>
        </motion.div>
      )}
    </div>
  );
}
