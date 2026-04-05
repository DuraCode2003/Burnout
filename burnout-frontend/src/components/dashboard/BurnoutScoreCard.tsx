'use client';

import { useState, useEffect } from 'react';
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

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.round(value);
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    let totalDuration = 2000;
    let increment = end / (totalDuration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <>{displayValue}</>;
}

function ScoreRing({ score, riskLevel, size = 200, strokeWidth = 14 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const color = getRiskColor(riskLevel);
  const config = getRiskLevelConfig(riskLevel);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Ambient Glow Background */}
      <motion.div 
        className="absolute inset-0 rounded-full blur-[40px] opacity-20"
        style={{ backgroundColor: color }}
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg
        width={size}
        height={size}
        className="transform -rotate-90 relative z-10"
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id={`gradient-${riskLevel}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
          <filter id={`glow-${riskLevel}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.03)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress */}
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
            duration: 2,
            ease: [0.34, 1.56, 0.64, 1],
            delay: 0.3,
          }}
          style={{
            strokeDasharray: circumference,
            filter: `url(#glow-${riskLevel})`,
          }}
        />
      </svg>

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center z-20"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="text-center">
          <motion.div 
            className="text-5xl font-bold font-sora tracking-tighter"
            style={{ 
              color: 'white',
              textShadow: `0 0 20px ${color}44`
            }}
          >
            <AnimatedNumber value={score} />
          </motion.div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-text-secondary font-medium mt-1">
            Burnout Index
          </div>
        </div>
        
        <motion.div
          className="mt-4 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider backdrop-blur-md border"
          style={{
            backgroundColor: `${config.color}15`,
            color: config.color,
            borderColor: `${config.color}33`,
            boxShadow: `0 0 15px ${config.color}15`
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {config.label}
        </motion.div>
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
