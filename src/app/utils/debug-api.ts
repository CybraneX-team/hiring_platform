// Debug utility to test API connectivity
import apiClient from './api-client';

export const debugAPI = {
  /**
   * Test basic API connectivity
   */
  testConnection: async () => {
    try {
      console.log('Testing API connection to:', apiClient.defaults.baseURL);
      
      // Simple test endpoint (if it exists)
      const response = await apiClient.get('/api/test');
      console.log('✅ API connection successful:', response.status);
      return true;
    } catch (error: any) {
      console.log('❌ API connection failed:', error.message);
      console.log('Response status:', error.response?.status);
      console.log('Response data:', error.response?.data);
      return false;
    }
  },

  /**
   * Test attendance endpoints specifically
   */
  testAttendanceEndpoints: async (profileId: string) => {
    try {
      console.log('Testing attendance endpoints for profile:', profileId);
      
      // Test GET endpoint
      const response = await apiClient.get(
        `/api/profile/${profileId}/attendance`,
        { params: { month: 9, year: 2025 } }
      );
      
      console.log('✅ Attendance GET endpoint working:', response.status);
      console.log('Response data:', response.data);
      return true;
    } catch (error: any) {
      console.log('❌ Attendance endpoint test failed:', error.message);
      console.log('Full error:', error.response?.data);
      return false;
    }
  },

  /**
   * Check current API configuration
   */
  checkConfig: () => {
    console.log('API Configuration:');
    console.log('- Base URL:', apiClient.defaults.baseURL);
    console.log('- Timeout:', apiClient.defaults.timeout);
    console.log('- Headers:', apiClient.defaults.headers);
  }
};

export default debugAPI;