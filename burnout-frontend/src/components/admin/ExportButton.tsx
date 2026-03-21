"use client";

import React from "react";
import { motion } from "framer-motion";
import { Download, Loader2, Check } from "lucide-react";

interface ExportButtonProps {
  format: "csv" | "pdf";
  onExport: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ExportButton({
  format,
  onExport,
  isLoading = false,
  disabled = false,
  className = "",
}: ExportButtonProps) {
  const [success, setSuccess] = React.useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;

    await onExport();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
        success
          ? "bg-success text-white"
          : isLoading
          ? "bg-bg-elevated text-text-secondary cursor-not-allowed"
          : disabled
          ? "bg-bg-elevated text-text-muted cursor-not-allowed"
          : "bg-gradient-admin text-white shadow-glow-admin hover:opacity-90"
      } ${className}`}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {success ? (
        <>
          <Check className="w-4 h-4" />
          <span>Downloaded!</span>
        </>
      ) : isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span>Export {format.toUpperCase()}</span>
          <span
            className={`px-1.5 py-0.5 rounded text-xs ${
              format === "csv"
                ? "bg-accent-admin-light/20 text-accent-admin-light"
                : "bg-accent-purple/20 text-accent-purple"
            }`}
          >
            {format.toUpperCase()}
          </span>
        </>
      )}
    </motion.button>
  );
}

export default ExportButton;
