import api from "./api";
import {
  Alert,
  CounselorStats,
  ResolvedAlert,
  AlertFilters,
  AlertSort,
  AddNoteRequest,
  ResolveAlertRequest,
  EscalateAlertRequest,
  ContactStudentRequest,
  SendMessageRequest,
  CrisisResources,
  MessageTemplate,
  PaginatedResponse,
} from "@/types/counselor";

/**
 * Counselor Service
 * Handles all counselor dashboard API interactions
 * Privacy-focused: respects student anonymization preferences
 */
export const counselorService = {
  /**
   * Fetch active alert queue
   * Alerts are ordered by urgency (RED first, then ORANGE, then YELLOW)
   * @returns Array of active alerts
   */
  async getActiveAlerts(): Promise<Alert[]> {
    const response = await api.get<Alert[]>("/api/counselor/alerts");
    return response.data;
  },

  /**
   * Fetch single alert by ID
   * @param alertId - Alert ID
   * @returns Alert detail with full information
   */
  async getAlertById(alertId: string): Promise<Alert> {
    const response = await api.get<Alert>(`/api/counselor/alerts/${alertId}`);
    return response.data;
  },

  /**
   * Mark alert as resolved
   * @param alertId - Alert ID
   * @param request - Resolution details
   * @returns Updated alert
   */
  async resolveAlert(alertId: string, request?: ResolveAlertRequest): Promise<Alert> {
    const response = await api.put<Alert>(
      `/api/counselor/alerts/${alertId}/resolve`,
      request || {}
    );
    return response.data;
  },

  /**
   * Bulk resolve multiple alerts
   * @param alertIds - Array of alert IDs
   * @param resolutionNotes - Notes for resolution
   * @returns Array of updated alerts
   */
  async bulkResolveAlerts(alertIds: string[], resolutionNotes: string): Promise<Alert[]> {
    const response = await api.put<Alert[]>(
      '/api/counselor/alerts/bulk-resolve',
      { alertIds, resolutionNotes }
    );
    return response.data;
  },

  /**
   * Escalate alert to senior counselor
   * @param alertId - Alert ID
   * @param request - Escalation reason and priority
   * @returns Updated alert
   */
  async escalateAlert(alertId: string, request: EscalateAlertRequest): Promise<Alert> {
    const response = await api.put<Alert>(
      `/api/counselor/alerts/${alertId}/escalate`,
      request
    );
    return response.data;
  },

  /**
   * Add counselor note to alert
   * @param alertId - Alert ID
   * @param request - Note content
   * @returns Updated alert with new note
   */
  async addNote(alertId: string, request: AddNoteRequest): Promise<Alert> {
    const response = await api.post<Alert>(
      `/api/counselor/alerts/${alertId}/note`,
      request
    );
    return response.data;
  },

  /**
   * Log that student was contacted
   * @param alertId - Alert ID
   * @param request - Contact method and notes
   * @returns Updated alert
   */
  async logContact(alertId: string, request: ContactStudentRequest): Promise<Alert> {
    const response = await api.post<Alert>(
      `/api/counselor/alerts/${alertId}/contact`,
      request
    );
    return response.data;
  },

  /**
   * Send check-in message to student
   * @param alertId - Alert ID
   * @param request - Message content
   * @returns Updated alert
   */
  async sendMessage(alertId: string, request: SendMessageRequest): Promise<Alert> {
    const response = await api.post<Alert>(
      `/api/counselor/alerts/${alertId}/message`,
      request
    );
    return response.data;
  },

  /**
   * Claim/assign alert to current counselor
   * @param alertId - Alert ID
   * @returns Updated alert
   */
  async claimAlert(alertId: string): Promise<Alert> {
    const response = await api.post<Alert>(
      `/api/counselor/alerts/${alertId}/claim`
    );
    return response.data;
  },

  /**
   * Fetch counselor overview statistics
   * @returns Counselor stats including queue and metrics
   */
  async getCounselorStats(): Promise<CounselorStats> {
    const response = await api.get<CounselorStats>("/api/counselor/stats");
    return response.data;
  },

  /**
   * Fetch resolved alert history with pagination
   * @param page - Page number (default: 0)
   * @param size - Items per page (default: 20)
   * @returns Paginated resolved alerts
   */
  async getResolvedAlerts(page = 0, size = 20): Promise<PaginatedResponse<Alert>> {
    const response = await api.get<PaginatedResponse<Alert>>("/api/counselor/resolved", {
      params: { page, size },
    });
    return response.data;
  },

  /**
   * Fetch crisis resources
   * @returns Crisis resources for display to students
   */
  async getCrisisResources(): Promise<CrisisResources> {
    const response = await api.get<CrisisResources>("/api/counselor/crisis-resources");
    return response.data;
  },

  /**
   * Fetch available message templates
   * @returns Array of message templates
   */
  async getMessageTemplates(): Promise<MessageTemplate[]> {
    const response = await api.get<MessageTemplate[]>("/api/counselor/message-templates");
    return response.data;
  },

  /**
   * Update alert status
   * @param alertId - Alert ID
   * @param status - New status
   * @returns Updated alert
   */
  async updateStatus(
    alertId: string,
    status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED'
  ): Promise<Alert> {
    const response = await api.patch<Alert>(
      `/api/counselor/alerts/${alertId}/status`,
      { status }
    );
    return response.data;
  },

  /**
   * Get alerts for a specific student (by user ID)
   * @param userId - Student user ID
   * @returns Array of alerts for that student
   */
  async getAlertsByUserId(userId: string): Promise<Alert[]> {
    const response = await api.get<Alert[]>(`/api/counselor/alerts/user/${userId}`);
    return response.data;
  },

  /**
   * Get alert statistics by date range
   * @param from - Start date (ISO)
   * @param to - End date (ISO)
   * @returns Alert statistics
   */
  async getAlertStatsByDateRange(from: string, to: string): Promise<{
    total: number;
    byTier: { red: number; orange: number; yellow: number };
    resolved: number;
    escalated: number;
    avgResponseTime: number;
  }> {
    const response = await api.get("/api/counselor/stats/range", {
      params: { from, to },
    });
    return response.data;
  },

  /**
   * Acknowledge an alert (mark as in-progress)
   * @param alertId - Alert ID
   * @returns Updated alert
   */
  async acknowledgeAlert(alertId: string): Promise<Alert> {
    const response = await api.post<Alert>(
      `/api/counselor/alerts/${alertId}/acknowledge`
    );
    return response.data;
  }
};

export default counselorService;
