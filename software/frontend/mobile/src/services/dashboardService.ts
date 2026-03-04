/**
 * Dashboard Service
 * 
 * Handles dashboard data and sensor readings.
 */

import api from './api';
import {API_ENDPOINTS} from '../config/api';
import {USE_MOCK_DATA} from '../config/api';
import * as mockApi from './mockApi';

export interface DashboardOverview {
  controllers: number;
  sensors: number;
  alerts: number;
}

export interface ControllerDashboard {
  controller_id: string;
  sensor_count: number;
  recent_readings: number;
}

export interface SensorReading {
  time: string;
  value: number;
  meta?: Record<string, any>;
}

/**
 * Get dashboard overview
 */
export const getOverview = async (): Promise<DashboardOverview> => {
  if (USE_MOCK_DATA) {
    return mockApi.mockDashboardService.getOverview();
  }
  const response = await api.get<DashboardOverview>(API_ENDPOINTS.DASHBOARD.OVERVIEW);
  return response;
};

/**
 * Get controller dashboard
 */
export const getControllerDashboard = async (
  id: string,
): Promise<ControllerDashboard> => {
  if (USE_MOCK_DATA) {
    return mockApi.mockDashboardService.getControllerDashboard(id);
  }
  const response = await api.get<ControllerDashboard>(
    API_ENDPOINTS.DASHBOARD.CONTROLLER(id),
  );
  return response;
};

/**
 * Get sensor readings
 */
export const getSensorReadings = async (
  sensorId: string,
): Promise<SensorReading[]> => {
  if (USE_MOCK_DATA) {
    return mockApi.mockDashboardService.getSensorReadings(sensorId);
  }
  const response = await api.get<SensorReading[]>(
    API_ENDPOINTS.READINGS.GET(sensorId),
  );
  return response;
};
