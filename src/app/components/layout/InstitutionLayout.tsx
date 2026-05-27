import { Outlet, Link, Navigate, useLocation, useNavigate } from 'react-router';
import { Home, Star, Inbox, MessageCircle, User, Bell, Menu, X, ChevronRight, LogOut, Users } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LanguageSwitcher } from '../../i18n/LanguageSwitcher';
import { useI18n } from '../../i18n/I18nProvider';
import { stripLocalePrefix } from '../../i18n/routes';
import logoImg from '../../../assets/df29d28e06eae9a96d131fc75e2fd7064bd951d1.png';

const institutionNavItems = [
  { path: '/instituicao/dashboard', labelKey: 'appShell.home', icon: Home },
  { path: '/instituicao/pacientes', labelKey: 'appShell.patients', icon: Users },
  { path: '/instituicao/sonhos', labelKey: 'appShell.dreams', icon: Star },
  { path: '/instituicao/propostas', labelKey: 'appShell.proposals', icon: Inbox },
  { path: '/instituicao/chat', labelKey: 'appShell.conversations', icon: MessageCircle },
  { path: '/instituicao/notificacoes', labelKey: 'appShell.notifications', icon: Bell },
  { path: '/instituicao/perfil', labelKey: 'appShell.profile', icon: User },
] as const;

const institutionMobileNav = [
  { path: '/instituicao/dashboard', labelKey: 'appShell.home', icon: Home },
  { path: '/instituicao/pacientes', labelKey: 'appShell.patients', icon: Users },
  { path: '/instituicao/propostas', labelKey: 'appShell.proposals', icon: Inbox },
  { path: '/instituicao/chat', labelKey: 'appShell.chat', icon: MessageCircle },
  { path: '/instituicao/notificacoes', labelKey: 'appShell.notices', icon: Bell },
  { path: '/instituicao/perfil', labelKey: 'appShell.profile', icon: User },
] as const;

