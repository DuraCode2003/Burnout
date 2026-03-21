'use client';

import { motion } from 'framer-motion';
import { getRiskColor, getRiskGradient, getRiskLevelConfig } from '@/utils/helpers';
import type { RiskLevel } from '@/types';

interface BurnoutScoreCardProps {
  score: number;
  riskLevel: RiskLevel;
  trend: 'improving' | 'worsening' | 'stable';
  previousScore?: number;
}

interface ScoreRingProps {
  score: number;
  riskLevel: RiskLevel;
  size?: number;
  strokeWidth?: number;
}

function ScoreRing({ score, riskLevel, size = 180, strokeWidth = 12 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const color = getRiskColor(riskLevel);
  const config = getRiskLevelConfig(riskLevel);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id={`gradient-${riskLevel}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
          <filter id={`glow-${riskLevel}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(148, 163, 184, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#gradient-${riskLevel})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 1.5,
            ease: [0.4, 0, 0.2, 1],
            delay: 0.2,
          }}
          style={{
            strokeDasharray: circumference,
            filter: `url(#glow-${riskLevel})`,
          }}
        />
      </svg>

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <motion.span
          className="text-4xl font-bold font-sora"
          style={{ color }}
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.7 }}
        >
          {Math.round(score)}
        </motion.span>
        <span className="text-sm text-text-secondary mt-1">Burnout Score</span>
        <motion.span
          className="text-xs mt-2 px-3 py-1 rounded-full"
          style={{
            background: config.bgColor,
            color: config.color,
            border: `1px solid ${config.borderColor}`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {config.icon} {config.label}
        </motion.span>
      </motion.div>
    </div>
  );
}

export function BurnoutScoreCard({
  score,
  riskLevel,
  trend,
  previousScore = 0,
}: BurnoutScoreCardProps) {
  const config = getRiskLevelConfig(riskLevel);
  const scoreDiff = previousScore ? score - previousScore : 0;
  const isImproving = trend === 'improving' || (scoreDiff < 0 && previousScore > 0);
  const isWorsening = trend === 'worsening' || (scoreDiff > 0 && previousScore > 0);

  const getTrendText = () => {
    if (!previousScore || scoreDiff === 0) return 'No change';
    const absDiff = Math.abs(scoreDiff);
    if (isImproving) return `${absDiff.toFixed(0)} points better`;
    if (isWorsening) return `${absDiff.toFixed(0)} points higher`;
    return 'Stable';
  };

  const getTrendIcon = () => {
    if (isImproving) return '↓';
    if (isWorsening) return '↑';
    return '→';
  };

  const getTrendColor = () => {
    if (isImproving) return 'text-success';
    if (isWorsening) return 'text-danger';
    return 'text-text-secondary';
  };

  return (
    <motion.div
      className="card-glow p-card flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold font-sora text-text-primary">
          Burnout Risk Assessment
        </h2>
        <motion.div
          className={`flex items-center gap-1 text-sm ${getTrendColor()}`}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <span className="font-medium">{getTrendIcon()}</span>
          <span>{getTrendText()}</span>
        </motion.div>
      </div>

      <ScoreRing score={score} riskLevel={riskLevel} />

      <motion.p
        className="text-center text-text-secondary mt-6 text-sm max-w-[280px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {config.description}
      </motion.p>

      <motion.div
        className="w-full mt-6 pt-6 border-t border-border-subtle"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <div className="flex justify-between text-xs text-text-secondary">
          <span>Last assessment</span>
          <span>Today</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default BurnoutScoreCard;
