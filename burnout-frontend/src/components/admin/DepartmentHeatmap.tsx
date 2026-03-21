"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { HeatmapDataPoint } from "@/types/admin";

interface DepartmentHeatmapProps {
  data: HeatmapDataPoint[];
}

interface HeatmapCell {
  department: string;
  week: string;
  weekLabel: string;
  avgScore: number;
  studentCount: number;
}

// Color scale from green (low stress) to red (high stress)
const getCellColor = (score: number): string => {
  if (score >= 80) return "bg-danger"; // Very high stress
  if (score >= 70) return "bg-danger/80";
  if (score >= 60) return "bg-warning/80";
  if (score >= 50) return "bg-warning/60";
  if (score >= 40) return "bg-warning/40";
  if (score >= 30) return "bg-success/60";
  if (score >= 20) return "bg-success/80";
  return "bg-success"; // Low stress
};

const getCellHoverColor = (score: number): string => {
  if (score >= 80) return "hover:bg-danger hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]";
  if (score >= 70) return "hover:bg-danger/90 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]";
  if (score >= 60) return "hover:bg-warning/90 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]";
  if (score >= 50) return "hover:bg-warning/70 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]";
  if (score >= 40) return "hover:bg-warning/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]";
  if (score >= 30) return "hover:bg-success/70 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]";
  if (score >= 20) return "hover:bg-success/90 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]";
  return "hover:bg-success hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]";
};

const getScoreLabel = (score: number): string => {
  if (score >= 80) return "Critical";
  if (score >= 70) return "High";
  if (score >= 60) return "Elevated";
  if (score >= 50) return "Moderate";
  if (score >= 40) return "Low";
  return "Very Low";
};

const CustomTooltip = ({
  cell,
  position,
}: {
  cell: HeatmapCell | null;
  position: { x: number; y: number };
}) => {
  if (!cell) return null;

  return (
    <motion.div
      className="fixed z-50 pointer-events-none"
      style={{ left: position.x + 10, top: position.y - 10 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
    >
      <div className="bg-bg-card border border-border-default rounded-xl p-4 shadow-2xl min-w-[180px]">
        <p className="text-sm font-semibold text-text-primary mb-1">
          {cell.department}
        </p>
        <p className="text-xs text-text-secondary mb-3">{cell.weekLabel}</p>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-text-secondary">Avg Score:</span>
            <span
              className={`text-sm font-bold ${
                cell.avgScore >= 70
                  ? "text-danger"
                  : cell.avgScore >= 40
                  ? "text-warning"
                  : "text-success"
              }`}
            >
              {cell.avgScore.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-text-secondary">Status:</span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                cell.avgScore >= 70
                  ? "bg-danger/15 text-danger"
                  : cell.avgScore >= 40
                  ? "bg-warning/15 text-warning"
                  : "bg-success/15 text-success"
              }`}
            >
              {getScoreLabel(cell.avgScore)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-text-secondary">Students:</span>
            <span className="text-xs text-text-primary">
              {cell.studentCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export function DepartmentHeatmap({ data }: DepartmentHeatmapProps) {
  const [hoveredCell, setHoveredCell] = React.useState<HeatmapCell | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

  // Transform data into matrix format
  const { departments, weeks, matrix } = useMemo(() => {
    const deptSet = new Set<string>();
    const weekSet = new Set<string>();
    const weekLabelMap = new Map<string, string>();

    data.forEach((d) => {
      deptSet.add(d.department);
      weekSet.add(d.week);
      weekLabelMap.set(d.week, d.weekLabel);
    });

    const departments = Array.from(deptSet).sort();
    const weeks = Array.from(weekSet).sort();

    // Create matrix
    const matrix: Map<string, Map<string, HeatmapCell>> = new Map();
    departments.forEach((dept) => {
      const weekMap = new Map<string, HeatmapCell>();
      weeks.forEach((week) => {
        const point = data.find((d) => d.department === dept && d.week === week);
        if (point) {
          weekMap.set(week, {
            department: point.department,
            week: point.week,
            weekLabel: point.weekLabel,
            avgScore: point.avgScore,
            studentCount: point.studentCount,
          });
        }
      });
      matrix.set(dept, weekMap);
    });

    return { departments, weeks, matrix };
  }, [data]);

  const handleCellHover = (
    e: React.MouseEvent,
    cell: HeatmapCell | undefined
  ) => {
    if (cell) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
      setHoveredCell(cell);
    } else {
      setHoveredCell(null);
    }
  };

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
            Stress Pattern Heatmap
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Department stress levels over the last 8 weeks
          </p>
        </div>

        {/* Color Legend */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary">Low</span>
          <div className="flex gap-0.5">
            {[100, 80, 60, 40, 20, 0].map((score) => (
              <div
                key={score}
                className="w-6 h-4 rounded-sm"
                style={{
                  backgroundColor:
                    score >= 80
                      ? "#ef4444"
                      : score >= 60
                      ? "#f59e0b"
                      : score >= 40
                      ? "#eab308"
                      : "#10b981",
                  opacity: score / 100,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-text-secondary">High</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Week Headers */}
          <div className="flex mb-2">
            <div className="w-40 flex-shrink-0" /> {/* Department column spacer */}
            <div className="flex-1 grid grid-cols-8 gap-1">
              {weeks.map((week, i) => (
                <div
                  key={week}
                  className="text-center text-xs font-medium text-text-secondary"
                >
                  <div>W{i + 1}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="space-y-1">
            {departments.map((department, deptIndex) => (
              <motion.div
                key={department}
                className="flex items-center gap-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: deptIndex * 0.05 }}
              >
                {/* Department Label */}
                <div className="w-40 flex-shrink-0">
                  <span className="text-xs font-medium text-text-primary truncate block">
                    {department}
                  </span>
                </div>

                {/* Week Cells */}
                <div className="flex-1 grid grid-cols-8 gap-1">
                  {weeks.map((week) => {
                    const cell = matrix.get(department)?.get(week);
                    const score = cell?.avgScore ?? 0;

                    return (
                      <div
                        key={week}
                        className={`aspect-square rounded-md ${getCellColor(score)} ${getCellHoverColor(score)} transition-all duration-200 cursor-pointer`}
                        onMouseEnter={(e) => handleCellHover(e, cell)}
                        onMouseLeave={() => handleCellHover(e, undefined)}
                      />
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <CustomTooltip cell={hoveredCell} position={tooltipPosition} />
      )}

      {/* Info Footer */}
      <div className="mt-6 pt-4 border-t border-border-subtle">
        <div className="flex items-center justify-center gap-6 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success" />
            <span>Low Stress (&lt;40)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning" />
            <span>Moderate (40-60)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-danger" />
            <span>High Stress (&gt;60)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default DepartmentHeatmap;
