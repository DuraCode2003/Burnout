'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SleepStepProps {
  onSelect: (hours: number) => void;
  value?: number;
}

function getSleepColor(hours: number): string {
  if (hours < 5) return '#ef4444';
  if (hours < 6) return '#f97316';
  if (hours < 7) return '#f59e0b';
  if (hours < 8) return '#84cc16';
  return '#10b981';
}

function getSleepQuality(hours: number): string {
  if (hours < 5) return 'Very Poor';
  if (hours < 6) return 'Poor';
  if (hours < 7) return 'Below Average';
  if (hours < 8) return 'Fair';
  if (hours < 9) return 'Good';
  return 'Excellent';
}

function getSleepIcon(hours: number): string {
  if (hours < 5) return '😫';
  if (hours < 6) return '😴';
  if (hours < 7) return '😐';
  if (hours < 8) return '🙂';
  return '😄';
}

export function SleepStep({ onSelect, value = 7 }: SleepStepProps) {
  const [hours, setHours] = useState(value);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setHours(value);
  }, [value]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setHours(newValue);
    onSelect(newValue);
  };

  const color = getSleepColor(hours);
  const quality = getSleepQuality(hours);
  const icon = getSleepIcon(hours);

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-8">
        <motion.h2
          className="text-2xl font-bold font-sora text-text-primary mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          How much did you sleep?
        </motion.h2>
        <motion.p
          className="text-text-secondary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Drag the slider to set your sleep duration
        </motion.p>
      </div>

      <motion.div
        className="card-glow p-6 xs:p-8 mb-8"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col items-center">
          <motion.div
            className="text-7xl xs:text-8xl font-bold font-sora mb-2"
            style={{ color }}
            animate={{
              scale: isDragging ? 1.05 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            {hours.toFixed(1)}
          </motion.div>

          <motion.div
            className="text-lg text-text-secondary mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            hours
          </motion.div>

          <motion.div
            className="flex items-center gap-3 px-4 py-2 rounded-full"
            style={{
              background: `${color}15`,
              border: `1px solid ${color}40`,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.span
              className="text-2xl"
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              {icon}
            </motion.span>
            <span className="text-sm font-medium" style={{ color }}>
              {quality}
            </span>
          </motion.div>
        </div>
      </motion.div>

      <div className="px-4">
        <div className="relative mb-4">
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={hours}
            onChange={handleSliderChange}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            className="w-full h-3 bg-bg-surface rounded-full appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, ${color} 0%, ${color} ${(hours / 12) * 100}%, #1a2235 ${(hours / 12) * 100}%, #1a2235 100%)`,
            }}
          />

          <style jsx>{`
            input[type='range']::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: ${color};
              cursor: pointer;
              border: 4px solid #0a0e1a;
              box-shadow: 0 0 20px ${color}60;
              transition: transform 0.2s;
            }

            input[type='range']::-webkit-slider-thumb:hover {
              transform: scale(1.2);
            }

            input[type='range']::-moz-range-thumb {
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: ${color};
              cursor: pointer;
              border: 4px solid #0a0e1a;
              box-shadow: 0 0 20px ${color}60;
              transition: transform 0.2s;
            }

            input[type='range']::-moz-range-thumb:hover {
              transform: scale(1.2);
            }
          `}</style>
        </div>

        <div className="flex justify-between text-xs text-text-muted px-2">
          <span>0h</span>
          <span>6h</span>
          <span>12h</span>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-3 gap-3 mt-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {[
          { hours: 6, label: 'Short' },
          { hours: 7.5, label: 'Ideal' },
          { hours: 9, label: 'Long' },
        ].map((preset) => (
          <motion.button
            key={preset.hours}
            onClick={() => {
              setHours(preset.hours);
              onSelect(preset.hours);
            }}
            className="py-3 px-4 rounded-xl bg-bg-surface/50 border border-border-subtle hover:border-border-default transition-colors text-sm text-text-secondary"
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
            whileTap={{ scale: 0.98 }}
          >
            {preset.hours}h • {preset.label}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default SleepStep;
