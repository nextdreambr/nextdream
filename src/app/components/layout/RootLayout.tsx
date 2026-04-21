import { Outlet, useLocation } from 'react-router';
import { AppProvider } from '../../context/AppContext';
import { SandboxTourProvider } from '../../context/SandboxTourContext';
import { SandboxEnvironmentBanner } from '../shared/SandboxEnvironmentBanner';
import { useSeoMetadata } from '../../seo/useSeoMetadata';

export function RootLayout() {
  const location = useLocation();
  useSeoMetadata(location.pathname);

  return (
    <AppProvider>
      <SandboxTourProvider>
        <SandboxEnvironmentBanner />
        <Outlet />
      </SandboxTourProvider>
    </AppProvider>
  );
}
