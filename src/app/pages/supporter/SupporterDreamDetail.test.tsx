import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SupporterDreamDetail from './SupporterDreamDetail';
import { dreamsApi, proposalsApi } from '../../lib/api';
import { SANDBOX_PROFILE_STORAGE_PREFIX } from '../../lib/sandboxProfileState';

const navigateMock = vi.fn();
const useAppMock = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ id: 'dream-1' }),
  };
});

vi.mock('../../context/AppContext', () => ({
  useApp: () => useAppMock(),
}));

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    dreamsApi: {
      ...actual.dreamsApi,
      getById: vi.fn(),
      createProposal: vi.fn(),
    },
    proposalsApi: {
      ...actual.proposalsApi,
      listMine: vi.fn(),
    },
  };
});

const getByIdMock = vi.mocked(dreamsApi.getById);
const listMineMock = vi.mocked(proposalsApi.listMine);

describe('SupporterDreamDetail', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    useAppMock.mockReset();
    getByIdMock.mockReset();
    listMineMock.mockReset();
    window.sessionStorage.clear();

    useAppMock.mockReturnValue({
      currentUser: {
        id: 'supporter-1',
        role: 'apoiador',
      },
    });

    getByIdMock.mockResolvedValue({
      id: 'dream-1',
      title: 'Sessão de violão no parque',
      description: 'Um encontro musical ao ar livre.',
      category: 'Arte e Música',
      format: 'presencial',
      urgency: 'alta',
      privacy: 'publico',
      status: 'publicado',
      patientId: 'patient-1',
      patientName: 'Ana',
      patientCity: 'Recife, PE',
      createdAt: '2026-04-20T10:00:00.000Z',
      updatedAt: '2026-04-20T10:00:00.000Z',
    });
    listMineMock.mockResolvedValue([]);
  });

  it('records the opened dream in the sandbox session history for the supporter profile', async () => {
    render(
      <MemoryRouter>
        <SupporterDreamDetail />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Sessão de violão no parque')).toBeInTheDocument();

    await waitFor(() => {
      expect(window.sessionStorage.getItem(`${SANDBOX_PROFILE_STORAGE_PREFIX}supporter-1`)).toContain(
        '"title":"Sessão de violão no parque"',
      );
    });
    expect(window.sessionStorage.getItem(`${SANDBOX_PROFILE_STORAGE_PREFIX}supporter-1`)).toContain(
      '"path":"/apoiador/sonhos/dream-1"',
    );
  });
});
