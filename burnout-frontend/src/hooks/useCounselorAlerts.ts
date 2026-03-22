import { useState, useEffect, useCallback, useMemo } from "react";
import counselorService from "@/services/counselorService";
import type { Alert, CounselorStats, AlertType } from "@/types/counselor";

interface UseCounselorAlertsReturn {
  alerts: Alert[];
  filteredAlerts: Alert[];
  urgentAlerts: Alert[];
  stats: CounselorStats | null;
  isLoading: boolean;
  error: string | null;
  filter: AlertType | "ALL";
  setFilter: (filter: AlertType | "ALL") => void;
  refetch: () => Promise<void>;
  lastRefreshed: Date | null;
}

// Play subtle notification sound using Web Audio API
const playNotificationSound = (isUrgent: boolean) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Softer, gentler tone for notifications
    oscillator.frequency.value = isUrgent ? 523.25 : 440; // C5 or A4
    oscillator.type = "sine";

    // Very quiet volume - not jarring
    gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn("Audio notification failed:", error);
  }
};

export function useCounselorAlerts(): UseCounselorAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<CounselorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AlertType | "ALL">("ALL");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [previousAlertIds, setPreviousAlertIds] = useState<Set<string>>(new Set());

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [alertsData, statsData] = await Promise.all([
        counselorService.getActiveAlerts(),
        counselorService.getCounselorStats(),
      ]);

      // Detect new alerts
      const currentIds = new Set(alertsData.map((a) => a.id));
      const newAlerts = alertsData.filter(
        (alert) => !previousAlertIds.has(alert.id)
      );

      // Play notification for new RED alerts
      newAlerts.forEach((alert) => {
        if (alert.tier === "RED") {
          playNotificationSound(true);
        } else if (alert.tier === "ORANGE") {
          playNotificationSound(false);
        }
      });

      setAlerts(alertsData);
      setStats(statsData);
      setPreviousAlertIds(currentIds);
      setLastRefreshed(new Date());
      setError(null);
    } catch (err) {
      console.error("Failed to fetch counselor alerts:", err);
      setError("Failed to load alerts. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }, [previousAlertIds]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    if (filter === "ALL") return alerts;
    return alerts.filter((alert) => alert.tier === filter);
  }, [alerts, filter]);

  // Get urgent alerts (RED only)
  const urgentAlerts = useMemo(() => {
    return alerts.filter((alert) => alert.tier === "RED" && alert.status === "ACTIVE");
  }, [alerts]);

  return {
    alerts,
    filteredAlerts,
    urgentAlerts,
    stats,
    isLoading,
    error,
    filter,
    setFilter,
    refetch: fetchData,
    lastRefreshed,
  };
}

export default useCounselorAlerts;
