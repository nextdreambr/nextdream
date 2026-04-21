import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppNotification, AuthSession, notificationsApi, setAccessTokenGetter } from '../lib/api';

export type AppRole = 'public' | 'paciente' | 'apoiador' | 'instituicao' | 'admin';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  avatar?: string;
  state?: string;
  city?: string;
  locationLabel?: string;
  institutionType?: string;
  institutionDescription?: string;
  verified: boolean;
  approved: boolean;
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
  updateCurrentUser: (nextUser: Partial<AuthSession['user']>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  reloadNotifications: () => Promise<void>;
}

const STORAGE_KEY = 'nextdream.auth.session';
const AUTH_EXPIRED_EVENT = 'nextdream:auth-expired';

const AppContext = createContext<AppContextType | null>(null);

function loadStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed.user) return null;
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
    state: session.user.state,
    city: session.user.city,
    locationLabel: session.user.locationLabel,
    institutionType: session.user.institutionType,
    institutionDescription: session.user.institutionDescription,
    verified: session.user.verified,
    approved: session.user.approved,
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
  const isAuthenticated = Boolean(session?.user);

  const unreadCount = notifications.filter(n => !n.read).length;

  const login = useCallback((authSession: AuthSession) => {
    setSession(authSession);
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const updateCurrentUser = useCallback((nextUser: Partial<AuthSession['user']>) => {
    setSession((current) => {
      if (!current) return current;

      return {
        ...current,
        user: {
          ...current.user,
          ...nextUser,
        },
      };
    });
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
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    setAccessTokenGetter(() => accessToken);
  }, [accessToken]);

  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, [logout]);

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
      updateCurrentUser,
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
