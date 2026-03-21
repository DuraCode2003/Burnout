'use client';

import { motion } from 'framer-motion';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center text-center p-8 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Icon with float animation */}
      <motion.div
        className="mb-6"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {icon || (
          <div className="w-20 h-20 rounded-2xl bg-bg-surface flex items-center justify-center">
            <svg
              className="w-10 h-10 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
        )}
      </motion.div>

      {/* Title */}
      <motion.h3
        className="text-lg font-semibold font-sora text-text-primary mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          className="text-sm text-text-secondary max-w-sm mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {description}
        </motion.p>
      )}

      {/* Action Button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant={action.variant || 'primary'}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

interface NoDataProps {
  type?: 'mood' | 'sleep' | 'stress' | 'breathing' | 'insights' | 'general';
  onAction?: () => void;
}

export function NoData({ type = 'general', onAction }: NoDataProps) {
  const configs = {
    mood: {
      icon: '📊',
      title: 'No mood data yet',
      description: 'Start tracking your daily mood to see trends and insights',
      actionLabel: 'Do Check-in',
    },
    sleep: {
      icon: '😴',
      title: 'No sleep data',
      description: 'Track your sleep to understand its impact on your wellbeing',
      actionLabel: 'Track Sleep',
    },
    stress: {
      icon: '😌',
      title: 'No stress data',
      description: 'Log your stress levels to identify patterns and triggers',
      actionLabel: 'Log Stress',
    },
    breathing: {
      icon: '🧘',
      title: 'No breathing sessions',
      description: 'Try a breathing exercise to reduce stress and improve focus',
      actionLabel: 'Start Session',
    },
    insights: {
      icon: '💡',
      title: 'Not enough data',
      description: 'Complete at least 7 days of check-ins to see personalized insights',
      actionLabel: 'Start Tracking',
    },
    general: {
      icon: '📭',
      title: 'Nothing here yet',
      description: 'Check back later or try a different action',
      actionLabel: 'Go Home',
    },
  };

  const config = configs[type];

  return (
    <EmptyState
      icon={<span className="text-5xl">{config.icon}</span>}
      title={config.title}
      description={config.description}
      action={
        onAction
          ? {
              label: config.actionLabel,
              onClick: onAction,
            }
          : undefined
      }
    />
  );
}

export default EmptyState;
