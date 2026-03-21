"use client";

import React from "react";
import { motion } from "framer-motion";

interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
}

interface DepartmentStats {
  departmentName: string;
  studentCount: number;
  averageBurnoutScore: number;
  averageMood: number;
  averageStress: number;
  averageSleep: number;
  riskDistribution: RiskDistribution;
  checkInRate: number;
}

interface DepartmentTableProps {
  departments: DepartmentStats[];
}

export function DepartmentTable({ departments }: DepartmentTableProps) {
  const getRiskLevelColor = (dist: RiskDistribution) => {
    const total = dist.low + dist.medium + dist.high;
    if (total === 0) return "text-text-secondary";
    const highRiskPercent = (dist.high / total) * 100;
    if (highRiskPercent >= 30) return "text-danger";
    if (highRiskPercent >= 15) return "text-warning";
    return "text-success";
  };

  const getCheckinRateColor = (rate: number) => {
    if (rate >= 70) return "text-success";
    if (rate >= 40) return "text-warning";
    return "text-danger";
  };

  const getBurnoutColor = (score: number) => {
    if (score >= 70) return "text-danger";
    if (score >= 50) return "text-warning";
    return "text-success";
  };

  return (
    <motion.div
      className="card-glow-admin p-6 bg-bg-card rounded-2xl border border-border-subtle overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h3 className="text-lg font-semibold font-sora text-text-primary mb-4">
        Department Breakdown
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Department
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Students
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Avg Burnout
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Avg Mood
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Check-in Rate
              </th>
              <th className="text-center py-3 px-4 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Risk Level
              </th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept, index) => (
              <motion.tr
                key={dept.departmentName}
                className="border-b border-border-subtle hover:bg-bg-elevated transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <td className="py-4 px-4">
                  <span className="text-sm font-medium text-text-primary">
                    {dept.departmentName}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-sm text-text-secondary">
                    {dept.studentCount}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span
                    className={`text-sm font-semibold ${getBurnoutColor(dept.averageBurnoutScore)}`}
                  >
                    {dept.averageBurnoutScore.toFixed(1)}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-sm text-text-secondary">
                    {dept.averageMood.toFixed(1)}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span
                    className={`text-sm font-semibold ${getCheckinRateColor(dept.checkInRate)}`}
                  >
                    {dept.checkInRate.toFixed(1)}%
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span
                    className={`text-sm font-semibold ${getRiskLevelColor(dept.riskDistribution)}`}
                  >
                    {dept.riskDistribution.high >
                    dept.riskDistribution.low + dept.riskDistribution.medium
                      ? "High"
                      : dept.riskDistribution.medium > dept.riskDistribution.low
                        ? "Medium"
                        : "Low"}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {departments.length === 0 && (
        <div className="text-center py-8">
          <p className="text-text-secondary text-sm">
            No department data available
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default DepartmentTable;
