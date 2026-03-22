import { useEffect, useRef, useCallback } from "react";
import counselorService from "@/services/counselorService";
import type { Alert } from "@/types/counselor";

interface UseAlertPollingOptions {
  intervalMs?: number;
  onNewAlert: (alert: Alert) => void;
  enabled?: boolean;
}

export function useAlertPolling({
  intervalMs = 30000, // Default: 30 seconds
  onNewAlert,
  enabled = true,
}: UseAlertPollingOptions) {
  const previousAlertIds = useRef<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isVisibleRef = useRef(true);

  // Check if new alerts exist and call onNewAlert for each
  const checkForNewAlerts = useCallback(async () => {
    if (!isVisibleRef.current || !enabled) return;

    try {
      const alerts = await counselorService.getActiveAlerts();
      const currentIds = new Set(alerts.map((a) => a.id));

      // Find new alerts
      alerts.forEach((alert) => {
        if (!previousAlertIds.current.has(alert.id)) {
          onNewAlert(alert);
        }
      });

      // Update stored IDs
      previousAlertIds.current = currentIds;
    } catch (error) {
      console.error("Alert polling failed:", error);
    }
  }, [enabled, onNewAlert]);

  useEffect(() => {
    if (!enabled) return;

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === "visible";

      // Immediately check when page becomes visible
      if (isVisibleRef.current) {
        checkForNewAlerts();
      }
    };

    // Handle focus/blur
    const handleFocus = () => {
      isVisibleRef.current = true;
      checkForNewAlerts();
    };

    const handleBlur = () => {
      isVisibleRef.current = false;
    };

    // Set up listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    // Start polling interval
    intervalRef.current = setInterval(checkForNewAlerts, intervalMs);

    // Initial check
    checkForNewAlerts();

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [intervalMs, enabled, checkForNewAlerts]);

  // Manual refresh function
  const refresh = useCallback(() => {
    checkForNewAlerts();
  }, [checkForNewAlerts]);

  return { refresh };
}

export default useAlertPolling;
