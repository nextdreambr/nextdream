import { Outlet, Link, Navigate, useLocation, useNavigate } from 'react-router';
import { BarChart2, Users, Star, Send, MessageCircle, AlertTriangle, Settings, FileText, Menu, X, Shield, LogOut, ChevronRight, Mail, MailCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import logoImg from '../../../assets/df29d28e06eae9a96d131fc75e2fd7064bd951d1.png';
import { adminApi } from '../../lib/api';

const navItems = [
  { path: '/admin',               label: 'Visão Geral',      icon: BarChart2,      exact: true },
  { path: '/admin/usuarios',      label: 'Usuários',         icon: Users },
  { path: '/admin/admins',        label: 'Admins',           icon: Shield },
  { path: '/admin/sonhos',        label: 'Sonhos',           icon: Star },
  { path: '/admin/propostas',     label: 'Propostas',        icon: Send },
  { path: '/admin/mensagens',     label: 'Mensagens',        icon: Mail },
  { path: '/admin/chats',         label: 'Chats',            icon: MessageCircle },
  { path: '/admin/denuncias',     label: 'Denúncias',        icon: AlertTriangle },
  { path: '/admin/email-templates', label: 'Templates de e-mail', icon: MailCheck },
  { path: '/admin/configuracoes', label: 'Configurações',    icon: Settings },
  { path: '/admin/auditoria',     label: 'Auditoria',        icon: FileText },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openReportsCount, setOpenReportsCount] = useState(0);

  const isActiveNavItem = (item: (typeof navItems)[number]) =>
    item.exact
      ? location.pathname === item.path
      : location.pathname === item.path || location.pathname.startsWith(item.path + '/');

  if (!currentUser) {
    return <Navigate to="/login?tipo=admin" replace state={{ from: location.pathname }} />;
  }
  if (currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    let mounted = true;

    async function loadOverview() {
      try {
        const data = await adminApi.overview();
        if (mounted) {
          setOpenReportsCount(data.totalReportsOpen);
        }
      } catch {
        if (mounted) {
          setOpenReportsCount(0);
        }
      }
    }

    void loadOverview();

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#f8faf7] flex">
      <aside className="hidden md:flex flex-col w-64 bg-[#24332b] fixed h-full z-30">
        <div className="p-5 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-2">
            <img src={logoImg} alt="NextDream" className="h-8 w-auto brightness-0 invert opacity-90" />
          </Link>
          <div className="mt-2">
            <span className="text-[#f4cbbd] text-xs font-medium">Painel Administrador</span>
          </div>
        </div>

        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f7d9c6]/15 flex items-center justify-center text-[#f4cbbd] font-semibold text-sm">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
              <span className="text-xs text-[#f4cbbd]">Administrador</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const isActive = isActiveNavItem(item);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                  ${isActive ? 'bg-[#a8544a] text-white' : 'text-[#d9e7dd] hover:bg-white/10 hover:text-white'}`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.path === '/admin/denuncias' && (
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[#f7d9c6]/15 text-[#f4cbbd]'}`}>{openReportsCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-2 w-full text-[#d9e7dd] hover:text-white px-3 py-2 rounded-xl text-sm hover:bg-white/10 transition-colors">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside className="w-64 h-full bg-[#24332b] p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <Link to="/admin" className="flex items-center gap-2">
                <img src={logoImg} alt="NextDream" className="h-7 w-auto brightness-0 invert opacity-90" />
              </Link>
              <button type="button" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <nav className="space-y-1">
              {navItems.map(item => {
                const isActive = isActiveNavItem(item);
                return (
                  <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${isActive ? 'bg-[#a8544a] text-white' : 'text-[#d9e7dd] hover:bg-white/10'}`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 pt-4 border-t border-white/10">
              <button onClick={() => { handleLogout(); setSidebarOpen(false); }}
                className="flex items-center gap-2 w-full text-[#d9e7dd] hover:text-white px-3 py-2 rounded-xl text-sm hover:bg-white/10">
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white/95 border-b border-[#d7e3d9] px-4 sm:px-6 h-14 flex items-center justify-between backdrop-blur">
          <button type="button" aria-label="Abrir menu" className="md:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="w-4 h-4 text-[#a8544a]" />
            <span>Painel Admin</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-800">
              {navItems.find(n => n.exact ? location.pathname === n.path : location.pathname.startsWith(n.path))?.label || 'Visão Geral'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block bg-[#fff4d8] text-[#8b3d44] text-xs px-3 py-1.5 rounded-full font-medium">
              {openReportsCount} denúncias abertas
            </div>
            <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              title="Sair do painel"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
