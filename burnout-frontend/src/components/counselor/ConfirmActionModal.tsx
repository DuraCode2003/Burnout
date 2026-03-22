"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

type ActionType = "resolve" | "escalate";

interface ConfirmActionModalProps {
  isOpen: boolean;
  action: ActionType;
  alertId: string;
  isLoading: boolean;
  onConfirm: (data: { note?: string; reason?: string; priority?: string }) => Promise<void>;
  onCancel: () => void;
}

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export function ConfirmActionModal({
  isOpen,
  action,
  alertId,
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState<"HIGH" | "URGENT">("HIGH");

  const isResolve = action === "resolve";
  const isEscalate = action === "escalate";

  const handleSubmit = async () => {
    if (isResolve && !note.trim()) return;
    if (isEscalate && !reason.trim()) return;

    await onConfirm({
      note: isResolve ? note.trim() : undefined,
      reason: isEscalate ? reason.trim() : undefined,
      priority: isEscalate ? priority : undefined,
    });

    // Reset form
    setNote("");
    setReason("");
    setPriority("HIGH");
  };

  const handleClose = () => {
    setNote("");
    setReason("");
    setPriority("HIGH");
    onCancel();
  };

  const getModalConfig = () => {
    if (isResolve) {
      return {
        title: "Resolve Alert",
        icon: CheckCircle,
        iconColor: "text-success",
        iconBg: "bg-success/10",
        buttonColor: "bg-gradient-counselor",
        buttonHover: "hover:opacity-90",
        description: "Mark this alert as resolved. Add a note explaining the resolution.",
        placeholder: "e.g., Contacted student, scheduled follow-up, situation stabilized...",
      };
    }
    return {
      title: "Escalate Alert",
      icon: AlertTriangle,
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
      buttonColor: "bg-gradient-alert-orange",
      buttonHover: "hover:opacity-90",
      description: "Escalate to senior counselor. This will notify them immediately.",
      placeholder: "e.g., Case requires specialized intervention, beyond my scope...",
    };
  };

  const config = getModalConfig();
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="w-full max-w-md p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${config.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-sora text-text-primary">
                      {config.title}
                    </h3>
                    <p className="text-xs text-text-muted">
                      Alert ID: {alertId.slice(0, 8)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-text-secondary mb-4">
                {config.description}
              </p>

              {/* Escalate Priority Selector */}
              {isEscalate && (
                <div className="mb-4">
                  <label className="text-sm font-medium text-text-primary mb-2 block">
                    Priority Level
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPriority("HIGH")}
                      className={`flex-1 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                        priority === "HIGH"
                          ? "bg-warning/10 border-warning/30 text-warning"
                          : "bg-bg-elevated border-border-subtle text-text-secondary hover:border-border-default"
                      }`}
                    >
                      High
                    </button>
                    <button
                      onClick={() => setPriority("URGENT")}
                      className={`flex-1 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                        priority === "URGENT"
                          ? "bg-danger/10 border-danger/30 text-danger"
                          : "bg-bg-elevated border-border-subtle text-text-secondary hover:border-border-default"
                      }`}
                    >
                      Urgent
                    </button>
                  </div>
                </div>
              )}

              {/* Text Area */}
              <div className="mb-4">
                <label className="text-sm font-medium text-text-primary mb-2 block">
                  {isResolve ? "Resolution Note" : "Escalation Reason"}
                </label>
                <textarea
                  value={isResolve ? note : reason}
                  onChange={(e) =>
                    isResolve ? setNote(e.target.value) : setReason(e.target.value)
                  }
                  placeholder={config.placeholder}
                  className="w-full h-32 px-4 py-3 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-counselor transition-colors resize-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-text-muted">
                    {(isResolve ? note : reason).length}/500 characters
                  </span>
                  {isResolve && (
                    <span className="text-xs text-danger">Required</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-bg-elevated border border-border-subtle text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    isLoading ||
                    (isResolve && !note.trim()) ||
                    (isEscalate && !reason.trim())
                  }
                  className={`flex-1 px-4 py-2.5 rounded-xl ${config.buttonColor} text-white font-semibold shadow-lg ${config.buttonHover} transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    config.title
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ConfirmActionModal;
