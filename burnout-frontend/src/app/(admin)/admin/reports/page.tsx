"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import adminService from "@/services/adminService";
import { QuickExportCard } from "@/components/admin/QuickExportCard";
import { ReportBuilder, ReportConfig } from "@/components/admin/ReportBuilder";
import { ReportPreviewTable } from "@/components/admin/ReportPreviewTable";
import { ExportButton } from "@/components/admin/ExportButton";
import {
  FileText,
  Calendar,
  Database,
  Download,
  Clock,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { DepartmentStats } from "@/types/admin";

interface ReportRow {
  [key: string]: string | number;
}

interface PastReport {
  id: string;
  name: string;
  date: string;
  format: "CSV" | "PDF";
  size: string;
  rows: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [departments, setDepartments] = useState<DepartmentStats[]>([]);
  const [reportConfig, setReportConfig] = useState<ReportConfig | null>(null);
  const [previewData, setPreviewData] = useState<ReportRow[]>([]);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [generatingPreview, setGeneratingPreview] = useState(false);

  const pastReports: PastReport[] = [
    {
      id: "1",
      name: "Monthly Campus Analytics",
      date: "2024-03-01",
      format: "CSV",
      size: "2.4 MB",
      rows: 1250,
    },
    {
      id: "2",
      name: "Q1 Department Summary",
      date: "2024-02-15",
      format: "PDF",
      size: "1.8 MB",
      rows: 850,
    },
    {
      id: "3",
      name: "Weekly Wellness Report",
      date: "2024-02-01",
      format: "CSV",
      size: "890 KB",
      rows: 420,
    },
  ];

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const depts = await adminService.getDepartmentStats();
        setDepartments(depts);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleQuickExport = async (type: string) => {
    setExporting(type);
    try {
      await adminService.exportCSV();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setTimeout(() => setExporting(null), 500);
    }
  };

  const handleGenerateReport = async (config: ReportConfig) => {
    setGeneratingPreview(true);
    setReportConfig(config);

    try {
      // Generate preview data based on config
      const columns = generateColumns(config);
      const data = await generatePreviewData(config, departments);

      setPreviewColumns(columns);
      setPreviewData(data);
      setTotalRows(Math.floor(Math.random() * 500) + 100); // Simulated
    } catch (err) {
      console.error("Failed to generate preview:", err);
      setError("Failed to generate report preview. Please try again.");
    } finally {
      setGeneratingPreview(false);
    }
  };

  const generateColumns = (config: ReportConfig): string[] => {
    const columns: string[] = ["Period"];

    if (config.departments.length > 0) {
      columns.push("Department");
    }

    if (config.metrics.includes("burnout")) {
      columns.push("Avg Burnout Score");
    }
    if (config.metrics.includes("mood")) {
      columns.push("Avg Mood");
    }
    if (config.metrics.includes("sleep")) {
      columns.push("Avg Sleep (hrs)");
    }
    if (config.metrics.includes("stress")) {
      columns.push("Stress Level");
    }
    if (config.metrics.includes("checkin")) {
      columns.push("Check-in Rate %");
    }

    return columns;
  };

  const generatePreviewData = async (
    config: ReportConfig,
    depts: DepartmentStats[]
  ): Promise<ReportRow[]> => {
    // Simulate preview data generation
    const rows: ReportRow[] = [];
    const periods = config.granularity === "daily" ? 7 : config.granularity === "weekly" ? 4 : 3;

    for (let i = 0; i < Math.min(periods, depts.length || 5); i++) {
      const dept = depts[i] || depts[0];
      const row: ReportRow = {
        Period: config.granularity === "daily" ? `Day ${i + 1}` : `Week ${i + 1}`,
      };

      if (config.departments.length > 0 && dept) {
        row["Department"] = dept.department;
      }

      if (config.metrics.includes("burnout")) {
        row["Avg Burnout Score"] = Math.round((dept?.avgBurnoutScore || 50) + (Math.random() * 10 - 5));
      }
      if (config.metrics.includes("mood")) {
        row["Avg Mood"] = (6 + Math.random() * 2).toFixed(1);
      }
      if (config.metrics.includes("sleep")) {
        row["Avg Sleep (hrs)"] = (6.5 + Math.random() * 1.5).toFixed(1);
      }
      if (config.metrics.includes("stress")) {
        row["Stress Level"] = (5 + Math.random() * 3).toFixed(1);
      }
      if (config.metrics.includes("checkin")) {
        row["Check-in Rate %"] = (60 + Math.random() * 30).toFixed(1);
      }

      rows.push(row);
    }

    return rows;
  };

  const handleExportReport = async () => {
    try {
      await adminService.exportCSV();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="w-64 h-8 rounded-lg bg-bg-elevated animate-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 rounded-2xl bg-bg-card animate-shimmer" />
          ))}
        </div>
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
        >
          <AlertTriangle className="w-16 h-16 text-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Error</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl bg-gradient-admin text-white font-semibold"
          >
            Retry
          </button>
        </motion.div>
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
            Reports & Export
          </h1>
          <p className="text-text-secondary mt-1">
            Generate and download anonymized campus analytics
          </p>
        </div>
      </motion.div>

      {/* Quick Export Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickExportCard
          title="Weekly Summary"
          description="Last 7 days overview"
          format="CSV"
          icon={<Calendar className="w-5 h-5 text-accent-admin-light" />}
          onExport={() => handleQuickExport("weekly")}
          isLoading={exporting === "weekly"}
        />
        <QuickExportCard
          title="Monthly Report"
          description="Full month analytics"
          format="CSV"
          icon={<FileText className="w-5 h-5 text-accent-cyan" />}
          onExport={() => handleQuickExport("monthly")}
          isLoading={exporting === "monthly"}
        />
        <QuickExportCard
          title="Full Dataset"
          description="Complete historical data"
          format="CSV"
          icon={<Database className="w-5 h-5 text-warning" />}
          onExport={() => handleQuickExport("full")}
          isLoading={exporting === "full"}
        />
      </div>

      {/* Report Builder + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportBuilder
          onGenerate={handleGenerateReport}
          availableDepartments={departments.map((d) => d.department)}
        />

        {/* Past Reports */}
        <motion.div
          className="card-glow-admin p-6 bg-bg-card rounded-2xl border border-border-subtle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-bg-elevated flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent-admin-light" />
            </div>
            <div>
              <h3 className="text-lg font-semibold font-sora text-text-primary">
                Past Reports
              </h3>
              <p className="text-sm text-text-secondary">
                Recently downloaded reports
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {pastReports.map((report, index) => (
              <motion.div
                key={report.id}
                className="flex items-center justify-between p-4 rounded-xl bg-bg-elevated border border-border-subtle"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      report.format === "CSV"
                        ? "bg-accent-admin-light/15"
                        : "bg-accent-purple/15"
                    }`}
                  >
                    <FileText
                      className={`w-5 h-5 ${
                        report.format === "CSV"
                          ? "text-accent-admin-light"
                          : "text-accent-purple"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {report.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {report.date} • {report.size} • {report.rows.toLocaleString()} rows
                    </p>
                  </div>
                </div>
                <button className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Report Preview */}
      {generatingPreview ? (
        <motion.div
          className="h-64 rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent-admin" />
            <p className="text-text-secondary">Generating preview...</p>
          </div>
        </motion.div>
      ) : previewData.length > 0 ? (
        <>
          <ReportPreviewTable
            data={previewData}
            columns={previewColumns}
            totalRows={totalRows}
          />

          {/* Export Action */}
          <motion.div
            className="flex items-center justify-between p-6 rounded-2xl bg-bg-card border border-border-subtle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-success" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Ready to Export
                </p>
                <p className="text-xs text-text-secondary">
                  {totalRows.toLocaleString()} rows • Anonymized aggregate data
                </p>
              </div>
            </div>
            <ExportButton
              format="csv"
              onExport={handleExportReport}
              disabled={!reportConfig}
            />
          </motion.div>
        </>
      ) : null}

      {/* Privacy Disclaimer */}
      <motion.div
        className="flex items-start gap-3 p-4 rounded-xl bg-bg-elevated border border-border-subtle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Shield className="w-5 h-5 text-accent-admin-light flex-shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary">
          <strong className="text-text-primary">Privacy Notice:</strong> All
          reports contain <strong>anonymized aggregate data only</strong>. No
          individual student information (names, emails, IDs) is ever included
          in exports. This ensures compliance with FERPA and other privacy
          regulations.
        </p>
      </motion.div>
    </div>
  );
}
