"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  MapPin,
  Globe,
  ExternalLink,
  Copy,
  Check,
  HeartHandshake,
  Clock,
} from "lucide-react";
import type { Alert } from "@/types/counselor";
import toast from "react-hot-toast";

interface CrisisResourcePanelProps {
  alert: Alert;
  department?: string;
}

interface Resource {
  id: string;
  name: string;
  type: "HOTLINE" | "CHAT" | "IN_PERSON" | "ONLINE";
  value: string;
  description: string;
  available24_7?: boolean;
  url?: string;
}

export function CrisisResourcePanel({
  alert,
  department,
}: CrisisResourcePanelProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const resources: Resource[] = [
    {
      id: "1",
      name: "988 Suicide & Crisis Lifeline",
      type: "HOTLINE",
      value: "988",
      description: "Free, confidential support 24/7",
      available24_7: true,
    },
    {
      id: "2",
      name: "Crisis Text Line",
      type: "CHAT",
      value: "Text HOME to 741741",
      description: "Free crisis counseling via text",
      available24_7: true,
    },
    {
      id: "3",
      name: "University Counseling Center",
      type: "IN_PERSON",
      value: "(555) 123-4567",
      description: "Free confidential counseling for students",
      url: "/book-appointment",
    },
    {
      id: "4",
      name: "Campus Emergency Services",
      type: "HOTLINE",
      value: "(555) 911-0000",
      description: "24/7 campus security and emergency response",
      available24_7: true,
    },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getResourceIcon = (type: Resource["type"]) => {
    switch (type) {
      case "HOTLINE":
        return Phone;
      case "CHAT":
        return MessageCircle;
      case "IN_PERSON":
        return MapPin;
      case "ONLINE":
        return Globe;
    }
  };

  // Only show for RED alerts
  if (alert.tier !== "RED") {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-counselor/10 border border-accent-counselor/30"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-counselor flex items-center justify-center shadow-glow-counselor">
            <HeartHandshake className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold font-sora text-text-primary">
              Crisis Resources
            </h3>
            <p className="text-xs text-text-secondary">
              Share with student — already shown to them
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-accent-counselor-light">
          <Check className="w-3 h-3" />
          <span>
            These resources were automatically shared when this alert was
            triggered
          </span>
        </div>
      </motion.div>

      {/* Resources List */}
      <div className="space-y-2">
        {resources.map((resource, index) => {
          const Icon = getResourceIcon(resource.type);
          const isCopied = copiedId === resource.id;

          return (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-lg bg-bg-elevated border border-border-subtle hover:border-accent-counselor/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent-counselor/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-accent-counselor-light" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-text-primary text-sm">
                      {resource.name}
                    </h4>
                    <button
                      onClick={() => handleCopy(resource.value, resource.id)}
                      className="p-1.5 rounded text-text-muted hover:text-accent-counselor-light transition-colors"
                      title="Copy to clipboard"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {resource.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-bg-card border border-border-subtle text-accent-counselor-light">
                      {resource.value}
                    </span>
                    {resource.available24_7 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-success/10 text-success border border-success/30">
                        <Clock className="w-3 h-3" />
                        24/7
                      </span>
                    )}
                    {resource.url && (
                      <a
                        href={resource.url}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-accent-counselor/10 text-accent-counselor border border-accent-counselor/30 hover:bg-accent-counselor/20 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Book Appointment
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Emergency Warning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl bg-danger/10 border border-danger/30"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-danger/20 flex items-center justify-center flex-shrink-0">
            <Phone className="w-4 h-4 text-danger" />
          </div>
          <div>
            <h4 className="font-semibold text-danger text-sm mb-1">
              In Immediate Danger?
            </h4>
            <p className="text-xs text-text-secondary">
              If you or the student is in immediate danger, call 911 or go to
              the nearest emergency room immediately.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CrisisResourcePanel;
