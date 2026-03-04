import api from './api';
import { API_ENDPOINTS } from '../config/api';

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

export const getSensors = async (controllerId: string): Promise<Sensor[]> => {
  const response = await api.get<Sensor[]>(API_ENDPOINTS.SENSORS.LIST(controllerId));
  return response.data;
};

export const getSensor = async (id: string): Promise<Sensor> => {
  const response = await api.get<Sensor>(API_ENDPOINTS.SENSORS.GET(id));
  return response.data;
};

export const getAISuggestedConfig = async (
  sensorId: string,
  request: AISuggestRequest
): Promise<AISuggestResponse> => {
  const response = await api.post<AISuggestResponse>(
    API_ENDPOINTS.SENSORS.AI_SUGGEST(sensorId),
    request
  );
  return response.data;
};

export const saveSensorConfig = async (
  sensorId: string,
  config: SensorConfig
): Promise<void> => {
  await api.post(API_ENDPOINTS.SENSORS.CONFIG(sensorId), config);
};
