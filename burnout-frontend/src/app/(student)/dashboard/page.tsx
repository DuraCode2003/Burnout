'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { BurnoutScoreCard } from '@/components/dashboard/BurnoutScoreCard';
import { MoodChart } from '@/components/dashboard/MoodChart';
import { DailyTipCard } from '@/components/dashboard/DailyTipCard';
import { StatusCard } from '@/components/dashboard/StatusCard';
import { ChatWidget } from '@/components/ai/ChatWidget';
import { SupportHub } from '@/components/dashboard/SupportHub';
import { api } from '@/services/api';
import { burnoutService } from '@/services/burnoutService';
import { supportService } from '@/services/supportService';
import { useAuth } from '@/context/AuthContext';
import { getTimeBasedGreeting, formatDate } from '@/utils/helpers';
import type { Alert } from '@/types/counselor';
import type { RiskLevel } from '@/types';

interface DashboardData {
  score: number;
  riskLevel: RiskLevel;
  trend: 'improving' | 'worsening' | 'stable';
  previousScore: number;
  lastCheckin: string | null;
  streak: {
    current: number;
    longest: number;
  };
  hasCheckedInToday: boolean;
  moodHistory: Array<{
    date: string;
    mood: number;
    stress: number;
    dayLabel: string;
  }>;
}

interface Tip {
  text: string;
  category: string;
}


function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card-glow p-card ${className}`}>
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-bg-elevated rounded w-1/3" />
        <div className="h-32 bg-bg-elevated rounded" />
        <div className="h-4 bg-bg-elevated rounded w-2/3" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [tip, setTip] = useState<Tip | null>(null);
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        setError(null);

        const [scoreResponse, moodResponse, tipResponse] = await Promise.all([
          api.get('/api/burnout/score'),
          api.get('/api/mood/history?days=7'),
          api.get('/api/tips/today')
        ]);

        const scoreData = scoreResponse.data;
        const moodData = moodResponse.data;
        const tipData = tipResponse.data;

        const moodHistory = moodData.map((entry: any) => ({
          date: entry.date,
          mood: entry.mood,
          stress: entry.stress,
          dayLabel: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
        }));

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const hasCheckedInToday = scoreData.hasCheckedInToday;

        setData({
          score: scoreData.overallScore || 0,
          riskLevel: scoreData.riskLevel || 'low',
          trend: scoreData.trend || 'stable',
          previousScore: scoreData.previousScore || 0,
          lastCheckin: moodData.length > 0 ? moodData[moodData.length - 1].date : null,
          streak: {
            current: scoreData.streak?.current || 0,
            longest: scoreData.streak?.longest || 0,
          },
          hasCheckedInToday,
          moodHistory,
        });

        if (tipData) {
          setTip({
            text: tipData.content,
            category: tipData.category || 'mindfulness'
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchSupportData() {
      try {
        const alert = await burnoutService.getActiveAlert();
        if (alert) {
          setActiveAlert(alert);
          const session = await supportService.getActiveSession(alert.id);
          if (session) {
            setActiveSessionId(session.id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch support data:', err);
      }
    }

    fetchDashboardData();
    fetchSupportData();
  }, []);

  const greeting = getTimeBasedGreeting();
  const { user: authUser } = useAuth();
  const userName = authUser?.name || 'Student';


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
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="w-full">
            <motion.header
              className="mb-6 xs:mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl xs:text-3xl font-bold font-sora text-text-primary mb-2">
                {isMounted ? `${greeting}, ${userName}` : 'Loading...'}
                {isMounted && (
                  <motion.span
                    className="inline-block ml-2"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                  >
                    👋
                  </motion.span>
                )}
              </h1>
              <p className="text-text-secondary">
                {isMounted ? `Here's your wellbeing overview for ${formatDate(new Date(), 'long')}` : 'Loading your overview...'}
              </p>
            </motion.header>

            {error && (
              <motion.div
                className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-danger">{error}</p>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SkeletonCard className="md:col-span-2 lg:col-span-2" />
                  <SkeletonCard />
                  <SkeletonCard className="md:col-span-2" />
                  <SkeletonCard />
                </motion.div>
              ) : data ? (
                <motion.div
                  key="content"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <div className="md:col-span-2 lg:col-span-2">
                    <BurnoutScoreCard
                      score={data.score}
                      riskLevel={data.riskLevel}
                      trend={data.trend}
                      previousScore={data.previousScore}
                    />
                  </div>

                  <div>
                    <StatusCard
                      lastCheckin={data.lastCheckin}
                      streak={data.streak.current}
                      hasCheckedInToday={data.hasCheckedInToday}
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <MoodChart data={data.moodHistory} />
                  </div>
                    <div className="md:col-span-2 lg:col-span-2">
                      <DailyTipCard tip={tip?.text || 'Stay mindful and take care of yourself.'} category={tip?.category || 'mindfulness'} />
                    </div>

                    {activeAlert && !activeSessionId && (
                      <div className="md:col-span-3">
                        <SupportHub 
                          alertId={activeAlert.id} 
                          onSessionCreated={() => {
                            window.location.reload();
                          }} 
                        />
                      </div>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
  
        {/* AI Chat Widget */}
        <ChatWidget />
      </div>
    );
  }
