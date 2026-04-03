import { Outlet } from 'react-router';
import { AppProvider } from '../../context/AppContext';

export function RootLayout() {
  return (
    <AppProvider>
      <Outlet />
    </AppProvider>
  );
}
