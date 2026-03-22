import { useState, useCallback } from "react";
import counselorService from "@/services/counselorService";
import type { Alert } from "@/types/counselor";
import toast from "react-hot-toast";

interface UseAlertActionsReturn {
  resolveAlert: (note?: string) => Promise<Alert | null>;
  escalateAlert: (reason: string, priority?: "HIGH" | "URGENT") => Promise<Alert | null>;
  addNote: (note: string, isInternal?: boolean) => Promise<Alert | null>;
  logContact: (method: "EMAIL" | "PHONE" | "MESSAGE" | "IN_PERSON", notes?: string) => Promise<Alert | null>;
  claimAlert: () => Promise<Alert | null>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export function useAlertActions(alertId: string): UseAlertActionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  const resolveAlert = useCallback(
    async (note?: string): Promise<Alert | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const updated = await counselorService.resolveAlert(alertId, {
          resolutionNotes: note,
        });
        setSuccess(true);
        toast.success("Alert resolved successfully");
        return updated;
      } catch (err) {
        console.error("Failed to resolve alert:", err);
        const errorMessage = "Failed to resolve alert";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [alertId]
  );

  const escalateAlert = useCallback(
    async (
      reason: string,
      priority: "HIGH" | "URGENT" = "HIGH"
    ): Promise<Alert | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const updated = await counselorService.escalateAlert(alertId, {
          reason,
          priority,
        });
        setSuccess(true);
        toast.success("Alert escalated to senior counselor");
        return updated;
      } catch (err) {
        console.error("Failed to escalate alert:", err);
        const errorMessage = "Failed to escalate alert";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [alertId]
  );

  const addNote = useCallback(
    async (note: string, isInternal = true): Promise<Alert | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const updated = await counselorService.addNote(alertId, {
          note,
          isInternal,
        });
        setSuccess(true);
        toast.success("Note added successfully");
        return updated;
      } catch (err) {
        console.error("Failed to add note:", err);
        const errorMessage = "Failed to add note";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [alertId]
  );

  const logContact = useCallback(
    async (
      method: "EMAIL" | "PHONE" | "MESSAGE" | "IN_PERSON",
      notes?: string
    ): Promise<Alert | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const updated = await counselorService.logContact(alertId, {
          contactMethod: method,
          notes,
        });
        setSuccess(true);
        toast.success("Contact logged successfully");
        return updated;
      } catch (err) {
        console.error("Failed to log contact:", err);
        const errorMessage = "Failed to log contact";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [alertId]
  );

  const claimAlert = useCallback(async (): Promise<Alert | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const updated = await counselorService.claimAlert(alertId);
      setSuccess(true);
      toast.success("Alert claimed successfully");
      return updated;
    } catch (err) {
      console.error("Failed to claim alert:", err);
      const errorMessage = "Failed to claim alert";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [alertId]);

  return {
    resolveAlert,
    escalateAlert,
    addNote,
    logContact,
    claimAlert,
    isLoading,
    error,
    success,
  };
}

export default useAlertActions;
