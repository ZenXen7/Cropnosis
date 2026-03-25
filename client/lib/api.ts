import { axiosInstance } from './axios';

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  
  // Prediction endpoints
  PREDICT: '/predict',
  HEALTH: '/health',
} as const;

// API service class
export class ApiService {
  private static instance: ApiService;
  
  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Auth methods
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    birthDate: string;
  }) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.REGISTER, userData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message 
      };
    }
  }

  async login(credentials: { email: string; password: string }) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, credentials);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message 
      };
    }
  }

  async logout() {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.LOGOUT);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message 
      };
    }
  }

  // Prediction methods
  async predict(imageData: FormData) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.PREDICT, imageData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message 
      };
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.HEALTH);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message 
      };
    }
  }
}

// Export singleton instance
export const apiService = ApiService.getInstance();
