"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

export type SortKey = "risk" | "students" | "score";
export type SortOrder = "asc" | "desc";

interface SortControlsProps {
  sortBy: SortKey;
  order: SortOrder;
  onChange: (sortBy: SortKey, order: SortOrder) => void;
}

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "risk", label: "Risk Level" },
  { key: "students", label: "Students" },
  { key: "score", label: "Avg Score" },
];

export function SortControls({ sortBy, order, onChange }: SortControlsProps) {
  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      onChange(key, order === "asc" ? "desc" : "asc");
    } else {
      onChange(key, "desc");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-text-secondary mr-2">Sort by:</span>
      <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-elevated border border-border-subtle">
        {sortOptions.map((option) => {
          const isActive = sortBy === option.key;

          return (
            <motion.button
              key={option.key}
              onClick={() => handleSort(option.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-admin text-white shadow-glow-admin"
                  : "text-text-secondary hover:text-text-primary"
              }`}
              whileHover={{ scale: isActive ? 1 : 1.02 }}
              whileTap={{ scale: isActive ? 1 : 0.98 }}
            >
              <span>{option.label}</span>
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {order === "asc" ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export default SortControls;
