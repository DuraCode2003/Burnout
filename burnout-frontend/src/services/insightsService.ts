import api from './api';

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

export interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: 'low' | 'medium' | 'high';
}

export interface InsightsOverview {
  currentRiskLevel: 'low' | 'medium' | 'high';
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

export const insightsService = {
  async getOverview(): Promise<InsightsOverview> {
    const response = await api.get<InsightsOverview>('/api/insights/overview');
    return response.data;
  },

  async getWeeklyInsights(weeks: number = 4): Promise<WeeklyInsight[]> {
    const response = await api.get<WeeklyInsight[]>(`/api/insights/weekly?weeks=${weeks}`);
    return response.data;
  },

  async getMonthlyInsights(months: number = 3): Promise<WeeklyInsight[]> {
    const response = await api.get<WeeklyInsight[]>(`/api/insights/monthly?months=${months}`);
    return response.data;
  },

  async getRecommendations(): Promise<Recommendation[]> {
    const response = await api.get<Recommendation[]>('/api/insights/recommendations');
    return response.data;
  },
};

export default insightsService;
