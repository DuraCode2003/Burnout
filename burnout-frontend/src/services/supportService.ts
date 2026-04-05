import api from "./api";
import { SupportSession, ChatMessage } from "@/types/support";

/**
 * Service for managing student-counselor support sessions and live chat
 */
export const supportService = {
  /**
   * Student requests human support
   */
  requestSupport: async (alertId: string, isAnonymous: boolean) => {
    const response = await api.post<SupportSession>("/api/support/request", {
      alertId,
      isAnonymous,
    });
    return response.data;
  },

  /**
   * Counselor joins an active support session
   */
  joinSession: async (sessionId: string) => {
    const response = await api.post<SupportSession>(`/api/support/join/${sessionId}`);
    return response.data;
  },

  /**
   * Student reveals their identity to the counselor
   */
  revealIdentity: async (sessionId: string) => {
    const response = await api.post<SupportSession>(`/api/support/reveal/${sessionId}`);
    return response.data;
  },

  /**
   * Fetch chat history for a session
   */
  getChatHistory: async (sessionId: string) => {
    const response = await api.get<ChatMessage[]>(`/api/support/messages/${sessionId}`);
    return response.data;
  },

  /**
   * Check for an active session linked to an alert.
   * Returns null if none exists (backend returns 204 No Content).
   */
  getActiveSession: async (alertId: string): Promise<SupportSession | null> => {
    const response = await api.get<SupportSession>(`/api/support/active/${alertId}`);
    // 204 No Content → response.data is empty string or undefined
    return response.data || null;
  },

  /**
   * Send a message through REST (fallback/initial)
   */
  sendMessage: async (sessionId: string, content: string) => {
    const response = await api.post<ChatMessage>(`/api/support/send/${sessionId}`, {
      content,
    });
    return response.data;
  },

  /**
   * Counselor proactively initiates a live chat session for an alert
   */
  initiateSession: async (alertId: string) => {
    const response = await api.post<SupportSession>(`/api/support/active/${alertId}`);
    return response.data;
  },
};
