/**
 * Enhanced API Client with Error Handling
 * Axios instance with request/response interceptors
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add request ID and timestamp
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add unique request ID
    config.headers['X-Request-ID'] = crypto.randomUUID();
    
    // Add timestamp for request timing
    (config as any).requestStartTime = Date.now();
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - log timing and handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = Date.now() - (response.config as any).requestStartTime;
    console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    
    return response;
  },
  (error: AxiosError) => {
    // Log error details
    if (error.response) {
      // Server responded with error status
      console.error(`[API Error] ${error.response.status} - ${error.config?.url}`, error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.error('[API Error] No response received', error.message);
    } else {
      // Error setting up request
      console.error('[API Error] Request setup failed', error.message);
    }
    
    // Pass error to be handled by ErrorParser
    return Promise.reject(error);
  }
);

export default apiClient;
