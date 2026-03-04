import api, { setToken, removeToken } from './api';
import { API_ENDPOINTS } from '../config/api';

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

type MeResponse =
  | User
  | {
      user: {
        id: string;
        email: string;
        phone?: string;
      };
      accounts?: Array<{
        id: string;
        name: string;
        role?: 'OWNER' | 'ADMIN' | 'VIEWER';
      }>;
    };

const normalizeUser = (data: MeResponse): User => {
  if ('user' in data) {
    return {
      id: data.user.id,
      email: data.user.email,
      phone: data.user.phone,
      accounts: (data.accounts || []).map((account) => ({
        ...account,
        role: account.role || 'VIEWER',
      })),
    };
  }

  return {
    ...data,
    accounts: (data.accounts || []).map((account) => ({
      ...account,
      role: account.role || 'VIEWER',
    })),
  };
};

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
  setToken(response.data.token);
  return response.data;
};

export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
  setToken(response.data.token);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<MeResponse>(API_ENDPOINTS.AUTH.ME);
  return normalizeUser(response.data);
};

export const logout = async (): Promise<void> => {
  removeToken();
};
