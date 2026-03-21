"use client";

import React from "react";
import { motion } from "framer-motion";
import { Download, FileText, Calendar, Clock, Check } from "lucide-react";

interface QuickExportCardProps {
  title: string;
  description: string;
  format: "CSV" | "PDF";
  icon: React.ReactNode;
  onExport: () => void;
  isLoading?: boolean;
}

export function QuickExportCard({
  title,
  description,
  format,
  icon,
  onExport,
  isLoading = false,
}: QuickExportCardProps) {
  const [success, setSuccess] = React.useState(false);

  const handleExport = async () => {
    await onExport();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <motion.div
      className="relative p-6 bg-bg-card rounded-2xl border border-border-subtle overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-admin-light/5 to-accent-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-bg-elevated flex items-center justify-center border border-border-subtle">
            {icon}
          </div>
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              format === "CSV"
                ? "bg-accent-admin-light/15 text-accent-admin-light border border-accent-admin-light/30"
                : "bg-accent-purple/15 text-accent-purple border border-accent-purple/30"
            }`}
          >
            {format}
          </span>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className="text-base font-semibold font-sora text-text-primary mb-1">
            {title}
          </h3>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleExport}
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
            success
              ? "bg-success text-white"
              : isLoading
              ? "bg-bg-elevated text-text-secondary cursor-not-allowed"
              : "bg-gradient-admin text-white shadow-glow-admin hover:opacity-90"
          }`}
        >
          {success ? (
            <>
              <Check className="w-4 h-4" />
              <span>Downloaded!</span>
            </>
          ) : isLoading ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export default QuickExportCard;
