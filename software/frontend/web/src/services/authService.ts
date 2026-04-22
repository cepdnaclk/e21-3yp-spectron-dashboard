import api, { setToken, removeToken, getToken } from './api';
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
    name?: string;
    phone?: string;
    avatar_url?: string;
  };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar_url?: string;
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
        name?: string;
        phone?: string;
        avatar_url?: string;
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
      name: data.user.name,
      phone: data.user.phone,
      avatar_url: data.user.avatar_url,
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
  if (!getToken()) {
    throw new Error('No authentication token');
  }

  const response = await api.get<MeResponse>(API_ENDPOINTS.AUTH.ME);
  return normalizeUser(response.data);
};

export const logout = async (): Promise<void> => {
  removeToken();
};

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export const updateProfile = async (data: UpdateProfileRequest): Promise<User> => {
  const response = await api.patch<User>(API_ENDPOINTS.AUTH.ME, data);
  return normalizeUser(response.data);
};

export const changePassword = async (data: ChangePasswordRequest): Promise<void> => {
  await api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
};
