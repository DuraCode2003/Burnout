'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6">
      <motion.div
        className="max-w-lg w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 404 Gradient Text */}
        <motion.h1
          className="text-8xl xs:text-9xl font-extrabold font-sora mb-4 bg-gradient-accent bg-clip-text text-transparent"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            delay: 0.2,
          }}
        >
          404
        </motion.h1>

        {/* Animated decoration */}
        <motion.div
          className="relative h-1 mb-8"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="absolute inset-0 bg-gradient-accent rounded-full" />
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-2xl font-bold font-sora text-text-primary mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Page not found
        </motion.h2>

        {/* Description */}
        <motion.p
          className="text-text-secondary mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </motion.p>

        {/* Floating emoji */}
        <motion.div
          className="text-6xl mb-8"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          🔍
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link href="/dashboard">
            <motion.button
              className="w-full sm:w-auto py-3 px-8 rounded-xl font-semibold font-sora text-white bg-gradient-accent hover:shadow-glow-indigo-lg transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Go to Dashboard
            </motion.button>
          </Link>

          <motion.button
            onClick={() => router.back()}
            className="w-full sm:w-auto py-3 px-8 rounded-xl font-semibold font-sora text-text-secondary bg-bg-surface border border-border-subtle hover:border-border-default transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Go Back
          </motion.button>
        </motion.div>

        {/* Help Links */}
        <motion.div
          className="mt-12 pt-8 border-t border-border-subtle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-sm text-text-muted mb-4">Need help?</p>
          <div className="flex justify-center gap-6 text-sm">
            <Link
              href="/dashboard"
              className="text-accent-indigo hover:text-accent-violet transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/checkin"
              className="text-accent-indigo hover:text-accent-violet transition-colors"
            >
              Daily Check-in
            </Link>
            <Link
              href="/insights"
              className="text-accent-indigo hover:text-accent-violet transition-colors"
            >
              Insights
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
