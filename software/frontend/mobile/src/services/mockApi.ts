/**
 * Mock API Service
 * 
 * This service provides mock implementations of all API endpoints.
 * Used when USE_MOCK_DATA is true in config/api.ts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  mockUser,
  mockControllers,
  mockSensors,
  mockAlerts,
  mockDashboardOverview,
  mockControllerDashboard,
  generateMockReadings,
  mockAISuggestResponse,
  delay,
} from '../data/mockData';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from './authService';
import type {Controller, PairControllerRequest, UpdateControllerRequest} from './controllerService';
import type {Sensor, AISuggestRequest, AISuggestResponse, SensorConfig} from './sensorService';
import type {Alert, AlertFilters} from './alertService';

const TOKEN_KEY = '@spectron:auth_token';
const MOCK_TOKEN = 'mock-jwt-token-12345';

// Simulate token storage
export const getToken = async (): Promise<string | null> => {
  if (await AsyncStorage.getItem(TOKEN_KEY)) {
    return MOCK_TOKEN;
  }
  return null;
};

export const setToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

// Mock Auth Service
export const mockAuthService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    await delay(800); // Simulate network delay
    
    // Accept any email/password for mock
    if (credentials.email && credentials.password) {
      await setToken(MOCK_TOKEN);
      return {
        token: MOCK_TOKEN,
        user: {
          id: mockUser.id,
          email: credentials.email,
          phone: mockUser.phone,
        },
      };
    }
    throw new Error('Invalid credentials');
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    await delay(1000);
    
    await setToken(MOCK_TOKEN);
    return {
      token: MOCK_TOKEN,
      user: {
        id: `user-${Date.now()}`,
        email: data.email,
        phone: data.phone,
      },
    };
  },

  getCurrentUser: async (): Promise<User> => {
    await delay(300);
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    return mockUser;
  },

  logout: async (): Promise<void> => {
    await delay(200);
    await removeToken();
  },
};

// Mock Controller Service
export const mockControllerService = {
  getControllers: async (): Promise<Controller[]> => {
    await delay(500);
    return mockControllers;
  },

  getController: async (id: string): Promise<Controller> => {
    await delay(300);
    const controller = mockControllers.find(c => c.id === id);
    if (!controller) {
      throw new Error('Controller not found');
    }
    return controller;
  },

  pairController: async (data: PairControllerRequest): Promise<Controller> => {
    await delay(1500);
    const newController: Controller = {
      id: `controller-${Date.now()}`,
      account_id: 'account-1',
      hw_id: `ESP32-${Math.floor(Math.random() * 1000)}`,
      name: 'New Controller',
      purpose: undefined,
      location: undefined,
      status: 'PENDING_CONFIG',
      last_seen: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    mockControllers.push(newController);
    return newController;
  },

  updateController: async (
    id: string,
    data: UpdateControllerRequest,
  ): Promise<Controller> => {
    await delay(600);
    const controller = mockControllers.find(c => c.id === id);
    if (!controller) {
      throw new Error('Controller not found');
    }
    Object.assign(controller, data);
    return controller;
  },
};

// Mock Sensor Service
export const mockSensorService = {
  getSensors: async (controllerId: string): Promise<Sensor[]> => {
    await delay(400);
    return mockSensors.filter(s => s.controller_id === controllerId);
  },

  getSensor: async (id: string): Promise<Sensor> => {
    await delay(300);
    const sensor = mockSensors.find(s => s.id === id);
    if (!sensor) {
      throw new Error('Sensor not found');
    }
    return sensor;
  },

  getAISuggestedConfig: async (
    sensorId: string,
    request: AISuggestRequest,
  ): Promise<AISuggestResponse> => {
    await delay(2000); // AI takes longer
    return {
      ...mockAISuggestResponse,
      suggested_config: {
        ...mockAISuggestResponse.suggested_config,
        friendly_name: request.purpose || 'Sensor',
      },
      explanation: `Based on your description "${request.purpose}", I've configured optimal thresholds and power management settings.`,
    };
  },

  saveSensorConfig: async (
    sensorId: string,
    config: SensorConfig,
  ): Promise<void> => {
    await delay(800);
    const sensor = mockSensors.find(s => s.id === sensorId);
    if (sensor) {
      sensor.name = config.friendly_name;
    }
  },
};

// Mock Alert Service
export const mockAlertService = {
  getAlerts: async (filters?: AlertFilters): Promise<Alert[]> => {
    await delay(400);
    let alerts = [...mockAlerts];
    
    if (filters) {
      if (filters.controller_id) {
        alerts = alerts.filter(a => a.controller_id === filters.controller_id);
      }
      if (filters.sensor_id) {
        alerts = alerts.filter(a => a.sensor_id === filters.sensor_id);
      }
      if (filters.type) {
        alerts = alerts.filter(a => a.type === filters.type);
      }
      if (filters.severity) {
        alerts = alerts.filter(a => a.severity === filters.severity);
      }
      if (filters.acknowledged !== undefined) {
        alerts = alerts.filter(a =>
          filters.acknowledged ? a.acknowledged_at : !a.acknowledged_at,
        );
      }
    }
    
    return alerts;
  },

  acknowledgeAlert: async (alertId: string): Promise<void> => {
    await delay(300);
    const alert = mockAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged_at = new Date().toISOString();
    }
  },
};

// Mock Dashboard Service
export const mockDashboardService = {
  getOverview: async () => {
    await delay(400);
    return mockDashboardOverview;
  },

  getControllerDashboard: async (id: string) => {
    await delay(400);
    return {
      ...mockControllerDashboard,
      controller_id: id,
    };
  },

  getSensorReadings: async (sensorId: string) => {
    await delay(500);
    return generateMockReadings(sensorId, 50);
  },
};
