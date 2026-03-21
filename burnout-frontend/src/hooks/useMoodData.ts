'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import moodService, { type MoodEntry, type BurnoutScoreResponse } from '@/services/moodService';
import type { MoodValue, StressLevel } from '@/types';

interface UseMoodDataReturn {
  moodHistory: MoodEntry[];
  burnoutScore: BurnoutScoreResponse | null;
  latestScore: number | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  weeklyAverage: number;
  trend: 'up' | 'down' | 'stable';
  lastCheckIn: string | null;
  hasCheckedInToday: boolean;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000;

function getCachedData<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp }: CachedData<T> = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > CACHE_DURATION;

    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function setCachedData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;

  try {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cached));
  } catch {
    // Ignore cache errors
  }
}

export function useMoodData(days: number = 30): UseMoodDataReturn {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [burnoutScore, setBurnoutScore] = useState<BurnoutScoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [historyResponse, scoreResponse] = await Promise.all([
        moodService.getMoodHistory(days),
        moodService.getBurnoutScore(),
      ]);

      setMoodHistory(historyResponse);
      setBurnoutScore(scoreResponse);

      setCachedData('moodHistory', historyResponse);
      setCachedData('burnoutScore', scoreResponse);
    } catch (err) {
      const cachedHistory = getCachedData<MoodEntry[]>('moodHistory');
      const cachedScore = getCachedData<BurnoutScoreResponse>('burnoutScore');

      if (cachedHistory) setMoodHistory(cachedHistory);
      if (cachedScore) setBurnoutScore(cachedScore);

      setError(err instanceof Error ? err.message : 'Failed to fetch mood data');
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const weeklyAverage = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentEntries = moodHistory.filter(
      (entry) => new Date(entry.createdAt) >= sevenDaysAgo
    );

    if (recentEntries.length === 0) return 0;

    const sum = recentEntries.reduce((acc, entry) => acc + entry.mood, 0);
    return Math.round((sum / recentEntries.length) * 10) / 10;
  }, [moodHistory]);

  const trend = useMemo<'up' | 'down' | 'stable'>(() => {
    if (moodHistory.length < 2) return 'stable';

    const sortedEntries = [...moodHistory].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const recentMood = sortedEntries[0]?.mood || 0;
    const previousMood = sortedEntries[1]?.mood || 0;
    const diff = recentMood - previousMood;

    if (diff > 0.5) return 'up';
    if (diff < -0.5) return 'down';
    return 'stable';
  }, [moodHistory]);

  const lastCheckIn = useMemo(() => {
    if (moodHistory.length === 0) return null;
    return moodHistory[0].createdAt;
  }, [moodHistory]);

  const hasCheckedInToday = useMemo(() => {
    if (moodHistory.length === 0) return false;

    const today = new Date().toDateString();
    return moodHistory.some(
      (entry) => new Date(entry.createdAt).toDateString() === today
    );
  }, [moodHistory]);

  const latestScore = useMemo(() => {
    return burnoutScore?.overallScore ?? null;
  }, [burnoutScore]);

  return {
    moodHistory,
    burnoutScore,
    latestScore,
    isLoading,
    error,
    refetch: fetchData,
    weeklyAverage,
    trend,
    lastCheckIn,
    hasCheckedInToday,
  };
}

export default useMoodData;
