"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  CheckCircle,
  ArrowUpCircle,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";
import type { Alert } from "@/types/counselor";
import toast from "react-hot-toast";

interface ActionButtonsProps {
  alert: Alert;
  onContact: () => Promise<void>;
  onResolve: (note: string) => Promise<void>;
  onEscalate: (reason: string) => Promise<void>;
}

export function ActionButtons({
  alert,
  onContact,
  onResolve,
  onEscalate,
}: ActionButtonsProps) {
  const [contacting, setContacting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [resolveNote, setResolveNote] = useState("");
  const [escalateReason, setEscalateReason] = useState("");

  const isContacted = alert.actions.some(
    (a) => a.actionType === "CONTACTED"
  );

  const handleContact = async () => {
    setContacting(true);
    try {
      await onContact();
      toast.success("Contact logged successfully");
    } catch (error) {
      console.error("Failed to log contact:", error);
      toast.error("Failed to log contact");
    } finally {
      setContacting(false);
    }
  };

  const handleResolve = async () => {
    if (!resolveNote.trim()) {
      toast.error("Please add a resolution note");
      return;
    }

    setResolving(true);
    try {
      await onResolve(resolveNote.trim());
      toast.success("Alert resolved successfully");
      setShowResolveModal(false);
    } catch (error) {
      console.error("Failed to resolve alert:", error);
      toast.error("Failed to resolve alert");
    } finally {
      setResolving(false);
    }
  };

  const handleEscalate = async () => {
    if (!escalateReason.trim()) {
      toast.error("Please provide an escalation reason");
      return;
    }

    setEscalating(true);
    try {
      await onEscalate(escalateReason.trim());
      toast.success("Alert escalated to senior counselor");
      setShowEscalateModal(false);
    } catch (error) {
      console.error("Failed to escalate alert:", error);
      toast.error("Failed to escalate alert");
    } finally {
      setEscalating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mark as Contacted */}
      <motion.button
        whileHover={{ scale: isContacted ? 1 : 1.02 }}
        whileTap={{ scale: isContacted ? 1 : 0.98 }}
        onClick={handleContact}
        disabled={contacting || isContacted}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
          isContacted
            ? "bg-success/10 text-success border border-success/30 cursor-default"
            : "bg-gradient-counselor text-white shadow-glow-counselor hover:opacity-90"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {contacting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isContacted ? (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>Contacted {alert.actions.find(a => a.actionType === "CONTACTED") && `on ${new Date(alert.actions.find(a => a.actionType === "CONTACTED")!.timestamp).toLocaleDateString()}`}</span>
          </>
        ) : (
          <>
            <Phone className="w-5 h-5" />
            <span>Mark as Contacted</span>
          </>
        )}
      </motion.button>

      {/* Resolve Alert */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowResolveModal(true)}
        disabled={resolving || alert.status === "RESOLVED"}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-success/10 text-success border border-success/30 hover:bg-success/20 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {resolving ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>Resolve Alert</span>
          </>
        )}
      </motion.button>

      {/* Escalate to Senior */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowEscalateModal(true)}
        disabled={escalating || alert.status === "ESCALATED"}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-bg-elevated text-text-secondary border border-border-subtle hover:text-warning hover:border-warning/30 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {escalating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <ArrowUpCircle className="w-5 h-5" />
            <span>Escalate to Senior</span>
          </>
        )}
      </motion.button>

      {/* Resolve Modal */}
      <AnimatePresence>
        {showResolveModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResolveModal(false)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="w-full max-w-md p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-glow-counselor">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold font-sora text-text-primary">
                    Resolve Alert
                  </h3>
                  <button
                    onClick={() => setShowResolveModal(false)}
                    className="p-2 rounded-lg text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm text-text-secondary mb-4">
                  Please add a brief note explaining how this alert was resolved.
                  This helps track intervention effectiveness.
                </p>

                <textarea
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  placeholder="e.g., Contacted student via email, scheduled follow-up appointment..."
                  className="w-full h-32 px-4 py-3 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-counselor transition-colors resize-none"
                  maxLength={500}
                />

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-text-muted">
                    {resolveNote.length}/500 characters
                  </span>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowResolveModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResolve}
                    disabled={!resolveNote.trim() || resolving}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-counselor text-white font-semibold shadow-glow-counselor hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resolving ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Resolve Alert"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Escalate Modal */}
      <AnimatePresence>
        {showEscalateModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEscalateModal(false)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="w-full max-w-md p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-glow-counselor">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold font-sora text-text-primary flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    Escalate Alert
                  </h3>
                  <button
                    onClick={() => setShowEscalateModal(false)}
                    className="p-2 rounded-lg text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 mb-4">
                  <p className="text-sm text-text-secondary">
                    This will notify senior counselors and mark this alert as
                    requiring higher-level intervention. Use this when the case
                    is beyond your scope.
                  </p>
                </div>

                <textarea
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  placeholder="Please explain why this alert needs to be escalated..."
                  className="w-full h-32 px-4 py-3 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:border-warning transition-colors resize-none"
                  maxLength={500}
                />

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-text-muted">
                    {escalateReason.length}/500 characters
                  </span>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowEscalateModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEscalate}
                    disabled={!escalateReason.trim() || escalating}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-alert-orange text-white font-semibold shadow-glow-orange hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {escalating ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Escalate Alert"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ActionButtons;
