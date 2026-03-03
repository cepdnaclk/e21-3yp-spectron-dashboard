/**
 * API Service
 * 
 * This service handles all HTTP requests to the backend using fetch API.
 * It includes authentication token management and error handling.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL} from '../config/api';

// Token storage key
const TOKEN_KEY = '@spectron:auth_token';

/**
 * Get stored authentication token
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Store authentication token
 */
export const setToken = async (token: string): Promise<void> => {
  try {
    if (!token) {
      // No token to store (e.g., failed login/registration); safely do nothing
      return;
    }
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

/**
 * Remove authentication token (logout)
 */
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

/**
 * API request options
 */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Make API request with authentication
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> => {
  const token = await getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body && options.method !== 'GET') {
    config.body = JSON.stringify(options.body);
  }

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // Handle 401 unauthorized
    if (response.status === 401) {
      await removeToken();
      throw new Error('Unauthorized');
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    let data: any;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Try to extract error message from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      if (data && typeof data === 'object') {
        errorMessage = data.message || data.error || errorMessage;
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      // Handle network errors gracefully
      if (error.name === 'AbortError' || error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your connection.');
      }
      throw error;
    }
    throw new Error('Network error');
  }
};

/**
 * API methods
 */
const api = {
  get: <T>(endpoint: string): Promise<T> => {
    return apiRequest<T>(endpoint, {method: 'GET'});
  },
  
  post: <T>(endpoint: string, body?: any): Promise<T> => {
    return apiRequest<T>(endpoint, {method: 'POST', body});
  },
  
  put: <T>(endpoint: string, body?: any): Promise<T> => {
    return apiRequest<T>(endpoint, {method: 'PUT', body});
  },
  
  patch: <T>(endpoint: string, body?: any): Promise<T> => {
    return apiRequest<T>(endpoint, {method: 'PATCH', body});
  },
  
  delete: <T>(endpoint: string): Promise<T> => {
    return apiRequest<T>(endpoint, {method: 'DELETE'});
  },
};

export default api;
