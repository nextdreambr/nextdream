import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminChats from './AdminChats';
import AdminDreamDetailPage from './AdminDreamDetailPage';
import AdminDreams from './AdminDreams';
import AdminProposalDetailPage from './AdminProposalDetailPage';
import AdminProposals from './AdminProposals';
import AdminReportDetailPage from './AdminReportDetailPage';
import AdminReports from './AdminReports';
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
      listEmailTemplates: vi.fn(),
    },
  };
});

const listDreamsMock = vi.mocked(adminApi.listDreams);
const getDreamDetailMock = vi.mocked(adminApi.getDreamDetail);
const listProposalsMock = vi.mocked(adminApi.listProposals);
const getProposalDetailMock = vi.mocked(adminApi.getProposalDetail);
const listChatsMock = vi.mocked(adminApi.listChats);
const getChatDetailMock = vi.mocked(adminApi.getChatDetail);
const listReportsMock = vi.mocked(adminApi.listReports);
const getReportDetailMock = vi.mocked(adminApi.getReportDetail);
const listAuditMock = vi.mocked(adminApi.listAudit);

describe('Admin operational pages', () => {
  beforeEach(() => {
    listDreamsMock.mockReset();
    getDreamDetailMock.mockReset();
    listProposalsMock.mockReset();
    getProposalDetailMock.mockReset();
    listChatsMock.mockReset();
    getChatDetailMock.mockReset();
    listReportsMock.mockReset();
    getReportDetailMock.mockReset();
    listAuditMock.mockReset();
    listAuditMock.mockResolvedValue([]);
  });

  it('renders the paginated dreams screen with filters and a dedicated detail route', async () => {
    listDreamsMock.mockResolvedValue({
      items: [
        {
          id: 'dream-1',
          title: 'Oficina de música assistida',
          category: 'Convivência',
          format: 'presencial',
          urgency: 'alta',
          privacy: 'verificados',
          status: 'publicado',
          patientName: 'Paciente Melodia',
          institutionName: 'Instituto Harmonia',
          city: 'Niterói',
          state: 'RJ',
          locationLabel: 'Niterói, RJ',
          proposalCount: 2,
          chatCount: 1,
          reportCount: 1,
          createdAt: '2026-04-20T10:00:00.000Z',
          updatedAt: '2026-04-20T12:00:00.000Z',
        },
      ],
      page: 1,
      pageSize: 10,
      total: 32,
      totalPages: 4,
    });
    getDreamDetailMock.mockResolvedValue({
      id: 'dream-1',
      title: 'Oficina de música assistida',
      description: 'Sessão com instrumentos leves e apoio emocional.',
      category: 'Convivência',
      format: 'presencial',
      urgency: 'alta',
      privacy: 'verificados',
      status: 'publicado',
      patientName: 'Paciente Melodia',
      institutionName: 'Instituto Harmonia',
      city: 'Niterói',
      state: 'RJ',
      locationLabel: 'Niterói, RJ',
      proposalCount: 1,
      chatCount: 1,
      reportCount: 1,
      relatedProposals: [
        {
          id: 'proposal-1',
          supporterName: 'Apoiadora Luz',
          offering: 'Vivência musical',
          status: 'enviada',
          createdAt: '2026-04-20T14:00:00.000Z',
        },
      ],
      linkedConversation: {
        id: 'chat-1',
        dreamId: 'dream-1',
        dreamTitle: 'Oficina de música assistida',
        patientName: 'Paciente Melodia',
        institutionName: 'Instituto Harmonia',
        supporterId: 'supporter-1',
        supporterName: 'Apoiadora Luz',
        status: 'ativa',
        messageCount: 2,
        lastMessageAt: '2026-04-20T15:00:00.000Z',
        createdAt: '2026-04-20T13:00:00.000Z',
        hasModeratedMessages: true,
        hasModerationReport: true,
        lastModerationAt: '2026-04-20T14:50:00.000Z',
        latestMessages: [],
        moderationReports: [],
      },
      relatedReports: [
        {
          id: 'report-1',
          type: 'dream-review',
          targetType: 'dream',
          targetId: 'dream-1',
          reason: 'Revisar conteúdo sensível antes de nova publicação.',
          status: 'aberto',
          severity: 'medium',
          entityLabel: 'Oficina de música assistida',
          createdAt: '2026-04-20T16:00:00.000Z',
        },
      ],
      createdAt: '2026-04-20T10:00:00.000Z',
      updatedAt: '2026-04-20T12:00:00.000Z',
    });

    render(
      <MemoryRouter initialEntries={['/admin/sonhos']}>
        <Routes>
          <Route path="/admin/sonhos" element={<AdminDreams />} />
          <Route path="/admin/sonhos/:dreamId" element={<AdminDreamDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect((await screen.findAllByText('Oficina de música assistida')).length).toBeGreaterThan(0);
    expect(screen.getByText('Exibindo 1–10 de 32')).toBeInTheDocument();
    expect(screen.getByText(/Niterói, RJ/i)).toBeInTheDocument();
    expect(screen.getByText(/1 denúncia/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/com denúncia/i), {
      target: { value: 'true' },
    });
    fireEvent.change(screen.getByLabelText(/propostas/i), {
      target: { value: 'with' },
    });
    fireEvent.change(screen.getByLabelText(/cidade ou estado/i), {
      target: { value: 'Niterói' },
    });

    await waitFor(() => {
      expect(listDreamsMock).toHaveBeenLastCalledWith(expect.objectContaining({
        report: 'true',
        proposal: 'with',
        location: 'Niterói',
      }));
    });

    fireEvent.change(screen.getByLabelText(/itens por página/i), {
      target: { value: '20' },
    });

    await waitFor(() => {
      expect(listDreamsMock).toHaveBeenCalledWith(expect.objectContaining({ pageSize: 20 }));
    });

    fireEvent.click(screen.getByRole('link', { name: /abrir sonho oficina de música assistida/i }));

    expect(await screen.findByRole('heading', { name: 'Oficina de música assistida' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getAllByText(/sessão com instrumentos leves/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /propostas/i }));
    expect(screen.getByText(/Apoiadora Luz/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /denúncias/i }));
    expect(screen.getByText(/Revisar conteúdo sensível/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /moderação/i }));
    expect(screen.getByText(/ações sensíveis/i)).toBeInTheDocument();
  });

  it('renders the paginated proposals screen with risk context and a dedicated detail route', async () => {
    listProposalsMock.mockResolvedValue({
      items: [
        {
          id: 'proposal-1',
          dreamId: 'dream-1',
          dreamTitle: 'Oficina de música assistida',
          supporterId: 'supporter-1',
          supporterName: 'Apoiadora Luz',
          patientName: 'Paciente Melodia',
          institutionName: 'Instituto Harmonia',
          status: 'enviada',
          message: 'Posso conduzir uma vivência musical de 90 minutos.',
          offering: 'Vivência musical',
          availability: 'Quartas à tarde',
          duration: '90 minutos',
          locationLabel: 'Niterói, RJ',
          conversationId: 'chat-1',
          conversationStatus: 'ativa',
          reportCount: 1,
          riskLevel: 'high',
          createdAt: '2026-04-20T14:00:00.000Z',
          updatedAt: '2026-04-20T15:00:00.000Z',
        },
      ],
      page: 1,
      pageSize: 10,
      total: 28,
      totalPages: 3,
    });
    getProposalDetailMock.mockResolvedValue({
      id: 'proposal-1',
      dreamId: 'dream-1',
      dreamTitle: 'Oficina de música assistida',
      dreamStatus: 'publicado',
      supporterId: 'supporter-1',
      supporterName: 'Apoiadora Luz',
      supporterEmail: 'apoiadora-luz@example.com',
      patientName: 'Paciente Melodia',
      institutionName: 'Instituto Harmonia',
      status: 'enviada',
      message: 'Posso conduzir uma vivência musical de 90 minutos.',
      offering: 'Vivência musical',
      availability: 'Quartas à tarde',
      duration: '90 minutos',
      locationLabel: 'Niterói, RJ',
      conversationId: 'chat-1',
      conversationStatus: 'ativa',
      reportCount: 1,
      riskLevel: 'high',
      relatedConversation: {
        id: 'chat-1',
        dreamId: 'dream-1',
        dreamTitle: 'Oficina de música assistida',
        patientName: 'Paciente Melodia',
        institutionName: 'Instituto Harmonia',
        supporterId: 'supporter-1',
        supporterName: 'Apoiadora Luz',
        status: 'ativa',
        messageCount: 2,
        lastMessageAt: '2026-04-20T15:00:00.000Z',
        createdAt: '2026-04-20T13:00:00.000Z',
        hasModeratedMessages: true,
        hasModerationReport: true,
        lastModerationAt: '2026-04-20T14:50:00.000Z',
        latestMessages: [],
        moderationReports: [],
      },
      relatedReports: [
        {
          id: 'report-1',
          type: 'chat-moderation',
          targetType: 'chat',
          targetId: 'chat-1',
          reason: 'Conversa vinculada sinalizada para revisão.',
          status: 'aberto',
          severity: 'high',
          entityLabel: 'Oficina de música assistida',
          createdAt: '2026-04-20T16:00:00.000Z',
        },
      ],
      createdAt: '2026-04-20T14:00:00.000Z',
      updatedAt: '2026-04-20T15:00:00.000Z',
    });

    render(
      <MemoryRouter initialEntries={['/admin/propostas']}>
        <Routes>
          <Route path="/admin/propostas" element={<AdminProposals />} />
          <Route path="/admin/propostas/:proposalId" element={<AdminProposalDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect((await screen.findAllByText('Oficina de música assistida')).length).toBeGreaterThan(0);
    expect(screen.getByText('Exibindo 1–10 de 28')).toBeInTheDocument();
    expect(screen.getByText(/Apoiadora Luz/i)).toBeInTheDocument();
    expect(screen.getByText(/Conversa ativa/i)).toBeInTheDocument();
    expect(screen.getByText(/1 denúncia/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/com conversa/i), {
      target: { value: 'true' },
    });
    fireEvent.change(screen.getByLabelText(/com denúncia/i), {
      target: { value: 'true' },
    });
    fireEvent.change(screen.getByLabelText(/risco/i), {
      target: { value: 'high' },
    });
    fireEvent.change(screen.getByLabelText(/sonho relacionado/i), {
      target: { value: 'música' },
    });

    await waitFor(() => {
      expect(listProposalsMock).toHaveBeenLastCalledWith(expect.objectContaining({
        conversation: 'true',
        report: 'true',
        risk: 'high',
        dream: 'música',
      }));
    });

    fireEvent.change(screen.getByLabelText(/itens por página/i), {
      target: { value: '20' },
    });

    await waitFor(() => {
      expect(listProposalsMock).toHaveBeenCalledWith(expect.objectContaining({ pageSize: 20 }));
    });

    fireEvent.click(screen.getByRole('link', { name: /abrir proposta de apoiadora luz/i }));

    expect(await screen.findByRole('heading', { name: 'Proposta de Apoiadora Luz' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText(/Posso conduzir uma vivência musical/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /conversa/i })[0]);
    expect(screen.getByText(/Conversa relacionada/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /denúncias/i })[0]);
    expect(screen.getByText(/Conversa vinculada sinalizada/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /moderação/i }));
    expect(screen.getByText(/ações sensíveis/i)).toBeInTheDocument();
  });

  it('keeps the chat list visible and opens the moderation detail in a persistent panel', async () => {
    listChatsMock.mockResolvedValue({
      items: [
        {
          id: 'chat-1',
          dreamId: 'dream-1',
          dreamTitle: 'Oficina de música assistida',
          patientName: 'Paciente Melodia',
          institutionName: 'Instituto Harmonia',
          supporterId: 'supporter-1',
          supporterName: 'Apoiadora Luz',
          status: 'ativa',
        messageCount: 3,
        lastMessageAt: '2026-04-20T15:00:00.000Z',
        lastMessagePreview: 'Mensagem sinalizada para revisão manual.',
        createdAt: '2026-04-20T13:00:00.000Z',
        hasModeratedMessages: true,
        hasModerationReport: true,
        lastModerationAt: '2026-04-20T14:50:00.000Z',
      },
      ],
      page: 1,
      pageSize: 10,
      total: 42,
      totalPages: 5,
    });
    getChatDetailMock.mockResolvedValue({
      id: 'chat-1',
      dreamId: 'dream-1',
      dreamTitle: 'Oficina de música assistida',
      patientName: 'Paciente Melodia',
      institutionName: 'Instituto Harmonia',
      supporterId: 'supporter-1',
      supporterName: 'Apoiadora Luz',
      status: 'ativa',
      messageCount: 3,
      lastMessageAt: '2026-04-20T15:00:00.000Z',
      lastMessagePreview: 'Mensagem sinalizada para revisão manual.',
      createdAt: '2026-04-20T13:00:00.000Z',
      hasModeratedMessages: true,
      hasModerationReport: true,
      lastModerationAt: '2026-04-20T14:50:00.000Z',
      latestMessages: [
        {
          id: 'message-2',
          senderId: 'patient-1',
          senderName: 'Paciente Melodia',
          body: 'Resposta operacional da instituição.',
          moderated: false,
          createdAt: '2026-04-20T15:00:00.000Z',
        },
        {
          id: 'message-1',
          senderId: 'supporter-1',
          senderName: 'Apoiadora Luz',
          body: 'Mensagem sinalizada para revisão manual.',
          moderated: true,
          createdAt: '2026-04-20T14:50:00.000Z',
        },
      ],
      moderationReports: [
        {
          id: 'report-1',
          type: 'chat',
          reason: 'Conversa sinalizada após moderação automática.',
          status: 'aberto',
          createdAt: '2026-04-20T14:55:00.000Z',
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={['/admin/chats']}>
        <Routes>
          <Route path="/admin/chats" element={<AdminChats />} />
          <Route path="/admin/chats/:chatId" element={<AdminChats />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText(/risco alto/i)).toBeInTheDocument();
    expect(screen.getByText('Exibindo 1–10 de 42')).toBeInTheDocument();
    expect(screen.getByText(/Mensagem sinalizada para revisão manual/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/^status$/i), {
      target: { value: 'ativa' },
    });
    fireEvent.change(screen.getByLabelText(/com denúncia/i), {
      target: { value: 'true' },
    });
    fireEvent.change(screen.getByLabelText(/risco/i), {
      target: { value: 'high' },
    });
    fireEvent.change(screen.getByLabelText(/tempo sem resposta/i), {
      target: { value: '24h' },
    });
    fireEvent.change(screen.getByLabelText(/entidade relacionada/i), {
      target: { value: 'Harmonia' },
    });

    await waitFor(() => {
      expect(listChatsMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: 'ativa',
          report: 'true',
          risk: 'high',
          unanswered: '24h',
          entity: 'Harmonia',
        }),
      );
    });

    fireEvent.click(screen.getByRole('button', { name: /oficina de música assistida/i }));

    expect(await screen.findByRole('heading', { name: 'Oficina de música assistida' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText(/conversa sinalizada após moderação automática/i)).toBeInTheDocument();
    expect(screen.getByText(/ações sensíveis/i)).toBeInTheDocument();

    const conversationRegion = screen.getByRole('region', { name: /mensagens do chat/i });
    const olderMessage = within(conversationRegion).getByText(/mensagem sinalizada para revisão manual/i);
    const newerMessage = within(conversationRegion).getByText(/resposta operacional da instituição/i);
    expect(olderMessage.compareDocumentPosition(newerMessage) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders the reports command center with severity, pagination, filters and a dedicated detail route', async () => {
    listReportsMock.mockResolvedValue({
      items: [
        {
          id: 'report-1',
          type: 'chat-moderation',
          targetType: 'chat',
          targetId: 'chat-1',
          reason: 'Conversa sinalizada após moderação automática.',
          status: 'aberto',
          severity: 'high',
          entityLabel: 'Oficina de música assistida',
          createdAt: '2026-04-20T14:55:00.000Z',
          updatedAt: '2026-04-20T14:55:00.000Z',
          targetSummary: {
            chatId: 'chat-1',
            dreamTitle: 'Oficina de música assistida',
            patientName: 'Paciente Melodia',
            supporterName: 'Apoiadora Luz',
          },
        },
      ],
      page: 1,
      pageSize: 10,
      total: 24,
      totalPages: 3,
    });
    getReportDetailMock.mockResolvedValue({
      id: 'report-1',
      type: 'chat-moderation',
      targetType: 'chat',
      targetId: 'chat-1',
      reason: 'Conversa sinalizada após moderação automática.',
      status: 'aberto',
      severity: 'high',
      entityLabel: 'Oficina de música assistida',
      createdAt: '2026-04-20T14:55:00.000Z',
      updatedAt: '2026-04-20T14:55:00.000Z',
      targetSummary: {
        chatId: 'chat-1',
        dreamTitle: 'Oficina de música assistida',
        patientName: 'Paciente Melodia',
        supporterName: 'Apoiadora Luz',
        hasModeratedMessages: true,
      },
    });

    render(
      <MemoryRouter initialEntries={['/admin/denuncias']}>
        <Routes>
          <Route path="/admin/denuncias" element={<AdminReports />} />
          <Route path="/admin/denuncias/:reportId" element={<AdminReportDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText(/risco alto/i)).toBeInTheDocument();
    expect(screen.getByText('Exibindo 1–10 de 24')).toBeInTheDocument();
    expect(screen.getByText(/Oficina de música assistida/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/status/i), {
      target: { value: 'em-analise' },
    });
    fireEvent.change(screen.getByLabelText(/severidade/i), {
      target: { value: 'high' },
    });
    fireEvent.change(screen.getByLabelText(/tipo da denúncia/i), {
      target: { value: 'chat-moderation' },
    });
    fireEvent.change(screen.getByLabelText(/tipo de alvo/i), {
      target: { value: 'chat' },
    });
    fireEvent.change(screen.getByLabelText(/entidade relacionada/i), {
      target: { value: 'Oficina' },
    });

    await waitFor(() => {
      expect(listReportsMock).toHaveBeenLastCalledWith(expect.objectContaining({
        status: 'em-analise',
        severity: 'high',
        type: 'chat-moderation',
        targetType: 'chat',
        entity: 'Oficina',
      }));
    });

    fireEvent.click(screen.getByRole('link', { name: /abrir denúncia report-1/i }));

    expect(await screen.findByRole('heading', { name: /denúncia chat-moderation/i })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText(/paciente melodia/i)).toBeInTheDocument();
    expect(screen.getByText(/ações sensíveis/i)).toBeInTheDocument();
  });
});
