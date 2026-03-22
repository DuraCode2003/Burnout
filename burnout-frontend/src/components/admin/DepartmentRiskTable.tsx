"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { DepartmentStats } from "@/types/admin";

interface DepartmentRiskTableProps {
  departments: DepartmentStats[];
}

type SortKey = "avgBurnoutScore" | "studentCount" | "riskLevel";
type SortOrder = "asc" | "desc";

const riskLevelOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };

const riskColors = {
  HIGH: {
    bg: "rgba(239, 68, 68, 0.15)",
    border: "rgba(239, 68, 68, 0.3)",
    text: "text-danger",
  },
  MEDIUM: {
    bg: "rgba(245, 158, 11, 0.15)",
    border: "rgba(245, 158, 11, 0.3)",
    text: "text-warning",
  },
  LOW: {
    bg: "rgba(16, 185, 129, 0.15)",
    border: "rgba(16, 185, 129, 0.3)",
    text: "text-success",
  },
};

const trendIcons = {
  up: { icon: ArrowUpRight, color: "text-danger" },
  down: { icon: ArrowDownRight, color: "text-success" },
  stable: { icon: Minus, color: "text-text-secondary" },
};

export function DepartmentRiskTable({ departments }: DepartmentRiskTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("avgBurnoutScore");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showAll, setShowAll] = useState(false);

  const sortedDepartments = useMemo(() => {
    const sorted = [...departments].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case "avgBurnoutScore":
          comparison = a.avgBurnoutScore - b.avgBurnoutScore;
          break;
        case "studentCount":
          comparison = a.studentCount - b.studentCount;
          break;
        case "riskLevel":
          comparison = riskLevelOrder[a.riskLevel] - riskLevelOrder[b.riskLevel];
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return showAll ? sorted : sorted.slice(0, 5);
  }, [departments, sortKey, sortOrder, showAll]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
  };

  const SortHeader = ({
    column,
    label,
  }: {
    column: SortKey;
    label: string;
  }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider hover:text-text-primary transition-colors"
    >
      {label}
      <SortIcon column={column} />
    </button>
  );

  return (
    <motion.div
      className="card-glow-admin p-6 bg-bg-card rounded-2xl border border-border-subtle overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold font-sora text-text-primary">
            Department Risk Analysis
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Top departments by risk level
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left py-3 px-4">
                <SortHeader column="riskLevel" label="Department" />
              </th>
              <th className="text-center py-3 px-4">
                <SortHeader column="studentCount" label="Students" />
              </th>
              <th className="text-center py-3 px-4">
                <SortHeader column="avgBurnoutScore" label="Avg Score" />
              </th>
              <th className="text-center py-3 px-4">
                <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                  Risk Level
                </span>
              </th>
              <th className="text-center py-3 px-4">
                <span className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                  Trend
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedDepartments.map((dept, index) => {
              const colors = riskColors[dept.riskLevel as keyof typeof riskColors] || riskColors.LOW;
              const trendData = trendIcons[dept.trend as keyof typeof trendIcons] || trendIcons.stable;
              const TrendIcon = trendData.icon;
              const trendColor = trendData.color;

              return (
                <motion.tr
                  key={dept.department}
                  className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-text-primary">
                      {dept.department}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-sm text-text-secondary">
                      {dept.studentCount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`text-sm font-semibold ${
                        dept.avgBurnoutScore >= 70
                          ? "text-danger"
                          : dept.avgBurnoutScore >= 40
                          ? "text-warning"
                          : "text-success"
                      }`}
                    >
                      {dept.avgBurnoutScore.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors.text}`}
                      style={{
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      {dept.riskLevel}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <TrendIcon
                      className={`w-4 h-4 inline-block ${trendColor}`}
                    />
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {departments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary text-sm">
            No department data available
          </p>
        </div>
      )}

      {/* View All Link */}
      <div className="flex items-center justify-center mt-6 pt-4 border-t border-border-subtle">
        <Link
          href="/admin/departments"
          className="flex items-center gap-2 text-sm font-medium text-accent-admin-light hover:text-accent-cyan transition-colors"
        >
          <span>View all departments</span>
          <ArrowUpRight className="w-4 h-4 rotate-45" />
        </Link>
      </div>
    </motion.div>
  );
}

export default DepartmentRiskTable;
