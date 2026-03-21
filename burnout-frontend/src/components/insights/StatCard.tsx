'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: string;
  color?: string;
  suffix?: string;
}

function AnimatedNumber({
  value,
  suffix = '',
}: {
  value: number;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {value % 1 === 0 ? Math.round(displayValue) : displayValue.toFixed(1)}
      {suffix}
    </span>
  );
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  color = '#6366f1',
  suffix = '',
}: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  const getChangeColor = () => {
    if (label.toLowerCase().includes('burnout') || label.toLowerCase().includes('stress')) {
      return isNegative ? 'text-success' : isPositive ? 'text-danger' : 'text-text-muted';
    }
    return isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-text-muted';
  };

  const getChangeIcon = () => {
    if (isPositive) return '↑';
    if (isNegative) return '↓';
    return '→';
  };

  return (
    <motion.div
      className="card-glow p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-4">
        <motion.div
          className="flex items-center justify-center w-12 h-12 rounded-xl"
          style={{
            background: `${color}15`,
            border: `1px solid ${color}30`,
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <span className="text-2xl">{icon}</span>
        </motion.div>

        {change !== undefined && (
          <motion.div
            className={`flex items-center gap-1 text-sm font-medium ${getChangeColor()}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span>{getChangeIcon()}</span>
            <span>{Math.abs(change).toFixed(0)}%</span>
          </motion.div>
        )}
      </div>

      <div className="mb-2">
        <motion.div
          className="text-3xl xs:text-4xl font-bold font-sora text-text-primary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {typeof value === 'number' ? (
            <AnimatedNumber value={value} suffix={suffix} />
          ) : (
            value
          )}
        </motion.div>

        <motion.p
          className="text-sm text-text-secondary mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.p>

        {changeLabel && (
          <motion.p
            className="text-xs text-text-muted mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {changeLabel}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

export default StatCard;
