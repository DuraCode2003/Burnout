"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Lock,
  UserCheck,
  Loader2
} from "lucide-react";
import { supportService } from "@/services/supportService";
import toast from "react-hot-toast";

interface SupportHubProps {
  alertId: string;
  onSessionCreated: (sessionId: string) => void;
}

export function SupportHub({ alertId, onSessionCreated }: SupportHubProps) {
  const [isExpanding, setIsExpanding] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestSupport = async () => {
    setIsLoading(true);
    try {
      const session = await supportService.requestSupport(alertId, isAnonymous);
      toast.success(isAnonymous ? "Support requested anonymously" : "Support requested");
      onSessionCreated(session.id);
    } catch (error) {
      toast.error("Failed to request support. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative group">
      {/* Decorative Background Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-1000" />
      
      <motion.div
        layout
        className="relative bg-bg-card border border-white/5 rounded-2xl p-6 shadow-2xl overflow-hidden"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20 shadow-glow-indigo">
              <Heart className="w-6 h-6 text-indigo-400 fill-indigo-400/20" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-sora text-text-primary">Wellbeing Support</h3>
              <p className="text-sm text-text-secondary">We've noticed you're under high stress lately.</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Priority Reachout</span>
          </div>
        </div>

        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          Your burnout patterns are showing a significant downward trend. Luma thinks a conversation with a university wellness counselor could help you navigate this week.
        </p>

        <AnimatePresence mode="wait">
          {!isExpanding ? (
            <motion.button
              key="initial-cta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setIsExpanding(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold shadow-glow-indigo hover:shadow-glow-indigo-strong transition-all duration-300"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Talk to someone now</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </motion.button>
          ) : (
            <motion.div
              key="privacy-choice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Privacy Preference</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsAnonymous(true)}
                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                      isAnonymous 
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' 
                        : 'bg-white/5 border-white/5 text-text-muted hover:bg-white/10'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                    <span className="text-xs font-bold">Stay Anonymous</span>
                  </button>
                  <button
                    onClick={() => setIsAnonymous(false)}
                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                      !isAnonymous 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
                        : 'bg-white/5 border-white/5 text-text-muted hover:bg-white/10'
                    }`}
                  >
                    <UserCheck className="w-5 h-5" />
                    <span className="text-xs font-bold">Share My Profile</span>
                  </button>
                </div>
                <p className="text-[10px] text-text-muted italic">
                  {isAnonymous 
                    ? "Counselors only see your anonymized ID. You can reveal your identity later." 
                    : "Sharing your profile helps counselors coordinate with your academic department if needed."}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsExpanding(false)}
                  className="px-4 py-3 rounded-xl border border-white/10 text-text-secondary font-bold text-sm hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestSupport}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-bg-primary font-bold shadow-2xl hover:bg-indigo-50 transition-all"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  Confirm & Connect
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Luma Endorsement */}
        <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-bold text-text-muted italic">
            Luma clinical triage identifies this session as priority for campus wellbeing.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
