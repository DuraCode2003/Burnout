"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import adminService from "@/services/adminService";
import { DepartmentCard } from "@/components/admin/DepartmentCard";
import { DepartmentComparisonChart } from "@/components/admin/DepartmentComparisonChart";
import { DepartmentHeatmap } from "@/components/admin/DepartmentHeatmap";
import { SortControls, SortKey, SortOrder } from "@/components/admin/SortControls";
import { Search, Filter, AlertTriangle } from "lucide-react";
import { DepartmentStats, HeatmapDataPoint } from "@/types/admin";

export default function DepartmentsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<DepartmentStats[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("risk");
  const [order, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [depts, heatmap] = await Promise.all([
          adminService.getDepartmentStats(),
          adminService.getHeatmapData(),
        ]);

        setDepartments(depts);
        setHeatmapData(heatmap);
      } catch (err) {
        console.error("Failed to fetch department data:", err);
        setError("Failed to load department data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort departments
  const filteredAndSortedDepartments = useMemo(() => {
    let filtered = departments.filter((dept) =>
      dept.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "risk":
          const riskOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
          comparison = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
          break;
        case "students":
          comparison = a.studentCount - b.studentCount;
          break;
        case "score":
          comparison = a.avgBurnoutScore - b.avgBurnoutScore;
          break;
      }

      return order === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [departments, searchQuery, sortBy, order]);

  // Calculate campus average
  const campusAverage = useMemo(() => {
    if (departments.length === 0) return 0;
    return (
      departments.reduce((sum, d) => sum + d.avgBurnoutScore, 0) /
      departments.length
    );
  }, [departments]);

  // High risk departments count
  const highRiskCount = useMemo(() => {
    return departments.filter((d) => d.riskLevel === "HIGH").length;
  }, [departments]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="w-64 h-8 rounded-lg bg-bg-elevated animate-shimmer" />
            <div className="w-40 h-4 rounded bg-bg-elevated animate-shimmer" />
          </div>
          <div className="w-48 h-10 rounded-xl bg-bg-elevated animate-shimmer" />
        </div>

        {/* Sort Controls Skeleton */}
        <div className="w-80 h-10 rounded-xl bg-bg-elevated animate-shimmer" />

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-bg-card animate-shimmer"
            />
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="h-[400px] rounded-2xl bg-bg-card animate-shimmer" />

        {/* Heatmap Skeleton */}
        <div className="h-96 rounded-2xl bg-bg-card animate-shimmer" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AlertTriangle className="w-16 h-16 text-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Failed to Load Data
          </h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl bg-gradient-admin text-white font-semibold shadow-glow-admin hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  if (departments.length < 2) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Filter className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Insufficient Data
          </h2>
          <p className="text-text-secondary">
            At least 2 departments with data are required to display analytics.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-3xl font-bold font-sora text-text-primary">
            Department Breakdown
          </h1>
          <p className="text-text-secondary mt-1">
            Compare wellbeing metrics across departments
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-10 pr-4 py-2.5 rounded-xl bg-bg-card border border-border-subtle text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-admin focus:ring-1 focus:ring-accent-admin transition-all"
          />
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle">
          <p className="text-sm text-text-secondary mb-1">Departments</p>
          <p className="text-2xl font-bold font-sora text-text-primary">
            {departments.length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle">
          <p className="text-sm text-text-secondary mb-1">Total Students</p>
          <p className="text-2xl font-bold font-sora text-text-primary">
            {departments.reduce((sum, d) => sum + d.studentCount, 0).toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-bg-card border border-border-subtle">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm text-text-secondary">High Risk Depts</p>
            {highRiskCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-danger/15 text-danger text-xs font-semibold">
                Attention
              </span>
            )}
          </div>
          <p className="text-2xl font-bold font-sora text-danger">
            {highRiskCount}
          </p>
        </div>
      </motion.div>

      {/* Sort Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <SortControls
          sortBy={sortBy}
          order={order}
          onChange={(key, newOrder) => {
            setSortBy(key);
            setSortOrder(newOrder);
          }}
        />
      </motion.div>

      {/* Department Cards Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {filteredAndSortedDepartments.map((dept, index) => (
          <motion.div
            key={dept.department}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <DepartmentCard department={dept} />
          </motion.div>
        ))}
      </motion.div>

      {filteredAndSortedDepartments.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Search className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary">
            No departments match your search
          </p>
        </motion.div>
      )}

      {/* Comparison Chart */}
      <DepartmentComparisonChart
        departments={departments}
        campusAverage={campusAverage}
      />

      {/* Heatmap */}
      {heatmapData.length > 0 && (
        <DepartmentHeatmap data={heatmapData} />
      )}
    </div>
  );
}
