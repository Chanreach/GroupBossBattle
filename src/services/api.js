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
      // window.location.href = "/auth";
    }

    return Promise.reject(error);
  }
);

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

export default apiClient;
