import { Outlet, useLocation } from 'react-router';
import { AppProvider } from '../../context/AppContext';
import { useSeoMetadata } from '../../seo/useSeoMetadata';

export function RootLayout() {
  const location = useLocation();
  useSeoMetadata(location.pathname);

  return (
    <AppProvider>
      <Outlet />
    </AppProvider>
  );
}
