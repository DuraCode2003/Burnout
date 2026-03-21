/**
 * Risk level configurations for burnout assessment
 */
export const RISK_LEVELS = {
  LOW: {
    value: 'low',
    label: 'Low Risk',
    description: 'You\'re doing well! Keep maintaining healthy habits.',
    color: '#10b981',
    colorHex: 'emerald',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    icon: '🌿',
  },
  MEDIUM: {
    value: 'medium',
    label: 'Moderate Risk',
    description: 'Some signs of stress detected. Consider reviewing your workload.',
    color: '#f59e0b',
    colorHex: 'amber',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    icon: '⚠️',
  },
  HIGH: {
    value: 'high',
    label: 'High Risk',
    description: 'Elevated burnout indicators. We recommend speaking with a counselor.',
    color: '#ef4444',
    colorHex: 'red',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    icon: '🔴',
  },
} as const;

/**
 * Mood emoji configurations for daily check-ins
 */
export const MOOD_EMOJIS = [
  { value: 1, emoji: '😫', label: 'Terrible', color: '#ef4444' },
  { value: 2, emoji: '😢', label: 'Very Bad', color: '#f87171' },
  { value: 3, emoji: '😞', label: 'Bad', color: '#f97316' },
  { value: 4, emoji: '😕', label: 'Not Great', color: '#fb923c' },
  { value: 5, emoji: '😐', label: 'Okay', color: '#f59e0b' },
  { value: 6, emoji: '😌', label: 'Alright', color: '#fbbf24' },
  { value: 7, emoji: '🙂', label: 'Good', color: '#84cc16' },
  { value: 8, emoji: '😊', label: 'Very Good', color: '#10b981' },
  { value: 9, emoji: '😄', label: 'Great', color: '#34d399' },
  { value: 10, emoji: '🤩', label: 'Excellent', color: '#6ee7b7' },
] as const;

/**
 * Breathing exercise configurations
 */
export const BREATHING_EXERCISES = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Equal parts inhale, hold, exhale, hold',
    duration: 240,
    phases: [
      { name: 'Inhale', duration: 4, instruction: 'Breathe in through your nose' },
      { name: 'Hold', duration: 4, instruction: 'Hold your breath' },
      { name: 'Exhale', duration: 4, instruction: 'Breathe out through your mouth' },
      { name: 'Hold', duration: 4, instruction: 'Hold your breath' },
    ],
    cycles: 4,
    color: '#6366f1',
    icon: '📦',
  },
  {
    id: '4-7-8',
    name: '4-7-8 Breathing',
    description: 'Relaxing breath technique for better sleep',
    duration: 300,
    phases: [
      { name: 'Inhale', duration: 4, instruction: 'Breathe in quietly through your nose' },
      { name: 'Hold', duration: 7, instruction: 'Hold your breath' },
      { name: 'Exhale', duration: 8, instruction: 'Exhale completely through your mouth' },
    ],
    cycles: 4,
    color: '#8b5cf6',
    icon: '🌙',
  },
  {
    id: 'calm',
    name: 'Calm Breathing',
    description: 'Gentle breathing for relaxation',
    duration: 180,
    phases: [
      { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly' },
      { name: 'Exhale', duration: 6, instruction: 'Breathe out gently' },
    ],
    cycles: 3,
    color: '#10b981',
    icon: '🧘',
  },
  {
    id: 'energize',
    name: 'Energizing Breath',
    description: 'Quick breaths to boost energy',
    duration: 120,
    phases: [
      { name: 'Inhale', duration: 2, instruction: 'Quick inhale through nose' },
      { name: 'Exhale', duration: 2, instruction: 'Quick exhale through mouth' },
    ],
    cycles: 5,
    color: '#f59e0b',
    icon: '⚡',
  },
] as const;

/**
 * Stress level configurations
 */
