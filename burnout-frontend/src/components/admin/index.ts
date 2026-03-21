/**
 * Admin Components
 * 
 * Complete admin dashboard component library for Burnout Tracker.
 * All components use cyan-blue accent colors (distinct from student indigo-violet)
 * to visually distinguish admin areas from student areas.
 * 
 * @module admin
 */

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export { AdminSidebar } from "./AdminSidebar";
export { AdminTopBar } from "./AdminTopBar";
export { AdminRoleGuard } from "./AdminRoleGuard";

// ============================================================================
// DASHBOARD COMPONENTS (Overview Page)
// ============================================================================

export { AdminStatsCard } from "./AdminStatsCard";
export { RiskDistributionChart } from "./RiskDistributionChart";
export { WeeklyTrendChart } from "./WeeklyTrendChart";
export { DepartmentRiskTable } from "./DepartmentRiskTable";
export { CheckinRateChart } from "./CheckinRateChart";
export { ExportButton } from "./ExportButton";

// ============================================================================
// DEPARTMENT ANALYTICS COMPONENTS
// ============================================================================

export { DepartmentCard } from "./DepartmentCard";
export { DepartmentComparisonChart } from "./DepartmentComparisonChart";
export { DepartmentHeatmap } from "./DepartmentHeatmap";
export { SortControls, type SortKey, type SortOrder } from "./SortControls";

// ============================================================================
// REPORTS COMPONENTS
// ============================================================================

export { QuickExportCard } from "./QuickExportCard";
export { ReportBuilder, type ReportConfig, type Granularity } from "./ReportBuilder";
export { ReportPreviewTable } from "./ReportPreviewTable";

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

export { AdminSkeletonCard, AdminChartSkeleton, AdminTableSkeleton, AdminDashboardSkeleton } from "./AdminSkeletonCard";
export { AdminEmptyState } from "./AdminEmptyState";
export { PrivacyBanner } from "./PrivacyBanner";
export { DataFreshnessIndicator } from "./DataFreshnessIndicator";
