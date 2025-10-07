import apiClient from "./api";

export const userBadgeAPI = {
  fetchAllUserBadges: async () => {
    const response = await apiClient.get("/user-badges/");
    return response.data;
  },
};
