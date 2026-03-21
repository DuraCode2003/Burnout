"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";

interface UseExportReturn {
  isExporting: boolean;
  error: string | null;
  exportCSV: (filename?: string) => Promise<void>;
  exportPDF: (filename?: string) => Promise<void>;
  exportJSON: (data: unknown, filename?: string) => void;
  resetError: () => void;
}

export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportCSV = useCallback(async (filename?: string) => {
    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/export/csv", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Export failed. Please try again.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const date = new Date().toISOString().split("T")[0];
      link.setAttribute(
        "download",
        filename ?? `campus-report-${date}.csv`
      );

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Report downloaded successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Export failed";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportPDF = useCallback(async (filename?: string) => {
    setIsExporting(true);
    setError(null);

    try {
      // Use browser print for PDF export
      // This is a simple approach without external libraries
      toast.success("Opening print dialog. Select 'Save as PDF' to export.");

      // Wait a moment for toast to show
      await new Promise((resolve) => setTimeout(resolve, 500));

      window.print();

      // Note: Actual PDF generation would require a library like jsPDF
      // or a backend endpoint that generates PDFs
    } catch (err) {
      const message = err instanceof Error ? err.message : "PDF export failed";
      setError(message);
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const exportJSON = useCallback((data: unknown, filename?: string) => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const date = new Date().toISOString().split("T")[0];
      link.setAttribute(
        "download",
        filename ?? `campus-data-${date}.json`
      );

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("JSON exported successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "JSON export failed";
      setError(message);
      toast.error(message);
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isExporting,
    error,
    exportCSV,
    exportPDF,
    exportJSON,
    resetError,
  };
}

export default useExport;
