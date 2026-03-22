/**
 * Admin Dashboard Types
 * All data is ANONYMIZED and AGGREGATED - no individual student data
 */

import { UserRole } from "./index";

// ============================================================================
// CAMPUS STATS
// ============================================================================

/**
 * Campus-wide aggregate statistics
 */
export interface CampusStats {
  totalStudents: number;
  activeThisWeek: number;
  checkinRatePercent: number;
  avgBurnoutScore: number;
  avgMoodScore: number;
  avgSleepHours: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  trendVsLastWeek: number;
}

// ============================================================================
// DEPARTMENT STATS
// ============================================================================

/**
 * Department-level aggregate statistics
 */
export interface DepartmentStats {
  department: string;
  studentCount: number;
  avgBurnoutScore: number;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  checkinRate: number;
  trend: "up" | "down" | "stable";
}

// ============================================================================
// RISK DISTRIBUTION
// ============================================================================

/**
 * Weekly risk history data point
 */
export interface WeeklyRiskHistory {
  week: string;
  high: number;
  medium: number;
  low: number;
}

/**
 * Risk distribution with historical data
 */
export interface RiskDistribution {
  high: number;
  medium: number;
  low: number;
  highPercent: number;
  mediumPercent: number;
  lowPercent: number;
  weeklyHistory: WeeklyRiskHistory[];
}

// ============================================================================
// WEEKLY TRENDS
// ============================================================================

/**
 * Weekly trend data point
 */
export interface WeeklyTrend {
  weekLabel: string;
  avgBurnoutScore: number;
  avgMoodScore: number;
  avgSleepHours: number;
  checkinCount: number;
}

// ============================================================================
// DAILY CHECKIN RATES
// ============================================================================

/**
 * Daily check-in rate data point
 */
export interface DailyCheckin {
  date: string;
  checkinCount: number;
  participationPercent: number;
}

// ============================================================================
// ADMIN REPORT
// ============================================================================

/**
 * Complete admin report data
 */
export interface AdminReport {
  campusStats: CampusStats;
  departmentStats: DepartmentStats[];
  riskDistribution: RiskDistribution;
  weeklyTrends: WeeklyTrend[];
  checkinRates: DailyCheckin[];
  generatedAt: string;
}

// ============================================================================
// ADMIN USER
// ============================================================================

/**
 * Admin user with role guard
 */
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "COUNSELOR";
  department?: string;
  isActive: boolean;
}

/**
 * Type guard to check if user has admin access
 */
export function isAdminUser(user: AdminUser | null | undefined): user is AdminUser {
  return user !== null && user !== undefined && 
         (user.role === "ADMIN" || user.role === "COUNSELOR");
}

/**
 * Type guard to check if user has full admin privileges
 */
export function hasAdminPrivileges(user: AdminUser | null | undefined): boolean {
  return user !== null && user !== undefined && user.role === "ADMIN";
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * User record for admin management
 */
export interface UserManagement {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN" | "COUNSELOR";
  department?: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * Request to update user role
 */
export interface UpdateRoleRequest {
  role: "STUDENT" | "ADMIN" | "COUNSELOR";
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Weekly trends request parameters
 */
export interface WeeklyTrendsRequest {
  weeks?: number;
}

/**
 * Export report request
 */
export interface ExportReportRequest {
  format: "csv" | "json";
  includeHistory?: boolean;
}

/**
 * Heatmap data point for department × week grid
 */
export interface HeatmapDataPoint {
  department: string;
  week: string;
  weekLabel: string;
  avgScore: number;
  studentCount: number;
}

/**
 * Admin dashboard overview (combined data)
 */
export interface AdminDashboardOverview {
  stats: CampusStats;
  departments: DepartmentStats[];
  riskDistribution: RiskDistribution;
  trends: WeeklyTrend[];
  lastUpdated: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Risk level color mapping
 */
export const RISK_LEVEL_COLORS = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#10b981",
} as const;

/**
 * Trend direction color mapping
 */
export const TREND_COLORS = {
  up: "#ef4444",
  down: "#10b981",
  stable: "#6366f1",
} as const;

/**
 * Get display label for risk level
 */
export function getRiskLevelLabel(level: string): string {
  switch (level) {
    case "HIGH":
      return "High Risk";
    case "MEDIUM":
      return "Medium Risk";
    case "LOW":
      return "Low Risk";
    default:
      return level;
  }
}

/**
 * Get display label for trend
 */
export function getTrendLabel(trend: string): string {
  switch (trend) {
    case "up":
      return "Increasing";
    case "down":
      return "Decreasing";
    case "stable":
      return "Stable";
    default:
      return trend;
  }
}
