'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ConsentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<'contribute' | 'private' | null>(null);

  const { updateConsent } = useAuth();

  const handleSubmit = async (choice: 'contribute' | 'private') => {
    setSelected(choice);
    setIsLoading(true);

    try {
      await updateConsent({
        hasConsented: choice === 'contribute',
        anonymizeData: true,
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to submit consent:', error);
      router.push('/dashboard');
    }
  };

  const shieldVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 2, ease: 'easeInOut', delay: 0.2 },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
          animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[150px]"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }}
          animate={{ x: [0, -30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Icon */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
        >
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>

              {/* Shield outline */}
              <motion.path
                d="M50 5 L85 20 L85 50 C85 75 50 90 50 90 C50 90 15 75 15 50 L15 20 Z"
                fill="none"
                stroke="url(#shieldGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={shieldVariants}
                initial="hidden"
                animate="visible"
              />

              {/* Shield inner */}
              <motion.path
                d="M50 15 L75 26 L75 50 C75 68 50 80 50 80 C50 80 25 68 25 50 L25 26 Z"
                fill="rgba(16, 185, 129, 0.1)"
                stroke="rgba(16, 185, 129, 0.3)"
                strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: 'easeInOut', delay: 1 }}
              />

              {/* Checkmark */}
              <motion.path
                d="M35 50 L48 63 L65 37"
                fill="none"
                stroke="url(#shieldGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, ease: 'easeInOut', delay: 1.5 }}
              />
            </svg>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div className="text-center mb-8">
          <motion.h1
            className="text-3xl font-bold font-sora text-text-primary mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Your privacy matters
          </motion.h1>
          <motion.p
            className="text-text-secondary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Choose how your data is used to improve student wellbeing
          </motion.p>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          className="grid grid-cols-2 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {[
            { icon: '📊', title: 'What we collect', desc: 'Mood, sleep, and stress data from your check-ins' },
            { icon: '🎯', title: 'Why we collect', desc: 'To provide personalized insights and recommendations' },
            { icon: '👁️', title: 'Who can see', desc: 'Only you and our secure systems' },
            { icon: '🏛️', title: 'Admin sees', desc: 'Anonymous aggregated data only' },
          ].map((card, index) => (
            <motion.div
              key={card.title}
              className="p-4 rounded-xl bg-bg-surface/50 border border-border-subtle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-2xl mb-2 block">{card.icon}</span>
              <h3 className="text-sm font-semibold text-text-primary mb-1">{card.title}</h3>
              <p className="text-xs text-text-secondary">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Choice Buttons */}
        <motion.div className="space-y-4 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
          <button
            onClick={() => handleSubmit('contribute')}
            disabled={isLoading}
            className="w-full p-5 rounded-2xl border-2 border-success/30 bg-success/10 hover:bg-success/15 hover:border-success/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left group"
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl">🤝</span>
              </motion.div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-success mb-1">
                  Yes, contribute to campus wellbeing
                </h3>
                <p className="text-sm text-text-secondary">
                  Help improve student mental health resources with anonymized data
                </p>
              </div>
              <motion.div
                className="w-6 h-6 rounded-full border-2 border-success flex items-center justify-center"
                animate={{ scale: selected === 'contribute' ? 1.1 : 1 }}
              >
                {selected === 'contribute' && (
                  <motion.div
                    className="w-3 h-3 rounded-full bg-success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                  />
                )}
              </motion.div>
            </div>
          </button>

          <button
            onClick={() => handleSubmit('private')}
            disabled={isLoading}
            className="w-full p-5 rounded-2xl border-2 border-border-subtle bg-bg-surface/50 hover:border-border-default transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left group"
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="w-12 h-12 rounded-xl bg-bg-elevated flex items-center justify-center flex-shrink-0"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl">🔒</span>
              </motion.div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary mb-1">
                  Keep my data private
                </h3>
                <p className="text-sm text-text-secondary">
                  Your data is used only for your personal insights
                </p>
              </div>
              <motion.div
                className="w-6 h-6 rounded-full border-2 border-border-default flex items-center justify-center"
                animate={{ scale: selected === 'private' ? 1.1 : 1 }}
              >
                {selected === 'private' && (
                  <motion.div
                    className="w-3 h-3 rounded-full bg-text-secondary"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                  />
                )}
              </motion.div>
            </div>
          </button>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-text-secondary text-sm">
              Setting up your preferences...
            </span>
          </motion.div>
        )}

        {/* Footer Note */}
        <motion.p
          className="text-center text-xs text-text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Change anytime in Settings
        </motion.p>
      </motion.div>
    </div>
  );
}
