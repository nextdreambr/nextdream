import { Outlet, Link, Navigate, useLocation, useNavigate } from 'react-router';
import { Home, Search, Send, MessageCircle, User, Bell, Menu, X, ChevronRight, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';
import { useI18n } from '../../i18n/I18nProvider';
import { stripLocalePrefix } from '../../i18n/routes';
import logoImg from '../../../assets/df29d28e06eae9a96d131fc75e2fd7064bd951d1.png';

const supporterNavItems = [
  { path: '/apoiador/dashboard', labelKey: 'appShell.home', icon: Home },
  { path: '/apoiador/explorar', labelKey: 'appShell.exploreDreams', icon: Search },
  { path: '/apoiador/propostas', labelKey: 'appShell.myProposals', icon: Send },
  { path: '/apoiador/chat', labelKey: 'appShell.conversations', icon: MessageCircle },
  { path: '/apoiador/notificacoes', labelKey: 'appShell.notifications', icon: Bell },
  { path: '/apoiador/perfil', labelKey: 'appShell.myProfile', icon: User },
] as const;

const supporterMobileNav = [
  { path: '/apoiador/dashboard', labelKey: 'appShell.home', icon: Home },
  { path: '/apoiador/explorar', labelKey: 'appShell.exploreDreams', icon: Search },
  { path: '/apoiador/propostas', labelKey: 'appShell.proposals', icon: Send },
  { path: '/apoiador/chat', labelKey: 'appShell.chat', icon: MessageCircle },
  { path: '/apoiador/perfil', labelKey: 'appShell.profile', icon: User },
] as const;

export function SupporterLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, notifications, logout } = useApp();
  const { t, localizedPath } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentPath = stripLocalePrefix(location.pathname);
  const navItems = supporterNavItems.map((item) => ({ ...item, label: t(item.labelKey) }));
  const mobileNav = supporterMobileNav.map((item) => ({ ...item, label: t(item.labelKey) }));

  if (!currentUser) {
    return <Navigate to={localizedPath('/login?tipo=apoiador')} replace state={{ from: location.pathname }} />;
  }
  if (currentUser.role !== 'apoiador') {
    return <Navigate to={localizedPath('/')} replace />;
  }

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const hideMobileNav = /^\/apoiador\/sonhos\/[^/]+$/.test(currentPath);

  const handleLogout = () => {
    logout();
    navigate(localizedPath('/'));
  };

  return (
    <div className={`min-h-screen bg-[#f2fbf8] flex ${hideMobileNav ? 'pb-0' : 'pb-16'} md:pb-0`}>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col bg-[#fbfffc] border-r border-[#c9e5dc]">
        <div className="p-5 border-b border-[#c9e5dc]">
          <Link to={localizedPath('/apoiador/dashboard')} className="flex items-center">
            <img src={logoImg} alt="NextDream" className="h-8 w-auto" />
          </Link>
        </div>

        <div className="p-4 border-b border-[#c9e5dc]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c9e5dc] flex items-center justify-center text-[#245b53] font-semibold text-sm">
              {currentUser?.name?.[0] || 'F'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#1f2924] truncate">{currentUser?.name}</p>
              <span className="text-xs text-[#245b53] bg-[#e5f4ee] px-2 py-0.5 rounded-full">{t('roles.supporter')}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={localizedPath(item.path)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                  ${isActive ? 'bg-[#245b53] text-white' : 'text-[#50645d] hover:bg-[#e5f4ee] hover:text-[#245b53]'}`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#c9e5dc]">
          <Link to={localizedPath('/apoiador/explorar')} className="flex items-center justify-center gap-2 w-full bg-[#245b53] hover:bg-[#17453f] text-white py-2.5 rounded-full text-sm font-bold transition-colors mb-2">
            <Search className="w-4 h-4" />
            {t('appShell.exploreDreams')}
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full text-[#50645d] hover:text-[#1f2924] px-3 py-2 rounded-xl text-sm hover:bg-[#e5f4ee] transition-colors">
            <LogOut className="w-4 h-4" />
            {t('appShell.logout')}
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside className="w-64 h-full bg-white p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <img src={logoImg} alt="NextDream" className="h-7 w-auto" />
              <button type="button" aria-label={t('appShell.closeMenu')} onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-3 mb-5 px-1 py-3 border-b border-[#c9e5dc]">
              <div className="w-8 h-8 rounded-xl bg-[#c9e5dc] flex items-center justify-center text-[#245b53] font-semibold text-sm">
                {currentUser?.name?.[0] || 'F'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{currentUser?.name}</p>
                <span className="text-xs text-[#245b53]">{t('roles.supporter')}</span>
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map(item => {
                const isActive = currentPath === item.path;
                return (
                  <Link key={item.path} to={localizedPath(item.path)} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${isActive ? 'bg-[#245b53] text-white' : 'text-[#50645d] hover:bg-[#e5f4ee]'}`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 pt-4 border-t border-teal-50">
              <button onClick={() => { handleLogout(); setSidebarOpen(false); }}
                className="flex items-center gap-2 w-full text-gray-500 px-3 py-2 rounded-xl text-sm hover:bg-gray-50">
                <LogOut className="w-4 h-4" /> {t('appShell.logout')}
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-[#fbfffc]/95 border-b border-[#c9e5dc] px-4 sm:px-6 h-14 flex items-center justify-between backdrop-blur">
          <button type="button" aria-label={t('appShell.openMenu')} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <span>{t('appShell.supporterArea')}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-800">
              {navItems.find(n => currentPath.startsWith(n.path))?.label || t('appShell.dashboard')}
            </span>
          </div>
          {/* Mobile page title */}
          <div className="md:hidden flex-1 text-center">
            <span className="text-sm font-medium text-gray-800">
              {navItems.find(n => currentPath.startsWith(n.path))?.label || 'NextDream'}
            </span>
          </div>
          <div className="flex items-center gap-3 relative">
            <Link
              to={localizedPath('/apoiador/notificacoes')}
              className="relative p-2 rounded-xl hover:bg-[#e5f4ee] transition-colors"
              aria-label={t('appShell.openNotifications')}
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadNotifs > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#245b53] text-white rounded-full text-xs flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </Link>
            <div className="h-6 w-px bg-[#c9e5dc] mx-1 hidden sm:block"></div>
            <div className="hidden sm:block">
              <LanguageSwitcher compact />
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-[#50645d] hover:text-[#245b53] hover:bg-[#e5f4ee] px-3 py-1.5 rounded-lg transition-colors"
              title={t('appShell.logout')}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('appShell.logout')}</span>
            </button>
          </div>
        </header>

        <main className={`flex-1 p-4 sm:p-6 ${hideMobileNav ? 'pb-6' : 'pb-20'} md:pb-6`}>
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      {!hideMobileNav && (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#fbfffc] border-t border-[#c9e5dc]">
        <div className="flex items-center">
          {mobileNav.map(item => {
            const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={localizedPath(item.path)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors relative
                  ${isActive ? 'text-[#245b53]' : 'text-[#8a9a93] hover:text-[#50645d]'}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
                {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#245b53] rounded-full" />}
              </Link>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}
