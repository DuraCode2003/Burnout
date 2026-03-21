import api from './api';
import type { MoodValue, StressLevel, SleepQualityValue } from '@/types';

export interface MoodEntryRequest {
  mood: MoodValue;
  stressLevel: StressLevel;
  sleepHours: number;
  sleepQuality: SleepQualityValue;
  notes?: string;
  energyLevel: number;
  socialInteraction: boolean;
  exerciseToday: boolean;
  caffeineIntake: 'none' | 'low' | 'medium' | 'high';
  tags: string[];
}

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

export interface BurnoutScoreResponse {
  id: string;
  userId: string;
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  trend: 'improving' | 'worsening' | 'stable';
  previousScore: number;
  categories: {
    emotionalExhaustion: number;
    depersonalization: number;
    personalAccomplishment: number;
    physicalSymptoms: number;
    workload: number;
    support: number;
  };
  streak: {
    current: number;
    longest: number;
  };
  completedAt: string;
  createdAt: string;
}

export interface MoodStats {
  averageMood: number;
  averageStress: number;
  averageSleep: number;
  totalEntries: number;
  trend: 'up' | 'down' | 'stable';
  bestDay: string;
  worstDay: string;
}

export const moodService = {
  async addMoodEntry(data: MoodEntryRequest): Promise<MoodEntry> {
    const response = await api.post<MoodEntry>('/api/mood', data);
    return response.data;
  },

  async getMoodHistory(days: number = 30): Promise<MoodEntry[]> {
    const response = await api.get<MoodEntry[]>(`/api/mood/history?days=${days}`);
    return response.data;
  },

  async getBurnoutScore(): Promise<BurnoutScoreResponse> {
    const response = await api.get<BurnoutScoreResponse>('/api/burnout/score');
    return response.data;
  },

  async getBurnoutHistory(): Promise<BurnoutScoreResponse[]> {
    const response = await api.get<BurnoutScoreResponse[]>('/api/burnout/history');
    return response.data;
  },

  async getLatestMood(): Promise<MoodEntry | null> {
    try {
      const response = await api.get<MoodEntry>('/api/mood/latest');
      return response.data;
    } catch {
      return null;
    }
  },

  async getMoodStats(days: number = 30): Promise<MoodStats> {
    const response = await api.get<MoodStats>(`/api/mood/stats?days=${days}`);
    return response.data;
  },

  async deleteMoodEntry(id: string): Promise<void> {
    await api.delete(`/api/mood/${id}`);
  },
};

export default moodService;
