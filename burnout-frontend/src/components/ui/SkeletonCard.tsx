'use client';

import { motion } from 'framer-motion';

interface SkeletonCardProps {
  className?: string;
  variant?: 'default' | 'compact' | 'tall' | 'wide';
}

const variantClasses = {
  default: 'h-48',
  compact: 'h-32',
  tall: 'h-64',
  wide: 'h-48 md:col-span-2',
};

export function SkeletonCard({ className = '', variant = 'default' }: SkeletonCardProps) {
  return (
    <motion.div
      className={`card-glow p-6 overflow-hidden ${variantClasses[variant]} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col h-full">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-bg-elevated rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-bg-elevated rounded w-16 animate-pulse" />
        </div>

        {/* Content skeleton */}
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-bg-elevated rounded w-full animate-pulse" />
          <div className="h-4 bg-bg-elevated rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-bg-elevated rounded w-4/6 animate-pulse" />
        </div>

        {/* Footer skeleton */}
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <div className="flex justify-between">
            <div className="h-3 bg-bg-elevated rounded w-20 animate-pulse" />
            <div className="h-3 bg-bg-elevated rounded w-16 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 0.5,
          ease: 'easeInOut',
        }}
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
        }}
      />
    </motion.div>
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-bg-elevated rounded animate-pulse"
          style={{
            width: i === lines - 1 ? '60%' : i === lines - 2 ? '80%' : '100%',
          }}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

interface SkeletonCircleProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export function SkeletonCircle({ size = 'md', className = '' }: SkeletonCircleProps) {
  return (
    <motion.div
      className={`${sizeClasses[size]} rounded-full bg-bg-elevated animate-pulse ${className}`}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        repeatType: 'reverse',
      }}
    />
  );
}

export default SkeletonCard;
