import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const BASE_URL = API_BASE_URL;
const TIMEOUT = 10000;

// Logging functions
const logApiCall = (url: string, method: string, data?: any) => {
  console.log(`🔄 API Call: ${method.toUpperCase()} ${url}`, data ? { data } : '');
};

const logApiResponse = (url: string, data: any) => {
  console.log(`✅ API Response: ${url}`, data);
};

const logApiError = (url: string, error: any) => {
  console.error(`❌ API Error: ${url}`, error);
};

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    logApiCall(config.url || '', config.method || 'GET', config.data);
    return config;
  },
  (error) => {
    logApiError('Request Setup', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    logApiResponse(response.config.url || '', response.data);
    return response;
  },
  (error) => {
    logApiError(error.config?.url || 'Unknown', error);
    
    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('🌐 Network Error - Check if server is running and IP is correct');
      console.error('💡 Set EXPO_PUBLIC_API_URL in .env or edit lib/apiConfig.ts');
    }
    
    return Promise.reject(error);
  }
);