export function InstitutionLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, notifications, unreadCount, logout } = useApp();
  const { t, localizedPath } = useI18n();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentPath = stripLocalePrefix(location.pathname);
  const navItems = institutionNavItems.map((item) => ({ ...item, label: t(item.labelKey) }));
  const mobileNav = institutionMobileNav.map((item) => ({ ...item, label: t(item.labelKey) }));

  if (!currentUser) {
    return <Navigate to={localizedPath('/login?tipo=instituicao')} replace state={{ from: location.pathname }} />;
  }
  if (currentUser.role !== 'instituicao') {
    return <Navigate to={localizedPath('/')} replace />;
  }

  const unreadNotifications = notifications.filter((notification) => !notification.read).length;
  const hideMobileNav = currentPath.includes('/sonhos/criar') || currentPath.includes('/sonhos/editar');

  const handleLogout = () => {
    logout();
    navigate(localizedPath('/'));
  };

  return (
    <div className={`min-h-screen bg-[#f8f5ff] flex ${hideMobileNav ? 'pb-0' : 'pb-16'} md:pb-0`}>
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col bg-[#fffdfd] border-r border-[#d8cdeb]">
        <div className="p-5 border-b border-[#d8cdeb]">
          <Link to={localizedPath('/instituicao/dashboard')} className="flex items-center">
            <img src={logoImg} alt="NextDream" className="h-8 w-auto" />
          </Link>
        </div>

        <div className="p-4 border-b border-[#d8cdeb]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#e6ddf6] flex items-center justify-center text-[#584478] font-semibold text-sm">
              {currentUser.name?.[0] || 'I'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#241b24] truncate">{currentUser.name}</p>
              <span className="text-xs text-[#584478] bg-[#f6f0ff] px-2 py-0.5 rounded-full">{t('roles.institution')}</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={localizedPath(item.path)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive ? 'bg-[#584478] text-white' : 'text-[#5f5268] hover:bg-[#f6f0ff] hover:text-[#584478]'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.path === '/instituicao/propostas' && unreadCount > 0 && (
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[#e6ddf6] text-[#584478]'}`}>
                    {unreadCount}
                  </span>
                )}
                {item.path === '/instituicao/notificacoes' && unreadNotifications > 0 && (
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[#e6ddf6] text-[#584478]'}`}>
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#d8cdeb]">
          <Link to={localizedPath('/instituicao/sonhos/criar')} className="flex items-center justify-center gap-2 w-full bg-[#584478] hover:bg-[#44345f] text-white py-2.5 rounded-full text-sm font-bold transition-colors mb-2">
            <Star className="w-4 h-4" />
            {t('appShell.publishDream')}
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full text-[#5f5268] hover:text-[#241b24] px-3 py-2 rounded-xl text-sm hover:bg-[#f6f0ff] transition-colors">
            <LogOut className="w-4 h-4" />
            {t('appShell.logout')}
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside className="w-64 h-full bg-white p-4" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <img src={logoImg} alt="NextDream" className="h-7 w-auto" />
              <button type="button" aria-label={t('appShell.closeMenu')} onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            <div className="flex items-center gap-3 mb-5 px-1 py-3 border-b border-[#d8cdeb]">
              <div className="w-8 h-8 rounded-xl bg-[#e6ddf6] flex items-center justify-center text-[#584478] font-semibold text-sm">
                {currentUser.name?.[0] || 'I'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{currentUser.name}</p>
                <span className="text-xs text-[#584478]">{t('roles.institution')}</span>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
                return (
                  <Link
                    key={item.path}
                    to={localizedPath(item.path)}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${isActive ? 'bg-[#584478] text-white' : 'text-[#5f5268] hover:bg-[#f6f0ff]'}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 pt-4 border-t border-indigo-50">
              <Link
                to={localizedPath('/instituicao/sonhos/criar')}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-[#584478] text-white py-2.5 rounded-full text-sm font-bold mb-2"
              >
                <Star className="w-4 h-4" /> {t('appShell.publishDream')}
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setSidebarOpen(false);
                }}
                className="flex items-center gap-2 w-full text-gray-500 px-3 py-2 rounded-xl text-sm hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4" /> {t('appShell.logout')}
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-[#fffdfd]/95 border-b border-[#d8cdeb] px-4 sm:px-6 h-14 flex items-center justify-between backdrop-blur">
          <button type="button" aria-label={t('appShell.openMenu')} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <span>{t('appShell.institutionArea')}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-800">
              {navItems.find((item) => currentPath.startsWith(item.path))?.label || t('appShell.dashboard')}
            </span>
          </div>
          <div className="md:hidden flex-1 text-center">
            <span className="text-sm font-medium text-gray-800">
              {navItems.find((item) => currentPath.startsWith(item.path))?.label || 'NextDream'}
            </span>
          </div>
          <div className="flex items-center gap-3 relative">
            <Link to={localizedPath('/instituicao/notificacoes')} className="relative p-2 rounded-xl hover:bg-[#f6f0ff] transition-colors" aria-label={t('appShell.openNotifications')}>
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#584478] text-white rounded-full text-xs flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Link>
            <div className="h-6 w-px bg-[#d8cdeb] mx-1 hidden sm:block"></div>
            <div className="hidden sm:block">
              <LanguageSwitcher compact />
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-[#5f5268] hover:text-[#584478] hover:bg-[#f6f0ff] px-3 py-1.5 rounded-lg transition-colors"
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

      {!hideMobileNav && (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#fffdfd] border-t border-[#d8cdeb] safe-area-bottom">
        <div className="flex items-center">
          {mobileNav.map((item) => {
            const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={localizedPath(item.path)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors relative ${isActive ? 'text-[#584478]' : 'text-[#9a8aa7] hover:text-[#5f5268]'}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
                {item.path === '/instituicao/propostas' && unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1/4 w-2 h-2 bg-[#584478] rounded-full" />
                )}
                {item.path === '/instituicao/notificacoes' && unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1/4 w-2 h-2 bg-[#584478] rounded-full" />
                )}
                {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#584478] rounded-full" />}
              </Link>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
}
