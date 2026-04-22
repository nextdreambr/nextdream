import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PatientProfile from './PatientProfile';
import { dreamsApi, notificationsApi, proposalsApi } from '../../lib/api';

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
    notificationsApi: {
      ...actual.notificationsApi,
      getPreferences: vi.fn(),
      updatePreferences: vi.fn(),
    },
  };
});

const listMineMock = vi.mocked(dreamsApi.listMine);
const listReceivedMock = vi.mocked(proposalsApi.listReceived);
const getPreferencesMock = vi.mocked(notificationsApi.getPreferences);

describe('PatientProfile', () => {
  beforeEach(() => {
    useAppMock.mockReset();
    logoutMock.mockReset();
    listMineMock.mockReset();
    listReceivedMock.mockReset();
    getPreferencesMock.mockReset();
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
    getPreferencesMock.mockResolvedValue({ emailEnabled: true });
  });

  it('turns profile sections into sandbox flows and persists privacy preferences per user', async () => {
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
    expect(window.sessionStorage.getItem('nextdream.sandbox.profile.patient-1')).toContain('"showCity":false');

    fireEvent.click(screen.getByRole('button', { name: /histórico/i }));
    expect(screen.getByText(/histórico desta sessão/i)).toBeInTheDocument();
    expect(screen.getByText(/ver o mar com minha irmã/i)).toBeInTheDocument();
    expect(screen.getByText(/lucas enviou uma proposta aceita/i)).toBeInTheDocument();
  });
});
