"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import counselorService from "@/services/counselorService";
import { AlertDetailPanel } from "@/components/counselor/AlertDetailPanel";
import { ActionButtons } from "@/components/counselor/ActionButtons";
import { NoteEditor } from "@/components/counselor/NoteEditor";
import { CrisisResourcePanel } from "@/components/counselor/CrisisResourcePanel";
import { NoteHistory } from "@/components/counselor/NoteHistory";
import { RiskBadge } from "@/components/counselor/RiskBadge";
import type { Alert } from "@/types/counselor";
import toast from "react-hot-toast";

export default function AlertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const alertId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch alert detail
  const fetchAlert = useCallback(async () => {
    try {
      setLoading(true);
      const data = await counselorService.getAlertById(alertId);
      setAlert(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch alert:", err);
      setError("Alert not found or you don't have access to it");
    } finally {
      setLoading(false);
    }
  }, [alertId]);

  useEffect(() => {
    fetchAlert();
  }, [fetchAlert]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAlert();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchAlert]);

  // Action handlers
  const handleContact = async () => {
    const updated = await counselorService.logContact(alertId, {
      contactMethod: "PHONE",
    });
    setAlert(updated);
  };

  const handleResolve = async (note: string) => {
    const updated = await counselorService.resolveAlert(alertId, {
      resolutionNotes: note,
    });
    setAlert(updated);
    // Redirect after short delay
    setTimeout(() => {
      router.push("/counselor");
    }, 1000);
  };

  const handleEscalate = async (reason: string) => {
    const updated = await counselorService.escalateAlert(alertId, {
      reason,
      priority: alert?.tier === "RED" ? "URGENT" : "HIGH",
    });
    setAlert(updated);
  };

  const handleAddNote = async (note: string) => {
    const updated = await counselorService.addNote(alertId, {
      note,
      isInternal: true,
    });
    setAlert(updated);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-accent-counselor" />
          <p className="text-text-secondary">Loading alert details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !alert) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-bg-elevated flex items-center justify-center border border-border-subtle">
            <AlertTriangle className="w-10 h-10 text-danger" />
          </div>
          <h2 className="text-2xl font-bold font-sora text-text-primary mb-2">
            Alert Not Found
          </h2>
          <p className="text-text-secondary mb-6">
            {error ||
              "This alert may have been resolved, deleted, or you don't have access to it."}
          </p>
          <button
            onClick={() => router.push("/counselor")}
            className="px-6 py-2.5 rounded-xl bg-gradient-counselor text-white font-medium shadow-glow-counselor hover:opacity-90 transition-opacity"
          >
            Back to Alert Queue
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-sora text-text-primary">
            Alert Details
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <RiskBadge tier={alert.tier} size="sm" />
            <span className="text-sm text-text-muted">
              ID: {alert.id.slice(0, 8)}
            </span>
            {alert.isUrgent && (
              <span className="text-xs text-danger font-medium">
                • Requires response within 2 hours
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Alert Details */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-bg-card border border-border-subtle"
          >
            <AlertDetailPanel alert={alert} />
          </motion.div>

          {/* Activity Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-bg-card border border-border-subtle"
          >
            <NoteHistory alert={alert} />
          </motion.div>
        </div>

        {/* Right Column: Actions Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-bg-card border border-border-subtle sticky top-24"
          >
            <h3 className="text-lg font-bold font-sora text-text-primary mb-4">
              Take Action
            </h3>
            <ActionButtons
              alert={alert}
              onContact={handleContact}
              onResolve={handleResolve}
              onEscalate={handleEscalate}
            />

            {/* Divider */}
            <div className="my-6 border-t border-border-subtle" />

            {/* Note Editor */}
            <NoteEditor alertId={alertId} onSave={handleAddNote} />

            {/* Divider */}
            <div className="my-6 border-t border-border-subtle" />

            {/* Crisis Resources (RED alerts only) */}
            <CrisisResourcePanel alert={alert} />
          </motion.div>
        </div>
      </div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-2 text-xs text-text-muted pt-6 border-t border-border-subtle"
      >
        <span>Auto-refreshes every 2 minutes</span>
        <span>•</span>
        <span>All actions are logged</span>
      </motion.div>
    </div>
  );
}
