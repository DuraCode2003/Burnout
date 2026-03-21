'use client';

import { motion } from 'framer-motion';

type Period = 7 | 14 | 30;

interface PeriodSelectorProps {
  period: Period;
  onChange: (period: Period) => void;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 7, label: 'Last 7 days' },
  { value: 14, label: 'Last 14 days' },
  { value: 30, label: 'Last 30 days' },
];

export function PeriodSelector({ period, onChange }: PeriodSelectorProps) {
  return (
    <div className="inline-flex p-1 rounded-xl bg-bg-surface border border-border-subtle">
      <div className="relative flex">
        <motion.div
          className="absolute inset-y-0 rounded-lg bg-gradient-accent"
          initial={false}
          animate={{
            width: 'calc(100% / 3)',
            x: `calc(${PERIODS.findIndex((p) => p.value === period) * 100}% )`,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />

        {PERIODS.map((p) => {
          const isActive = period === p.value;

          return (
            <button
              key={p.value}
              onClick={() => onChange(p.value)}
              className={`relative px-4 xs:px-6 py-2.5 text-sm font-medium font-sora rounded-lg transition-colors ${
                isActive ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="relative z-10">{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PeriodSelector;
