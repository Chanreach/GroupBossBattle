import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });

  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const isTokenError =
      error.response?.status === 401 &&
      (error.response?.data?.message === "Invalid token." ||
        ["TokenExpiredError", "JsonWebTokenError"].includes(
          error.response?.data?.error
        ));
        
    if (isTokenError && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        const refreshUrl = `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }/api/auth/refresh`;

        const refreshResponse = await axios.post(
          refreshUrl,
          {},
          {
            withCredentials: true,
          }
        );
        const { token } = refreshResponse.data;

        localStorage.setItem("accessToken", token);
        processQueue(null, token);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/auth";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (!error.response) {
      console.error("Network or CORS error:", error);
      return Promise.reject({
        message: "Network error. Please check your connection.",
      });
    }

    return Promise.reject(error);
  }
);

export { apiClient };
