import axios from "axios";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("API Response Error:", error.response?.data || error.message);

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = "/authentication";
    }

    return Promise.reject(error);
  }
);

export const bossPreviewAPI = {
  getBossPreview: async (eventId, bossId) => {
    const response = await apiClient.get(`/boss-preview/${eventId}/${bossId}`);
    return response.data;
  }, 

  getBossPreviewLeaderboard: async (eventId, bossId) => {
    const response = await apiClient.get(
      `/boss-preview/${eventId}/${bossId}/leaderboard`
    );
    return response.data;
  },

  getEventBossByJoinCode: async (joinCode) => {
    const response = await apiClient.get(`/event-bosses/join/${joinCode}`);
    return response.data;
  },
};

export const eventBossAPI = {
  getEventBosses: async (eventId) => {
    const response = await apiClient.get(`/events/${eventId}/bosses`);
    return response.data;
  },

  getEventBossByJoinCode: async (joinCode) => {
    const response = await apiClient.get(`/event-bosses/join/${joinCode}`);
    return response.data;
  },
};

export const joinAPI = {
  joinBossFight: async (joinCode, nickname) => {
    const response = await apiClient.post("/join/boss-fight", {
      joinCode,
      nickname,
    });
    return response.data;
  },
};

export const leaderboardAPI = {
  getAllTimeLeaderboard: async (limit = 50, bossId = null) => {
    try {
      const params = { limit };
      if (bossId) params.bossId = bossId;

      const response = await apiClient.get("/leaderboards/all-time", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all-time leaderboard:", error);
      throw error;
    }
  },

  getEventLeaderboard: async (eventId, limit = 50) => {
    try {
      const response = await apiClient.get(`/leaderboards/event/${eventId}`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching event leaderboard:", error);
      throw error;
    }
  },

  getBossLeaderboard: async (eventId, eventBossId, limit = 50) => {
    try {
      const response = await apiClient.get(
        `/leaderboards/boss/${eventId}/${eventBossId}`,
        {
          params: { limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching boss-specific leaderboard:", error);
      throw error;
    }
  },

  getBossAllTimeLeaderboard: async (bossId, limit = 50) => {
    try {
      const response = await apiClient.get("/leaderboards/all-time", {
        params: { bossId, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching boss all-time leaderboard:", error);
      throw error;
    }
  },

  getPlayerStats: async (playerId) => {
    try {
      const response = await apiClient.get(`/leaderboards/player/${playerId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching player stats:", error);
      throw error;
    }
  },
};

export const badgeAPI = {
  getAllBadges: async () => {
    try {
      const response = await apiClient.get("/badges");
      return response.data;
    } catch (error) {
      console.error("Error fetching badges:", error);
      throw error;
    }
  },

  getPlayerBadges: async (playerId) => {
    try {
      const response = await apiClient.get(`/badges/player/${playerId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching player badges:", error);
      throw error;
    }
  },
};

export default apiClient;
