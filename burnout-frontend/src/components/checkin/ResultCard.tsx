'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getRiskLevelConfig, getRiskGradient } from '@/utils/helpers';
import type { RiskLevel } from '@/types';

interface ResultCardProps {
  score: number;
  riskLevel: RiskLevel;
  suggestion: string;
  onDone?: () => void;
}

interface ScoreRingProps {
  score: number;
  riskLevel: RiskLevel;
  size?: number;
}

function ScoreRing({ score, riskLevel, size = 160 }: ScoreRingProps) {
  const radius = (size - 12) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const config = getRiskLevelConfig(riskLevel);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id={`result-gradient-${riskLevel}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={config.color} stopOpacity="1" />
          </linearGradient>
          <filter id={`result-glow-${riskLevel}`}>
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
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
          strokeWidth={10}
          fill="none"
        />

        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#result-gradient-${riskLevel})`}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 2,
            ease: [0.4, 0, 0.2, 1],
            delay: 0.3,
          }}
          style={{
            strokeDasharray: circumference,
            filter: `url(#result-glow-${riskLevel})`,
          }}
        />
      </svg>

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
          delay: 0.5,
        }}
      >
        <motion.span
          className="text-4xl font-bold font-sora"
          style={{ color: config.color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 15,
            delay: 0.7,
          }}
        >
          {Math.round(score)}
        </motion.span>
        <span className="text-xs text-text-secondary mt-1">Score</span>
      </motion.div>
    </div>
  );
}

export function ResultCard({ score, riskLevel, suggestion, onDone }: ResultCardProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = getRiskLevelConfig(riskLevel);

  useEffect(() => {
    if (riskLevel === 'low') {
      setShowConfetti(true);

      const duration = 2000;
      const end = Date.now() + duration;

      const colors = ['#10b981', '#34d399', '#6366f1', '#8b5cf6', '#fbbf24'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
          gravity: 0.8,
          drift: 0.5,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
          gravity: 0.8,
          drift: -0.5,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }
  }, [riskLevel]);

  const getTitle = () => {
    switch (riskLevel) {
      case 'low':
        return "You're doing great!";
      case 'medium':
        return 'Let\'s find balance';
      case 'high':
        return 'Let\'s work on this together';
    }
  };

  const getMessage = () => {
    switch (riskLevel) {
      case 'low':
        return "Keep up the healthy habits! Your wellbeing is in a good place.";
      case 'medium':
        return "You're showing some signs of stress. Small changes can make a big difference.";
      case 'high':
        return "You've been under significant pressure. Consider reaching out for support.";
    }
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="text-5xl mb-4"
        >
          {config.icon}
        </motion.div>

        <motion.h2
          className="text-2xl font-bold font-sora text-text-primary mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {getTitle()}
        </motion.h2>

        <motion.p
          className="text-text-secondary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {getMessage()}
        </motion.p>
      </div>

      <motion.div
        className="card-glow p-8 mb-6 flex flex-col items-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <ScoreRing score={score} riskLevel={riskLevel} />

        <motion.div
          className="mt-6 px-4 py-2 rounded-full text-sm font-medium"
          style={{
            background: config.bgColor,
            color: config.color,
            border: `1px solid ${config.borderColor}`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {config.label}
        </motion.div>
      </motion.div>

      <motion.div
        className="card-glow p-6 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-start gap-4">
          <motion.div
            className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0"
            style={{ background: config.bgColor }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.7,
            }}
          >
            <span className="text-2xl">💡</span>
          </motion.div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-2">
              Today's Suggestion
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {suggestion}
            </p>
          </div>
        </div>
      </motion.div>

      {onDone && (
        <motion.button
          onClick={onDone}
          className="w-full py-4 px-6 rounded-xl font-medium font-sora text-white bg-gradient-accent hover:shadow-glow-indigo-lg transition-shadow"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          Done
        </motion.button>
      )}

      <motion.div
        className="text-center mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-xs text-text-muted">
          Check in again tomorrow to track your progress
        </p>
      </motion.div>
    </motion.div>
  );
}

export default ResultCard;
