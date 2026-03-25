import { apiService } from './api';
import { getAllPossibleURLs } from './config';

export interface ConnectionTestResult {
  url: string;
  success: boolean;
  error?: string;
  responseTime?: number;
}

export class ConnectionTester {
  static async testAllConnections(): Promise<ConnectionTestResult[]> {
    const urls = getAllPossibleURLs();
    const results: ConnectionTestResult[] = [];

    console.log('🔍 Testing all possible API connections...');

    for (const url of urls) {
      const result = await this.testConnection(url);
      results.push(result);
      
      if (result.success) {
        console.log(`✅ ${url} - Working (${result.responseTime}ms)`);
      } else {
        console.log(`❌ ${url} - Failed: ${result.error}`);
      }
    }

    return results;
  }

  static async testConnection(url: string): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    
    try {
      // Test with a simple health check
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000, // 5 second timeout
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        return {
          url,
          success: true,
          responseTime,
        };
      } else {
        return {
          url,
          success: false,
          error: `HTTP ${response.status}`,
          responseTime,
        };
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        url,
        success: false,
        error: error.message || 'Connection failed',
        responseTime,
      };
    }
  }

  static async findWorkingConnection(): Promise<string | null> {
    const results = await this.testAllConnections();
    const workingConnection = results.find(result => result.success);
    
    if (workingConnection) {
      console.log(`🎉 Found working connection: ${workingConnection.url}`);
      return workingConnection.url;
    } else {
      console.log('❌ No working connections found');
      console.log('💡 Make sure your server is running on port 3000');
      return null;
    }
  }
}

// Helper function to test connection and update config
export const testAndUpdateConnection = async (): Promise<boolean> => {
  try {
    const workingUrl = await ConnectionTester.findWorkingConnection();
    
    if (workingUrl) {
      console.log('✅ Connection test successful');
      return true;
    } else {
      console.log('❌ Connection test failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return false;
  }
};
