import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, TravellerType } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeLanguage: string;
  setActiveLanguage: (lang: string) => void;
  setLanguage: (lang: string) => void;
  login: (email: string, pass: string) => Promise<void>;
  loginGoogle: (email?: string, name?: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  loginAsGuest: () => void;
  register: (data: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SUPPORTED_LANGUAGES = [
  'English',
  'Hindi',
  'Marathi',
  'Tamil',
  'Telugu',
  'Bengali',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Punjabi',
  'French',
  'German',
  'Spanish',
  'Japanese'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Preload cached user synchronously if available
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('travelshield_current_user');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeLanguage, setActiveLanguage] = useState<string>('English');

  useEffect(() => {
    const token = localStorage.getItem('travelshield_token');
    const guestSession = localStorage.getItem('travelshield_guest');
    const storedUser = localStorage.getItem('travelshield_current_user');

    if (token) {
      if (storedUser && !user) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          if (parsed.preferredLanguage) setActiveLanguage(parsed.preferredLanguage);
        } catch {}
      }

      api.getMe()
        .then(res => {
          if (res.user) {
            setUser(res.user);
            localStorage.setItem('travelshield_current_user', JSON.stringify(res.user));
            if (res.user.preferredLanguage) {
              setActiveLanguage(res.user.preferredLanguage);
            }
          }
        })
        .catch(() => {
          // If server error, do not delete token if we have a valid cached user
          const cached = localStorage.getItem('travelshield_current_user');
          if (!cached) {
            localStorage.removeItem('travelshield_token');
          }
        })
        .finally(() => setIsLoading(false));
    } else if (guestSession) {
      setUser({
        id: 'guest-tourist',
        name: 'Guest Explorer',
        email: 'guest@travelshield.com',
        country: 'International Visitor',
        phone: '',
        preferredLanguage: 'English',
        travellerType: 'Solo Traveller',
        role: 'TOURIST',
        createdAt: new Date().toISOString()
      });
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Helper to maintain list of saved accounts on this device
  const recordSavedAccount = (accountUser: User) => {
    try {
      const raw = localStorage.getItem('travelshield_saved_accounts');
      let list: any[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
      const idx = list.findIndex((a: any) => a.email.toLowerCase() === accountUser.email.toLowerCase());
      const accountSummary = {
        id: accountUser.id,
        name: accountUser.name,
        email: accountUser.email,
        phone: accountUser.phone || '',
        country: accountUser.country || 'India',
        travellerType: accountUser.travellerType || 'Solo Traveller',
        lastLogin: new Date().toISOString()
      };
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...accountSummary };
      } else {
        list.unshift(accountSummary);
      }
      localStorage.setItem('travelshield_saved_accounts', JSON.stringify(list.slice(0, 10)));
    } catch {}
  };

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      localStorage.setItem('travelshield_token', res.token);
      localStorage.setItem('travelshield_current_user', JSON.stringify(res.user));
      localStorage.removeItem('travelshield_guest');

      // Retrieve authenticated user's profile directly from backend
      const meRes = await api.getMe();
      const profile = meRes.user || res.user;
      localStorage.setItem('travelshield_current_user', JSON.stringify(profile));
      recordSavedAccount(profile);
      setUser(profile);
      if (profile.preferredLanguage) {
        setActiveLanguage(profile.preferredLanguage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginGoogle = async (email?: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await api.loginGoogle(email, name);
      localStorage.setItem('travelshield_token', res.token);
      localStorage.setItem('travelshield_current_user', JSON.stringify(res.user));
      localStorage.removeItem('travelshield_guest');
      recordSavedAccount(res.user);
      setUser(res.user);
      if (res.user.preferredLanguage) {
        setActiveLanguage(res.user.preferredLanguage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async () => {
    await login('demo@travelshield.com', 'demo123');
  };

  const loginAsGuest = () => {
    localStorage.setItem('travelshield_guest', 'true');
    localStorage.removeItem('travelshield_token');
    localStorage.removeItem('travelshield_current_user');
    const guestUser: User = {
      id: 'guest-tourist',
      name: 'Guest Explorer',
      email: 'guest@travelshield.com',
      country: 'International Visitor',
      phone: '',
      preferredLanguage: 'English',
      travellerType: 'Solo Traveller',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelation: '',
      role: 'TOURIST',
      createdAt: new Date().toISOString()
    };
    setUser(guestUser);
  };

  const register = async (data: Partial<User> & { password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem('travelshield_token', res.token);
      localStorage.removeItem('travelshield_guest');

      // Retrieve authenticated user's profile from backend
      const meRes = await api.getMe();
      const profile = meRes.user || res.user;
      localStorage.setItem('travelshield_current_user', JSON.stringify(profile));
      recordSavedAccount(profile);
      setUser(profile);
      if (profile.preferredLanguage) {
        setActiveLanguage(profile.preferredLanguage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('travelshield_token');
    localStorage.removeItem('travelshield_current_user');
    localStorage.removeItem('travelshield_guest');
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (user?.id === 'guest-tourist') {
      setUser(prev => prev ? { ...prev, ...data } : null);
      return;
    }
    const res = await api.updateProfile(data);
    setUser(res.user);
    if (res.user.preferredLanguage) {
      setActiveLanguage(res.user.preferredLanguage);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        activeLanguage,
        setActiveLanguage,
        setLanguage: setActiveLanguage,
        login,
        loginGoogle,
        loginDemo,
        loginAsGuest,
        register,
        logout,
        updateProfile
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
