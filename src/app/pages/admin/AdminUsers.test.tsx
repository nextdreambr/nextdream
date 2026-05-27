import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminUsers from './AdminUsers';
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
      updateAdmin: vi.fn(),
      inviteAdmin: vi.fn(),
      listDreams: vi.fn(),
      updateDreamStatus: vi.fn(),
      listProposals: vi.fn(),
      updateProposalStatus: vi.fn(),
      listMessages: vi.fn(),
      listChats: vi.fn(),
      closeChat: vi.fn(),
      listReports: vi.fn(),
      updateReportStatus: vi.fn(),
      listAudit: vi.fn(),
      listEmailTemplates: vi.fn(),
      getSettings: vi.fn(),
      updateSettings: vi.fn(),
    },
  };
});

const listUsersMock = vi.mocked(adminApi.listUsers);
const getUserDetailMock = vi.mocked(adminApi.getUserDetail);
const updateUserMock = vi.mocked(adminApi.updateUser);
const resetUserPasswordMock = vi.mocked(adminApi.resetUserPassword);
const listReportsMock = vi.mocked(adminApi.listReports);
const listAuditMock = vi.mocked(adminApi.listAudit);

describe('AdminUsers', () => {
  beforeEach(() => {
    listUsersMock.mockReset();
    getUserDetailMock.mockReset();
    updateUserMock.mockReset();
    resetUserPasswordMock.mockReset();
    listReportsMock.mockReset();
    listAuditMock.mockReset();
    vi.restoreAllMocks();
    listReportsMock.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 100,
      total: 0,
      totalPages: 0,
    });
    listAuditMock.mockResolvedValue([]);
  });

  it('loads the master-detail workspace, saves edits and confirms reset-link delivery without exposing passwords', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    listUsersMock.mockResolvedValue({
      items: [
        {
          id: 'user-1',
          name: 'Casa Esperança',
          email: 'instituicao@example.com',
          role: 'instituicao',
          state: 'RJ',
          city: 'Niterói',
          locationLabel: 'Niterói, RJ',
          verified: true,
          approved: false,
          suspended: false,
          createdAt: '2026-04-18T10:00:00.000Z',
        },
      ],
      page: 1,
      pageSize: 10,
      total: 42,
      totalPages: 5,
    });
    getUserDetailMock.mockResolvedValue({
      id: 'user-1',
      name: 'Casa Esperança',
      email: 'instituicao@example.com',
      role: 'instituicao',
      state: 'RJ',
      city: 'Niterói',
      locationLabel: 'Niterói, RJ',
      verified: true,
      approved: false,
      suspended: false,
      createdAt: '2026-04-18T10:00:00.000Z',
      updatedAt: '2026-04-20T14:00:00.000Z',
      institutionType: 'Hospital filantrópico',
      institutionResponsibleName: 'Mariana Silva',
      institutionResponsiblePhone: '(11) 98888-0000',
      institutionDescription: 'Rede de apoio para casos crônicos.',
      activitySummary: {
        dreams: 3,
        proposalsReceived: 5,
        conversations: 2,
        activeConversations: 1,
        managedPatients: 4,
        linkedPatients: 2,
        supporterConnections: 3,
      },
      recentDreams: [
        {
          id: 'dream-1',
          title: 'Oficina de música',
          category: 'Convivência',
          status: 'publicado',
          urgency: 'media',
          updatedAt: '2026-04-20T14:00:00.000Z',
        },
      ],
      recentProposals: [
        {
          id: 'proposal-1',
          dreamId: 'dream-1',
          dreamTitle: 'Oficina de música',
          supporterId: 'supporter-1',
          supporterName: 'Apoiadora Luz',
          status: 'enviada',
          offering: 'Companhia',
          createdAt: '2026-04-20T15:00:00.000Z',
        },
      ],
      recentConversations: [
        {
          id: 'conversation-1',
          dreamId: 'dream-1',
          dreamTitle: 'Oficina de música',
          supporterId: 'supporter-1',
          supporterName: 'Apoiadora Luz',
          status: 'ativa',
          messageCount: 4,
          createdAt: '2026-04-20T16:00:00.000Z',
          lastMessageAt: '2026-04-20T16:30:00.000Z',
        },
      ],
    });
    updateUserMock.mockResolvedValue({
      id: 'user-1',
      name: 'Casa Esperança Atualizada',
      email: 'instituicao+editada@example.com',
      role: 'instituicao',
      state: 'PE',
      city: 'Recife',
      locationLabel: 'Recife, PE',
      verified: false,
      approved: true,
      suspended: false,
      createdAt: '2026-04-18T10:00:00.000Z',
      updatedAt: '2026-04-20T18:00:00.000Z',
      institutionType: 'ONG de acolhimento',
      institutionResponsibleName: 'Fernanda Costa',
      institutionResponsiblePhone: '(81) 97777-1111',
      institutionDescription: 'Atendimento humanizado com foco em autonomia.',
      activitySummary: {
        dreams: 3,
        proposalsReceived: 5,
        conversations: 2,
        activeConversations: 1,
        managedPatients: 4,
        linkedPatients: 2,
        supporterConnections: 3,
      },
      recentDreams: [],
      recentProposals: [],
      recentConversations: [],
    });
    resetUserPasswordMock.mockResolvedValue({
      id: 'user-1',
      mode: 'reset-link',
      delivery: 'email',
      email: 'instituicao@example.com',
      expiresAt: '2026-04-21T10:00:00.000Z',
    });

    render(
      <MemoryRouter>
        <AdminUsers />
      </MemoryRouter>,
    );

    await screen.findByText('Casa Esperança');
    expect(listUsersMock).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      query: '',
      role: '',
      status: '',
      approval: '',
      verification: '',
    });
    expect(screen.getByText('Exibindo 1–10 de 42')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/buscar por nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/aprovação/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/verificação/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: 'Casa' },
    });
    await waitFor(() => {
      expect(listUsersMock).toHaveBeenLastCalledWith(expect.objectContaining({ query: 'Casa', page: 1 }));
    });

    fireEvent.click(screen.getByRole('button', { name: /selecionar casa esperança/i }));

    await waitFor(() => expect(getUserDetailMock).toHaveBeenCalledWith('user-1'));
    expect(await screen.findByText(/ficha operacional/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hospital filantrópico')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Mariana Silva')).toBeInTheDocument();
    expect(screen.getByText(/propostas recebidas/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /propostas/i }));
    expect(screen.getAllByText(/Apoiadora Luz/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /visão geral/i }));

    fireEvent.change(screen.getByLabelText(/nome do usuário/i), {
      target: { value: 'Casa Esperança Atualizada' },
    });
    fireEvent.change(screen.getByLabelText(/e-mail da conta/i), {
      target: { value: 'instituicao+editada@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/estado/i), {
      target: { value: 'PE' },
    });
    fireEvent.change(screen.getByLabelText(/cidade/i), {
      target: { value: 'Recife' },
    });
    fireEvent.click(screen.getByLabelText(/conta verificada/i));
    fireEvent.click(screen.getByLabelText(/conta aprovada/i));
    fireEvent.change(screen.getByLabelText(/tipo da instituição/i), {
      target: { value: 'ONG de acolhimento' },
    });
    fireEvent.change(screen.getByLabelText(/responsável pela conta/i), {
      target: { value: 'Fernanda Costa' },
    });
    fireEvent.change(screen.getByLabelText(/telefone do responsável/i), {
      target: { value: '(81) 97777-1111' },
    });
    fireEvent.change(screen.getByLabelText(/descrição institucional/i), {
      target: { value: 'Atendimento humanizado com foco em autonomia.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(updateUserMock).toHaveBeenCalledWith('user-1', {
        name: 'Casa Esperança Atualizada',
        email: 'instituicao+editada@example.com',
        state: 'PE',
        city: 'Recife',
        verified: false,
        approved: true,
        institutionType: 'ONG de acolhimento',
        institutionResponsibleName: 'Fernanda Costa',
        institutionResponsiblePhone: '(81) 97777-1111',
        institutionDescription: 'Atendimento humanizado com foco em autonomia.',
      });
    });

    expect(await screen.findByText(/alterações salvas/i)).toBeInTheDocument();
    expect(screen.getAllByText('Casa Esperança Atualizada').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /enviar link de redefinição/i }));

    expect(await screen.findByText(/confirme a ação sensível/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /confirmar ação/i }));

    await waitFor(() => {
      expect(resetUserPasswordMock).toHaveBeenCalledWith('user-1', {
        mode: 'reset-link',
      });
    });

    expect(
      await screen.findByText(/link de redefinição enviado por e-mail para instituicao@example.com/i),
    ).toBeInTheDocument();
    expect(screen.queryByText('Temp#123456')).not.toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('renders role-specific sections so supporter details do not show institution-only fields', async () => {
    listUsersMock.mockResolvedValue({
      items: [
        {
          id: 'user-2',
          name: 'Lucas',
          email: 'lucas@example.com',
          role: 'apoiador',
          verified: true,
          approved: true,
          suspended: false,
          createdAt: '2026-04-18T10:00:00.000Z',
        },
      ],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    });
    getUserDetailMock.mockResolvedValue({
      id: 'user-2',
      name: 'Lucas',
      email: 'lucas@example.com',
      role: 'apoiador',
      verified: true,
      approved: true,
      suspended: false,
      createdAt: '2026-04-18T10:00:00.000Z',
      updatedAt: '2026-04-20T14:00:00.000Z',
      activitySummary: {
        proposalsSent: 2,
        conversations: 1,
        activeConversations: 1,
      },
      recentDreams: [],
      recentProposals: [],
      recentConversations: [],
    });

    render(
      <MemoryRouter>
        <AdminUsers />
      </MemoryRouter>,
    );

    await screen.findByText('Lucas');
    fireEvent.click(screen.getByRole('button', { name: /selecionar lucas/i }));

    await waitFor(() => expect(getUserDetailMock).toHaveBeenCalledWith('user-2'));
    expect(await screen.findByText(/ficha operacional/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/tipo da instituição/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/responsável pela conta/i)).not.toBeInTheDocument();
    expect(screen.getByText(/propostas enviadas/i)).toBeInTheDocument();
  });

  it('renders empty related tabs when the user detail contract omits relationship arrays', async () => {
    listUsersMock.mockResolvedValue({
      items: [
        {
          id: 'user-3',
          name: 'Ana Parcial',
          email: 'ana@example.com',
          role: 'paciente',
          verified: true,
          approved: true,
          suspended: false,
          createdAt: '2026-04-18T10:00:00.000Z',
        },
      ],
      page: 1,
      pageSize: 10,
      total: 1,
      totalPages: 1,
    });
    listReportsMock.mockResolvedValue({
      items: [
        {
          id: 'report-1',
          type: 'conteudo',
          targetType: 'chat',
          targetId: 'conversation-externa',
          reason: 'Sem vínculo com esta conta',
          status: 'aberto',
          severity: 'low',
          createdAt: '2026-04-20T14:00:00.000Z',
        },
      ],
      page: 1,
      pageSize: 100,
      total: 1,
      totalPages: 1,
    });
    getUserDetailMock.mockResolvedValue({
      id: 'user-3',
      name: 'Ana Parcial',
      email: 'ana@example.com',
      role: 'paciente',
      verified: true,
      approved: true,
      suspended: false,
      createdAt: '2026-04-18T10:00:00.000Z',
      updatedAt: '2026-04-20T14:00:00.000Z',
      activitySummary: {},
    } as never);

    render(
      <MemoryRouter>
        <AdminUsers />
      </MemoryRouter>,
    );

    await screen.findByText('Ana Parcial');
    fireEvent.click(screen.getByRole('button', { name: /selecionar ana parcial/i }));

    await waitFor(() => expect(getUserDetailMock).toHaveBeenCalledWith('user-3'));
    await waitFor(() => expect(screen.queryByText(/carregando ficha operacional/i)).not.toBeInTheDocument());
    expect(await screen.findByText(/ficha operacional/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /sonhos/i }));
    expect(screen.getByText(/nenhum sonho relacionado/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^conversas$/i }));
    expect(screen.getByText(/nenhuma conversa relacionada/i)).toBeInTheDocument();
  });

  it('keeps the user list stable when the API still returns the legacy array shape', async () => {
    listUsersMock.mockResolvedValue([
      {
        id: 'user-4',
        name: 'Formato Legado',
        email: 'legado@example.com',
        role: 'paciente',
        verified: true,
        approved: true,
        suspended: false,
        createdAt: '2026-04-18T10:00:00.000Z',
      },
    ] as never);

    render(
      <MemoryRouter>
        <AdminUsers />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Formato Legado')).toBeInTheDocument();
    expect(screen.getByText('Exibindo 1–1 de 1')).toBeInTheDocument();
  });
});
