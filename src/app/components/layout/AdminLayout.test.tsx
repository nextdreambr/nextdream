import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminLayout } from './AdminLayout';
import { adminApi } from '../../lib/api';

const useAppMock = vi.fn();

vi.mock('../../context/AppContext', () => ({
  useApp: () => useAppMock(),
}));

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    adminApi: {
      overview: vi.fn(),
      listUsers: vi.fn(),
      getUserDetail: vi.fn(),
      updateUser: vi.fn(),
      suspendUser: vi.fn(),
      reactivateUser: vi.fn(),
      approveUser: vi.fn(),
      resetUserPassword: vi.fn(),
      listAdmins: vi.fn(),
      getAdminDetail: vi.fn(),
      updateAdmin: vi.fn(),
      inviteAdmin: vi.fn(),
      listAdminInvites: vi.fn(),
      listDreams: vi.fn(),
      getDreamDetail: vi.fn(),
      updateDreamStatus: vi.fn(),
      listProposals: vi.fn(),
      getProposalDetail: vi.fn(),
      updateProposalStatus: vi.fn(),
      listMessages: vi.fn(),
      getMessageDetail: vi.fn(),
      listChats: vi.fn(),
      getChatDetail: vi.fn(),
      closeChat: vi.fn(),
      listReports: vi.fn(),
      getReportDetail: vi.fn(),
      updateReportStatus: vi.fn(),
      listAudit: vi.fn(),
      getSettings: vi.fn(),
      updateSettings: vi.fn(),
      listEmailTemplates: vi.fn(),
    },
  };
});

const overviewMock = vi.mocked(adminApi.overview);

describe('AdminLayout', () => {
  beforeEach(() => {
    useAppMock.mockReset();
    overviewMock.mockReset();
  });

  it('shows the e-mail templates entry and renders the open reports badge from live overview data', async () => {
    useAppMock.mockReturnValue({
      currentUser: {
        id: 'admin-1',
        name: 'Admin Root',
        role: 'admin',
        approved: true,
      },
      logout: vi.fn(),
    });
    overviewMock.mockResolvedValue({
      totalUsers: 10,
      totalDreams: 6,
      totalProposals: 9,
      totalChats: 4,
      totalReportsOpen: 2,
    });

    const router = createMemoryRouter(
      [
        {
          path: '/admin',
          Component: AdminLayout,
          children: [
            {
              path: 'usuarios',
              element: <div>Conteudo admin</div>,
            },
          ],
        },
      ],
      {
        initialEntries: ['/admin/usuarios'],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByRole('link', { name: /templates de e-mail/i })).toHaveAttribute('href', '/admin/email-templates');
    expect(screen.getByRole('link', { name: /configurações/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText(/2 denúncias abertas/i).length).toBeGreaterThan(0);
    });
  });
});
