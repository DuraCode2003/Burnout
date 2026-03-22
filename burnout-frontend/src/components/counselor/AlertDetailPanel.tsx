"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Mail,
  User,
  Calendar,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Shield,
} from "lucide-react";
import type { Alert } from "@/types/counselor";
import { RiskBadge, RiskLevelBadge, TrendIndicator } from "./RiskBadge";

interface AlertDetailPanelProps {
  alert: Alert;
}

export function AlertDetailPanel({ alert }: AlertDetailPanelProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPatternSummary = () => {
    const triggers = alert.triggers;
    if (triggers.length === 0) return null;

    const mainTrigger = triggers[0];
    const parts: string[] = [];

    if (mainTrigger.pattern === "MOOD_DECLINE") {
      parts.push("declining mood scores");
    }
    if (mainTrigger.pattern === "NEGATIVE_SENTIMENT") {
      parts.push("negative sentiment in check-ins");
    }
    if (mainTrigger.pattern === "SLEEP_DISTURBANCE") {
      parts.push(`less than ${alert.riskIndicators.avgSleepHours} hours of sleep`);
    }
    if (mainTrigger.pattern === "CRISIS_KEYWORDS") {
      parts.push("crisis-related keywords detected");
    }
    if (mainTrigger.pattern === "HIGH_WORKLOAD") {
      parts.push("high workload indicators");
    }

    if (mainTrigger.daysPersisting && mainTrigger.daysPersisting > 1) {
      parts.push(`${mainTrigger.daysPersisting} consecutive days`);
    }

    return `This alert was triggered due to ${parts.join(", ")}. The student's current burnout score of ${Math.round(alert.riskIndicators.burnoutScore)} indicates ${
      alert.riskIndicators.burnoutScore >= 75
        ? "high risk"
        : alert.riskIndicators.burnoutScore >= 50
        ? "moderate risk"
        : "elevated risk"
    } of burnout.`;
  };

  const scoreColor =
    alert.riskIndicators.burnoutScore >= 75
      ? "text-danger"
      : alert.riskIndicators.burnoutScore >= 50
      ? "text-warning"
      : "text-success";

  return (
    <div className="space-y-6">
      {/* Risk Badge + Status */}
      <div className="flex items-start justify-between">
        <RiskBadge tier={alert.tier} size="lg" pulsing={alert.isUrgent} />
        {alert.responseTimeRemaining !== undefined &&
          alert.responseTimeRemaining > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                alert.responseTimeRemaining < 3600
                  ? "bg-danger/10 text-danger border border-danger/30"
                  : "bg-warning/10 text-warning border border-warning/30"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm font-semibold">
                Response due in{" "}
                {Math.floor(alert.responseTimeRemaining / 3600)}h{" "}
                {Math.floor((alert.responseTimeRemaining % 3600) / 60)}m
              </span>
            </motion.div>
          )}
      </div>

      {/* Student Information */}
      <div className="p-5 rounded-xl bg-bg-elevated border border-border-subtle">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-accent-counselor-light" />
          Student Information
        </h3>

        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
              alert.student.isAnonymous
                ? "bg-bg-card border-border-subtle"
                : "bg-gradient-counselor border-accent-counselor"
            }`}
          >
            {alert.student.isAnonymous ? (
              <Lock className="w-6 h-6 text-text-muted" />
            ) : (
              <span className="text-xl font-bold text-white">
                {alert.student.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-lg font-bold text-text-primary">
                {alert.student.isAnonymous
                  ? alert.student.anonymousId
                  : alert.student.name}
              </h4>
              {alert.student.isAnonymous ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-bg-card text-text-muted border border-border-subtle">
                  <Lock className="w-3 h-3" />
                  Identity Protected
                </span>
              ) : (
                <a
                  href={`mailto:${alert.student.email}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-accent-counselor/10 text-accent-counselor border border-accent-counselor/30 hover:bg-accent-counselor/20 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail className="w-3 h-3" />
                  Contact
                </a>
              )}
            </div>

            {alert.student.department && (
              <p className="text-sm text-text-secondary mb-2">
                {alert.student.department}
              </p>
            )}

            {!alert.student.isAnonymous && alert.student.email && (
              <p className="text-xs text-text-muted">{alert.student.email}</p>
            )}

            {alert.student.isAnonymous && (
              <p className="mt-2 text-xs text-text-muted flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                This student has chosen to remain anonymous. Full identity is not
                available.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Alert Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trigger Time */}
        <div className="p-4 rounded-xl bg-bg-elevated border border-border-subtle">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-text-muted" />
            <span className="text-xs text-text-muted">Alert Triggered</span>
          </div>
          <p className="text-sm font-medium text-text-primary">
            {formatTimeAgo(alert.createdAt)}
          </p>
          <p
            className="text-xs text-text-muted mt-1"
            title={formatFullDate(alert.createdAt)}
          >
            {formatFullDate(alert.createdAt)}
          </p>
        </div>

        {/* Burnout Score */}
        <div className="p-4 rounded-xl bg-bg-elevated border border-border-subtle">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-text-muted" />
            <span className="text-xs text-text-muted">Burnout Score</span>
          </div>
          <div className="flex items-center gap-3">
            <p className={`text-2xl font-bold font-sora ${scoreColor}`}>
              {Math.round(alert.riskIndicators.burnoutScore)}
              <span className="text-sm text-text-muted font-normal">/100</span>
            </p>
            <RiskLevelBadge
              level={
                alert.riskIndicators.currentRiskLevel as
                  | "LOW"
                  | "MEDIUM"
                  | "HIGH"
                  | "CRITICAL"
              }
            />
          </div>
        </div>

        {/* Mood Trend */}
        <div className="p-4 rounded-xl bg-bg-elevated border border-border-subtle">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-text-muted" />
            <span className="text-xs text-text-muted">Mood Trend</span>
          </div>
          <TrendIndicator trend={alert.riskIndicators.moodTrend} />
        </div>

        {/* Energy Trend */}
        <div className="p-4 rounded-xl bg-bg-elevated border border-border-subtle">
          <div className="flex items-center gap-2 mb-2">
            <Minus className="w-4 h-4 text-text-muted" />
            <span className="text-xs text-text-muted">Energy Trend</span>
          </div>
          <TrendIndicator trend={alert.riskIndicators.energyTrend} />
        </div>
      </div>

      {/* Risk Indicators */}
      <div className="p-5 rounded-xl bg-bg-elevated border border-border-subtle">
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Risk Indicators
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-text-muted mb-1">Stress Level</p>
            <p className="text-lg font-semibold text-text-primary">
              {alert.riskIndicators.stressLevel}
              <span className="text-sm text-text-muted">/10</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Sleep Quality</p>
            <p className="text-lg font-semibold text-text-primary">
              {alert.riskIndicators.sleepQuality}
              <span className="text-sm text-text-muted">/7</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Avg Sleep</p>
            <p className="text-lg font-semibold text-text-primary">
              {alert.riskIndicators.avgSleepHours}
              <span className="text-sm text-text-muted">h</span>
            </p>
          </div>
        </div>
      </div>

      {/* Pattern Summary */}
      <div className="p-5 rounded-xl bg-gradient-counselor/5 border border-accent-counselor/30">
        <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-accent-counselor-light" />
          Pattern Summary
        </h3>
        <blockquote className="text-sm text-text-secondary italic border-l-4 border-accent-counselor pl-4 py-2">
          {getPatternSummary()}
        </blockquote>
      </div>

      {/* Trigger Details */}
      {alert.triggers.length > 0 && (
        <div className="p-5 rounded-xl bg-bg-elevated border border-border-subtle">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Detected Triggers
          </h3>
          <div className="space-y-2">
            {alert.triggers.map((trigger, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-3 rounded-lg bg-bg-card border border-border-subtle"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {trigger.description}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Detected {formatTimeAgo(trigger.detectedAt)}
                    {trigger.daysPersisting &&
                      ` • Persisting for ${trigger.daysPersisting} days`}
                  </p>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    trigger.severity >= 8
                      ? "bg-danger/10 text-danger"
                      : trigger.severity >= 5
                      ? "bg-warning/10 text-warning"
                      : "bg-success/10 text-success"
                  }`}
                >
                  Severity: {trigger.severity}/10
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Stats */}
      <div className="p-5 rounded-xl bg-bg-elevated border border-border-subtle">
        <h3 className="text-sm font-semibold text-text-primary mb-4">
          Student Engagement
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-bg-card border border-border-subtle">
            <p className="text-2xl font-bold text-text-primary">
              {alert.riskIndicators.checkInStreak}
            </p>
            <p className="text-xs text-text-muted mt-1">Check-in Streak</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-bg-card border border-border-subtle">
            <p className="text-lg font-bold text-text-primary">
              {new Date(alert.riskIndicators.lastCheckIn).toLocaleDateString()}
            </p>
            <p className="text-xs text-text-muted mt-1">Last Check-in</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-bg-card border border-border-subtle">
            <p className="text-2xl font-bold text-text-primary">
              {alert.actions.length}
            </p>
            <p className="text-xs text-text-muted mt-1">Actions Taken</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertDetailPanel;
