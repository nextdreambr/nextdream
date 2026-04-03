import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { Home, Search, Send, MessageCircle, User, Bell, Menu, X, ChevronRight, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DemoBar } from './DemoBar';
import logoImg from '../../../assets/df29d28e06eae9a96d131fc75e2fd7064bd951d1.png';

const navItems = [
  { path: '/apoiador/dashboard', label: 'Início', icon: Home },
  { path: '/apoiador/explorar', label: 'Explorar Sonhos', icon: Search },
  { path: '/apoiador/propostas', label: 'Minhas Propostas', icon: Send },
  { path: '/apoiador/chat', label: 'Conversas', icon: MessageCircle },
  { path: '/apoiador/notificacoes', label: 'Notificações', icon: Bell },
  { path: '/apoiador/perfil', label: 'Meu Perfil', icon: User },
];

const mobileNav = [
  { path: '/apoiador/dashboard', label: 'Início', icon: Home },
  { path: '/apoiador/explorar', label: 'Explorar', icon: Search },
  { path: '/apoiador/propostas', label: 'Propostas', icon: Send },
  { path: '/apoiador/chat', label: 'Chat', icon: MessageCircle },
  { path: '/apoiador/perfil', label: 'Perfil', icon: User },
];

export function SupporterLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, notifications, logout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex pb-12">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-teal-100 fixed h-full z-30">
        <div className="p-5 border-b border-teal-100">
          <Link to="/apoiador/dashboard" className="flex items-center">
            <img src={logoImg} alt="NextDream" className="h-8 w-auto" />
          </Link>
        </div>

        <div className="p-4 border-b border-teal-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">
              {currentUser?.name?.[0] || 'F'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{currentUser?.name}</p>
              <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">Apoiador</span>
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
                  ${isActive ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-50 hover:text-teal-700'}`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-teal-100">
          <Link to="/apoiador/explorar" className="flex items-center justify-center gap-2 w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors mb-2">
            <Search className="w-4 h-4" />
            Explorar Sonhos
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside className="w-64 h-full bg-white p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <img src={logoImg} alt="NextDream" className="h-7 w-auto" />
              <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-3 mb-5 px-1 py-3 border-b border-teal-50">
              <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">
                {currentUser?.name?.[0] || 'F'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{currentUser?.name}</p>
                <span className="text-xs text-teal-600">Apoiador</span>
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${isActive ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-teal-50'}`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 pt-4 border-t border-teal-50">
              <button onClick={() => { handleLogout(); setSidebarOpen(false); }}
                className="flex items-center gap-2 w-full text-gray-500 px-3 py-2 rounded-xl text-sm hover:bg-gray-50">
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white border-b border-teal-100 px-4 sm:px-6 h-14 flex items-center justify-between">
          <button className="md:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <span>Área do Apoiador</span>
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
              to="/apoiador/notificacoes"
              className="relative p-2 rounded-xl hover:bg-teal-50 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-teal-600 text-white rounded-full text-xs flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </Link>
            <div className="h-6 w-px bg-teal-100 mx-1 hidden sm:block"></div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors"
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
      <div className="md:hidden fixed bottom-12 left-0 right-0 z-30 bg-white border-t border-teal-100">
        <div className="flex items-center">
          {mobileNav.map(item => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors relative
                  ${isActive ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
                {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-teal-600 rounded-full" />}
              </Link>
            );
          })}
        </div>
      </div>

      <DemoBar />
    </div>
  );
}
