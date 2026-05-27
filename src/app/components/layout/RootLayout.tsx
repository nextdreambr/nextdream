import { Outlet, useLocation } from 'react-router';
import { AppProvider } from '../../context/AppContext';
import { SandboxTourProvider } from '../../context/SandboxTourContext';
import { SandboxEnvironmentBanner } from '../shared/SandboxEnvironmentBanner';
import { useSeoMetadata } from '../../seo/useSeoMetadata';
import { I18nProvider } from '../../i18n/I18nProvider';
import { resolveLocaleFromPath } from '../../i18n/locale';

export function RootLayout() {
  const location = useLocation();
  useSeoMetadata(location.pathname);
  const { locale } = resolveLocaleFromPath(location.pathname);

  return (
    <I18nProvider locale={locale}>
      <AppProvider>
        <SandboxTourProvider>
          <SandboxEnvironmentBanner />
          <Outlet />
        </SandboxTourProvider>
      </AppProvider>
    </I18nProvider>
  );
}
