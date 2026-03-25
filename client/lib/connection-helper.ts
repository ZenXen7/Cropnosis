import { Platform } from 'react-native';
import { API_BASE_URL } from './apiConfig';

// Connection helper for React Native
export class ConnectionHelper {
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    const baseUrl = API_BASE_URL;
    
    try {
      console.log('🔍 Testing connection to:', baseUrl);
      
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Connection successful:', data);
        return { success: true, message: 'Connection successful!' };
      } else {
        console.log('❌ Connection failed with status:', response.status);
        return { success: false, message: `Connection failed: ${response.status}` };
      }
    } catch (error: any) {
      console.error('❌ Connection error:', error);
      
      let message = 'Connection failed';
      if (error.message.includes('Network request failed')) {
        message = 'Network request failed - check if server is running';
      } else if (error.message.includes('timeout')) {
        message = 'Connection timeout - server might be slow';
      } else {
        message = `Connection error: ${error.message}`;
      }
      
      return { success: false, message };
    }
  }

  static async testRegistration(): Promise<{ success: boolean; message: string }> {
    const baseUrl = API_BASE_URL;
    
    try {
      console.log('🔍 Testing registration endpoint...');
      
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `test-${Date.now()}@example.com`,
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          birthDate: '1990-01-01'
        }),
        timeout: 10000,
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Registration test successful:', data);
        return { success: true, message: 'Registration endpoint working!' };
      } else {
        console.log('❌ Registration test failed:', data);
        return { success: false, message: `Registration failed: ${data.error || 'Unknown error'}` };
      }
    } catch (error: any) {
      console.error('❌ Registration test error:', error);
      return { success: false, message: `Registration test error: ${error.message}` };
    }
  }

  static getConnectionInfo() {
    return {
      platform: Platform.OS,
      baseUrl: API_BASE_URL,
      endpoints: {
        health: '/health',
        register: '/auth/register',
        login: '/auth/login',
        predict: '/predict'
      }
    };
  }
}

// Simple connection test function
export const testConnection = async () => {
  console.log('🚀 Starting connection test...');
  console.log('Platform:', Platform.OS);
  console.log('Base URL:', API_BASE_URL);
  
  const healthTest = await ConnectionHelper.testConnection();
  console.log('Health test:', healthTest);
  
  if (healthTest.success) {
    const registrationTest = await ConnectionHelper.testRegistration();
    console.log('Registration test:', registrationTest);
  }
  
  return healthTest;
};
