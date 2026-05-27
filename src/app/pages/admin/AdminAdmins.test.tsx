import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminAdmins from './AdminAdmins';
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
      listAdminsPage: vi.fn(),
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
    },
  };
});

const listAdminsMock = vi.mocked(adminApi.listAdmins);
const listAdminsPageMock = vi.mocked(adminApi.listAdminsPage);
const getAdminDetailMock = vi.mocked(adminApi.getAdminDetail);
const updateAdminMock = vi.mocked(adminApi.updateAdmin);
const listAdminInvitesMock = vi.mocked(adminApi.listAdminInvites);
const inviteAdminMock = vi.mocked(adminApi.inviteAdmin);

describe('AdminAdmins', () => {
  beforeEach(() => {
    useAppMock.mockReset();
    listAdminsMock.mockReset();
    listAdminsPageMock.mockReset();
    getAdminDetailMock.mockReset();
    updateAdminMock.mockReset();
    listAdminInvitesMock.mockReset();
    inviteAdminMock.mockReset();
  });

  it('uses row menus and a persistent detail panel for admin accounts and supports resending pending invites', async () => {
    useAppMock.mockReturnValue({
      currentUser: {
        id: 'admin-1',
        name: 'Admin Root',
        role: 'admin',
      },
    });
    listAdminsMock.mockResolvedValue([]);
    listAdminsPageMock.mockResolvedValue({
      items: [
        {
          id: 'admin-2',
          name: 'Carla Segurança',
          email: 'carla@example.com',
          role: 'admin',
          verified: true,
          approved: true,
          suspended: false,
          createdAt: '2026-04-18T10:00:00.000Z',
        },
      ],
      page: 1,
      pageSize: 10,
      total: 24,
      totalPages: 3,
    });
    listAdminInvitesMock.mockResolvedValue([
      {
        id: 'invite-1',
        email: 'novo-admin@example.com',
        expiresAt: '2026-04-26T10:00:00.000Z',
      },
    ]);
    getAdminDetailMock.mockResolvedValue({
      id: 'admin-2',
      name: 'Carla Segurança',
      email: 'carla@example.com',
      role: 'admin',
      verified: true,
      approved: true,
      suspended: false,
      createdAt: '2026-04-18T10:00:00.000Z',
      updatedAt: '2026-04-20T16:00:00.000Z',
      securityTrail: [
        {
          id: 'audit-1',
          action: 'Admin atualizado',
          details: 'Senha trocada via painel.',
          date: '2026-04-20T16:00:00.000Z',
          severity: 'alta',
          outcome: 'ok',
        },
      ],
    });
    updateAdminMock.mockResolvedValue({
      id: 'admin-2',
      name: 'Carla Segurança Atualizada',
      email: 'carla@example.com',
      role: 'admin',
      verified: true,
      approved: true,
      suspended: false,
      createdAt: '2026-04-18T10:00:00.000Z',
    });
    inviteAdminMock.mockResolvedValue({
      id: 'invite-2',
      email: 'novo-admin@example.com',
      expiresAt: '2026-04-27T10:00:00.000Z',
    });

    render(
      <MemoryRouter>
        <AdminAdmins />
      </MemoryRouter>,
    );

    await screen.findByText('Carla Segurança');
    expect(screen.getByText('Exibindo 1–10 de 24')).toBeInTheDocument();
    expect(screen.getByText(/novo-admin@example.com/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /reenviar convite para novo-admin@example.com/i }));

    await waitFor(() => {
      expect(inviteAdminMock).toHaveBeenCalledWith('novo-admin@example.com');
    });

    fireEvent.click(screen.getByRole('button', { name: /ações para carla segurança/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /ver e editar/i }));

    expect(await screen.findByText('Central do admin')).toBeInTheDocument();
    expect(screen.getByText(/senha trocada via painel/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/nome do admin/i), {
      target: { value: 'Carla Segurança Atualizada' },
    });
    fireEvent.change(screen.getByLabelText(/sua senha atual/i), {
      target: { value: 'AdminSecret123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(updateAdminMock).toHaveBeenCalledWith('admin-2', expect.objectContaining({
        name: 'Carla Segurança Atualizada',
      }));
    });

    expect(screen.getByText(/ações sensíveis/i)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/sua senha atual/i), {
      target: { value: 'AdminSecret123!' },
    });
    fireEvent.change(screen.getByLabelText(/motivo para suspender admin/i), {
      target: { value: 'Conta sem necessidade operacional ativa.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /suspender admin/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirmar ação/i }));

    await waitFor(() => {
      expect(updateAdminMock).toHaveBeenCalledWith('admin-2', expect.objectContaining({
        isActive: false,
        reason: 'Conta sem necessidade operacional ativa.',
      }));
    });
  });
});
