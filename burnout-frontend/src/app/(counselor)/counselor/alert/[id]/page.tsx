"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import counselorService from "@/services/counselorService";
import { AlertDetailPanel } from "@/components/counselor/AlertDetailPanel";
import { ActionButtons } from "@/components/counselor/ActionButtons";
import { NoteEditor } from "@/components/counselor/NoteEditor";
import { CrisisResourcePanel } from "@/components/counselor/CrisisResourcePanel";
import { RiskBadge } from "@/components/counselor/RiskBadge";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import type { Alert } from "@/types/counselor";
import toast from "react-hot-toast";

export default function AlertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const alertId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAlert = useCallback(async () => {
    try {
      setLoading(true);
      const data = await counselorService.getAlert(alertId);
      setAlert(data);
    } catch (error) {
      console.error("Failed to fetch alert:", error);
      toast.error("Failed to load alert details");
    } finally {
      setLoading(false);
    }
  }, [alertId]);

  useEffect(() => {
    fetchAlert();
  }, [fetchAlert]);

  const handleResolve = async (notes?: string) => {
    setActionLoading("resolve");
    try {
      const updated = await counselorService.resolveAlert(alertId, {
        resolutionNotes: notes,
      });
      setAlert(updated);
      toast.success("Alert marked as resolved");
      router.push("/counselor");
    } catch (error) {
      console.error("Failed to resolve alert:", error);
      toast.error("Failed to resolve alert");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEscalate = async (reason: string, priority: "HIGH" | "URGENT") => {
    setActionLoading("escalate");
    try {
      const updated = await counselorService.escalateAlert(alertId, {
        reason,
        priority,
      });
      setAlert(updated);
      toast.success("Alert escalated to senior counselor");
    } catch (error) {
      console.error("Failed to escalate alert:", error);
      toast.error("Failed to escalate alert");
    } finally {
      setActionLoading(null);
    }
  };

  const handleContact = async (
    method: "EMAIL" | "PHONE" | "MESSAGE" | "IN_PERSON",
    notes?: string
  ) => {
    setActionLoading("contact");
    try {
      const updated = await counselorService.logContact(alertId, {
        contactMethod: method,
        notes,
      });
      setAlert(updated);
      toast.success("Contact logged successfully");
    } catch (error) {
      console.error("Failed to log contact:", error);
      toast.error("Failed to log contact");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendMessage = async (message: string) => {
    setActionLoading("send-message");
    try {
      const updated = await counselorService.sendMessage(alertId, {
        message,
      });
      setAlert(updated);
      toast.success("Message sent to student");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddNote = async (content: string, isInternal: boolean) => {
    try {
      const updated = await counselorService.addNote(alertId, {
        content,
        isInternal,
      });
      setAlert(updated);
      toast.success("Note added");
    } catch (error) {
      console.error("Failed to add note:", error);
      toast.error("Failed to add note");
    }
  };

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

  if (!alert) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-danger" />
          <h2 className="text-xl font-bold font-sora text-text-primary mb-2">
            Alert Not Found
          </h2>
          <p className="text-text-secondary mb-4">
            This alert may have been resolved or deleted
          </p>
          <button
            onClick={() => router.push("/counselor")}
            className="px-6 py-2 rounded-xl bg-gradient-counselor text-white font-medium shadow-glow-counselor hover:opacity-90 transition-opacity"
          >
            Back to Alert Queue
          </button>
        </div>
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
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Alert Details */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-bg-card border border-border-subtle"
          >
            <AlertDetailPanel alert={alert} />
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-bg-card border border-border-subtle"
          >
            <h3 className="text-lg font-bold font-sora text-text-primary mb-4">
              Take Action
            </h3>
            <ActionButtons
              alert={alert}
              onResolve={handleResolve}
              onEscalate={handleEscalate}
              onContact={handleContact}
              onSendMessage={handleSendMessage}
            />
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-bg-card border border-border-subtle"
          >
            <NoteEditor
              notes={alert.notes}
              onAddNote={handleAddNote}
            />
          </motion.div>
        </div>

        {/* Right: Crisis Resources */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="sticky top-24"
          >
            <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle">
              <CrisisResourcePanel />
            </div>

            {/* Alert Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-6 rounded-2xl bg-bg-card border border-border-subtle"
            >
              <h3 className="text-sm font-semibold text-text-primary mb-4">
                Alert Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent-counselor mt-1.5" />
                  <div>
                    <p className="text-sm text-text-primary">Alert Created</p>
                    <p className="text-xs text-text-muted">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {alert.actions.map((action, index) => (
                  <div key={action.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-success mt-1.5" />
                    <div>
                      <p className="text-sm text-text-primary">
                        {action.actionType.replace("_", " ")}
                      </p>
                      <p className="text-xs text-text-muted">
                        {action.performedByName} •{" "}
                        {new Date(action.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
