"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import adminService from "@/services/adminService";
import {
  CampusStats,
  RiskDistribution,
  WeeklyTrend,
  DailyCheckin,
  DepartmentStats,
} from "@/types/admin";

interface AdminStatsData {
  stats: CampusStats | null;
  riskDistribution: RiskDistribution | null;
  weeklyTrends: WeeklyTrend[];
  checkinRates: DailyCheckin[];
  departments: DepartmentStats[];
}

interface UseAdminStatsReturn {
  data: AdminStatsData;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

const CACHE_KEY = "admin_stats_cache";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  data: AdminStatsData;
  timestamp: number;
}

export function useAdminStats(): UseAdminStatsReturn {
  const [data, setData] = useState<AdminStatsData>({
    stats: null,
    riskDistribution: null,
    weeklyTrends: [],
    checkinRates: [],
    departments: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchStats = useCallback(async (isRefresh = false) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      if (!isRefresh) {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed: CachedData = JSON.parse(cached);
          const age = Date.now() - parsed.timestamp;

          if (age < CACHE_DURATION) {
            setData(parsed.data);
            setLastUpdated(new Date(parsed.timestamp));
            setIsLoading(false);
            return;
          }
        }
      }

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      const [stats, risk, trends, rates, depts] = await Promise.all([
        adminService.getCampusStats(),
        adminService.getRiskDistribution(),
        adminService.getWeeklyTrends(8),
        adminService.getCheckinRates(),
        adminService.getDepartmentStats(),
      ]);

      const newData: AdminStatsData = {
        stats,
        riskDistribution: risk,
        weeklyTrends: trends,
        checkinRates: rates,
        departments: depts,
      };

      setData(newData);

      // Cache the data
      const cacheData: CachedData = {
        data: newData,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

      setLastUpdated(new Date());
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error("Failed to fetch admin stats:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchStats(true);
    }, CACHE_DURATION);

    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchStats]);

  const refetch = useCallback(async () => {
    await fetchStats(true);
  }, [fetchStats]);

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refetch,
    lastUpdated,
  };
}

export default useAdminStats;
