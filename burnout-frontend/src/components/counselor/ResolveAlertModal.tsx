"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { counselorService } from "@/services/counselorService";
import { toast } from "react-hot-toast";

interface ResolveAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertId: string;
  studentName: string;
  onSuccess: () => void;
}

export function ResolveAlertModal({ isOpen, onClose, alertId, studentName, onSuccess }: ResolveAlertModalProps) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  const handleLumaDraft = async () => {
    setIsDrafting(true);
    try {
      const res = await counselorService.getResolutionDraft(alertId);
      if (res.success) {
        setNotes(res.summary);
        toast.success("Luma generated a resolution draft");
      } else {
        toast.error("Luma failed to generate a draft");
      }
    } catch (error) {
      toast.error("Error connecting to Luma");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast.error("Please provide resolution notes");
      return;
    }

    setIsSubmitting(true);
    try {
      await counselorService.resolveAlert(alertId, { resolutionNotes: notes });
      toast.success("Alert resolved successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to resolve alert");
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
            <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-emerald-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-sora text-text-primary">Resolve Alert</h3>
                  <p className="text-sm text-text-secondary">Closing case for {studentName}</p>
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
              <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl flex gap-3 text-warning-light">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-xs font-medium leading-relaxed">
                  Important: Resolving an alert indicates that the immediate risk is managed. This action will archive the case and inform the system of a successful clinical outcome.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-sm font-bold text-text-primary uppercase tracking-widest">Resolution Summary</label>
                  <button
                    onClick={handleLumaDraft}
                    disabled={isDrafting}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-500/20 transition-all disabled:opacity-50"
                  >
                    {isDrafting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    Draft with Luma AI
                  </button>
                </div>
                
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Summarize the intervention and final student status..."
                  className="w-full h-48 bg-bg-elevated border border-border-subtle rounded-xl p-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                />
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
                disabled={isSubmitting || !notes.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-500 disabled:opacity-50 disabled:grayscale transition-all"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Resolution"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
