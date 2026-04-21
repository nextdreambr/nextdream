import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import InstitutionNotifications from './InstitutionNotifications';

const navigateMock = vi.fn();
const markNotificationReadMock = vi.fn();
const markAllNotificationsReadMock = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../../context/AppContext', () => ({
  useApp: () => ({
    notifications: [
      {
        id: 'notification-1',
        title: 'Nova proposta',
        message: 'Uma nova proposta chegou para o paciente acompanhado.',
        type: 'proposta',
        read: false,
        createdAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
        actionPath: '/instituicao/propostas',
      },
    ],
    markNotificationRead: markNotificationReadMock,
    markAllNotificationsRead: markAllNotificationsReadMock,
  }),
}));

describe('InstitutionNotifications', () => {
  it('renders notification items as accessible buttons and formats future dates safely', () => {
    render(
      <MemoryRouter>
        <InstitutionNotifications />
      </MemoryRouter>,
    );

    const notificationButton = screen.getByRole('button', { name: /nova proposta/i });
    expect(notificationButton).toBeInTheDocument();
    expect(screen.queryByText(/-\d+ dias atrás/i)).not.toBeInTheDocument();

    fireEvent.click(notificationButton);

    expect(markNotificationReadMock).toHaveBeenCalledWith('notification-1');
    expect(navigateMock).toHaveBeenCalledWith('/instituicao/propostas');
  });
});