export const STRESS_LEVELS = [
  { value: 1, label: 'No Stress', description: 'Feeling completely relaxed', color: '#10b981' },
  { value: 2, label: 'Very Low', description: 'Minimal stress', color: '#34d399' },
  { value: 3, label: 'Low', description: 'Slight pressure', color: '#84cc16' },
  { value: 4, label: 'Mild', description: 'Manageable stress', color: '#fbbf24' },
  { value: 5, label: 'Moderate', description: 'Noticeable stress', color: '#f59e0b' },
  { value: 6, label: 'Elevated', description: 'Above average stress', color: '#fb923c' },
  { value: 7, label: 'High', description: 'Significant stress', color: '#f97316' },
  { value: 8, label: 'Very High', description: 'Struggling to cope', color: '#f87171' },
  { value: 9, label: 'Extreme', description: 'Overwhelming stress', color: '#ef4444' },
  { value: 10, label: 'Maximum', description: 'Cannot handle more', color: '#dc2626' },
] as const;

/**
 * API endpoint configurations
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
  },
  // Mood tracking
  MOOD: {
    LIST: '/api/mood',
    CREATE: '/api/mood',
    GET: (id: string) => `/api/mood/${id}`,
    UPDATE: (id: string) => `/api/mood/${id}`,
    DELETE: (id: string) => `/api/mood/${id}`,
    STATS: '/api/mood/stats',
  },
  // Burnout assessment
  ASSESSMENT: {
    LIST: '/api/assessment',
    CREATE: '/api/assessment',
    GET: (id: string) => `/api/assessment/${id}`,
    LATEST: '/api/assessment/latest',
    HISTORY: '/api/assessment/history',
    TREND: '/api/assessment/trend',
  },
  // Insights & Analytics
  INSIGHTS: {
    OVERVIEW: '/api/insights/overview',
    WEEKLY: '/api/insights/weekly',
    MONTHLY: '/api/insights/monthly',
    RECOMMENDATIONS: '/api/insights/recommendations',
  },
  // User profile
  USER: {
    PROFILE: '/api/user/profile',
    SETTINGS: '/api/user/settings',
    PREFERENCES: '/api/user/preferences',
  },
  // Breathing exercises
  BREATHING: {
    LOG: '/api/breathing/log',
    HISTORY: '/api/breathing/history',
    STATS: '/api/breathing/stats',
  },
} as const;

/**
 * Chart color palettes for Recharts
 */
export const CHART_COLORS = {
  primary: ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe'],
  success: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
  warning: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7'],
  danger: ['#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'],
  neutral: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'],
  mood: ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6'],
  stress: ['#10b981', '#34d399', '#84cc16', '#fbbf24', '#f59e0b', '#fb923c', '#f97316', '#f87171', '#ef4444', '#dc2626'],
  sleep: ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff', '#f3e8ff'],
} as const;

/**
 * Sleep quality configurations
 */
export const SLEEP_QUALITY = [
  { value: 1, label: 'Very Poor', hours: '< 4 hours', color: '#ef4444' },
  { value: 2, label: 'Poor', hours: '4-5 hours', color: '#f87171' },
  { value: 3, label: 'Below Average', hours: '5-6 hours', color: '#f97316' },
  { value: 4, label: 'Fair', hours: '6-7 hours', color: '#f59e0b' },
  { value: 5, label: 'Good', hours: '7-8 hours', color: '#84cc16' },
  { value: 6, label: 'Very Good', hours: '8-9 hours', color: '#10b981' },
  { value: 7, label: 'Excellent', hours: '9+ hours', color: '#34d399' },
] as const;

/**
 * Week day labels for charts
 */
export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/**
 * Month labels for charts
 */
export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

/**
 * Burnout assessment question categories
 */
export const ASSESSMENT_CATEGORIES = {
  EMOTIONAL_EXHAUSTION: 'emotional_exhaustion',
  DEPERSONALIZATION: 'depersonalization',
  PERSONAL_ACCOMPLISHMENT: 'personal_accomplishment',
  PHYSICAL_SYMPTOMS: 'physical_symptoms',
  WORKLOAD: 'workload',
  SUPPORT: 'support',
} as const;

/**
 * Recommendation types
 */
export const RECOMMENDATION_TYPES = {
  BREATHING: 'breathing',
  BREAK: 'break',
  SLEEP: 'sleep',
  EXERCISE: 'exercise',
  SOCIAL: 'social',
  PROFESSIONAL_HELP: 'professional_help',
  MINDFULNESS: 'mindfulness',
  TIME_MANAGEMENT: 'time_management',
} as const;
