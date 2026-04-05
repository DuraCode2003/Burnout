/**
 * Counselor Dashboard Types
 * Privacy-focused: Students only identified if anonymize_data = false
 */

// ============================================================================
// ALERT TIER ENUMS
// ============================================================================

export type AlertType = 'YELLOW' | 'ORANGE' | 'RED';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED';

export type AlertPattern = 
  | 'MOOD_DECLINE'
  | 'ENERGY_DECLINE'
  | 'NEGATIVE_SENTIMENT'
  | 'HIGH_WORKLOAD'
  | 'CRISIS_KEYWORDS'
  | 'SLEEP_DISTURBANCE'
  | 'SOCIAL_WITHDRAWAL'
  | 'PERSISTENT_LOW_MOOD';

// ============================================================================
// STUDENT IDENTIFICATION (Privacy-Preserving)
// ============================================================================

export interface StudentInfo {
  id: string;
  anonymousId: string;
  isAnonymous: boolean;
  name?: string;
  email?: string;
  department?: string;
}

// ============================================================================
// ALERT TYPES
// ============================================================================

export interface AlertTrigger {
  pattern: AlertPattern;
  detectedAt: string;
  severity: number;
  description: string;
  daysPersisting?: number;
}

export interface RiskIndicators {
  currentRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  burnoutScore: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  energyTrend: 'improving' | 'stable' | 'declining';
  stressLevel: number;
  sleepQuality: number;
  avgSleepHours: number;
  checkInStreak: number;
  lastCheckIn: string;
}

export interface CounselorNote {
  id: string;
  alertId: string;
  counselorId: string;
  counselorName: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface AlertAction {
  id: string;
  alertId: string;
  actionType: 'CONTACTED' | 'MESSAGE_SENT' | 'ESCALATED' | 'RESOLVED' | 'BOOKING_OFFERED';
  performedBy: string;
  performedByName: string;
  timestamp: string;
  notes?: string;
}

export interface Alert {
  id: string;
  student: StudentInfo;
  tier: AlertType;
  status: AlertStatus;
  triggers: AlertTrigger[];
  riskIndicators: RiskIndicators;
  requiresResponseBy?: string;
  createdAt: string;
  resolvedAt?: string;
  updatedAt: string;
  assignedTo?: string;
  assignedToName?: string;
  notes: CounselorNote[];
  actions: AlertAction[];
  isUrgent: boolean;
  responseTimeRemaining?: number;
  supportRequested: boolean;
}

// ============================================================================
// COUNSELOR STATS
// ============================================================================

export interface AlertQueueStats {
  total: number;
  red: number;
  orange: number;
  yellow: number;
  urgent: number;
  assignedToMe: number;
  unassigned: number;
}

export interface CounselorMetrics {
  alertsResolved: number;
  avgResponseTime: number;
  studentsContacted: number;
  escalationsMade: number;
  responseTimeSLA: number;
}

export interface WeeklyAlertTrend {
  week: string;
  red: number;
  orange: number;
  yellow: number;
  resolved: number;
}

export interface CounselorStats {
  queue: AlertQueueStats;
  metrics: CounselorMetrics;
  weeklyTrend: WeeklyAlertTrend[];
  lastUpdated: string;
}

// ============================================================================
// RESOLVED ALERT HISTORY
// ============================================================================

export interface ResolvedAlert {
  id: string;
  student: StudentInfo;
  tier: AlertType;
  resolvedAt: string;
  resolutionType: 'RESOLVED' | 'ESCALATED';
  resolvedBy: string;
  resolvedByName: string;
  totalActions: number;
  daysOpen: number;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface ResolveAlertRequest {
  resolutionNotes?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

export interface AddNoteRequest {
  note: string;
  isInternal?: boolean;
}

export interface EscalateAlertRequest {
  reason: string;
  priority: 'HIGH' | 'URGENT';
}

export interface ContactStudentRequest {
  contactMethod: 'EMAIL' | 'PHONE' | 'MESSAGE' | 'IN_PERSON';
  notes?: string;
}

export interface SendMessageRequest {
  message: string;
  templateId?: string;
}

// ============================================================================
// CRISIS RESOURCES
// ============================================================================

export interface CrisisResource {
  id: string;
  name: string;
  type: 'HOTLINE' | 'CHAT' | 'IN_PERSON' | 'ONLINE';
  phone?: string;
  url?: string;
  description: string;
  available24_7: boolean;
  languages: string[];
}

export interface CrisisResources {
  national: CrisisResource[];
  campus: CrisisResource[];
  online: CrisisResource[];
}

export interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  tier: AlertType;
}

// ============================================================================
// ALERT FILTERS
// ============================================================================

export interface AlertFilters {
  tier?: AlertType[];
  status?: AlertStatus[];
  assignedTo?: 'me' | 'unassigned' | 'others';
  pattern?: AlertPattern[];
  dateRange?: {
    from: string;
    to: string;
  };
  search?: string;
}

export type AlertSortField = 'createdAt' | 'tier' | 'responseTimeRemaining' | 'student';
export type AlertSortOrder = 'asc' | 'desc';

export interface AlertSort {
  field: AlertSortField;
  order: AlertSortOrder;
}

// ============================================================================
// PAGINATION
// ============================================================================

export interface PaginatedResponse<T> {
  content: T[];
  total: number;
  page: number;
  totalPages: number;
  size: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getAlertTierColor(tier: AlertType): string {
  switch (tier) {
    case 'RED':
      return '#ef4444';
    case 'ORANGE':
      return '#f97316';
    case 'YELLOW':
      return '#eab308';
    default:
      return '#6b7280';
  }
}

export function getAlertTierGlow(tier: AlertType): string {
  switch (tier) {
    case 'RED':
      return '0 0 50px rgba(239, 68, 68, 0.4)';
    case 'ORANGE':
      return '0 0 40px rgba(249, 115, 22, 0.3)';
    case 'YELLOW':
      return '0 0 30px rgba(234, 179, 8, 0.25)';
    default:
      return 'none';
  }
}

export function getAlertTierLabel(tier: AlertType): string {
  switch (tier) {
    case 'RED':
      return 'URGENT';
    case 'ORANGE':
      return 'Needs Attention';
    case 'YELLOW':
      return 'Monitoring';
    default:
      return tier;
  }
}

export function getAlertStatusLabel(status: AlertStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'ACKNOWLEDGED':
      return 'Acknowledged';
    case 'RESOLVED':
      return 'Resolved';
    case 'ESCALATED':
      return 'Escalated';
    default:
      return status;
  }
}

export function getPatternLabel(pattern: AlertPattern): string {
  const labels: Record<AlertPattern, string> = {
    MOOD_DECLINE: 'Mood Decline',
    ENERGY_DECLINE: 'Energy Decline',
    NEGATIVE_SENTIMENT: 'Negative Sentiment',
    HIGH_WORKLOAD: 'High Workload',
    CRISIS_KEYWORDS: 'Crisis Keywords',
    SLEEP_DISTURBANCE: 'Sleep Disturbance',
    SOCIAL_WITHDRAWAL: 'Social Withdrawal',
    PERSISTENT_LOW_MOOD: 'Persistent Low Mood',
  };
  return labels[pattern];
}

export function generateAnonymousId(studentId: string): string {
  const hash = studentId.slice(-4).toUpperCase();
  return `Student #${hash}`;
}
