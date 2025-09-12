import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { Config, resolveBaseUrl } from './index';
import { useUserStore } from '../stores/userStore';
import { authService } from '../services/authService';

// Create Axios instance with base URL including /kmsg/buyer
const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${resolveBaseUrl().replace(/\/$/, '')}/kmsg/buyer`,
  timeout: 120000, // Set timeout to 2 minutes for large uploads
  maxContentLength: 50 * 1024 * 1024, // 50MB max content length
  maxBodyLength: 50 * 1024 * 1024, // 50MB max body length
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const { token } = useUserStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken, setAuthTokens } = useUserStore.getState();
        
        if (!refreshToken) {
          // No refresh token available, redirect to login
          useUserStore.getState().logout();
          return Promise.reject(error);
        }

        // Call refresh token endpoint using authService
        const refreshResponse = await authService.refreshToken(refreshToken);
        const { accessToken } = refreshResponse;
        
        // Update tokens in store
        setAuthTokens({
          token: accessToken,
          refreshToken: refreshToken, // Keep the same refresh token
          category: useUserStore.getState().category
        });

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        // Refresh failed, logout user
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    // Log other errors
    if (error.response) {
      console.error(`[Axios] HTTP error: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error('[Axios] No response received:', error.message);
      console.error('[Axios] Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout,
        maxContentLength: error.config?.maxContentLength,
        maxBodyLength: error.config?.maxBodyLength,
      });
    } else {
      console.error('[Axios] Request setup error:', error.message);
      console.error('[Axios] Full error:', error);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;