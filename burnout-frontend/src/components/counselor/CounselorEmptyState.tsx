"use client";

import React from "react";
import { motion } from "framer-motion";
import { Inbox, CheckCircle, Filter, HeartHandshake } from "lucide-react";

interface CounselorEmptyStateProps {
  type: "no-alerts" | "no-history" | "filter-empty";
  filterValue?: string;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

// CSS Art: Calm concentric circles
const CalmIllustration = () => (
  <div className="relative w-32 h-32 mx-auto mb-6">
    {[1, 2, 3, 4].map((i) => (
      <motion.div
        key={i}
        className="absolute inset-0 rounded-full border-2 border-accent-counselor/20"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: i * 0.1,
          duration: 0.5,
          type: "spring",
          stiffness: 200,
        }}
        style={{
          borderWidth: `${i}px`,
          borderColor: `rgba(20, 184, 166, ${0.3 - i * 0.05})`,
        }}
      />
    ))}
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
    >
      <HeartHandshake className="w-12 h-12 text-accent-counselor" />
    </motion.div>
  </div>
);

export function CounselorEmptyState({
  type,
  filterValue,
}: CounselorEmptyStateProps) {
  const getContent = () => {
    switch (type) {
      case "no-alerts":
        return {
          icon: <CalmIllustration />,
          title: "All Caught Up!",
          description:
            "No active alerts — your students are doing well. This is a great time to review resolved cases or catch up on documentation.",
          action: null,
        };

      case "no-history":
        return {
          icon: (
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-bg-elevated flex items-center justify-center border border-border-subtle">
              <CheckCircle className="w-10 h-10 text-text-muted" />
            </div>
          ),
          title: "No Resolved Alerts Yet",
          description:
            "Resolved alerts will appear here for future reference. This helps you track your workload and review past interventions.",
          action: null,
        };

      case "filter-empty":
        return {
          icon: (
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-bg-elevated flex items-center justify-center border border-border-subtle">
              <Filter className="w-10 h-10 text-text-muted" />
            </div>
          ),
          title: `No ${filterValue || "Matching"} Alerts`,
          description:
            "No alerts match your current filter criteria. Try adjusting your filters or check back later.",
          action: "clear-filters",
        };

      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-center py-16"
    >
      {content.icon}

      <h3 className="text-xl font-bold font-sora text-text-primary mb-2">
        {content.title}
      </h3>

      <p className="text-text-secondary max-w-md mx-auto mb-6">
        {content.description}
      </p>

      {content.action === "clear-filters" && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-6 py-2.5 rounded-xl bg-gradient-counselor text-white font-medium shadow-glow-counselor hover:opacity-90 transition-opacity"
          onClick={() => {
            // This would be passed as a prop in real usage
            window.location.reload();
          }}
        >
          Clear Filters
        </motion.button>
      )}
    </motion.div>
  );
}

export default CounselorEmptyState;
