'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import api from '@/services/api';
import { PeriodSelector } from '@/components/insights/PeriodSelector';
import { StatCard } from '@/components/insights/StatCard';
import { MoodTrendChart } from '@/components/insights/MoodTrendChart';
import { SleepChart } from '@/components/insights/SleepChart';
import { StressDonut } from '@/components/insights/StressDonut';
import { BestWorstDays } from '@/components/insights/BestWorstDays';
import type { MoodValue } from '@/types';

type Period = 7 | 14 | 30;

interface InsightsData {
  avgBurnoutScore: number;
  burnoutChange: number;
  checkInStreak: number;
  streakChange: number;
  totalCheckIns: number;
  moodTrend: Array<{
    date: string;
    dayLabel: string;
    mood: number;
    burnoutScore?: number;
  }>;
  sleepData: Array<{
    date: string;
    dayLabel: string;
    hours: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  }>;
  stressDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  bestDay: {
    date: string;
    mood: MoodValue;
    sleepHours: number;
    stressLevel: number;
    notes?: string;
  } | null;
  worstDay: {
    date: string;
    mood: MoodValue;
    sleepHours: number;
    stressLevel: number;
    notes?: string;
  } | null;
}

function generateMockData(period: number): InsightsData {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  
  const moodTrend = Array.from({ length: period }).map((_, i) => {
    const date = new Date(today.getTime() - (period - 1 - i) * 24 * 60 * 60 * 1000);
    const mood = Math.floor(Math.random() * 6) + 4;
    
    return {
      date: date.toISOString().split('T')[0],
      dayLabel: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
      mood,
      burnoutScore: Math.floor(100 - mood * 8 + Math.random() * 20),
    };
  });

  const sleepData = moodTrend.map((d) => ({
    date: d.date,
    dayLabel: d.dayLabel,
    hours: Math.floor(Math.random() * 40) / 10 + 5,
    quality: 'good' as const,
  }));

  const stressLow = Math.floor(Math.random() * 5) + 2;
  const stressMedium = Math.floor(Math.random() * 5) + 2;
  const stressHigh = period - stressLow - stressMedium;

  const bestMoodDay = moodTrend.reduce((best, current) =>
    current.mood > best.mood ? current : best
  );
  const worstMoodDay = moodTrend.reduce((worst, current) =>
    current.mood < worst.mood ? current : worst
  );

  return {
    avgBurnoutScore: Math.floor(moodTrend.reduce((acc, d) => acc + d.burnoutScore!, 0) / moodTrend.length),
    burnoutChange: Math.floor(Math.random() * 20) - 10,
    checkInStreak: Math.floor(Math.random() * 14) + 1,
    streakChange: Math.floor(Math.random() * 30),
    totalCheckIns: period,
    moodTrend,
    sleepData,
    stressDistribution: {
      low: stressLow,
      medium: stressMedium,
      high: Math.max(0, stressHigh),
    },
    bestDay: {
      date: bestMoodDay.date,
      mood: bestMoodDay.mood as MoodValue,
      sleepHours: 7.5,
      stressLevel: 3,
      notes: 'Felt really productive today!',
    },
    worstDay: {
      date: worstMoodDay.date,
      mood: worstMoodDay.mood as MoodValue,
      sleepHours: 5.5,
      stressLevel: 8,
      notes: 'Had a big deadline and didn\'t sleep well',
    },
  };
}

export default function InsightsPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>(7);
  const [data, setData] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      setIsLoading(true);
      
      try {
        const response = await api.get(`/api/insights/overview?period=${period}`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching insights:', error);
        // Fallback to mock if API fails
        setData(generateMockData(period));
      } finally {
        setIsLoading(false);
      }
    }

    fetchInsights();
  }, [period]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="w-full">
            <motion.header
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold font-sora text-text-primary mb-2">
                Insights
              </h1>
              <p className="text-text-secondary">
                Understand your burnout patterns and track your progress
              </p>
            </motion.header>

            <div className="flex items-center justify-between mb-8">
              <PeriodSelector period={period} onChange={setPeriod} />

              <motion.div
                className="text-sm text-text-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {data?.totalCheckIns || 0} check-ins in this period
              </motion.div>
            </div>

            {data ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    label="Avg Burnout Score"
                    value={data.avgBurnoutScore}
                    change={data.burnoutChange}
                    changeLabel="vs previous period"
                    icon="📊"
                    color="#8b5cf6"
                  />

                  <StatCard
                    label="Check-in Streak"
                    value={data.checkInStreak}
                    change={data.streakChange}
                    changeLabel="days in a row"
                    icon="🔥"
                    color="#f59e0b"
                    suffix=" days"
                  />

                  <StatCard
                    label="Avg Sleep"
                    value={
                      data.sleepData.length > 0 
                        ? data.sleepData.reduce((acc, d) => acc + d.hours, 0) / data.sleepData.length
                        : 0
                    }
                    icon="😴"
                    color="#6366f1"
                    suffix="h"
                  />

                  <StatCard
                    label="Avg Mood"
                    value={
                      data.moodTrend.length > 0
                        ? data.moodTrend.reduce((acc, d) => acc + d.mood, 0) / data.moodTrend.length
                        : 0
                    }
                    icon="😊"
                    color="#10b981"
                    suffix="/10"
                  />
                </div>

                <MoodTrendChart
                  data={data.moodTrend}
                  period={period}
                  isLoading={isLoading}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SleepChart
                    data={data.sleepData}
                    isLoading={isLoading}
                  />

                  <StressDonut
                    low={data.stressDistribution.low}
                    medium={data.stressDistribution.medium}
                    high={data.stressDistribution.high}
                    isLoading={isLoading}
                  />
                </div>

                <BestWorstDays
                  best={data.bestDay}
                  worst={data.worstDay}
                  isLoading={isLoading}
                />
              </motion.div>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center h-[400px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="animate-pulse text-6xl mb-4">📊</div>
                <p className="text-text-secondary">Loading insights...</p>
              </motion.div>
            )}
    </div>
  );
}
