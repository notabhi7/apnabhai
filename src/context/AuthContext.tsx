import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, password?: string) => Promise<boolean>;
  loginAsGuest: () => void;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'ai_study_buddy_auth_user';

const defaultGuestUser: User = {
  id: 'user-demo-4482',
  name: 'Alex Chen',
  email: 'alex.chen@university.edu',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'student',
  studyGoalHours: 4,
  joinedAt: '2026-09-01'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse auth storage', e);
    }
    return defaultGuestUser; // Default active session for instant SaaS experience
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600)); // Smooth micro-interaction delay
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      email,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      role: 'student',
      studyGoalHours: 3.5,
      joinedAt: new Date().toISOString().slice(0, 10)
    };
    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const signup = async (name: string, email: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim() || 'Student Scholar',
      email: email.trim(),
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'student',
      studyGoalHours: 4,
      joinedAt: new Date().toISOString().slice(0, 10)
    };
    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const loginAsGuest = () => {
    setUser(defaultGuestUser);
  };

  const logout = () => {
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 500));
    return true;
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    setUser(prev => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginAsGuest,
        logout,
        resetPassword,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
