/**
 * Type definitions for the app
 */

// Re-export types from services for convenience
export type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '../services/authService';

export type {
  Controller,
  PairControllerRequest,
  UpdateControllerRequest,
} from '../services/controllerService';

export type {
  Sensor,
  SensorConfig,
  AISuggestRequest,
  AISuggestResponse,
} from '../services/sensorService';

export type {
  Alert,
  AlertFilters,
} from '../services/alertService';
