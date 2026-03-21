import api from './api';

export interface BreathingSessionRequest {
  exerciseId: string;
  exerciseName: string;
  duration: number;
  completed: boolean;
  preStressLevel?: number;
  postStressLevel?: number;
  feltCalmer?: boolean;
  notes?: string;
}

export interface BreathingSession {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  duration: number;
  completed: boolean;
  preStressLevel?: number;
  postStressLevel?: number;
  feltCalmer?: boolean;
  notes?: string;
  createdAt: string;
}

export interface BreathingStats {
  totalSessions: number;
  totalMinutes: number;
  averageSessionsPerWeek: number;
  favoriteExercise: string;
  stressReduction: number;
  streak: number;
}

export const breathingService = {
  async startSession(exerciseId: string): Promise<{ sessionId: string }> {
    const response = await api.post<{ sessionId: string }>('/api/breathing/start', { exerciseId });
    return response.data;
  },

  async completeSession(data: BreathingSessionRequest): Promise<BreathingSession> {
    const response = await api.post<BreathingSession>('/api/breathing/log', data);
    return response.data;
  },

  async getSessionHistory(days: number = 30): Promise<BreathingSession[]> {
    const response = await api.get<BreathingSession[]>(`/api/breathing/history?days=${days}`);
    return response.data;
  },

  async getStats(): Promise<BreathingStats> {
    const response = await api.get<BreathingStats>('/api/breathing/stats');
    return response.data;
  },

  async getCurrentStreak(): Promise<number> {
    const response = await api.get<{ streak: number }>('/api/breathing/streak');
    return response.data.streak;
  },
};

export default breathingService;
