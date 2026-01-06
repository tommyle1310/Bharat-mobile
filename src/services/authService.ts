import axios, { AxiosInstance } from 'axios';
import { useUserStore } from '../stores/userStore';
import { resolveBaseUrl } from '../config';
import { EBusinessVertical } from '../types/common';

// Auth API has a different base URL than the rest of the app
const AUTH_BASE_URL = 'http://testindus.kmsgtech.com:8002/buyer';
const AUTH_BASE_URL_NAME = `http://testindus.kmsgtech.com:1310/kmsg/buyer`;

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

// Add same interceptors for authClientName
authClientName.interceptors.request.use((config) => {
  console.log('[auth-name] request:', {
    method: config.method,
    url: `${config.baseURL || ''}${config.url || ''}`,
    data: config.data,
    headers: config.headers,
  });
  return config;
});

authClientName.interceptors.response.use(
  (response) => {
    console.log('[auth-name] response:', {
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
    console.error('[auth-name] error:', { status, url, data, message, fullError: error });
    return Promise.reject(error);
  }
);

export type BusinessVertical = EBusinessVertical;

export interface RegisterPayload {
  name: string;
  phone: string;
  email: string;
  address: string;
  state_id: number;
  city_id: number;
  pin_number: string;
  company_name: string;
  aadhaar_number: string;
  pan_number: string;
  business_vertical: BusinessVertical;
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
  id: number;
  email: string;
  mobile: string;
  business_vertical: string;
  address: string;
  aadhaar_number: string;
  pan_number: string;
  company_name: string;
  pincode: string;
  

}

export interface ForgotPasswordResponse {
  message: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<{ message: string, id: number }> {
    const client = authClient;
    console.log('check payload:', payload);
    const response = await client.post('/register', payload);
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
    try {
      const response = await authClientName.get(`/buyers/name/${phone}`);
      console.log('[getNameByPhone] Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[getNameByPhone] Error details:', {
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        responseData: error?.response?.data,
        requestUrl: error?.config?.url,
        fullError: error,
      });
      throw error;
    }
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const response = await authClient.post('/forgot-password', { email });
    return response.data;
  },
};

export default authService;


