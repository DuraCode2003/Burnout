"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Loader2, Sparkles, ShieldAlert, TrendingUp } from "lucide-react";
import { counselorService } from "@/services/counselorService";
import { toast } from "react-hot-toast";

interface EscalateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertId: string;
  studentName: string;
  onSuccess: () => void;
}

export function EscalateAlertModal({ isOpen, onClose, alertId, studentName, onSuccess }: EscalateAlertModalProps) {
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState<"URGENT" | "STANDARD">("URGENT");
  const [report, setReport] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  const handleLumaReport = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a brief primary reason first");
      return;
    }
    
    setIsDrafting(true);
    try {
      const res = await counselorService.getEscalationReport(alertId, reason);
      if (res.success) {
        setReport(res.summary);
        toast.success("Luma generated a formal escalation report");
      } else {
        toast.error("Luma failed to draft the report");
      }
    } catch (error) {
      toast.error("Error connecting to Luma");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSubmit = async () => {
    const finalReason = report.trim() ? report : reason;
    if (!finalReason.trim()) {
      toast.error("Please provide an escalation justification");
      return;
    }

    setIsSubmitting(true);
    try {
      // In a real system, priority might be a separate field, but for now we append it
      await counselorService.escalateAlert(alertId, { 
        reason: finalReason,
        priority: priority === "URGENT" ? "URGENT" : "HIGH"
      });
      toast.success("Alert escalated to senior staff");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to escalate alert");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-bg-card border border-border-subtle rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-rose-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/20">
                  <ShieldAlert className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-sora text-text-primary">Escalate to Senior</h3>
                  <p className="text-sm text-text-secondary">Requesting lead intervention for {studentName}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-bg-elevated text-text-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 block">
                    Primrary Reason for Escalation
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Acute escalation of symptoms, zero engagement with outreach..."
                    className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPriority("URGENT")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                      priority === "URGENT" 
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                        : 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Urgent Review</span>
                  </button>
                  <button
                    onClick={() => setPriority("STANDARD")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                      priority === "STANDARD" 
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                        : 'bg-white/5 border-white/5 text-text-secondary hover:bg-white/10'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Standard Escalate</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Detailed Report</label>
                    <button
                      onClick={handleLumaReport}
                      disabled={isDrafting || !reason.trim()}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-500/20 transition-all disabled:opacity-50"
                    >
                      {isDrafting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      Generate Formal Luma Report
                    </button>
                  </div>
                  
                  <textarea
                    value={report}
                    onChange={(e) => setReport(e.target.value)}
                    placeholder="Provide a formal justification for senior counselor review..."
                    className="w-full h-40 bg-bg-elevated border border-border-subtle rounded-xl p-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-bg-elevated/50 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-border-subtle text-text-secondary font-semibold hover:bg-bg-card transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (!reason.trim() && !report.trim())}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-glow-indigo hover:bg-indigo-500 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Escalation"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
