import api from "./api";
import {
  CampusStats,
  DepartmentStats,
  RiskDistribution,
  WeeklyTrend,
  DailyCheckin,
} from "@/types/admin";

/**
 * Admin Service
 * All methods fetch ANONYMIZED, AGGREGATED data only
 * No individual student information is ever returned
 */
export const adminService = {
  /**
   * Fetch campus-wide aggregate statistics
   * @returns CampusStats with anonymized metrics
   */
  async getCampusStats(): Promise<CampusStats> {
    const response = await api.get<CampusStats>("/api/admin/stats");
    return response.data;
  },

  /**
   * Fetch per-department aggregate statistics
   * @returns Array of DepartmentStats (anonymized)
   */
  async getDepartmentStats(): Promise<DepartmentStats[]> {
    const response = await api.get<DepartmentStats[]>("/api/admin/department-stats");
    return response.data;
  },

  /**
   * Fetch risk distribution with 8-week history
   * @returns RiskDistribution with current and historical data
   */
  async getRiskDistribution(): Promise<RiskDistribution> {
    const response = await api.get<RiskDistribution>("/api/admin/risk-distribution");
    return response.data;
  },

  /**
   * Fetch weekly trends
   * @param weeks - Number of weeks to fetch (default: 8)
   * @returns Array of WeeklyTrend data points
   */
  async getWeeklyTrends(weeks: number = 8): Promise<WeeklyTrend[]> {
    const response = await api.get<WeeklyTrend[]>("/api/admin/weekly-trends", {
      params: { weeks },
    });
    return response.data;
  },

  /**
   * Fetch daily check-in rates for last 30 days
   * @returns Array of DailyCheckin data points
   */
  async getCheckinRates(): Promise<DailyCheckin[]> {
    const response = await api.get<DailyCheckin[]>("/api/admin/checkin-rates");
    return response.data;
  },

  /**
   * Export campus analytics as CSV
   * Triggers browser download - NO individual student data included
   */
  async exportCSV(): Promise<void> {
    const response = await api.get("/api/admin/export/csv", {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const date = new Date().toISOString().split("T")[0];
    link.setAttribute("download", `campus-report-${date}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Fetch heatmap data for department × week visualization
   * @returns Array of HeatmapDataPoint for last 8 weeks
   */
  async getHeatmapData(): Promise<import("@/types/admin").HeatmapDataPoint[]> {
    const response = await api.get<import("@/types/admin").HeatmapDataPoint[]>(
      "/api/admin/heatmap-data"
    );
    return response.data;
  },

  /**
   * Fetch complete admin dashboard overview
   * Combines all data sources into single call
   * @returns AdminDashboardOverview with all metrics
   */
  async getDashboardOverview(): Promise<{
    stats: CampusStats;
    departments: DepartmentStats[];
    riskDistribution: RiskDistribution;
    trends: WeeklyTrend[];
    checkinRates: DailyCheckin[];
  }> {
    const [stats, departments, riskDistribution, trends, checkinRates] =
      await Promise.all([
        this.getCampusStats(),
        this.getDepartmentStats(),
        this.getRiskDistribution(),
        this.getWeeklyTrends(),
        this.getCheckinRates(),
      ]);

    return {
      stats,
      departments,
      riskDistribution,
      trends,
      checkinRates,
    };
  },

  /**
   * Fetch all users for management
   * @returns Array of UserManagement records
   */
  async getAllUsers(): Promise<import("@/types/admin").UserManagement[]> {
    const response = await api.get<import("@/types/admin").UserManagement[]>("/api/admin/users");
    return response.data;
  },

  /**
   * Update a user's role
   * @param userId - Target user ID
   * @param role - New role to assign
   * @returns Updated UserManagement record
   */
  async updateUserRole(
    userId: string,
    role: "STUDENT" | "ADMIN" | "COUNSELOR"
  ): Promise<import("@/types/admin").UserManagement> {
    const response = await api.put<import("@/types/admin").UserManagement>(
      `/api/admin/users/${userId}/role`,
      { role }
    );
    return response.data;
  },

  /**
   * Create a new staff member (Admin/Counselor)
   * @param data - New staff member information
   * @returns Created UserManagement record
   */
  async createStaffUser(data: {
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "COUNSELOR";
    department?: string;
  }): Promise<import("@/types/admin").UserManagement> {
    const response = await api.post<import("@/types/admin").UserManagement>(
      "/api/admin/users/staff",
      data
    );
    return response.data;
  },
};

export default adminService;
