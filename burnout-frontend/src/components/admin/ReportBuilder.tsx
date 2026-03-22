"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Filter, ChevronRight, Clock } from "lucide-react";

export type Granularity = "daily" | "weekly" | "monthly";

export interface ReportConfig {
  dateFrom: string;
  dateTo: string;
  departments: string[];
  metrics: string[];
  granularity: Granularity;
}

interface ReportBuilderProps {
  onGenerate: (config: ReportConfig) => void;
  availableDepartments?: string[];
}

const metricOptions = [
  { id: "burnout", label: "Burnout Score Trends", icon: "📈" },
  { id: "mood", label: "Mood Score Trends", icon: "😊" },
  { id: "sleep", label: "Sleep Quality", icon: "😴" },
  { id: "stress", label: "Stress Distribution", icon: "⚡" },
  { id: "checkin", label: "Check-in Participation", icon: "✅" },
];

const datePresets = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

export function ReportBuilder({
  onGenerate,
  availableDepartments = [],
}: ReportBuilderProps) {
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo);
  const [dateTo, setDateTo] = useState(today);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(
    availableDepartments.length > 0 ? availableDepartments : ["all"]
  );
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "burnout",
    "mood",
    "stress",
  ]);
  const [granularity, setGranularity] = useState<Granularity>("weekly");
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePresetClick = (days: number) => {
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    setDateFrom(fromDate);
    setDateTo(today);
  };

  const handleDepartmentToggle = (dept: string) => {
    if (dept === "all") {
      setSelectedDepartments(["all"]);
    } else {
      setSelectedDepartments((prev) => {
        const filtered = prev.filter((d) => d !== "all");
        if (filtered.includes(dept)) {
          return filtered.filter((d) => d !== dept);
        } else {
          return [...filtered, dept];
        }
      });
    }
  };

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricId)
        ? prev.filter((m) => m !== metricId)
        : [...prev, metricId]
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);

    const config: ReportConfig = {
      dateFrom,
      dateTo,
      departments: selectedDepartments.includes("all")
        ? availableDepartments
        : selectedDepartments,
      metrics: selectedMetrics,
      granularity,
    };

    // Simulate generation delay
    setTimeout(() => {
      onGenerate(config);
      setIsGenerating(false);
    }, 500);
  };

  const isAllDepartments = selectedDepartments.includes("all");
  const isAllMetrics = selectedMetrics.length === metricOptions.length;

  return (
    <motion.div
      className="card-glow-admin p-6 bg-bg-card rounded-2xl border border-border-subtle"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-admin flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold font-sora text-text-primary">
            Custom Report Builder
          </h3>
          <p className="text-sm text-text-secondary">
            Configure your report parameters
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Date Range */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-text-primary flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-admin-light" />
              Date Range
            </label>
            <div className="flex items-center gap-1">
              {datePresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset.days)}
                  className="px-3 py-1 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-accent-admin focus:ring-1 focus:ring-accent-admin transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">
                To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                max={today}
                className="w-full px-4 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-accent-admin focus:ring-1 focus:ring-accent-admin transition-all"
              />
            </div>
          </div>
        </div>

        {/* Departments */}
        <div>
          <label className="text-sm font-medium text-text-primary flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-accent-cyan" />
            Departments
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleDepartmentToggle("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isAllDepartments
                  ? "bg-gradient-admin text-white shadow-glow-admin"
                  : "bg-bg-elevated text-text-secondary hover:text-text-primary"
              }`}
            >
              All Departments
            </button>
            {availableDepartments.slice(0, 5).map((dept) => (
              <button
                key={dept}
                onClick={() => handleDepartmentToggle(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedDepartments.includes(dept)
                    ? "bg-gradient-admin text-white shadow-glow-admin"
                    : "bg-bg-elevated text-text-secondary hover:text-text-primary"
                }`}
              >
                {dept}
              </button>
            ))}
            {availableDepartments.length > 5 && (
              <span className="text-xs text-text-muted">
                +{availableDepartments.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div>
          <label className="text-sm font-medium text-text-primary flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-warning" />
            Metrics to Include
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {metricOptions.map((metric) => (
              <button
                key={metric.id}
                onClick={() => handleMetricToggle(metric.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  selectedMetrics.includes(metric.id)
                    ? "bg-bg-elevated border border-accent-admin/50 text-text-primary"
                    : "bg-bg-elevated border border-border-subtle text-text-secondary hover:border-border-strong"
                }`}
              >
                <span className="text-lg">{metric.icon}</span>
                <span className="flex-1 text-left">{metric.label}</span>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMetrics.includes(metric.id)
                      ? "border-accent-admin bg-accent-admin"
                      : "border-border-subtle"
                  }`}
                >
                  {selectedMetrics.includes(metric.id) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Granularity */}
        <div>
          <label className="text-sm font-medium text-text-primary flex items-center gap-2 mb-3">
            <ChevronRight className="w-4 h-4 text-success" />
            Data Granularity
          </label>
          <div className="flex items-center gap-2">
            {(["daily", "weekly", "monthly"] as Granularity[]).map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  granularity === g
                    ? "bg-gradient-admin text-white shadow-glow-admin"
                    : "bg-bg-elevated text-text-secondary hover:text-text-primary"
                }`}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || selectedMetrics.length === 0}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-semibold bg-gradient-admin text-white shadow-glow-admin hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <>
              <Clock className="w-5 h-5 animate-spin" />
              <span>Generating Preview...</span>
            </>
          ) : (
            <>
              <Calendar className="w-5 h-5" />
              <span>Generate Report</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export default ReportBuilder;
