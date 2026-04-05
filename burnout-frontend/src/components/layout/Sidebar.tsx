"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { HelpSupportCard } from "@/components/dashboard/HelpSupportCard";
import logo from "@/assets/logo.png";
import { useCheckinStatus } from "@/hooks/useCheckinStatus";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { name: "Check-in", href: "/checkin", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { name: "Insights", href: "/insights", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { name: "Breathing", href: "/breathing", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { hasCheckedInToday } = useCheckinStatus();

  return (
    <aside className="w-72 hidden md:block h-full relative z-20">
      <div className="flex flex-col h-full py-8 pr-6 pl-4 space-y-8">
        {/* Brand/Logo Area */}
        <div className="px-2 mb-4">
          <div className="flex items-center gap-3 group cursor-pointer">
            <motion.div
              className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/20 border border-white/10 flex-shrink-0"
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Image src={logo} alt="Burnout Tracker Logo" fill sizes="44px" className="object-cover" />
            </motion.div>
            <div>
              <h2 className="text-white font-black font-sora text-base tracking-tight leading-tight">Burnout Tracker</h2>
              <p className="text-[9px] text-text-secondary font-bold uppercase tracking-[0.2em] opacity-50">Wellbeing Intelligence</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const isCheckinLocked = item.name === "Check-in" && hasCheckedInToday;

            // Render disabled state for Check-in when already done today
            if (isCheckinLocked) {
              return (
                <div
                  key={item.name}
                  title="You've already checked in today. Come back tomorrow!"
                  className="group flex items-center px-6 py-3.5 rounded-2xl relative overflow-hidden cursor-not-allowed opacity-60 select-none"
                >
                  {/* Subtle checked-in background */}
                  <div className="absolute inset-0 bg-emerald-500/5 border-l-[3px] border-emerald-500/40 rounded-2xl" />

                  <svg
                    className="w-5 h-5 mr-4 relative z-10 text-emerald-500/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>

                  <span className="text-sm font-bold font-sora relative z-10 tracking-wide text-emerald-400/70">
                    {item.name}
                  </span>

                  {/* Done badge */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                    className="ml-auto relative z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30"
                  >
                    <svg className="w-2.5 h-2.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">Done</span>
                  </motion.div>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-6 py-3.5 rounded-2xl transition-all duration-500 relative overflow-hidden ${
                  isActive
                    ? "text-white"
                    : "text-text-secondary hover:text-white"
                }`}
              >
                {/* Active Background Pill */}
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border-l-[3px] border-indigo-500"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <svg
                  className={`w-5 h-5 mr-4 relative z-10 transition-all duration-500 ${
                    isActive ? "text-indigo-400 scale-110" : "text-text-secondary group-hover:text-white group-hover:scale-110"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={isActive ? 2.5 : 2}
                    d={item.icon}
                  />
                </svg>
                <span className={`text-sm font-bold font-sora relative z-10 tracking-wide transition-all duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                  {item.name}
                </span>

                {isActive && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-auto">
          <HelpSupportCard isSidebar />
        </div>
      </div>
    </aside>
  );
}

