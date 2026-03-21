import { RISK_LEVELS, MOOD_EMOJIS, STRESS_LEVELS, CHART_COLORS } from './constants';
import type { RiskLevel, MoodValue, StressLevel } from '@/types';

/**
 * Formats a date string or Date object into a readable format
 * @param date - The date to format (ISO string, Date object, or timestamp)
 * @param format - The format type: 'short', 'long', 'relative', or 'time'
 * @returns Formatted date string
 *
 * @example
 * formatDate('2024-01-15T10:30:00Z', 'short') // "Jan 15, 2024"
 * formatDate(new Date(), 'relative') // "Today" or "Yesterday"
 */
export function formatDate(
  date: string | Date | number,
  format: 'short' | 'long' | 'relative' | 'time' | 'datetime' = 'short'
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

    case 'relative':
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;

    case 'time':
      return dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

    case 'datetime':
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

    default:
      return dateObj.toLocaleDateString('en-US');
  }
}

/**
 * Gets the color for a given risk level
 * @param level - The risk level ('low', 'medium', 'high')
 * @returns Hex color string
 *
 * @example
 * getRiskColor('low') // "#10b981"
 * getRiskColor('high') // "#ef4444"
 */
export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'high':
      return RISK_LEVELS.HIGH.color;
    case 'medium':
      return RISK_LEVELS.MEDIUM.color;
    case 'low':
    default:
      return RISK_LEVELS.LOW.color;
  }
}

/**
 * Gets the gradient for a given risk level
 * @param level - The risk level ('low', 'medium', 'high')
 * @returns CSS gradient string
 *
 * @example
 * getRiskGradient('low') // "linear-gradient(135deg, #10b981 0%, #34d399 100%)"
 */
export function getRiskGradient(level: RiskLevel): string {
  switch (level) {
    case 'high':
      return RISK_LEVELS.HIGH.gradient;
    case 'medium':
      return RISK_LEVELS.MEDIUM.gradient;
    case 'low':
    default:
      return RISK_LEVELS.LOW.gradient;
  }
}

/**
 * Gets the risk level configuration object
 * @param level - The risk level ('low', 'medium', 'high')
 * @returns Full risk level configuration
 *
 * @example
 * getRiskLevelConfig('medium') // Returns MEDIUM config with label, description, etc.
 */
export function getRiskLevelConfig(level: RiskLevel) {
  switch (level) {
    case 'high':
      return RISK_LEVELS.HIGH;
    case 'medium':
      return RISK_LEVELS.MEDIUM;
    case 'low':
    default:
      return RISK_LEVELS.LOW;
  }
}

/**
 * Gets the mood emoji configuration for a given mood value
 * @param value - Mood value from 1-10
 * @returns Mood emoji configuration object
 *
 * @example
 * getMoodEmoji(10) // { value: 10, emoji: "🤩", label: "Excellent", color: "#6ee7b7" }
 */
export function getMoodEmoji(value: MoodValue) {
  const clampedValue = Math.max(1, Math.min(10, value)) as MoodValue;
  return MOOD_EMOJIS.find(mood => mood.value === clampedValue) || MOOD_EMOJIS[4];
}

/**
 * Gets the emoji character for a given mood value
 * @param value - Mood value from 1-10
 * @returns Emoji character string
 *
 * @example
 * getMoodEmojiChar(7) // "🙂"
 */
export function getMoodEmojiChar(value: MoodValue): string {
  return getMoodEmoji(value).emoji;
}

/**
 * Gets the stress level configuration
 * @param value - Stress level from 1-10
 * @returns Stress level configuration object
 */
export function getStressLevel(value: StressLevel) {
  const clampedValue = Math.max(1, Math.min(10, value)) as StressLevel;
  return STRESS_LEVELS.find(level => level.value === clampedValue) || STRESS_LEVELS[4];
}

/**
 * Calculates the trend direction between two values
 * @param currentValue - The current value
 * @param previousValue - The previous value
 * @returns Trend direction: 'up', 'down', or 'stable'
 *
 * @example
 * calculateTrend(8, 6) // "up"
 * calculateTrend(5, 7) // "down"
 * calculateTrend(5, 5) // "stable"
 */
export function calculateTrend(
  currentValue: number,
  previousValue: number
): 'up' | 'down' | 'stable' {
  const diff = currentValue - previousValue;
  if (diff > 0.5) return 'up';
  if (diff < -0.5) return 'down';
  return 'stable';
}

/**
 * Calculates the percentage change between two values
 * @param currentValue - The current value
 * @param previousValue - The previous value
 * @returns Percentage change (can be negative)
 *
 * @example
 * calculatePercentageChange(8, 6) // 33.33
 */
