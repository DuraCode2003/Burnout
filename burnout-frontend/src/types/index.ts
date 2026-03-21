/**
 * Core type definitions for Burnout Tracker application
 */

// ============================================================================
// PRIMITIVE TYPES
// ============================================================================

/**
 * Risk level for burnout assessment
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * Mood value ranging from 1 (terrible) to 10 (excellent)
 */
export type MoodValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Stress level ranging from 1 (no stress) to 10 (maximum)
 */
export type StressLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Sleep quality rating from 1-7
 */
export type SleepQualityValue = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Gender identity options
 */
export type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | 'other';

/**
 * Academic level
 */
export type AcademicLevel = 'undergraduate' | 'graduate' | 'phd' | 'other';

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * User role
 */
export type UserRole = 'STUDENT' | 'ADMIN' | 'COUNSELOR';

/**
 * User profile information
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  gender?: Gender;
  dateOfBirth?: string;
  academicLevel?: AcademicLevel;
  institution?: string;
  major?: string;
  yearOfStudy?: number;
  timezone: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User preferences and settings
 */
export interface UserPreferences {
  id: string;
  userId: string;
  notifications: {
    email: boolean;
    push: boolean;
    dailyCheckIn: boolean;
    weeklyReport: boolean;
    riskAlerts: boolean;
  };
  theme: 'dark' | 'light' | 'system';
  language: string;
  breathingReminders: boolean;
  reminderTime?: string;
  dataSharing: {
    analytics: boolean;
    research: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Authentication response from API
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

// ============================================================================
// MOOD TRACKING TYPES
// ============================================================================

/**
 * Mood entry for daily check-in
 */
export interface MoodEntry {
  id: string;
  userId: string;
  mood: MoodValue;
  stressLevel: StressLevel;
  sleepHours: number;
  sleepQuality: SleepQualityValue;
  notes?: string;
  tags: string[];
  energyLevel: number;
  socialInteraction: boolean;
  exerciseToday: boolean;
  caffeineIntake: 'none' | 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

/**
 * Mood statistics for a period
 */
export interface MoodStats {
  averageMood: number;
  averageStress: number;
  averageSleep: number;
  totalEntries: number;
  trend: 'up' | 'down' | 'stable';
  bestDay: string;
  worstDay: string;
  moodDistribution: Record<MoodValue, number>;
}

// ============================================================================
// BURNOUT ASSESSMENT TYPES
// ============================================================================

/**
 * Burnout assessment score breakdown
 */
export interface BurnoutScore {
  id: string;
  userId: string;
  overallScore: number;
  riskLevel: RiskLevel;
  categories: {
    emotionalExhaustion: number;
    depersonalization: number;
    personalAccomplishment: number;
    physicalSymptoms: number;
    workload: number;
    support: number;
  };
  recommendations: Recommendation[];
  completedAt: string;
  createdAt: string;
}

/**
 * Assessment question
 */
export interface AssessmentQuestion {
  id: string;
  category: keyof BurnoutScore['categories'];
  text: string;
  reverseScored: boolean;
  options: {
    value: number;
    label: string;
  }[];
}

/**
 * Assessment session
 */
export interface AssessmentSession {
  id: string;
  userId: string;
  responses: Record<string, number>;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
}

// ============================================================================
// BREATHING EXERCISE TYPES
// ============================================================================

/**
 * Breathing exercise phase
 */
export interface BreathingPhase {
  name: string;
  duration: number;
  instruction: string;
}

/**
 * Breathing exercise configuration
 */
export interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  phases: readonly BreathingPhase[];
  cycles: number;
  color: string;
  icon: string;
}

/**
 * Completed breathing session
 */
export interface BreathingSession {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  duration: number;
  completed: boolean;
  preStressLevel?: StressLevel;
  postStressLevel?: StressLevel;
  notes?: string;
  createdAt: string;
}

/**
 * Breathing statistics
 */
export interface BreathingStats {
  totalSessions: number;
  totalMinutes: number;
  averageSessionsPerWeek: number;
  favoriteExercise: string;
  stressReduction: number;
  streak: number;
}

// ============================================================================
// INSIGHTS & ANALYTICS TYPES
// ============================================================================

/**
 * Dashboard overview data
 */
export interface DashboardOverview {
  currentRiskLevel: RiskLevel;
  riskTrend: 'improving' | 'worsening' | 'stable';
  weeklyMoodAverage: number;
  weeklyStressAverage: number;
  weeklySleepAverage: number;
  assessmentsCompleted: number;
  breathingSessionsThisWeek: number;
  lastCheckIn: string;
  streak: {
    current: number;
    longest: number;
  };
}

/**
 * Weekly insight report
 */
export interface WeeklyInsight {
  weekStart: string;
  weekEnd: string;
  moodTrend: number[];
  stressTrend: number[];
  sleepTrend: number[];
  highlights: string[];
  concerns: string[];
  recommendations: Recommendation[];
  overallScore: number;
}

/**
 * Personalized recommendation
 */
export interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  action?: {
    type: 'navigate' | 'exercise' | 'external';
    target?: string;
    url?: string;
  };
  estimatedImpact: 'low' | 'medium' | 'high';
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
  additionalData?: Record<string, number | string>;
}

/**
 * Time series data for charts
 */
export interface TimeSeriesData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
    fill?: boolean;
  }[];
}

