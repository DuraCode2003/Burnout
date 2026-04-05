'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 w-full px-6 py-4">
        <motion.div
          className="max-w-5xl mx-auto h-14 px-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] flex items-center justify-between shadow-xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 overflow-hidden rounded-xl border border-white/10">
              <Image src={logo} alt="Burnout Tracker" fill sizes="32px" className="object-cover" />
            </div>
            <span className="text-sm font-black font-sora text-white tracking-tight">Burnout Tracker</span>
          </Link>

          <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-text-secondary/60">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/login" className="px-4 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all">
              Sign In
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* Page Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-white/5">
        <p className="text-[10px] uppercase tracking-widest font-medium text-text-secondary/30">
          © 2025 Burnout Tracker · Privacy Policy · Terms
        </p>
      </footer>
    </div>
  );
}
