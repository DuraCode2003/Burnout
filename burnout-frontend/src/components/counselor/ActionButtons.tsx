"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  ArrowUpCircle,
  MessageSquare,
  Phone,
  Mail,
  UserCheck,
  Loader2,
} from "lucide-react";
import type { Alert, AlertStatus } from "@/types/counselor";

interface ActionButtonsProps {
  alert: Alert;
  onResolve: (notes?: string) => Promise<void>;
  onEscalate: (reason: string, priority: "HIGH" | "URGENT") => Promise<void>;
  onContact: (method: "EMAIL" | "PHONE" | "MESSAGE" | "IN_PERSON", notes?: string) => Promise<void>;
  onSendMessage: (message: string) => Promise<void>;
}

export function ActionButtons({
  alert,
  onResolve,
  onEscalate,
  onContact,
  onSendMessage,
}: ActionButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");

  const isAssignedToMe = !!alert.assignedTo;
  const canResolve = alert.status !== "RESOLVED";
  const canEscalate = alert.status !== "ESCALATED" && alert.status !== "RESOLVED";

  const handleAction = async (action: string, fn: () => Promise<void>) => {
    setLoading(action);
    try {
      await fn();
    } catch (error) {
      console.error(`Action ${action} failed:`, error);
    } finally {
      setLoading(null);
    }
  };

  const handleResolve = async () => {
    await handleAction("resolve", () => onResolve());
  };

  const handleEscalate = async () => {
    const reason = prompt("Enter escalation reason:");
    if (!reason) return;
    const priority = alert.tier === "RED" ? "URGENT" : "HIGH";
    await handleAction("escalate", () => onEscalate(reason, priority));
  };

  const handleContact = async (method: "EMAIL" | "PHONE" | "MESSAGE" | "IN_PERSON") => {
    const notes = prompt("Add notes about this contact (optional):") || undefined;
    await handleAction("contact", () => onContact(method, notes));
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    await handleAction("send-message", () => onSendMessage(messageText));
    setMessageText("");
    setShowMessageModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-3">
        {/* Resolve */}
        {canResolve && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleResolve}
            disabled={loading === "resolve"}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-success/10 text-success border border-success/30 hover:bg-success/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === "resolve" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Resolve</span>
              </>
            )}
          </motion.button>
        )}

        {/* Escalate */}
        {canEscalate && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEscalate}
            disabled={loading === "escalate"}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading === "escalate" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ArrowUpCircle className="w-5 h-5" />
                <span className="font-medium">Escalate</span>
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Contact Options */}
      <div className="pt-4 border-t border-border-subtle">
        <h4 className="text-sm font-semibold text-text-primary mb-3">Contact Student</h4>
        <div className="grid grid-cols-4 gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleContact("EMAIL")}
            disabled={loading === "contact"}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-bg-elevated border border-border-subtle hover:bg-bg-card transition-colors disabled:opacity-50"
          >
            <Mail className="w-5 h-5 text-accent-counselor-light" />
            <span className="text-xs text-text-secondary">Email</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleContact("PHONE")}
            disabled={loading === "contact"}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-bg-elevated border border-border-subtle hover:bg-bg-card transition-colors disabled:opacity-50"
          >
            <Phone className="w-5 h-5 text-accent-counselor-light" />
            <span className="text-xs text-text-secondary">Phone</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMessageModal(true)}
            disabled={loading === "send-message"}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-bg-elevated border border-border-subtle hover:bg-bg-card transition-colors disabled:opacity-50"
          >
            <MessageSquare className="w-5 h-5 text-accent-counselor-light" />
            <span className="text-xs text-text-secondary">Message</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleContact("IN_PERSON")}
            disabled={loading === "contact"}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-bg-elevated border border-border-subtle hover:bg-bg-card transition-colors disabled:opacity-50"
          >
            <UserCheck className="w-5 h-5 text-accent-counselor-light" />
            <span className="text-xs text-text-secondary">In Person</span>
          </motion.button>
        </div>
      </div>

      {/* Message Modal */}
      <AnimatePresence>
        {showMessageModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMessageModal(false)}
            />
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="w-full max-w-md p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-glow-counselor">
                <h3 className="text-lg font-bold font-sora text-text-primary mb-4">
                  Send Check-in Message
                </h3>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Write a supportive message to the student..."
                  className="w-full h-40 px-4 py-3 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-counselor transition-colors resize-none"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || loading === "send-message"}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-counselor text-white font-semibold shadow-glow-counselor hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === "send-message" ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      "Send Message"
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
