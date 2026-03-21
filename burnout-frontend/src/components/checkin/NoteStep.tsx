'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NoteStepProps {
  onSubmit: (note: string) => void;
  onSkip: () => void;
  initialValue?: string;
}

const MAX_CHARS = 200;

export function NoteStep({ onSubmit, onSkip, initialValue = '' }: NoteStepProps) {
  const [note, setNote] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remaining = MAX_CHARS - note.length;
  const isOverLimit = remaining < 0;
  const isNearLimit = remaining <= 20 && remaining >= 0;

  const handleSubmit = () => {
    onSubmit(note);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

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
          Any thoughts to share?
        </motion.h2>
        <motion.p
          className="text-text-secondary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Optional: Add a note about your day (max {MAX_CHARS} characters)
        </motion.p>
      </div>

      <motion.div
        className="relative mb-4"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div
          className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
            isFocused ? 'ring-2 ring-accent-indigo ring-offset-2 ring-offset-bg-primary' : ''
          }`}
        >
          <textarea
            ref={textareaRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="How's your day going? What's on your mind?..."
            className="w-full h-40 p-6 bg-bg-card border-2 border-border-default rounded-2xl text-text-primary placeholder-text-secondary resize-none focus:outline-none focus:border-accent-indigo focus:ring-4 focus:ring-accent-indigo/10 transition-all duration-300"
            maxLength={MAX_CHARS + 50}
          />

          <div
            className={`absolute bottom-4 right-4 text-xs transition-colors duration-300 ${
              isOverLimit
                ? 'text-danger'
                : isNearLimit
                  ? 'text-warning'
                  : 'text-text-muted'
            }`}
          >
            {remaining} characters left
          </div>
        </div>

        {note.length > 0 && (
          <motion.div
            className="absolute top-4 right-4"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <button
              onClick={() => setNote('')}
              className="p-2 rounded-lg bg-bg-elevated hover:bg-bg-surface transition-colors"
            >
              <svg
                className="w-4 h-4 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="flex items-start gap-3 p-4 rounded-xl bg-bg-surface/50 border border-border-subtle"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span className="text-2xl">💡</span>
        <p className="text-sm text-text-secondary">
          Tip: Press <kbd className="px-2 py-0.5 rounded bg-bg-elevated text-xs">Cmd</kbd> +{' '}
          <kbd className="px-2 py-0.5 rounded bg-bg-elevated text-xs">Enter</kbd> to submit
        </p>
      </motion.div>

      <div className="flex gap-3 mt-8">
        <motion.button
          onClick={onSkip}
          className="flex-1 py-4 px-6 rounded-xl font-medium font-sora text-text-secondary bg-bg-surface border border-border-subtle hover:border-border-default transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Skip
        </motion.button>

        <motion.button
          onClick={handleSubmit}
          className="flex-1 py-4 px-6 rounded-xl font-medium font-sora text-white bg-gradient-accent hover:shadow-glow-indigo-lg transition-shadow"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Complete Check-in
        </motion.button>
      </div>
    </motion.div>
  );
}

export default NoteStep;
