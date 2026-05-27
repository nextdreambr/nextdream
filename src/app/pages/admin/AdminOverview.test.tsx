import { act, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminOverview from './AdminOverview';
import { adminApi } from '../../lib/api';

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    adminApi: {
      ...actual.adminApi,
      overview: vi.fn(),
    },
  };
});

const overviewMock = vi.mocked(adminApi.overview);

function operationalOverview() {
  return {
    totalUsers: 12,
    totalDreams: 7,
    totalProposals: 9,
    totalChats: 4,
    totalReportsOpen: 3,
    generatedAt: '2026-05-17T12:00:00.000Z',
    environment: 'test',
    systemStatus: {
      api: 'online',
      email: 'smtp',
      dataMode: 'database',
    },
    workQueues: {
      reportsOpen: 3,
      institutionsPendingApproval: 2,
      chatsWithModeration: 1,
      contactMessagesNew: 4,
      dreamsPaused: 5,
      proposalsInReview: 6,
    },
    health: {
      activeChats: 3,
      closedChats: 1,
      backlog: 16,
      usersByRole: {
        paciente: 4,
        apoiador: 5,
        instituicao: 2,
        admin: 1,
      },
      dreamsByStatus: {
        publicado: 3,
        pausado: 5,
      },
      proposalsByStatus: {
        enviada: 2,
        'em-analise': 6,
      },
    },
    riskCare: {
      moderatedMessages: 8,
      suspendedUsersRecent: 2,
      recurringReportedTargets: [
        {
          targetType: 'chat',
          targetId: 'chat-1',
          count: 3,
        },
      ],
    },
    recent: {
      auditLogs: [
        {
          id: 'audit-1',
          action: 'Status de denúncia alterado',
          by: 'Admin Root',
          target: 'report-1',
          type: 'denuncia',
          severity: 'media',
          outcome: 'ok',
          details: 'Triagem concluída.',
          refPath: '/admin/denuncias',
          refId: 'report-1',
          date: '2026-05-17T11:00:00.000Z',
        },
      ],
      reports: [
        {
          id: 'report-1',
          type: 'chat-moderation',
          targetType: 'chat',
          targetId: 'chat-1',
          reason: 'Conversa sinalizada para revisão.',
          status: 'aberto',
          createdAt: '2026-05-17T10:00:00.000Z',
        },
      ],
      moderatedChats: [
        {
          id: 'chat-1',
          dreamId: 'dream-1',
          dreamTitle: 'Oficina de música assistida',
          patientName: 'Paciente Melodia',
          supporterId: 'supporter-1',
          supporterName: 'Apoiadora Luz',
          status: 'ativa',
          messageCount: 3,
          lastMessageAt: '2026-05-17T10:30:00.000Z',
          createdAt: '2026-05-17T10:00:00.000Z',
          hasModeratedMessages: true,
          hasModerationReport: true,
          lastModerationAt: '2026-05-17T10:15:00.000Z',
        },
      ],
      adminInvites: [
        {
          id: 'invite-1',
          email: 'novo-admin@example.com',
          expiresAt: '2026-05-24T10:00:00.000Z',
        },
      ],
    },
  } as Awaited<ReturnType<typeof adminApi.overview>>;
}

describe('AdminOverview', () => {
  beforeEach(() => {
    overviewMock.mockReset();
  });

  it('shows a loading state instead of zeroed metrics while the operational overview is pending', () => {
    overviewMock.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <AdminOverview />
      </MemoryRouter>,
    );

    expect(screen.getByText(/carregando filas administrativas/i)).toBeInTheDocument();
    expect(screen.queryByText(/^0$/)).not.toBeInTheDocument();
  });

  it('renders actionable queues, risk signals and recent activity from the overview contract', async () => {
    overviewMock.mockResolvedValue(operationalOverview());

    render(
      <MemoryRouter>
        <AdminOverview />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: /operação admin/i })).toBeInTheDocument();
    expect(screen.getByText(/instituições pendentes/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/chats com moderação/i)).toBeInTheDocument();
    expect(screen.getByText(/conteúdo financeiro bloqueado/i)).toBeInTheDocument();
    expect(screen.getByText(/oficina de música assistida/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /abrir denúncias/i })).toHaveAttribute('href', '/admin/denuncias');
  });

  it('keeps the previous data visible when a refresh fails', async () => {
    overviewMock.mockResolvedValueOnce(operationalOverview());

    render(
      <MemoryRouter>
        <AdminOverview />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/instituições pendentes/i)).toBeInTheDocument();

    overviewMock.mockRejectedValueOnce(new Error('Falha de rede'));
    await act(async () => {
      window.dispatchEvent(new Event('nextdream:admin-overview-refresh'));
    });

    expect(await screen.findByText(/não foi possível carregar métricas administrativas/i)).toBeInTheDocument();
    expect(screen.getByText(/instituições pendentes/i)).toBeInTheDocument();
  });
});
