/**
 * Counselor Dashboard Components
 * Barrel export for all counselor-related components
 */

// Core Components
export { AlertCard } from "./AlertCard";
export { AlertQueue } from "./AlertQueue";
export { AlertDetailPanel } from "./AlertDetailPanel";
export { AlertFilterTabs } from "./AlertFilterTabs";

// Action Components
export { ActionButtons } from "./ActionButtons";
export { NoteEditor } from "./NoteEditor";
export { NoteHistory } from "./NoteHistory";
export { ConfirmActionModal } from "./ConfirmActionModal";

// Stats & Display
export { CounselorStatsBar } from "./CounselorStatsBar";
export { RiskBadge, RiskLevelBadge, TrendIndicator } from "./RiskBadge";
export { ResolutionStats } from "./ResolutionStats";

// History & Pagination
export { ResolvedAlertCard } from "./ResolvedAlertCard";
export { HistoryFilterBar } from "./HistoryFilterBar";
export { PaginationControls } from "./PaginationControls";

// Notifications & Feedback
export { NewAlertNotification } from "./NewAlertNotification";
export { UrgentAlertBanner } from "./UrgentAlertBanner";
export { CounselorEmptyState } from "./CounselorEmptyState";

// Crisis & Resources
export { CrisisResourcePanel } from "./CrisisResourcePanel";

// Navigation & Layout
export { CounselorSidebar } from "./CounselorSidebar";
export { CounselorTopBar } from "./CounselorTopBar";
export { CounselorRoleGuard } from "./CounselorRoleGuard";
