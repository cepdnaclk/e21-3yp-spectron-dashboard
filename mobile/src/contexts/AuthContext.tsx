/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app.
 */

import React, {createContext, useContext, useState, useEffect} from 'react';
import {
  login as loginService,
  register as registerService,
  getCurrentUser,
  logout as logoutService,
  User,
} from '../services/authService';
import {LoginRequest, RegisterRequest} from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error: any) {
      // Not logged in, token expired, or backend unavailable
      // Silently fail - user can still use the app
      console.log('Auth check failed (this is OK if backend is not running):', error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    // Perform login and use the returned user directly, so we don't depend
    // on /auth/me (which may return 404 in some setups)
    const auth = await loginService(credentials);
    const userWithAccounts: User = {
      id: auth.user.id,
      email: auth.user.email,
      phone: auth.user.phone,
      // Accounts will be loaded later via refreshUser when /auth/me is available
      accounts: [],
    };
    setUser(userWithAccounts);
  };

  const register = async (data: RegisterRequest) => {
    const auth = await registerService(data);
    const userWithAccounts: User = {
      id: auth.user.id,
      email: auth.user.email,
      phone: auth.user.phone,
      accounts: [],
    };
    setUser(userWithAccounts);
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error: any) {
      // Silently fail if backend is unavailable
      console.log('Refresh user failed:', error.message);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{user, loading, login, register, logout, refreshUser}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
