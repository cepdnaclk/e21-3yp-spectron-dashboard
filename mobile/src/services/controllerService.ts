/**
 * Controller Service
 * 
 * Handles operations related to controllers (ESP32 main controllers).
 */

import api from './api';
import {API_ENDPOINTS} from '../config/api';
import {USE_MOCK_DATA} from '../config/api';
import * as mockApi from './mockApi';

export interface Controller {
  id: string;
  account_id: string;
  hw_id: string;
  name: string;
  purpose?: string;
  location?: string;
  status: 'ONLINE' | 'OFFLINE' | 'PENDING_CONFIG';
  last_seen?: string;
  created_at: string;
}

export interface PairControllerRequest {
  qr_token: string;
}

export interface UpdateControllerRequest {
  name?: string;
  purpose?: string;
  location?: string;
}

/**
 * Get all controllers for current user's account
 */
export const getControllers = async (): Promise<Controller[]> => {
  if (USE_MOCK_DATA) {
    return mockApi.mockControllerService.getControllers();
  }
  const response = await api.get<Controller[]>(API_ENDPOINTS.CONTROLLERS.LIST);
  return response;
};

/**
 * Get single controller by ID
 */
export const getController = async (id: string): Promise<Controller> => {
  if (USE_MOCK_DATA) {
    return mockApi.mockControllerService.getController(id);
  }
  const response = await api.get<Controller>(API_ENDPOINTS.CONTROLLERS.GET(id));
  return response;
};

/**
 * Pair a controller using QR code token
 */
export const pairController = async (
  data: PairControllerRequest,
): Promise<Controller> => {
  if (USE_MOCK_DATA) {
    return mockApi.mockControllerService.pairController(data);
  }
  const response = await api.post<Controller>(
    API_ENDPOINTS.CONTROLLERS.PAIR,
    data,
  );
  return response;
};

/**
 * Update controller details
 */
export const updateController = async (
  id: string,
  data: UpdateControllerRequest,
): Promise<Controller> => {
  if (USE_MOCK_DATA) {
    return mockApi.mockControllerService.updateController(id, data);
  }
  const response = await api.patch<Controller>(
    API_ENDPOINTS.CONTROLLERS.UPDATE(id),
    data,
  );
  return response;
};
