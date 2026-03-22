"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import logo from "@/assets/logo.png";

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="bg-bg-surface border-b border-border-subtle sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 overflow-hidden rounded-xl shadow-glow-indigo-sm border border-border-subtle">
              <Image 
                src={logo} 
                alt="Burnout Tracker Logo" 
                fill 
                className="object-cover"
              />
            </div>
            <h1 className="text-xl font-bold font-sora tracking-tight text-text-primary">
              Burnout Tracker
            </h1>
          </div>

          <div className="flex items-center space-x-6">
            <span className="text-sm font-medium text-text-secondary hidden sm:inline">
              Welcome, <span className="text-text-primary">{user?.name || 'Student'}</span>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-text-primary bg-bg-card border border-border-default hover:bg-bg-elevated hover:border-border-strong transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
