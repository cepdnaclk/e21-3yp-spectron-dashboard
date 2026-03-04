/**
 * Alert Service
 * 
 * Handles alerts and notifications.
 */

import api from './api';
import {API_ENDPOINTS} from '../config/api';
import {USE_MOCK_DATA} from '../config/api';
import * as mockApi from './mockApi';

export interface Alert {
  id: string;
  account_id: string;
  controller_id?: string;
  sensor_id?: string;
  type: 'THRESHOLD_BREACH' | 'SENSOR_OFFLINE' | 'CONTROLLER_OFFLINE';
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  message: string;
  created_at: string;
  acknowledged_at?: string;
}

export interface AlertFilters {
  controller_id?: string;
  sensor_id?: string;
  type?: Alert['type'];
  severity?: Alert['severity'];
  acknowledged?: boolean;
}

/**
 * Get alerts with optional filters
 */
export const getAlerts = async (filters?: AlertFilters): Promise<Alert[]> => {
  if (USE_MOCK_DATA) {
    return mockApi.mockAlertService.getAlerts(filters);
  }
  let endpoint = API_ENDPOINTS.ALERTS.LIST;
  
  // Build query string if filters provided
  if (filters) {
    const params = new URLSearchParams();
    if (filters.controller_id) params.append('controller_id', filters.controller_id);
    if (filters.sensor_id) params.append('sensor_id', filters.sensor_id);
    if (filters.type) params.append('type', filters.type);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.acknowledged !== undefined) {
      params.append('acknowledged', filters.acknowledged.toString());
    }
    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
  }
  
  const response = await api.get<Alert[]>(endpoint);
  return response;
};

/**
 * Acknowledge an alert
 */
export const acknowledgeAlert = async (alertId: string): Promise<void> => {
  if (USE_MOCK_DATA) {
    return mockApi.mockAlertService.acknowledgeAlert(alertId);
  }
  await api.post(API_ENDPOINTS.ALERTS.ACK(alertId));
};
