"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { burnoutService } from "@/services/burnoutService";
import { supportService } from "@/services/supportService";
import { StudentChatPane } from "@/components/dashboard/StudentChatPane";

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    async function fetchSupportData() {
      if (!user) return;
      try {
        const alert = await burnoutService.getActiveAlert();
        if (alert) {
          const session = await supportService.getActiveSession(alert.id);
          if (session) {
            setActiveSessionId(session.id);
            setIsAnonymous(session.isAnonymous);
          }
        }
      } catch (err) {
        console.error("Failed to fetch support data in Navbar:", err);
      }
    }
    fetchSupportData();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-[100] w-full px-6 py-4 pointer-events-none">
      <motion.div 
        className="max-w-7xl mx-auto h-16 px-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] flex items-center justify-between shadow-2xl pointer-events-auto"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Brand logo in navbar */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 overflow-hidden rounded-xl shadow-lg shadow-indigo-500/20">
            <Image src={logo} alt="Burnout Tracker Logo" fill sizes="36px" className="object-cover" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-sm font-black font-sora text-white tracking-tight leading-none">Burnout Tracker</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-text-secondary/50 mt-0.5">Wellbeing Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 border-r border-white/5 pr-8">
            {activeSessionId && (
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors mr-2 group"
                title="Open Counselor Chat"
              >
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#1a2235] z-10" />
                <MessageCircle className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </button>
            )}
            
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase tracking-widest font-medium text-text-secondary/50">Welcome back</p>
              <p className="text-sm font-bold text-white font-sora">{user?.name || 'Student'}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold overflow-hidden shadow-lg">
              {user?.name?.[0] || 'S'}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-text-secondary hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/15 transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </motion.div>

      {/* Global Support Chat Pane */}
      {activeSessionId && isChatOpen && (
        <div className="pointer-events-auto">
          <StudentChatPane
            sessionId={activeSessionId}
            isAnonymous={isAnonymous}
            onClose={() => setIsChatOpen(false)}
            onIdentityRevealed={() => setIsAnonymous(false)}
          />
        </div>
      )}
    </nav>
  );
}
