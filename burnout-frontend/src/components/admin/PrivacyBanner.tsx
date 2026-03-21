"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, Lock, Eye } from "lucide-react";

interface PrivacyBannerProps {
  variant?: "default" | "compact";
  dismissible?: boolean;
}

export function PrivacyBanner({
  variant = "default",
  dismissible = true,
}: PrivacyBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  if (variant === "compact") {
    return (
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-40 bg-bg-surface/95 backdrop-blur-xl border-t border-border-subtle hidden lg:block"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between px-6 py-2">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-success" />
            <span className="text-xs text-text-secondary">
              All data shown is anonymized and aggregated. Individual student records are never accessible.
            </span>
          </div>
          {dismissible && (
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-40 bg-bg-surface/95 backdrop-blur-xl border-t border-border-subtle"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-success" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-success" />
                  <h4 className="text-sm font-semibold text-text-primary">
                    Privacy Protected
                  </h4>
                </div>
                <p className="text-sm text-text-secondary">
                  All data shown is <strong>anonymized and aggregated</strong>.
                  Individual student records are <strong>never accessible</strong> through
                  the admin dashboard. This ensures compliance with FERPA and protects
                  student privacy while providing valuable insights for improving
                  campus wellbeing.
                </p>

                {/* Additional info */}
                <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Aggregate views only</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>No PII stored</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>FERPA compliant</span>
                  </div>
                </div>
              </div>

              {/* Close button */}
              {dismissible && (
                <button
                  onClick={() => setIsDismissed(true)}
                  className="flex-shrink-0 p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PrivacyBanner;
