import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from 'react';
import {
  AppNotification,
  AuthSession,
  notificationsApi,
  setAccessTokenGetter,
  setRefreshTokenGetter,
  setSessionChangeHandler,
} from '../lib/api';
import {
  clearStoredSession,
  loadStoredSession,
  persistStoredSession,
} from '../lib/authSession';

export type AppRole = 'public' | 'paciente' | 'apoiador' | 'admin';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  avatar?: string;
  city?: string;
  verified: boolean;
  emailNotificationsEnabled?: boolean;
}

interface AppContextType {
  currentRole: AppRole;
  accessToken: string | null;
  refreshToken: string | null;
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  notifications: AppNotification[];
  unreadCount: number;
  login: (session: AuthSession) => void;
  logout: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  reloadNotifications: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

function toAppUser(session: AuthSession | null): AppUser | null {
  if (!session) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    city: session.user.city,
    verified: session.user.verified,
    emailNotificationsEnabled: session.user.emailNotificationsEnabled,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => loadStoredSession());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

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
    setNotifications([]);
    clearStoredSession();
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    void notificationsApi.markRead(id).catch(() => {
      // keep optimistic state
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    void notificationsApi.markAllRead().catch(() => {
      // keep optimistic state
    });
  }, []);

  useEffect(() => {
    if (!session) {
      clearStoredSession();
      return;
    }
    persistStoredSession(session);
  }, [session]);

  useLayoutEffect(() => {
    setAccessTokenGetter(() => accessToken);
    setRefreshTokenGetter(() => refreshToken);
    setSessionChangeHandler((nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        setNotifications([]);
      }
    });
  }, [accessToken, refreshToken]);

  const reloadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationsApi.listMine();
      setNotifications(data);
    } catch {
      // keep previous state if request fails
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    void reloadNotifications();
    const interval = window.setInterval(() => {
      void reloadNotifications();
    }, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isAuthenticated, reloadNotifications]);

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
      markAllNotificationsRead,
      reloadNotifications,
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
