import React, { createContext, useContext, useState, useCallback } from 'react';

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
  currentUser: AppUser | null;
  notifications: Notification[];
  unreadCount: number;
  switchRole: (role: AppRole) => void;
  login: (role: AppRole) => void;
  logout: () => void;
  markNotificationRead: (id: string) => void;
}

const mockPatient: AppUser = {
  id: 'p1', name: 'Ana Souza', email: 'ana@email.com',
  role: 'paciente', city: 'Santos, SP', verified: true,
};
const mockSupporter: AppUser = {
  id: 's1', name: 'Fernanda Lima', email: 'fernanda@email.com',
  role: 'apoiador', city: 'Santos, SP', verified: true,
};
const mockAdmin: AppUser = {
  id: 'a1', name: 'Admin NextDream', email: 'admin@nextdream.com.br',
  role: 'admin', verified: true,
};

const mockNotifications: Notification[] = [
  { id: 'n1', type: 'proposta', title: 'Nova proposta recebida!',  message: 'Fernanda Lima enviou uma proposta para "Ver o nascer do sol na praia"', read: false, createdAt: '2026-02-20 14:30' },
  { id: 'n2', type: 'mensagem', title: 'Nova mensagem',            message: 'Pedro Rocha enviou uma mensagem sobre seu sonho',                       read: false, createdAt: '2026-02-20 10:15' },
  { id: 'n3', type: 'aceito',   title: 'Proposta aceita! 🎉',     message: 'Ana Souza aceitou sua proposta para "Ver o nascer do sol na praia"',    read: true,  createdAt: '2026-02-18 09:00' },
];

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<AppRole>('public');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const switchRole = useCallback((role: AppRole) => {
    setCurrentRole(role);
    if (role === 'paciente')      setCurrentUser(mockPatient);
    else if (role === 'apoiador') setCurrentUser(mockSupporter);
    else if (role === 'admin')    setCurrentUser(mockAdmin);
    else                          setCurrentUser(null);
  }, []);

  const login  = useCallback((role: AppRole) => { switchRole(role); }, [switchRole]);
  const logout = useCallback(() => { setCurrentRole('public'); setCurrentUser(null); }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  return (
    <AppContext.Provider value={{
      currentRole, currentUser, notifications, unreadCount,
      switchRole, login, logout, markNotificationRead,
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
