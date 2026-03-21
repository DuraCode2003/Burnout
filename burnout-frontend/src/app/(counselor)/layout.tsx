"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { CounselorSidebar } from "@/components/counselor/CounselorSidebar";
import { CounselorRoleGuard } from "@/components/counselor/CounselorRoleGuard";
import { CounselorTopBar } from "@/components/counselor/CounselorTopBar";
import { Loader2 } from "lucide-react";
import counselorService from "@/services/counselorService";

interface CounselorLayoutProps {
  children: React.ReactNode;
}

export default function CounselorLayout({ children }: CounselorLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (!loading && user && user.role !== "COUNSELOR" && user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Fetch unread alert count
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const stats = await counselorService.getStats();
        setUnreadCount(stats.queue.urgent + stats.queue.red);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount();
    
    // Refresh every 2 minutes
    const interval = setInterval(fetchUnreadCount, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-accent-counselor" />
          <p className="text-text-secondary">Loading counselor portal...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "COUNSELOR" && user.role !== "ADMIN")) {
    return null;
  }

  return (
    <CounselorRoleGuard>
      <div className="min-h-screen bg-bg-primary">
        <CounselorSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeRoute={pathname}
          unreadCount={unreadCount}
        />
        
        <div className="lg:pl-64">
          <CounselorTopBar onMenuClick={() => setSidebarOpen(true)} />
          
          <main className="p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </CounselorRoleGuard>
  );
}
