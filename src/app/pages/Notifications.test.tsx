import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AppProvider } from '../context/AppContext';
import PatientNotifications from './patient/PatientNotifications';
import SupporterNotifications from './supporter/SupporterNotifications';

describe('Notifications pages', () => {
  it('renders empty state for patient notifications by default', () => {
    render(
      <AppProvider>
        <MemoryRouter>
          <PatientNotifications />
        </MemoryRouter>
      </AppProvider>,
    );

    expect(screen.getByText('Nenhuma notificação')).toBeInTheDocument();
  });

  it('renders empty state for supporter notifications by default', () => {
    render(
      <AppProvider>
        <MemoryRouter>
          <SupporterNotifications />
        </MemoryRouter>
      </AppProvider>,
    );

    expect(screen.getByText('Nenhuma notificação')).toBeInTheDocument();
  });
});
