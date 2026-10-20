import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';
import { User, Profile } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: (payload: { idToken?: string; user?: any }) => Promise<void>;
  register: (email: string, pass: string) => Promise<{ email: string }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfileState: (profile: Profile) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@cupid_access_token');
      const storedUser = await AsyncStorage.getItem('@cupid_user_data');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    const res = await apiClient.post('/auth/login', { email, password: pass });
    const { accessToken, user: userData } = res.data;

    await AsyncStorage.setItem('@cupid_access_token', accessToken);
    await AsyncStorage.setItem('@cupid_user_data', JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);
  };

  const loginWithGoogle = async (payload: { idToken?: string; user?: any }) => {
    const res = await apiClient.post('/auth/google', payload);
    const { accessToken, user: userData } = res.data;

    await AsyncStorage.setItem('@cupid_access_token', accessToken);
    await AsyncStorage.setItem('@cupid_user_data', JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);
  };

  const register = async (email: string, pass: string) => {
    const res = await apiClient.post('/auth/register', { email, password: pass });
    return res.data;
  };

  const verifyOtp = async (email: string, otpCode: string) => {
    const res = await apiClient.post('/auth/verify-otp', { email, otpCode });
    const { accessToken, user: userData } = res.data;

    await AsyncStorage.setItem('@cupid_access_token', accessToken);
    await AsyncStorage.setItem('@cupid_user_data', JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);
  };

  const resendOtp = async (email: string) => {
    const res = await apiClient.post('/auth/resend-otp', { email });
    return res.data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@cupid_access_token');
    await AsyncStorage.removeItem('@cupid_user_data');
    setToken(null);
    setUser(null);
  };

  const updateProfileState = (profile: Profile) => {
    if (user) {
      const updated = { ...user, hasProfile: true, profile };
      setUser(updated);
      AsyncStorage.setItem('@cupid_user_data', JSON.stringify(updated));
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await apiClient.get('/profile/me');
      if (res.data?.profile) {
        updateProfileState(res.data.profile);
      }
    } catch (e) {
      console.error('Failed to refresh profile:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginWithGoogle,
        register,
        verifyOtp,
        resendOtp,
        logout,
        updateProfileState,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
