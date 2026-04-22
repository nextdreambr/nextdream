import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientProfile from './PatientProfile';
import { conversationsApi, dreamsApi, notificationsApi, proposalsApi } from '../../lib/api';
import { SANDBOX_PROFILE_STORAGE_PREFIX } from '../../lib/sandboxProfileState';

const useAppMock = vi.fn();
const logoutMock = vi.fn();

vi.mock('../../context/AppContext', () => ({
  useApp: () => useAppMock(),
}));

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    dreamsApi: {
      ...actual.dreamsApi,
      listMine: vi.fn(),
    },
    proposalsApi: {
      ...actual.proposalsApi,
      listReceived: vi.fn(),
    },
    conversationsApi: {
      ...actual.conversationsApi,
      listMine: vi.fn(),
    },
    notificationsApi: {
      ...actual.notificationsApi,
      getPreferences: vi.fn(),
      listMine: vi.fn(),
      updatePreferences: vi.fn(),
    },
  };
});

const listMineMock = vi.mocked(dreamsApi.listMine);
const listReceivedMock = vi.mocked(proposalsApi.listReceived);
const listConversationsMock = vi.mocked(conversationsApi.listMine);
const getPreferencesMock = vi.mocked(notificationsApi.getPreferences);
const listNotificationsMock = vi.mocked(notificationsApi.listMine);

describe('PatientProfile', () => {
  beforeEach(() => {
    useAppMock.mockReset();
    logoutMock.mockReset();
    listMineMock.mockReset();
    listReceivedMock.mockReset();
    listConversationsMock.mockReset();
    getPreferencesMock.mockReset();
    listNotificationsMock.mockReset();
    window.sessionStorage.clear();

    useAppMock.mockReturnValue({
      currentUser: {
        id: 'patient-1',
        name: 'Ana Paciente',
        email: 'ana@example.com',
        role: 'paciente',
        verified: true,
        approved: true,
        city: 'Recife',
        locationLabel: 'Recife, PE',
      },
      logout: logoutMock,
    });

    listMineMock.mockResolvedValue([
      {
        id: 'dream-1',
        title: 'Ver o mar com minha irmã',
        description: 'Um passeio calmo ao entardecer.',
        category: 'Experiência ao ar livre',
        format: 'presencial',
        urgency: 'media',
        privacy: 'publico',
        status: 'em-conversa',
        patientId: 'patient-1',
        canEdit: true,
        createdAt: '2026-04-18T10:00:00.000Z',
        updatedAt: '2026-04-19T10:00:00.000Z',
      },
      {
        id: 'dream-2',
        title: 'Receber uma roda de música em casa',
        description: 'Gostaria de um encontro musical com amigos.',
        category: 'Arte e Música',
        format: 'presencial',
        urgency: 'baixa',
        privacy: 'publico',
        status: 'publicado',
        patientId: 'patient-1',
        canEdit: true,
        createdAt: '2026-04-16T10:00:00.000Z',
        updatedAt: '2026-04-17T10:00:00.000Z',
      },
    ]);
    listReceivedMock.mockResolvedValue([
      {
        id: 'proposal-1',
        dreamId: 'dream-1',
        dreamTitle: 'Ver o mar com minha irmã',
        supporterId: 'supporter-1',
        supporterName: 'Lucas',
        message: 'Posso acompanhar esse passeio com cuidado.',
        offering: 'Companhia',
        availability: 'Sábado à tarde',
        duration: '3 horas',
        status: 'aceita',
        createdAt: '2026-04-19T11:00:00.000Z',
      },
    ]);
    listConversationsMock.mockResolvedValue([
      {
        id: 'conversation-1',
        dreamId: 'dream-1',
        dreamTitle: 'Ver o mar com minha irmã',
        dreamPath: '/paciente/sonhos/editar/dream-1',
        patientId: 'patient-1',
        supporterId: 'supporter-1',
        patientName: 'Ana Paciente',
        status: 'ativa',
        createdAt: '2026-04-19T12:00:00.000Z',
      },
    ]);
    getPreferencesMock.mockResolvedValue({ emailEnabled: true });
    listNotificationsMock.mockResolvedValue([
      {
        id: 'notification-1',
        type: 'mensagem',
        title: 'Nova mensagem no chat',
        message: 'Lucas respondeu no chat do sonho "Ver o mar com minha irmã".',
        actionPath: '/paciente/chat?conversationId=conversation-1',
        read: false,
        createdAt: '2026-04-19T13:00:00.000Z',
      },
    ]);
  });

  it('turns profile sections into sandbox flows and persists privacy, security and history preferences per user', async () => {
    render(
      <MemoryRouter>
        <PatientProfile />
      </MemoryRouter>,
    );

    const recentDreamLink = await screen.findByRole('link', { name: /ver o mar com minha irmã/i });
    expect(recentDreamLink).toHaveAttribute('href', '/paciente/sonhos/editar/dream-1');

    fireEvent.click(screen.getByRole('button', { name: /privacidade/i }));
    expect(screen.getByText(/privacidade no sandbox/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('switch', { name: /mostrar cidade no perfil/i }));
    fireEvent.click(screen.getByRole('button', { name: /salvar preferências/i }));

    await waitFor(() => {
      expect(screen.getByText(/preferências salvas no sandbox/i)).toBeInTheDocument();
    });
    expect(window.sessionStorage.getItem(`${SANDBOX_PROFILE_STORAGE_PREFIX}patient-1`)).toContain('"showCity":false');

    fireEvent.click(screen.getByRole('button', { name: /visão geral/i }));
    expect(screen.getByText(/use as seções abaixo para simular ajustes de privacidade/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /segurança/i }));
    fireEvent.click(screen.getByRole('switch', { name: /checklist de segurança revisado/i }));
    fireEvent.click(screen.getByRole('button', { name: /salvar segurança/i }));

    await waitFor(() => {
      expect(screen.getByText(/ajustes de segurança salvos no sandbox/i)).toBeInTheDocument();
    });
    expect(window.sessionStorage.getItem(`${SANDBOX_PROFILE_STORAGE_PREFIX}patient-1`)).toContain('"safetyChecklist":true');

    fireEvent.click(screen.getByRole('button', { name: /histórico/i }));
    expect(screen.getByText(/histórico desta sessão/i)).toBeInTheDocument();
    expect(screen.getByText(/lucas enviou uma proposta aceita/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /conversa ativa sobre "ver o mar com minha irmã"/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/nova mensagem no chat/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^conversas$/i }));
    expect(
      screen.getByRole('link', { name: /conversa ativa sobre "ver o mar com minha irmã"/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/nova mensagem no chat/i)).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem(`${SANDBOX_PROFILE_STORAGE_PREFIX}patient-1`)).toContain('"historyFilter":"conversas"');
  });
});
