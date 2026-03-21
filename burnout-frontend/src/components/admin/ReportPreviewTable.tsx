"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Table as TableIcon } from "lucide-react";

interface ReportRow {
  [key: string]: string | number;
}

interface ReportPreviewTableProps {
  data: ReportRow[];
  columns: string[];
  totalRows?: number;
}

export function ReportPreviewTable({
  data,
  columns,
  totalRows,
}: ReportPreviewTableProps) {
  const previewData = data.slice(0, 10);
  const remainingRows = (totalRows ?? data.length) - previewData.length;

  const formatValue = (value: string | number) => {
    if (typeof value === "number") {
      if (value % 1 === 0) return value.toLocaleString();
      return value.toFixed(2);
    }
    return value;
  };

  return (
    <motion.div
      className="card-glow-admin p-6 bg-bg-card rounded-2xl border border-border-subtle overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Privacy Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-success/10 border border-success/30 mb-6">
        <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-success mb-1">
            Privacy Protected
          </p>
          <p className="text-xs text-text-secondary">
            This report contains <strong>anonymized aggregate data only</strong>.
            No individual student names, emails, IDs, or personally identifiable
            information is included. All metrics are aggregated at the department
            or campus level.
          </p>
        </div>
      </div>

      {/* Table Header */}
      <div className="flex items-center gap-3 mb-4">
        <TableIcon className="w-5 h-5 text-accent-admin-light" />
        <h3 className="text-lg font-semibold font-sora text-text-primary">
          Report Preview
        </h3>
        <span className="text-xs text-text-muted px-2 py-1 rounded-lg bg-bg-elevated">
          Showing {previewData.length} of {(totalRows ?? data.length).toLocaleString()} rows
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle">
              {columns.map((column, index) => (
                <th
                  key={column}
                  className={`text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-text-secondary ${
                    index === 0 ? "sticky left-0 bg-bg-card z-10" : ""
                  }`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                className="border-b border-border-subtle last:border-0 hover:bg-bg-elevated transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: rowIndex * 0.05 }}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={`${rowIndex}-${column}`}
                    className={`py-3 px-4 text-sm ${
                      colIndex === 0
                        ? "sticky left-0 bg-bg-card font-medium text-text-primary"
                        : "text-text-secondary"
                    }`}
                  >
                    {formatValue(row[column])}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {remainingRows > 0 && (
        <div className="mt-4 pt-4 border-t border-border-subtle text-center">
          <p className="text-sm text-text-muted">
            ... and {remainingRows.toLocaleString()} more rows
          </p>
        </div>
      )}

      {data.length === 0 && (
        <div className="text-center py-12">
          <TableIcon className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary">
            No data to preview. Generate a report to see the preview.
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default ReportPreviewTable;
