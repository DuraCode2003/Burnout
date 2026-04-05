import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Send, CheckCircle2, Loader2, X } from 'lucide-react';
import { api } from '@/services/api';

interface HelpSupportCardProps {
  isSidebar?: boolean;
}

export function HelpSupportCard({ isSidebar }: HelpSupportCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [urgency, setUrgency] = useState<"LOW" | "HIGH">("LOW");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    try {
      setStatus("loading");
      await api.post("/api/support/request", { reason, urgency });
      setStatus("success");
      setTimeout(() => {
        setIsOpen(false);
        setStatus("idle");
        setReason("");
        setUrgency("LOW");
      }, 3000);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div
      className={`card-glow ${
        isSidebar ? "p-4" : "p-card"
      } h-full flex flex-col justify-between`}
    >
      <div>
        <div className={`flex items-center gap-3 ${isSidebar ? "mb-2" : "mb-4"}`}>
          <div
            className={`${
              isSidebar ? "w-8 h-8" : "w-10 h-10"
            } rounded-xl bg-orange-500/10 flex items-center justify-center`}
          >
            <ShieldAlert
              className={`${isSidebar ? "w-4 h-4" : "w-5 h-5"} text-orange-500`}
            />
          </div>
          <h3
            className={`${
              isSidebar ? "text-base" : "text-lg"
            } font-bold font-sora text-text-primary`}
          >
            Need Help?
          </h3>
        </div>
        {!isSidebar && (
          <p className="text-sm text-text-secondary mb-6">
            Connect directly with a Wellbeing Counselor if you're feeling
            overwhelmed or need immediate support.
          </p>
        )}
      </div>

      <button
        onClick={() => setIsOpen(true)}
        className={`w-full ${
          isSidebar ? "py-2 text-xs" : "py-2.5 text-sm"
        } rounded-xl bg-bg-elevated text-text-primary font-semibold hover:bg-bg-elevated/80 border border-border-subtle transition-colors flex items-center justify-center gap-2`}
      >
        <Send className={isSidebar ? "w-3 h-3" : "w-4 h-4"} />{" "}
        {isSidebar ? "Support" : "Request Specialist Support"}
      </button>

      {/* Modal Dialog */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-bg-card border border-border-subtle rounded-2xl shadow-xl overflow-hidden pointer-events-auto relative z-[160]"
              >
              <div className="flex items-center justify-between p-4 border-b border-border-subtle">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-orange-500" />
                  Request Support
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-text-muted hover:bg-bg-elevated transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {status === 'success' ? (
                  <div className="text-center py-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 mx-auto mb-4 bg-success/10 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-8 h-8 text-success" />
                    </motion.div>
                    <h4 className="text-xl font-bold text-text-primary mb-2">Request Sent</h4>
                    <p className="text-text-secondary">
                      A counselor has been notified and will reach out to you shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        How can we help? (Optional, but helpful)
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="I'm feeling very overwhelmed with my workload..."
                        className="w-full h-24 px-4 py-3 rounded-xl bg-bg-elevated border border-border-subtle focus:border-accent-primary focus:ring-1 focus:ring-accent-primary outline-none text-text-primary resize-none transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Urgency Level
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setUrgency('LOW')}
                          className={`py-2 rounded-xl text-sm font-semibold border transition-colors ${
                            urgency === 'LOW'
                              ? 'bg-accent-primary text-white border-accent-primary'
                              : 'bg-bg-elevated text-text-secondary border-border-subtle hover:border-accent-primary/50'
                          }`}
                        >
                          I can wait a bit
                        </button>
                        <button
                          type="button"
                          onClick={() => setUrgency('HIGH')}
                          className={`py-2 rounded-xl text-sm font-semibold border transition-colors ${
                            urgency === 'HIGH'
                              ? 'bg-orange-500 text-white border-orange-500 shadow-glow-urgent'
                              : 'bg-bg-elevated text-text-secondary border-border-subtle hover:border-orange-500/50'
                          }`}
                        >
                          I need help now
                        </button>
                      </div>
                    </div>

                    {status === 'error' && (
                      <p className="text-sm text-danger mt-2">
                        Failed to send request. Please try again.
                      </p>
                    )}

                    <div className="pt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="flex-1 py-2.5 rounded-xl bg-bg-elevated text-text-primary font-semibold hover:bg-bg-elevated/80 border border-border-subtle transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-primary text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70"
                      >
                        {status === 'loading' ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          'Send Request'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </div>
  );
}
