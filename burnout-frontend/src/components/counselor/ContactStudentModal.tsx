"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Mail, Users, CheckCircle2, Loader2, MessageSquare } from "lucide-react";
import { counselorService } from "@/services/counselorService";
import { supportService } from "@/services/supportService";
import { toast } from "react-hot-toast";
import { SupportSession } from "@/types/support";

interface ContactStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  alertId: string;
  studentName: string;
  onSuccess: () => void;
  onSessionStarted?: (session: SupportSession) => void;
}

export function ContactStudentModal({ isOpen, onClose, alertId, studentName, onSuccess, onSessionStarted }: ContactStudentModalProps) {
  const [method, setMethod] = useState<"PHONE" | "EMAIL" | "IN_PERSON" | "LIVE_CHAT">("EMAIL");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods: { id: "PHONE" | "EMAIL" | "IN_PERSON" | "LIVE_CHAT", label: string, icon: any, color: string, description?: string }[] = [
    { id: "PHONE", label: "Phone Call", icon: Phone, color: "text-blue-400" },
    { id: "EMAIL", label: "University Email", icon: Mail, color: "text-indigo-400" },
    { id: "IN_PERSON", label: "In-Person Meeting", icon: Users, color: "text-emerald-400" },
    { id: "LIVE_CHAT", label: "Live Chat", icon: MessageSquare, color: "text-violet-400", description: "Open a real-time chat session" },
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (method === "LIVE_CHAT") {
        const session = await supportService.initiateSession(alertId);
        toast.success("Live chat session started!");
        onSessionStarted?.(session);
        onSuccess();
        onClose();
      } else {
        await counselorService.logContact(alertId, { contactMethod: method });
        toast.success("Contact attempt logged successfully");
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error("Failed to process contact action");
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
            className="relative w-full max-w-md bg-bg-card border border-border-subtle rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-border-subtle flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-sora text-text-primary">Log Outreach</h3>
                <p className="text-sm text-text-secondary">Student: {studentName}</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-bg-elevated text-text-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-3">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      method === m.id 
                        ? m.id === 'LIVE_CHAT'
                          ? 'bg-violet-500/10 border-violet-500 shadow-[0_0_16px_rgba(139,92,246,0.2)]'
                          : 'bg-bg-elevated border-indigo-500 shadow-glow-indigo' 
                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-white/5 ${m.color}`}>
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-semibold text-text-primary block">{m.label}</span>
                      {m.description && <span className="text-xs text-text-muted">{m.description}</span>}
                    </div>
                    {method === m.id && (
                      <CheckCircle2 className={`w-5 h-5 ml-auto ${m.id === 'LIVE_CHAT' ? 'text-violet-400' : 'text-indigo-400'}`} />
                    )}
                  </button>
                ))}
              </div>

              <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                method === 'LIVE_CHAT'
                  ? 'bg-violet-500/5 border-violet-500/10 text-violet-300'
                  : 'bg-indigo-500/5 border-indigo-500/10 text-indigo-300'
              }`}>
                {method === 'LIVE_CHAT'
                  ? 'A live chat session will be created immediately. The student will receive a notification to join and can chat securely and anonymously.'
                  : 'Logging a contact attempt will update the SLA timer and notify the clinical lead that this student is currently being supported.'}
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
                disabled={isSubmitting}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-bold transition-all disabled:opacity-50 ${
                  method === 'LIVE_CHAT'
                    ? 'bg-violet-600 hover:bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                    : 'bg-gradient-counselor shadow-glow-counselor hover:opacity-90'
                }`}
              >
                {isSubmitting
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : method === 'LIVE_CHAT'
                    ? <><MessageSquare className="w-4 h-4" /> Start Live Chat</>
                    : 'Confirm Contact'
                }
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
