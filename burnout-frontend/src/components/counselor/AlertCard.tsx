"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  AlertTriangle,
  Hash,
  User,
  ArrowRight,
  Clock,
  TrendingUp,
  Lock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import type { Alert } from "@/types/counselor";
import { counselorService } from "@/services/counselorService";

interface AlertCardProps {
  alert: Alert;
  index?: number;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function AlertCard({ alert, index = 0, selectable = false, selected = false, onToggleSelect }: AlertCardProps) {
  const router = useRouter();
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const isRed = alert.tier === "RED";
  const isOrange = alert.tier === "ORANGE";
  const isYellow = alert.tier === "YELLOW";
  const isUrgent = alert.isUrgent || isRed;

  const handleAiInsightClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showAiSummary) {
      setShowAiSummary(false);
      return;
    }

    setShowAiSummary(true);
    if (!aiSummary) {
      setIsAiLoading(true);
      try {
        const res = await counselorService.getAiSummary(alert.id);
        if (res.success) {
          setAiSummary(res.summary);
        } else {
          setAiSummary("Unable to generate insight at this time.");
        }
      } catch (err) {
        setAiSummary("Error connecting to Luma AI.");
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  const getSeverityStyles = () => {
    if (isRed) return { 
      border: "border-l-rose-500", 
      glow: "shadow-[0_0_20px_rgba(244,63,94,0.15)]",
      badge: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      accent: "#f43f5e"
    };
    if (isOrange) return { 
      border: "border-l-orange-500", 
      glow: "shadow-[0_0_20px_rgba(249,115,22,0.1)]",
      badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      accent: "#f97316"
    };
    return { 
      border: "border-l-amber-500", 
      glow: "",
      badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      accent: "#f59e0b"
    };
  };

  const styles = getSeverityStyles();

  const handleClick = () => {
    router.push(`/counselor/alert/${alert.id}`);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
      className={`group relative flex flex-col rounded-2xl bg-white/[0.02] backdrop-blur-xl border border-white/5 ${styles.border} border-l-4 overflow-hidden transition-all duration-500 hover:bg-white/[0.04] ${styles.glow}`}
    >
      <div className="p-5 flex flex-col" onClick={handleClick}>
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {selectable && (
              <div 
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect?.(alert.id);
                }}
              >
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${selected ? 'bg-indigo-500 border-indigo-500' : 'border-white/10 hover:border-indigo-400'}`}>
                  {selected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
            )}
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${styles.badge}`}>
              {isRed ? "Urgent" : isOrange ? "Priority" : "Monitor"}
            </span>
            {alert.supportRequested && (
              <motion.span 
                animate={{ opacity: [1, 0.5, 1], scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-indigo-500 text-white shadow-glow-indigo"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                STUDENT WAITING
              </motion.span>
            )}
            {alert.student.isAnonymous && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold bg-white/5 text-white/40 border border-white/5">
                <Lock className="w-2.5 h-2.5" />
                ANONYMOUS
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-white/30 text-[10px] font-bold uppercase tracking-wider">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(alert.createdAt)}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          <div className="md:col-span-8">
            <h3 className="text-lg font-bold font-sora text-white mb-2 tracking-tight group-hover:text-indigo-300 transition-colors">
              {isRed ? "Immediate intervention required" : isOrange ? "Downward trend detected" : "Behavioral shift noted"}
            </h3>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                {alert.student.isAnonymous ? <Hash className="w-4 h-4 text-white/40" /> : <User className="w-4 h-4 text-indigo-400" />}
              </div>
              <div>
                <p className="text-sm font-bold text-white/90">
                  {alert.student.isAnonymous ? alert.student.anonymousId : alert.student.name}
                </p>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  {alert.student.department || "General Student body"}
                </p>
              </div>
            </div>

            <p className="text-sm text-white/60 line-clamp-2 leading-relaxed">
              {alert.triggers[0]?.description || "No specific trigger description provided."}
            </p>
          </div>

          <div className="md:col-span-4 flex flex-col gap-3">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Risk Metrics</span>
                <TrendingUp className={`w-3.5 h-3.5 ${alert.riskIndicators.moodTrend === 'declining' ? 'text-rose-400 rotate-180' : 'text-emerald-400'}`} />
              </div>
              <div className="flex items-end gap-2">
                <span className={`text-2xl font-black font-sora ${alert.riskIndicators.burnoutScore > 70 ? 'text-rose-400' : 'text-amber-400'}`}>
                  {Math.round(alert.riskIndicators.burnoutScore)}
                </span>
                <span className="text-[10px] font-bold text-white/20 uppercase mb-1">Score</span>
              </div>
            </div>

            <button
              onClick={handleAiInsightClick}
              className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${
                showAiSummary 
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' 
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Luma Insight
              {showAiSummary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable AI Summary Section */}
      <AnimatePresence>
        {showAiSummary && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-t border-white/5 bg-gradient-to-br from-indigo-500/[0.05] to-transparent"
          >
            <div className="p-5 pt-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-4 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                  Luma Clinical Analysis
                </h4>
              </div>
              
              <div className="relative p-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
                
                {isAiLoading ? (
                  <div className="flex items-center gap-3 py-6 justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                    <p className="text-xs text-white/40 font-medium tracking-tight">AI is synthesizing risk patterns...</p>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        h3: ({ ...props }) => <h3 className="text-[11px] font-black text-white/40 uppercase tracking-widest mt-4 mb-2 first:mt-0" {...props} />,
                        p: ({ ...props }) => <p className="text-sm text-white/80 leading-relaxed mb-3 last:mb-0" {...props} />,
                        ul: ({ ...props }) => <ul className="space-y-1.5 mb-4 last:mb-0" {...props} />,
                        li: ({ ...props }) => (
                          <li className="flex items-start gap-2 text-sm text-white/70">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo-500 flex-shrink-0" />
                            {props.children}
                          </li>
                        ),
                      }}
                    >
                      {aiSummary || ""}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-white/30 tracking-tight">Confidence Score: High (94%)</span>
                </div>
                <button 
                  onClick={handleClick}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Join Case Triage <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Footer */}
      <div className="px-5 py-3 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
          SLA: {isRed ? "2 hours remaining" : "24h standard"}
        </span>
        <button 
          className="text-[10px] font-black text-white group-hover:text-indigo-300 transition-colors flex items-center gap-1"
          onClick={handleClick}
        >
          {isRed ? "ENGAGE" : "VIEW"} <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export default AlertCard;
