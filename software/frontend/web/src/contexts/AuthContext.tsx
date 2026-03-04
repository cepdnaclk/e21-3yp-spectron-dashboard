import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login as loginService, register as registerService, logout as logoutService, User, LoginRequest, RegisterRequest } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapAuthUserToUser = (authUser: { id: string; email: string; phone?: string }): User => {
  return {
    id: authUser.id,
    email: authUser.email,
    phone: authUser.phone,
    accounts: [],
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    const auth = await loginService(credentials);
    setUser(mapAuthUserToUser(auth.user));
  };

  const register = async (data: RegisterRequest) => {
    const auth = await registerService(data);
    setUser(mapAuthUserToUser(auth.user));
  };

  const logout = async () => {
    await logoutService();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
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
