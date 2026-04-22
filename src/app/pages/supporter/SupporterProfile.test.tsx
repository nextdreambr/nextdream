import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SupporterProfile from './SupporterProfile';
import { conversationsApi, notificationsApi, proposalsApi } from '../../lib/api';
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
    proposalsApi: {
      ...actual.proposalsApi,
      listMine: vi.fn(),
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

const listMineMock = vi.mocked(proposalsApi.listMine);
const listConversationsMock = vi.mocked(conversationsApi.listMine);
const getPreferencesMock = vi.mocked(notificationsApi.getPreferences);
const listNotificationsMock = vi.mocked(notificationsApi.listMine);

describe('SupporterProfile', () => {
  beforeEach(() => {
    useAppMock.mockReset();
    logoutMock.mockReset();
    listMineMock.mockReset();
    listConversationsMock.mockReset();
    getPreferencesMock.mockReset();
    listNotificationsMock.mockReset();
    window.sessionStorage.clear();

    useAppMock.mockReturnValue({
      currentUser: {
        id: 'supporter-1',
        name: 'Bruno Apoiador',
        email: 'bruno@example.com',
        role: 'apoiador',
        verified: true,
        approved: true,
        city: 'Olinda',
        locationLabel: 'Olinda, PE',
      },
      logout: logoutMock,
    });

    window.sessionStorage.setItem(
      `${SANDBOX_PROFILE_STORAGE_PREFIX}supporter-1`,
      JSON.stringify({
        historyFilter: 'todos',
        visitedDreams: [
          {
            dreamId: 'dream-visitado',
            title: 'Oficina de pintura com vista para o jardim',
            path: '/apoiador/sonhos/dream-visitado',
            visitedAt: '2026-04-20T10:00:00.000Z',
          },
        ],
      }),
    );

    listMineMock.mockResolvedValue([
      {
        id: 'proposal-1',
        dreamId: 'dream-aceito',
        dreamTitle: 'Serenata para a varanda',
        supporterId: 'supporter-1',
        patientName: 'Ana',
        message: 'Posso levar voz e violão.',
        offering: 'Serenata',
        availability: 'Sexta',
        duration: '1 hora',
        status: 'aceita',
        createdAt: '2026-04-19T11:00:00.000Z',
      },
    ]);
    listConversationsMock.mockResolvedValue([
      {
        id: 'conversation-1',
        dreamId: 'dream-aceito',
        dreamTitle: 'Serenata para a varanda',
        dreamPath: '/apoiador/sonhos/dream-aceito',
        patientId: 'patient-1',
        supporterId: 'supporter-1',
        patientName: 'Ana',
        status: 'ativa',
        createdAt: '2026-04-19T12:00:00.000Z',
      },
    ]);
    getPreferencesMock.mockResolvedValue({ emailEnabled: true });
    listNotificationsMock.mockResolvedValue([
      {
        id: 'notification-1',
        type: 'aceito',
        title: 'Proposta aceita',
        message: 'Sua proposta para "Serenata para a varanda" foi aceita.',
        actionPath: '/apoiador/chat?conversationId=conversation-1',
        read: false,
        createdAt: '2026-04-19T13:00:00.000Z',
      },
    ]);
  });

  it('persists sandbox privacy/security settings and keeps supporter history actionable', async () => {
    render(
      <MemoryRouter>
        <SupporterProfile />
      </MemoryRouter>,
    );

    await screen.findByText(/propostas enviadas/i);

    fireEvent.click(screen.getByRole('button', { name: /segurança/i }));
    expect(screen.getByText(/segurança no sandbox/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/nova senha de demonstração/i), {
      target: { value: 'NovaSenha123!' },
    });
    fireEvent.click(screen.getByRole('switch', { name: /checklist de conversa segura revisado/i }));
    fireEvent.click(screen.getByRole('button', { name: /salvar segurança/i }));

    await waitFor(() => {
      expect(screen.getByText(/ajustes de segurança salvos no sandbox/i)).toBeInTheDocument();
    });
    expect(window.sessionStorage.getItem(`${SANDBOX_PROFILE_STORAGE_PREFIX}supporter-1`)).toContain('"demoPasswordDraft":"NovaSenha123!"');
    expect(window.sessionStorage.getItem(`${SANDBOX_PROFILE_STORAGE_PREFIX}supporter-1`)).toContain('"safetyChecklist":false');

    fireEvent.click(screen.getByRole('button', { name: /visão geral/i }));
    expect(screen.getByText(/use as seções abaixo para simular preferências do apoiador/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /histórico/i }));
    expect(screen.getByText(/histórico desta sessão/i)).toBeInTheDocument();
    expect(screen.getByText(/oficina de pintura com vista para o jardim/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /sua proposta para "serenata para a varanda" foi aceita/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/conversa ativa sobre "serenata para a varanda"/i)).toBeInTheDocument();
    expect(screen.getByText(/^proposta aceita$/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^visitas$/i }));
    expect(screen.getByText(/oficina de pintura com vista para o jardim/i)).toBeInTheDocument();
    expect(screen.queryByText(/conversa ativa sobre "serenata para a varanda"/i)).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem(`${SANDBOX_PROFILE_STORAGE_PREFIX}supporter-1`)).toContain('"historyFilter":"visitas"');
  });
});