// ============================================================================
// CONSENT & COMPLIANCE TYPES
// ============================================================================

/**
 * Consent record for data processing
 */
export interface ConsentRecord {
  id: string;
  userId: string;
  type: 'terms' | 'privacy' | 'data-sharing' | 'research';
  version: string;
  agreed: boolean;
  agreedAt: string;
  withdrawnAt?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Privacy settings
 */
export interface PrivacySettings {
  profileVisibility: 'private' | 'public' | 'institution-only';
  dataRetention: 'minimum' | 'standard' | 'extended';
  allowResearchParticipation: boolean;
  allowAnonymousAnalytics: boolean;
  downloadDataRequested?: string;
  deleteAccountRequested?: string;
}

// ============================================================================
// API & UTILITY TYPES
// ============================================================================

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
  timestamp: string;
  path: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Date range filter
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Filter options for data queries
 */
export interface DataFilters {
  dateRange?: DateRange;
  riskLevel?: RiskLevel[];
  moodRange?: [MoodValue, MoodValue];
  stressRange?: [StressLevel, StressLevel];
  tags?: string[];
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * Base props for all components
 */
export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Button component props
 */
export interface ButtonProps extends BaseProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

/**
 * Card component props
 */
export interface CardProps extends BaseProps {
  variant?: 'default' | 'glow' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
}

/**
 * Modal component props
 */
export interface ModalProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

/**
 * Form input props
 */
export interface InputProps extends BaseProps {
  label?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

/**
 * Select option
 */
export interface SelectOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

/**
 * Select component props
 */
export interface SelectProps extends BaseProps {
  label?: string;
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

/**
 * Navigation item
 */
export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  activePattern?: string;
  badge?: number | string;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

/**
 * Notification type
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Notification object
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: number;
}

/**
 * Toast notification props
 */
export interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Make all properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Extract keys of a specific type
 */
export type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Valueof utility
 */
export type ValueOf<T> = T[keyof T];

/**
 * Async function type
 */
export type AsyncFunction<T = void> = () => Promise<T>;

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Optional type
 */
export type Optional<T> = T | undefined;

// ============================================================================
// ADMIN DASHBOARD TYPES (AGGREGATE ONLY - NO INDIVIDUAL DATA)
// ============================================================================

/**
 * Campus-wide aggregate statistics (anonymized)
 */
export interface AdminCampusStats {
  totalStudents: number;
  activeThisWeek: number;
  averageBurnoutScore: number;
  averageMood: number;
  averageStress: number;
  averageSleep: number;
  checkInRate: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

/**
 * Department-level statistics (aggregated, anonymized)
 */
export interface DepartmentStats {
  departmentName: string;
  studentCount: number;
  averageBurnoutScore: number;
  averageMood: number;
  averageStress: number;
  averageSleep: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  checkInRate: number;
}

/**
 * Risk distribution data for charts
 */
export interface RiskDistributionData {
  low: number;
  medium: number;
  high: number;
  total: number;
}

/**
 * Weekly trend data point
 */
export interface WeeklyTrendPoint {
  week: string;
  weekStart: string;
  weekEnd: string;
  averageMood: number;
  averageStress: number;
  averageBurnout: number;
  checkInCount: number;
  activeStudents: number;
}

/**
 * Weekly trend data for charts
 */
export interface WeeklyTrendData {
  weeks: WeeklyTrendPoint[];
}

/**
 * Daily check-in rate data
 */
export interface CheckinRatePoint {
  date: string;
  dayName: string;
  checkInCount: number;
  expectedCount: number;
  rate: number;
}

/**
 * Check-in rate data for charts
 */
export interface CheckinRateData {
  days: CheckinRatePoint[];
  averageRate: number;
}

/**
 * Admin dashboard overview
 */
export interface AdminDashboardOverview {
  campusStats: AdminCampusStats;
  riskDistribution: RiskDistributionData;
  weeklyTrend: WeeklyTrendData;
  checkinRate: CheckinRateData;
  departmentStats: DepartmentStats[];
  lastUpdated: string;
}

/**
 * Admin user role
 */
export type AdminRole = 'ADMIN' | 'COUNSELOR';

/**
 * Export format options
 */
export type ExportFormat = 'csv' | 'json' | 'pdf';

/**
 * Export report request
 */
export interface ExportReportRequest {
  format: ExportFormat;
  dateRange?: DateRange;
  includeDepartments: boolean;
  includeTrends: boolean;
}

/**
 * Export report response
 */
export interface ExportReportResponse {
  downloadUrl: string;
  fileName: string;
  expiresAt: string;
  recordCount: number;
}
