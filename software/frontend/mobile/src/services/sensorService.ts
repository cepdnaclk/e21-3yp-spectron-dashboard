/**
 * Sensor Service
 * 
 * Handles operations related to sensors and their configurations.
 */

import api from './api';
import {API_ENDPOINTS} from '../config/api';
import {USE_MOCK_DATA} from '../config/api';
import * as mockApi from './mockApi';

export interface Sensor {
  id: string;
  controller_id: string;
  hw_id: string;
  type: string;
  name?: string;
  purpose?: string;
  unit?: string;
  status: 'OK' | 'OFFLINE' | 'ERROR';
  last_seen?: string;
}

export interface SensorConfig {
  friendly_name: string;
  thresholds: {
    min?: number;
    max?: number;
    warning_min?: number;
    warning_max?: number;
  };
  metric_thresholds?: Record<string, {
    min?: number;
    max?: number;
    warning_min?: number;
    warning_max?: number;
  }>;
  report_interval_per_day: number;
  power_management: {
    battery_life_days: number;
    sampling_frequency: number;
  };
}

export interface AISuggestRequest {
  purpose: string;
  desired_battery_life_days?: number;
  sampling_preferences?: {
    frequency?: 'low' | 'medium' | 'high';
  };
}

export interface AISuggestResponse {
  suggested_config: SensorConfig;
  explanation: string;
}

/**
 * Get all sensors for a controller
 */
export const getSensors = async (controllerId: string): Promise<Sensor[]> => {
  if (USE_MOCK_DATA) {
    return mockApi.mockSensorService.getSensors(controllerId);
  }
  const response = await api.get<Sensor[]>(
    API_ENDPOINTS.SENSORS.LIST(controllerId),
  );
  return response;
};

/**
 * Get single sensor by ID
 */
export const getSensor = async (id: string): Promise<Sensor> => {
  if (USE_MOCK_DATA) {
    return mockApi.mockSensorService.getSensor(id);
  }
  const response = await api.get<Sensor>(API_ENDPOINTS.SENSORS.GET(id));
  return response;
};

/**
 * Get AI-suggested configuration for a sensor
 */
export const getAISuggestedConfig = async (
  sensorId: string,
  request: AISuggestRequest,
): Promise<AISuggestResponse> => {
  if (USE_MOCK_DATA) {
    return mockApi.mockSensorService.getAISuggestedConfig(sensorId, request);
  }
  const response = await api.post<AISuggestResponse>(
    API_ENDPOINTS.SENSORS.AI_SUGGEST(sensorId),
    request,
  );
  return response;
};

/**
 * Save sensor configuration
 */
export const saveSensorConfig = async (
  sensorId: string,
  config: SensorConfig,
): Promise<void> => {
  if (USE_MOCK_DATA) {
    return mockApi.mockSensorService.saveSensorConfig(sensorId, config);
  }
  await api.post(API_ENDPOINTS.SENSORS.CONFIG(sensorId), config);
};
