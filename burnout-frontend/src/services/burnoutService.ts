import { api } from "./api";

export const burnoutService = {
  getLatestScore: async () => {
    const response = await api.get("/api/burnout/score");
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get("/api/burnout/history");
    return response.data;
  },

  getActiveAlert: async () => {
    try {
      const response = await api.get("/api/burnout/active-alert");
      return response.data;
    } catch (error) {
      return null;
    }
  }
};
