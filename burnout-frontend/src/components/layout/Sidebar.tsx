"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpSupportCard } from "@/components/dashboard/HelpSupportCard";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { name: "Check-in", href: "/checkin", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { name: "Insights", href: "/insights", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { name: "Breathing", href: "/breathing", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-bg-surface border-r border-border-subtle hidden md:block h-full scrollbar-hide">
      <div className="flex flex-col h-full py-4">
        <nav className="px-4 flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-accent text-white shadow-glow-indigo-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 transition-colors ${
                    isActive ? "text-white" : "text-text-secondary"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                <span className="font-medium font-sora">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="px-4 mt-auto">
          <HelpSupportCard isSidebar />
        </div>
      </div>
    </aside>
  );
}
