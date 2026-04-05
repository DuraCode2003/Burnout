"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  CheckCircle,
  ArrowUpCircle,
} from "lucide-react";
import type { Alert } from "@/types/counselor";
import { ContactStudentModal } from "./ContactStudentModal";
import { ResolveAlertModal } from "./ResolveAlertModal";
import { EscalateAlertModal } from "./EscalateAlertModal";
import { SupportSession } from "@/types/support";

interface ActionButtonsProps {
  alert: Alert;
  onSuccess: () => void;
  onSessionStarted?: (session: SupportSession) => void;
}

export function ActionButtons({
  alert,
  onSuccess,
  onSessionStarted,
}: ActionButtonsProps) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);

  const isContacted = alert.actions.some(
    (a) => a.actionType === "CONTACTED"
  );

  const studentName = alert.student.isAnonymous 
    ? alert.student.anonymousId 
    : (alert.student.name || "Unknown Student");

  return (
    <div className="space-y-4">
      {/* Mark as Contacted */}
      <motion.button
        whileHover={{ scale: isContacted ? 1 : 1.02 }}
        whileTap={{ scale: isContacted ? 1 : 0.98 }}
        onClick={() => setShowContactModal(true)}
        disabled={isContacted}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
          isContacted
            ? "bg-success/10 text-success border border-success/30 cursor-default"
            : "bg-gradient-counselor text-white shadow-glow-counselor hover:opacity-90"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isContacted ? (
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
        disabled={alert.status === "RESOLVED"}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-success/10 text-success border border-border-subtle hover:bg-success/20 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckCircle className="w-5 h-5" />
        <span>Resolve Alert</span>
      </motion.button>

      {/* Escalate to Senior */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowEscalateModal(true)}
        disabled={alert.status === "ESCALATED"}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-bg-elevated text-text-secondary border border-border-subtle hover:text-warning hover:border-warning/30 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowUpCircle className="w-5 h-5" />
        <span>Escalate to Senior</span>
      </motion.button>

      {/* High-Fidelity Modals */}
      <ContactStudentModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        alertId={alert.id}
        studentName={studentName}
        onSuccess={onSuccess}
        onSessionStarted={onSessionStarted}
      />

      <ResolveAlertModal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        alertId={alert.id}
        studentName={studentName}
        onSuccess={onSuccess}
      />

      <EscalateAlertModal
        isOpen={showEscalateModal}
        onClose={() => setShowEscalateModal(false)}
        alertId={alert.id}
        studentName={studentName}
        onSuccess={onSuccess}
      />
    </div>
  );
}

export default ActionButtons;
