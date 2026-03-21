"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  MapPin,
  Globe,
  Clock,
  ExternalLink,
  HeartHandshake,
} from "lucide-react";
import type { CrisisResource, CrisisResources } from "@/types/counselor";

interface CrisisResourcePanelProps {
  resources?: CrisisResources;
  onOpenBooking?: () => void;
}

const defaultResources: CrisisResources = {
  national: [
    {
      id: "1",
      name: "National Suicide Prevention Lifeline",
      type: "HOTLINE",
      phone: "988",
      description: "24/7 crisis support and suicide prevention",
      available24_7: true,
      languages: ["English", "Spanish"],
    },
    {
      id: "2",
      name: "Crisis Text Line",
      type: "CHAT",
      url: "https://www.crisistextline.org",
      description: "Text HOME to 741741 for free crisis counseling",
      available24_7: true,
      languages: ["English", "Spanish"],
    },
  ],
  campus: [
    {
      id: "3",
      name: "University Counseling Center",
      type: "IN_PERSON",
      phone: "(555) 123-4567",
      description: "Free confidential counseling for students",
      available24_7: false,
      languages: ["English"],
    },
  ],
  online: [
    {
      id: "4",
      name: "Talkspace",
      type: "ONLINE",
      url: "https://www.talkspace.com",
      description: "Online therapy and counseling",
      available24_7: true,
      languages: ["English"],
    },
  ],
};

export function CrisisResourcePanel({
  resources = defaultResources,
  onOpenBooking,
}: CrisisResourcePanelProps) {
  const getResourceIcon = (type: CrisisResource["type"]) => {
    switch (type) {
      case "HOTLINE":
        return Phone;
      case "CHAT":
        return MessageCircle;
      case "IN_PERSON":
        return MapPin;
      case "ONLINE":
        return Globe;
      default:
        return Globe;
    }
  };

  const ResourceCard = ({ resource }: { resource: CrisisResource }) => {
    const Icon = getResourceIcon(resource.type);

    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-4 rounded-xl bg-bg-elevated border border-border-subtle hover:border-accent-counselor/30 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-counselor/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-accent-counselor-light" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-text-primary mb-1">
              {resource.name}
            </h4>
            <p className="text-sm text-text-secondary mb-2">
              {resource.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {resource.phone && (
                <a
                  href={`tel:${resource.phone}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-card border border-border-subtle text-xs text-accent-counselor-light hover:bg-bg-surface transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  {resource.phone}
                </a>
              )}
              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-bg-card border border-border-subtle text-xs text-accent-counselor-light hover:bg-bg-surface transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Visit
                </a>
              )}
              {resource.available24_7 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-success/10 border border-success/30 text-xs text-success">
                  <Clock className="w-3 h-3" />
                  24/7
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-counselor/10 border border-accent-counselor/30">
        <div className="w-10 h-10 rounded-lg bg-gradient-counselor flex items-center justify-center shadow-glow-counselor">
          <HeartHandshake className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold font-sora text-text-primary">
            Crisis Resources
          </h3>
          <p className="text-sm text-text-secondary">
            Immediate support is available 24/7
          </p>
        </div>
      </div>

      {/* National Hotlines */}
      <div>
        <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Phone className="w-4 h-4 text-danger" />
          National Crisis Lines
        </h4>
        <div className="space-y-2">
          {resources.national.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </div>

      {/* Campus Resources */}
      {resources.campus.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent-counselor-light" />
            Campus Support
          </h4>
          <div className="space-y-2">
            {resources.campus.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}

      {/* Online Resources */}
      {resources.online.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-accent-counselor-light" />
            Online Support
          </h4>
          <div className="space-y-2">
            {resources.online.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </div>
      )}

      {/* Booking CTA */}
      {onOpenBooking && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenBooking}
          className="w-full p-4 rounded-xl bg-gradient-counselor text-white font-semibold shadow-glow-counselor hover:opacity-90 transition-opacity"
        >
          Schedule Appointment with Counselor
        </motion.button>
      )}

      {/* Emergency Warning */}
      <div className="p-4 rounded-xl bg-danger/10 border border-danger/30">
        <p className="text-sm text-danger font-medium mb-1">
          In Immediate Danger?
        </p>
        <p className="text-xs text-text-secondary">
          If you or someone you know is in immediate danger, please call 911 or
          go to the nearest emergency room.
        </p>
      </div>
    </div>
  );
}

export default CrisisResourcePanel;
