'use client';

import { useState, useEffect, useCallback } from 'react';
import moodService, { type BurnoutScoreResponse } from '@/services/moodService';

interface UseBurnoutScoreReturn {
  score: number;
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
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: string | null;
}

const CACHE_KEY = 'burnoutScore';
const CACHE_DURATION = 5 * 60 * 1000;

interface CachedData<T> {
  data: T;
  timestamp: number;
}

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

export function useBurnoutScore(): UseBurnoutScoreReturn {
  const [score, setScore] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [trend, setTrend] = useState<'improving' | 'worsening' | 'stable'>('stable');
  const [previousScore, setPreviousScore] = useState<number>(0);
  const [categories, setCategories] = useState<UseBurnoutScoreReturn['categories']>({
    emotionalExhaustion: 0,
    depersonalization: 0,
    personalAccomplishment: 0,
    physicalSymptoms: 0,
    workload: 0,
    support: 0,
  });
  const [streak, setStreak] = useState<{ current: number; longest: number }>({
    current: 0,
    longest: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchScore = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await moodService.getBurnoutScore();

      setScore(response.overallScore);
      setRiskLevel(response.riskLevel);
      setTrend(response.trend);
      setPreviousScore(response.previousScore);
      setCategories(response.categories);
      setStreak(response.streak);
      setLastUpdated(response.completedAt);

      setCachedData(CACHE_KEY, response);
    } catch (err) {
      const cached = getCachedData<BurnoutScoreResponse>(CACHE_KEY);

      if (cached) {
        setScore(cached.overallScore);
        setRiskLevel(cached.riskLevel);
        setTrend(cached.trend);
        setPreviousScore(cached.previousScore);
        setCategories(cached.categories);
        setStreak(cached.streak);
        setLastUpdated(cached.completedAt);
      }

      setError(err instanceof Error ? err.message : 'Failed to fetch burnout score');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  return {
    score,
    riskLevel,
    trend,
    previousScore,
    categories,
    streak,
    isLoading,
    error,
    refetch: fetchScore,
    lastUpdated,
  };
}

export default useBurnoutScore;
