import apiClient from './api-client';

// Types for attendance data
export type AttendanceStatus = 'present' | 'absent' | 'holiday' | 'none';

export interface AttendanceLog {
  id?: string;
  time: string;
  activity: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id?: string;
  date: string;
  status: AttendanceStatus;
  logs: AttendanceLog[];
}

export interface AttendanceResponse {
  success: boolean;
  data: {
    month: number;
    year: number;
    records: AttendanceRecord[];
    presentDays: number[];
    absentDays: number[];
    holidayDays: number[];
    daysWithLogs: number[];
    summary: {
      totalPresent: number;
      totalAbsent: number;
      totalHolidays: number;
      totalLoggedDays: number;
    };
  };
}

export interface UpdateAttendanceRequest {
  status?: AttendanceStatus;
  logs?: AttendanceLog[];
}

export interface UpdateAttendanceResponse {
  success: boolean;
  data: AttendanceRecord;
}

// API functions
export const attendanceAPI = {
  /**
   * Get attendance records for a specific month and year
   */
  getAttendance: async (
    profileId: string,
    month: number,
    year: number
  ): Promise<AttendanceResponse> => {
    try {
      console.log(`🔍 Fetching attendance for profile ${profileId}, month ${month}, year ${year}`);
      console.log(`📡 API URL: ${apiClient.defaults.baseURL}/api/profile/${profileId}/attendance`);
      
      const response = await apiClient.get(
        `/api/profile/${profileId}/attendance`,
        {
          params: { month, year }
        }
      );
      
      console.log('✅ Attendance data fetched successfully:', response.status);
      return response.data as AttendanceResponse;
    } catch (error: any) {
      console.error('❌ Error fetching attendance:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch attendance data'
      );
    }
  },

  /**
   * Update attendance for a specific date
   */
  updateAttendance: async (
    profileId: string,
    date: string,
    data: UpdateAttendanceRequest
  ): Promise<UpdateAttendanceResponse> => {
    try {
      const encodedDate = encodeURIComponent(date);
      console.log(`🔄 Updating attendance for profile ${profileId}, date ${date}`);
      console.log(`📡 API URL: ${apiClient.defaults.baseURL}/api/profile/${profileId}/attendance/${encodedDate}`);
      console.log('📝 Update data:', data);
      
      const response = await apiClient.put(
        `/api/profile/${profileId}/attendance/${encodedDate}`,
        data
      );
      
      console.log('✅ Attendance updated successfully:', response.status);
      return response.data as UpdateAttendanceResponse;
    } catch (error: any) {
      console.error('❌ Error updating attendance:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      throw new Error(
        error.response?.data?.message || 'Failed to update attendance'
      );
    }
  },

  /**
   * Set attendance status for a specific date
   */
  setAttendanceStatus: async (
    profileId: string,
    date: string,
    status: AttendanceStatus
  ): Promise<UpdateAttendanceResponse> => {
    return attendanceAPI.updateAttendance(profileId, date, { status });
  },

  /**
   * Update activity logs for a specific date
   */
  updateActivityLogs: async (
    profileId: string,
    date: string,
    logs: AttendanceLog[]
  ): Promise<UpdateAttendanceResponse> => {
    return attendanceAPI.updateAttendance(profileId, date, { logs });
  },

  /**
   * Update both status and logs for a specific date
   */
  updateAttendanceComplete: async (
    profileId: string,
    date: string,
    status: AttendanceStatus,
    logs: AttendanceLog[]
  ): Promise<UpdateAttendanceResponse> => {
    return attendanceAPI.updateAttendance(profileId, date, { status, logs });
  }
};

export default attendanceAPI;