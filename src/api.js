import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

export { apiClient };

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Set up interceptors once when the module loads
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check for token expiration (403 with "Invalid token" message)
    if (error.response?.status === 403 && 
        error.response?.data?.message === 'Invalid token' && 
        !originalRequest._retry) {
      
      console.log('Token expired, attempting refresh...');
      
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('Calling refresh endpoint...');
        // Use a separate axios instance for refresh to avoid interceptor loops
        const refreshResponse = await axios.post('/api/auth/refresh', {}, { 
          withCredentials: true 
        });
        
        const { token } = refreshResponse.data;
        console.log('Token refreshed successfully');
        
        // Update stored token
        localStorage.setItem('accessToken', token);
        
        // Process queued requests
        processQueue(null, token);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Refresh failed - logout user
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        
        // Redirect to login
        window.location.href = '/auth';
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

// Legacy function for compatibility - now does nothing since interceptors are set up automatically
export const setupInterceptors = (auth, navigate) => {
  console.log('Interceptors already set up automatically');
};