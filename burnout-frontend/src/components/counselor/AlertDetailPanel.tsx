"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, CheckCircle, ArrowUpRight } from "lucide-react";
import type { Alert } from "@/types/counselor";
import { RiskBadge, RiskLevelBadge, TrendIndicator } from "./RiskBadge";

interface AlertDetailPanelProps {
  alert: Alert;
  onResolve?: () => void;
  onEscalate?: () => void;
  onContact?: () => void;
}

export function AlertDetailPanel({
  alert,
  onResolve,
  onEscalate,
  onContact,
}: AlertDetailPanelProps) {
  const isUrgent = alert.isUrgent || alert.tier === "RED";

  return (
    <div className="space-y-6">
      {/* Alert Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <RiskBadge tier={alert.tier} size="lg" pulsing={isUrgent} />
          {alert.status === "ESCALATED" && (
            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
              Escalated
            </span>
          )}
        </div>
        {alert.responseTimeRemaining !== undefined && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            alert.responseTimeRemaining < 0
              ? "bg-danger/10 text-danger border border-danger/30"
              : "bg-warning/10 text-warning border border-warning/30"
          }`}>
            <Clock className="w-4 h-4" />
            <span className="text-sm font-semibold">
              {alert.responseTimeRemaining < 0
                ? "Response Overdue"
                : `Response due in ${Math.floor(alert.responseTimeRemaining / 3600)}h ${Math.floor((alert.responseTimeRemaining % 3600) / 60)}m`}
            </span>
          </div>
        )}
      </div>

      {/* Student Info */}
      <div className="p-4 rounded-xl bg-bg-elevated border border-border-subtle">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Student Information</h3>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-bg-card flex items-center justify-center border border-border-subtle">
            {alert.student.isAnonymous ? (
              <span className="text-lg font-bold text-text-muted">#</span>
            ) : (
              <span className="text-lg font-bold text-accent-counselor-light">
                {alert.student.name?.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-text-primary">
              {alert.student.isAnonymous
                ? alert.student.anonymousId
                : alert.student.name}
            </p>
            {!alert.student.isAnonymous && alert.student.email && (
              <p className="text-sm text-text-muted">{alert.student.email}</p>
            )}
            {alert.student.department && (
              <p className="text-sm text-text-muted">{alert.student.department}</p>
            )}
          </div>
        </div>
        {alert.student.isAnonymous && (
          <p className="mt-3 text-xs text-text-muted flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            Student has chosen to remain anonymous. Full identity not available.
          </p>
        )}
      </div>

      {/* Risk Indicators */}
      <div className="p-4 rounded-xl bg-bg-elevated border border-border-subtle">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Risk Indicators</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-text-muted mb-1">Risk Level</p>
            <RiskLevelBadge level={alert.riskIndicators.currentRiskLevel} />
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Burnout Score</p>
            <p className={`text-2xl font-bold font-sora ${
              alert.riskIndicators.burnoutScore >= 75
                ? "text-danger"
                : alert.riskIndicators.burnoutScore >= 50
                ? "text-warning"
                : "text-success"
            }`}>
              {alert.riskIndicators.burnoutScore}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Mood Trend</p>
            <TrendIndicator trend={alert.riskIndicators.moodTrend} />
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Energy Trend</p>
            <TrendIndicator trend={alert.riskIndicators.energyTrend} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border-subtle">
          <div>
            <p className="text-xs text-text-muted mb-1">Stress Level</p>
            <p className="text-lg font-semibold text-text-primary">
              {alert.riskIndicators.stressLevel}<span className="text-sm text-text-muted">/10</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Sleep Quality</p>
            <p className="text-lg font-semibold text-text-primary">
              {alert.riskIndicators.sleepQuality}<span className="text-sm text-text-muted">/7</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-text-muted mb-1">Avg Sleep</p>
            <p className="text-lg font-semibold text-text-primary">
              {alert.riskIndicators.avgSleepHours}<span className="text-sm text-text-muted">h</span>
            </p>
          </div>
        </div>
      </div>

      {/* Alert Triggers */}
      <div className="p-4 rounded-xl bg-bg-elevated border border-border-subtle">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Detected Patterns</h3>
        <div className="space-y-2">
          {alert.triggers.map((trigger, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-bg-card border border-border-subtle"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">{trigger.description}</p>
                <p className="text-xs text-text-muted">
                  Detected {new Date(trigger.detectedAt).toLocaleDateString()}
                  {trigger.daysPersisting && ` • Persisting for ${trigger.daysPersisting} days`}
                </p>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-semibold ${
                trigger.severity >= 8
                  ? "bg-danger/10 text-danger"
                  : trigger.severity >= 5
                  ? "bg-warning/10 text-warning"
                  : "bg-success/10 text-success"
              }`}>
                Severity: {trigger.severity}/10
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="p-4 rounded-xl bg-bg-elevated border border-border-subtle">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Student Engagement</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-bg-card border border-border-subtle">
            <p className="text-2xl font-bold text-text-primary">{alert.riskIndicators.checkInStreak}</p>
            <p className="text-xs text-text-muted">Check-in Streak</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-bg-card border border-border-subtle">
            <p className="text-2xl font-bold text-text-primary">
              {new Date(alert.riskIndicators.lastCheckIn).toLocaleDateString()}
            </p>
            <p className="text-xs text-text-muted">Last Check-in</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-bg-card border border-border-subtle">
            <p className="text-2xl font-bold text-text-primary">{alert.actions.length}</p>
            <p className="text-xs text-text-muted">Actions Taken</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertDetailPanel;
