import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminSettings from './AdminSettings';
import { adminApi } from '../../lib/api';

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
    },
  };
});

const getSettingsMock = vi.mocked(adminApi.getSettings);
const updateSettingsMock = vi.mocked(adminApi.updateSettings);

describe('AdminSettings', () => {
  beforeEach(() => {
    getSettingsMock.mockReset();
    updateSettingsMock.mockReset();
  });

  it('loads persisted settings, saves changes and no longer exposes templates as a tab', async () => {
    getSettingsMock.mockResolvedValue({
      blockedWords: ['pix', 'doacao'],
      rules: [
        {
          id: 'r1',
          label: 'Bloqueio em tempo real no chat',
          description: 'Impede termos financeiros.',
          enabled: true,
        },
      ],
      categories: [
        { id: 'cat-1', name: 'Arte e Música' },
        { id: 'cat-2', name: 'Convivência' },
      ],
      institutionalTexts: [
        {
          id: 'txt-1',
          label: 'Aviso anti-dinheiro',
          text: 'Sem pedidos financeiros.',
        },
      ],
      updatedAt: '2026-04-20T10:00:00.000Z',
    });
    updateSettingsMock.mockResolvedValue({
      blockedWords: ['pix', 'doacao', 'campanha'],
      rules: [
        {
          id: 'r1',
          label: 'Bloqueio em tempo real no chat',
          description: 'Impede termos financeiros.',
          enabled: true,
        },
      ],
      categories: [
        { id: 'cat-1', name: 'Arte e Música' },
        { id: 'cat-3', name: 'Saúde integral' },
      ],
      institutionalTexts: [
        {
          id: 'txt-1',
          label: 'Aviso anti-dinheiro',
          text: 'Sem pedidos financeiros.',
        },
      ],
      updatedAt: '2026-04-20T12:00:00.000Z',
    });

    render(
      <MemoryRouter>
        <AdminSettings />
      </MemoryRouter>,
    );

    expect(await screen.findByText('pix')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /templates/i })).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/nova palavra bloqueada/i), {
      target: { value: 'campanha' },
    });
    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }));

    fireEvent.click(screen.getByRole('button', { name: /categorias/i }));
    expect(await screen.findByText('Arte e Música')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /nova categoria/i }));
    fireEvent.change(screen.getByPlaceholderText(/nome da categoria/i), {
      target: { value: 'Saúde integral' },
    });
    fireEvent.click(screen.getByRole('button', { name: /criar categoria/i }));

    fireEvent.click(screen.getByRole('button', { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(updateSettingsMock).toHaveBeenCalledWith({
        blockedWords: ['pix', 'doacao', 'campanha'],
        rules: [
          {
            id: 'r1',
            label: 'Bloqueio em tempo real no chat',
            description: 'Impede termos financeiros.',
            enabled: true,
          },
        ],
        categories: [
          { id: 'cat-1', name: 'Arte e Música' },
          { id: 'cat-2', name: 'Convivência' },
          expect.objectContaining({ name: 'Saúde integral' }),
        ],
        institutionalTexts: [
          {
            id: 'txt-1',
            label: 'Aviso anti-dinheiro',
            text: 'Sem pedidos financeiros.',
          },
        ],
      });
    });

    expect(await screen.findByText(/configurações salvas com sucesso/i)).toBeInTheDocument();
  });
});
