import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '@/services/api';

/**
 * Lightweight hook that fetches the authoritative hasCheckedInToday value
 * directly from /api/burnout/score — same source the dashboard uses.
 * Uses a short localStorage cache (1 min) to avoid redundant API calls.
 */
export function useCheckinStatus() {
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const CACHE_KEY = 'checkin_status_today';

    // Check cache first
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { value, date, ts } = JSON.parse(cached);
        const today = new Date().toDateString();
        const age = Date.now() - ts;
        // Use cache only if it's from today and less than 1 minute old
        if (date === today && age < 1 * 60 * 1000) {
          setHasCheckedInToday(value);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // ignore cache errors
    }

    // Fetch fresh from API
    api.get('/api/burnout/score')
      .then((res) => {
        const value: boolean = res.data?.hasCheckedInToday ?? false;
        setHasCheckedInToday(value);

        // Cache the result with today's date
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            value,
            date: new Date().toDateString(),
            ts: Date.now(),
          }));
        } catch {
          // ignore
        }
      })
      .catch(() => {
        // Keep default false on error — don't lock user out due to network issues
        setHasCheckedInToday(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [pathname]); // Re-fetch on navigation to ensure Sidebar reflects latest status

  return { hasCheckedInToday, isLoading };
}
