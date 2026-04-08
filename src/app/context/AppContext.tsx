import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthSession, setAccessTokenGetter } from '../lib/api';

export type AppRole = 'public' | 'paciente' | 'apoiador' | 'admin';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  avatar?: string;
  city?: string;
  verified: boolean;
}

interface Notification {
  id: string;
  type: 'proposta' | 'mensagem' | 'aceito' | 'concluido' | 'seguranca';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface AppContextType {
  currentRole: AppRole;
  accessToken: string | null;
  refreshToken: string | null;
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  notifications: Notification[];
  unreadCount: number;
  login: (session: AuthSession) => void;
  logout: () => void;
  markNotificationRead: (id: string) => void;
}

const STORAGE_KEY = 'nextdream.auth.session';

const AppContext = createContext<AppContextType | null>(null);

function loadStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed.accessToken || !parsed.refreshToken || !parsed.user) return null;
    return parsed;
  } catch {
    return null;
  }
}

function toAppUser(session: AuthSession | null): AppUser | null {
  if (!session) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    city: session.user.city,
    verified: session.user.verified,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => loadStoredSession());
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const currentUser = toAppUser(session);
  const currentRole: AppRole = currentUser?.role ?? 'public';
  const accessToken = session?.accessToken ?? null;
  const refreshToken = session?.refreshToken ?? null;
  const isAuthenticated = Boolean(session?.accessToken && session?.user);

  const unreadCount = notifications.filter(n => !n.read).length;

  const login = useCallback((authSession: AuthSession) => {
    setSession(authSession);
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  useEffect(() => {
    if (!session) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    setAccessTokenGetter(() => accessToken);
  }, [accessToken]);

  return (
    <AppContext.Provider value={{
      currentRole,
      accessToken,
      refreshToken,
      currentUser,
      isAuthenticated,
      notifications,
      unreadCount,
      login,
      logout,
      markNotificationRead,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
