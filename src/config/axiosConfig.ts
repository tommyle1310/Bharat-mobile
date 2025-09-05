import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';
import { Config, resolveBaseUrl } from './index';



// Create Axios instance with base URL including /kmsg/buyer
const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${resolveBaseUrl().replace(/\/$/, '')}/kmsg/buyer`,
  timeout: 10000, // Set timeout to 10s
  headers: {
    'Content-Type': 'application/json',
  },
});

// Centralized error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`[Axios] HTTP error: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error('[Axios] No response received:', error.message);
    } else {
      console.error('[Axios] Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;