export function calculatePercentageChange(
  currentValue: number,
  previousValue: number
): number {
  if (previousValue === 0) return 0;
  return ((currentValue - previousValue) / previousValue) * 100;
}

/**
 * Formats sleep hours into a readable string
 * @param hours - Number of sleep hours
 * @returns Formatted sleep hours string
 *
 * @example
 * formatSleepHours(7.5) // "7h 30m"
 * formatSleepHours(8) // "8h"
 */
export function formatSleepHours(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  return `${wholeHours}h ${minutes}m`;
}

/**
 * Gets the sleep quality label based on hours slept
 * @param hours - Number of sleep hours
 * @returns Sleep quality label
 */
export function getSleepQualityLabel(hours: number): string {
  if (hours < 4) return 'Very Poor';
  if (hours < 5) return 'Poor';
  if (hours < 6) return 'Below Average';
  if (hours < 7) return 'Fair';
  if (hours < 8) return 'Good';
  if (hours < 9) return 'Very Good';
  return 'Excellent';
}

/**
 * Gets the sleep quality color based on hours slept
 * @param hours - Number of sleep hours
 * @returns Hex color string
 */
export function getSleepQualityColor(hours: number): string {
  if (hours < 5) return '#ef4444';
  if (hours < 6) return '#f97316';
  if (hours < 7) return '#f59e0b';
  if (hours < 8) return '#84cc16';
  return '#10b981';
}

/**
 * Calculates burnout risk score based on multiple factors
 * @param moodScore - Average mood score (1-10)
 * @param stressLevel - Average stress level (1-10)
 * @param sleepHours - Average sleep hours
 * @param assessmentScore - Burnout assessment score (0-100)
 * @returns Risk level: 'low', 'medium', or 'high'
 */
export function calculateBurnoutRisk(
  moodScore: number,
  stressLevel: number,
  sleepHours: number,
  assessmentScore: number
): RiskLevel {
  const normalizedMood = (10 - moodScore) / 10;
  const normalizedStress = stressLevel / 10;
  const normalizedSleep = Math.max(0, (8 - sleepHours) / 4);
  const normalizedAssessment = assessmentScore / 100;

  const weightedScore =
    normalizedMood * 0.25 +
    normalizedStress * 0.25 +
    normalizedSleep * 0.2 +
    normalizedAssessment * 0.3;

  if (weightedScore >= 0.66) return 'high';
  if (weightedScore >= 0.33) return 'medium';
  return 'low';
}

/**
 * Gets a chart color from the palette by index
 * @param index - Color index
 * @param palette - Color palette name
 * @returns Hex color string
 */
export function getChartColor(index: number, palette: keyof typeof CHART_COLORS = 'primary'): string {
  const colors = CHART_COLORS[palette];
  return colors[index % colors.length];
}

/**
 * Clamps a number between min and max values
 * @param value - The value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped number
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Rounds a number to specified decimal places
 * @param value - The number to round
 * @param decimals - Number of decimal places
 * @returns Rounded number
 */
export function roundTo(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Generates an array of numbers in a range
 * @param start - Start value
 * @param end - End value
 * @returns Array of numbers
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Gets Tailwind color class for risk level
 * @param level - Risk level
 * @param type - Type of class (text, bg, border)
 * @returns Tailwind class string
 */
export function getRiskTailwindClass(
  level: RiskLevel,
  type: 'text' | 'bg' | 'border' = 'text'
): string {
  const colorMap: Record<RiskLevel, string> = {
    low: 'emerald',
    medium: 'amber',
    high: 'red',
  };

  const color = colorMap[level];
  switch (type) {
    case 'bg':
      return `bg-${color}-500/10`;
    case 'border':
      return `border-${color}-500/30`;
    case 'text':
    default:
      return `text-${color}-500`;
  }
}

/**
 * Formats a number with abbreviations for large values
 * @param num - The number to format
 * @returns Formatted string
 *
 * @example
 * formatNumber(1500) // "1.5K"
 * formatNumber(1500000) // "1.5M"
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Gets the appropriate text color class based on background
 * @param isDark - Whether the background is dark
 * @returns Tailwind text color class
 */
export function getTextColorClass(isDark: boolean = true): string {
  return isDark ? 'text-text-primary' : 'text-text-inverse';
}

/**
 * Calculates days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days
 */
export function daysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Gets greeting based on time of day
 * @returns Greeting string
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

/**
 * Validates an email address format
 * @param email - Email string to validate
 * @returns Whether email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Truncates text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
