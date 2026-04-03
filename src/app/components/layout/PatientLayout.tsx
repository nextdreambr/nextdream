import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Home, Star, Inbox, MessageCircle, User, Bell, Menu, X, ChevronRight, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DemoBar } from './DemoBar';
import logoImg from '../../../assets/df29d28e06eae9a96d131fc75e2fd7064bd951d1.png';

const navItems = [
  { path: '/paciente/dashboard', label: 'Início', icon: Home },
  { path: '/paciente/sonhos', label: 'Meus Sonhos', icon: Star },
  { path: '/paciente/propostas', label: 'Propostas', icon: Inbox },
  { path: '/paciente/chat', label: 'Conversas', icon: MessageCircle },
  { path: '/paciente/notificacoes', label: 'Notificações', icon: Bell },
  { path: '/paciente/perfil', label: 'Meu Perfil', icon: User },
];

const mobileNav = [
  { path: '/paciente/dashboard', label: 'Início', icon: Home },
  { path: '/paciente/sonhos', label: 'Sonhos', icon: Star },
  { path: '/paciente/propostas', label: 'Propostas', icon: Inbox },
  { path: '/paciente/chat', label: 'Chat', icon: MessageCircle },
  { path: '/paciente/notificacoes', label: 'Avisos', icon: Bell },
  { path: '/paciente/perfil', label: 'Perfil', icon: User },
];

export function PatientLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, notifications, unreadCount, logout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex pb-12">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-pink-100 fixed h-full z-30">
        <div className="p-5 border-b border-pink-100">
          <Link to="/paciente/dashboard" className="flex items-center">
            <img src={logoImg} alt="NextDream" className="h-8 w-auto" />
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center text-pink-700 font-semibold text-sm">
              {currentUser?.name?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{currentUser?.name}</p>
              <span className="text-xs text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">Paciente</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                  ${isActive ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-pink-50 hover:text-pink-700'}`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.path === '/paciente/propostas' && unreadCount > 0 && (
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-700'}`}>
                    {unreadCount}
                  </span>
                )}
                {item.path === '/paciente/notificacoes' && unreadNotifs > 0 && (
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-700'}`}>
                    {unreadNotifs}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-pink-100">
          <Link to="/paciente/sonhos/criar" className="flex items-center justify-center gap-2 w-full bg-pink-600 hover:bg-pink-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors mb-2">
            <Star className="w-4 h-4" />
            Compartilhar um sonho
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside className="w-64 h-full bg-white p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <img src={logoImg} alt="NextDream" className="h-7 w-auto" />
              <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-3 mb-5 px-1 py-3 border-b border-pink-50">
              <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center text-pink-700 font-semibold text-sm">
                {currentUser?.name?.[0] || 'A'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{currentUser?.name}</p>
                <span className="text-xs text-pink-600">Paciente</span>
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${isActive ? 'bg-pink-600 text-white' : 'text-gray-600 hover:bg-pink-50'}`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 pt-4 border-t border-pink-50">
              <Link to="/paciente/sonhos/criar" onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-pink-600 text-white py-2.5 rounded-xl text-sm font-medium mb-2">
                <Star className="w-4 h-4" /> Compartilhar um sonho
              </Link>
              <button onClick={() => { handleLogout(); setSidebarOpen(false); }}
                className="flex items-center gap-2 w-full text-gray-500 px-3 py-2 rounded-xl text-sm hover:bg-gray-50">
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-pink-100 px-4 sm:px-6 h-14 flex items-center justify-between">
          <button className="md:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <span>Área do Paciente</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-800">
              {navItems.find(n => location.pathname.startsWith(n.path))?.label || 'Dashboard'}
            </span>
          </div>
          {/* Mobile page title */}
          <div className="md:hidden flex-1 text-center">
            <span className="text-sm font-medium text-gray-800">
              {navItems.find(n => location.pathname.startsWith(n.path))?.label || 'NextDream'}
            </span>
          </div>
          <div className="flex items-center gap-3 relative">
            <Link
              to="/paciente/notificacoes"
              className="relative p-2 rounded-xl hover:bg-pink-50 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-pink-600 text-white rounded-full text-xs flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </Link>
            <div className="h-6 w-px bg-pink-100 mx-1 hidden sm:block"></div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-pink-700 hover:bg-pink-50 px-3 py-1.5 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-12 left-0 right-0 z-30 bg-white border-t border-pink-100 safe-area-bottom">
        <div className="flex items-center">
          {mobileNav.map(item => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors relative
                  ${isActive ? 'text-pink-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
                {item.path === '/paciente/propostas' && unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1/4 w-2 h-2 bg-amber-500 rounded-full" />
                )}
                {item.path === '/paciente/notificacoes' && unreadNotifs > 0 && (
                  <span className="absolute top-1.5 right-1/4 w-2 h-2 bg-pink-500 rounded-full" />
                )}
                {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-pink-600 rounded-full" />}
              </Link>
            );
          })}
        </div>
      </div>

      <DemoBar />
    </div>
  );
}
