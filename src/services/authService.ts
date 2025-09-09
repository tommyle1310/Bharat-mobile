import axios, { AxiosInstance } from 'axios';
import { useUserStore } from '../stores/userStore';
import { resolveBaseUrl } from '../config';

// Auth API has a different base URL than the rest of the app
const AUTH_BASE_URL = 'http://13.203.1.159:8002/buyer';
const AUTH_BASE_URL_NAME = `${resolveBaseUrl()}/kmsg/buyer`;

const authClient: AxiosInstance = axios.create({
  baseURL: AUTH_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authClientName: AxiosInstance = axios.create({
  baseURL: AUTH_BASE_URL_NAME,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
// Log requests/responses and normalize errors for better visibility
authClient.interceptors.request.use((config) => {
  console.log('[auth] request:', {
    method: config.method,
    url: `${config.baseURL || ''}${config.url || ''}`,
    data: config.data,
    headers: config.headers,
  });
  return config;
});

authClient.interceptors.response.use(
  (response) => {
    console.log('[auth] response:', {
      url: response.config?.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const url = `${error?.config?.baseURL || ''}${error?.config?.url || ''}`;
    const data = error?.response?.data;
    const message = data?.message || error?.message || 'Request failed';
    console.error('[auth] error:', { status, url, data, message });
    return Promise.reject(error);
  }
);

export interface RegisterPayload {
  name: string;
  phone: string;
  email: string;
  address: string;
  password: string;
  category: number;
  state_id: string;
  city_id: number;
  pin_number: string;
  company_name: string;
  aadhaar_number: string;
  pan_number: string;
}

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  category: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface UserNameResponse {
  name: string;
  id: number
}

export const authService = {
  async register(payload: RegisterPayload): Promise<{ message: string }> {
    const response = await authClient.post('/register', payload);
    console.log('Register response:', response);
    return response.data;
  },

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await authClient.post('/login', payload);
    console.log('cehck login response:', response);
    return response.data;
  },

  async logout(token?: string): Promise<void> {
    // Get token from parameter or from store
    const authToken = token || useUserStore.getState().token;
    console.log('Logout token:', authToken);
    const config = {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    };
    const result = await authClient.post('/logout', {}, config);
    return result.data;
  },

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    console.log('Refresh token request:', { refreshToken });
    const response = await authClient.post('/refresh', { refreshToken });
    console.log('Refresh token response:', response);
    return response.data;
  },

  async getNameByPhone(phone: string): Promise<UserNameResponse> {
    const response = await authClientName.get(`buyers/name/${phone}`);
    return response.data;
  },
};

export default authService;


