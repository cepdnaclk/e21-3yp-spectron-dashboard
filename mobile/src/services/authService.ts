/**
 * Authentication Service
 * 
 * Handles user authentication: login, register, and token management.
 */

import api, {setToken, removeToken} from './api';
import {API_ENDPOINTS} from '../config/api';
import {USE_MOCK_DATA} from '../config/api';
import * as mockApi from './mockApi';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  phone?: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    phone?: string;
  };
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  accounts: Array<{
    id: string;
    name: string;
    role: 'OWNER' | 'ADMIN' | 'VIEWER';
  }>;
}

/**
 * Login user
 */
export const login = async (
  credentials: LoginRequest,
): Promise<AuthResponse> => {
  if (USE_MOCK_DATA) {
    return mockApi.mockAuthService.login(credentials);
  }
  const response = await api.post<AuthResponse>(
    API_ENDPOINTS.AUTH.LOGIN,
    credentials,
  );
  await setToken(response.token);
  return response;
};

/**
 * Register new user
 */
export const register = async (
  data: RegisterRequest,
): Promise<AuthResponse> => {
  if (USE_MOCK_DATA) {
    return mockApi.mockAuthService.register(data);
  }
  const response = await api.post<AuthResponse>(
    API_ENDPOINTS.AUTH.REGISTER,
    data,
  );
  await setToken(response.token);
  return response;
};

/**
 * Get current user info
 */
export const getCurrentUser = async (): Promise<User> => {
  if (USE_MOCK_DATA) {
    return mockApi.mockAuthService.getCurrentUser();
  }
  const response = await api.get<User>(API_ENDPOINTS.AUTH.ME);
  return response;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  if (USE_MOCK_DATA) {
    return mockApi.mockAuthService.logout();
  }
  await removeToken();
};
