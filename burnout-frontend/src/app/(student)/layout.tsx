'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { PageTransition } from '@/components/layout/PageTransition';

interface StudentLayoutProps {
  children: React.ReactNode;
}

const PROTECTED_PATHS = [
  '/dashboard',
  '/checkin',
  '/insights',
  '/breathing',
];

export default function StudentLayout({ children }: StudentLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: isLoading } = useAuth();
  const isAuthenticated = !!user;
  const [mounted, setMounted] = useState(false);
  const isBreathingRoute = pathname === '/breathing';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'ADMIN' || user.role === 'COUNSELOR') {
        router.push('/admin');
        return;
      }
      if (!user.consentGiven) {
        router.push('/consent');
      }
    }
  }, [isLoading, user, router]);

  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-indigo border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isBreathingRoute) {
    return (
      <AnimatePresence mode="wait">
        <PageTransition key={pathname}>{children}</PageTransition>
      </AnimatePresence>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bg-primary">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto scrollbar-hide pb-20 lg:pb-0">
          <div className="p-6 md:p-8 lg:p-12">
            <AnimatePresence mode="wait">
              <PageTransition key={pathname}>{children}</PageTransition>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <MobileBottomNav />
    </div>
  );
}
