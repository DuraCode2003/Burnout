"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import adminService from "@/services/adminService";
import { AdminStatsCard } from "@/components/admin/AdminStatsCard";
import { RiskDistributionChart } from "@/components/admin/RiskDistributionChart";
import { WeeklyTrendChart } from "@/components/admin/WeeklyTrendChart";
import { DepartmentRiskTable } from "@/components/admin/DepartmentRiskTable";
import { CheckinRateChart } from "@/components/admin/CheckinRateChart";
import { ExportButton } from "@/components/admin/ExportButton";
import {
  Users,
  Activity,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Clock,
} from "lucide-react";
import {
  CampusStats,
  RiskDistribution,
  WeeklyTrend,
  DailyCheckin,
  DepartmentStats,
} from "@/types/admin";

interface SectionError {
  stats?: boolean;
  riskDistribution?: boolean;
  weeklyTrends?: boolean;
  checkinRates?: boolean;
  departments?: boolean;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState<SectionError>({});
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Data states
  const [campusStats, setCampusStats] = useState<CampusStats | null>(null);
  const [riskDistribution, setRiskDistribution] = useState<RiskDistribution | null>(null);
  const [weeklyTrends, setWeeklyTrends] = useState<WeeklyTrend[]>([]);
  const [checkinRates, setCheckinRates] = useState<DailyCheckin[]>([]);
  const [departments, setDepartments] = useState<DepartmentStats[]>([]);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrors({});

      const [stats, risk, trends, rates, depts] = await Promise.allSettled([
        adminService.getCampusStats(),
        adminService.getRiskDistribution(),
        adminService.getWeeklyTrends(8),
        adminService.getCheckinRates(),
        adminService.getDepartmentStats(),
      ]);

      // Process results
      if (stats.status === "fulfilled") {
        setCampusStats(stats.value);
      } else {
        setErrors((prev) => ({ ...prev, stats: true }));
      }

      if (risk.status === "fulfilled") {
        setRiskDistribution(risk.value);
      } else {
        setErrors((prev) => ({ ...prev, riskDistribution: true }));
      }

      if (trends.status === "fulfilled") {
        setWeeklyTrends(trends.value);
      } else {
        setErrors((prev) => ({ ...prev, weeklyTrends: true }));
      }

      if (rates.status === "fulfilled") {
        setCheckinRates(rates.value);
      } else {
        setErrors((prev) => ({ ...prev, checkinRates: true }));
      }

      if (depts.status === "fulfilled") {
        setDepartments(depts.value);
      } else {
        setErrors((prev) => ({ ...prev, departments: true }));
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchData]);

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="w-64 h-8 rounded-lg bg-bg-elevated animate-shimmer" />
            <div className="w-40 h-4 rounded bg-bg-elevated animate-shimmer" />
          </div>
          <div className="w-32 h-10 rounded-xl bg-bg-elevated animate-shimmer" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-2xl bg-bg-card animate-shimmer"
            />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-2xl bg-bg-card animate-shimmer" />
          <div className="h-80 rounded-2xl bg-bg-card animate-shimmer" />
        </div>

        {/* Table Skeleton */}
        <div className="h-64 rounded-2xl bg-bg-card animate-shimmer" />

        {/* Checkin Chart Skeleton */}
        <div className="h-72 rounded-2xl bg-bg-card animate-shimmer" />
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
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-3xl font-bold font-sora text-text-primary">
            Campus Wellbeing Overview
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-4 h-4 text-text-muted" />
            <span className="text-sm text-text-secondary">
              Last updated: {getTimeAgo(lastUpdated)}
            </span>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-1 text-sm text-accent-admin-light hover:text-accent-cyan transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
        <ExportButton 
          format="csv" 
          onExport={async () => {
            try {
              await adminService.exportCSV();
            } catch (error) {
              console.error("Export failed:", error);
            }
          }} 
        />
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <AdminStatsCard
          label="Total Students"
          value={campusStats?.totalStudents ?? 0}
          icon={Users}
          accentColor="blue"
          trend={
            campusStats?.trendVsLastWeek
              ? {
                  value: campusStats.trendVsLastWeek,
                  label: "vs last week",
                  isPositive: campusStats.trendVsLastWeek > 0,
                }
              : undefined
          }
        />

        <AdminStatsCard
          label="Active This Week"
          value={campusStats?.activeThisWeek ?? 0}
          subValue={`${campusStats?.checkinRatePercent.toFixed(1)}% participation`}
          icon={Activity}
          accentColor="cyan"
        />

        <AdminStatsCard
          label="Avg Burnout Score"
          value={campusStats?.avgBurnoutScore ?? 0}
          icon={TrendingUp}
          accentColor="amber"
          suffix="/100"
        />

        <AdminStatsCard
          label="High Risk Count"
          value={campusStats?.highRiskCount ?? 0}
          subValue={`${campusStats?.mediumRiskCount} medium, ${campusStats?.lowRiskCount} low`}
          icon={AlertTriangle}
          accentColor="red"
        />
      </motion.div>

      {/* Risk Distribution + Weekly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {riskDistribution && !errors.riskDistribution ? (
          <RiskDistributionChart
            high={riskDistribution.high}
            medium={riskDistribution.medium}
            low={riskDistribution.low}
            highPercent={riskDistribution.highPercent}
            mediumPercent={riskDistribution.mediumPercent}
            lowPercent={riskDistribution.lowPercent}
          />
        ) : (
          <div className="h-80 rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-center">
            <p className="text-text-secondary">Failed to load risk distribution</p>
          </div>
        )}

        {weeklyTrends.length > 0 && !errors.weeklyTrends ? (
          <WeeklyTrendChart data={weeklyTrends} />
        ) : (
          <div className="h-80 rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-center">
            <p className="text-text-secondary">Failed to load weekly trends</p>
          </div>
        )}
      </div>

      {/* Department Table */}
      {departments.length > 0 && !errors.departments ? (
        <DepartmentRiskTable departments={departments} />
      ) : (
        !errors.departments && (
          <div className="h-64 rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-center">
            <p className="text-text-secondary">No department data available</p>
          </div>
        )
      )}

      {/* Check-in Rate Chart */}
      {checkinRates.length > 0 && !errors.checkinRates ? (
        <CheckinRateChart data={checkinRates} />
      ) : (
        <div className="h-72 rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-center">
          <p className="text-text-secondary">Failed to load check-in rates</p>
        </div>
      )}
    </div>
  );
}
