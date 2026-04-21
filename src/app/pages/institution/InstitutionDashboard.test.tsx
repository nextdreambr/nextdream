import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InstitutionDashboard from './InstitutionDashboard';
import { institutionApi } from '../../lib/api';

const useAppMock = vi.fn();

vi.mock('../../context/AppContext', () => ({
  useApp: () => useAppMock(),
}));

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    institutionApi: {
      overview: vi.fn(),
      listPatients: vi.fn(),
      createPatient: vi.fn(),
      updatePatient: vi.fn(),
    },
  };
});

const overviewMock = vi.mocked(institutionApi.overview);

function buildOverview(overrides: Partial<Awaited<ReturnType<typeof institutionApi.overview>>> = {}) {
  return {
    managedPatients: 0,
    linkedPatients: 0,
    pendingAccessInvites: 0,
    dreams: 0,
    dreamsPublished: 0,
    dreamsInConversation: 0,
    proposals: 0,
    pendingProposals: 0,
    acceptedProposals: 0,
    activeConversations: 0,
    supporterConnections: 0,
    ...overrides,
  };
}

describe('InstitutionDashboard', () => {
  beforeEach(() => {
    overviewMock.mockReset();
    useAppMock.mockReset();
  });

  it('shows a pending approval state without loading operational metrics', () => {
    useAppMock.mockReturnValue({
      currentUser: {
        id: 'institution-1',
        name: 'Casa Esperanca',
        role: 'instituicao',
        approved: false,
      },
    });

    render(
      <MemoryRouter>
        <InstitutionDashboard />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: /conta em análise/i })).toBeInTheDocument();
    expect(overviewMock).not.toHaveBeenCalled();
  });

  it('loads institution metrics after approval', async () => {
    useAppMock.mockReturnValue({
      currentUser: {
        id: 'institution-1',
        name: 'Casa Esperanca',
        role: 'instituicao',
        approved: true,
      },
    });
    overviewMock.mockResolvedValue({
      managedPatients: 3,
      linkedPatients: 1,
      pendingAccessInvites: 1,
      dreams: 2,
      dreamsPublished: 2,
      dreamsInConversation: 1,
      proposals: 4,
      pendingProposals: 2,
      acceptedProposals: 2,
      activeConversations: 1,
      supporterConnections: 2,
    });

    render(
      <MemoryRouter>
        <InstitutionDashboard />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /pacientes acompanhados/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /propostas pendentes/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /apoiadores conectados/i })).toBeInTheDocument();
    });
  });

  it('reloads the overview when the approved institution account changes', async () => {
    overviewMock
      .mockResolvedValueOnce(buildOverview({
        managedPatients: 3,
        dreams: 2,
        proposals: 4,
        activeConversations: 1,
      }))
      .mockResolvedValueOnce(buildOverview({
        managedPatients: 5,
        dreams: 1,
        proposals: 2,
        activeConversations: 0,
      }));

    useAppMock.mockReturnValue({
      currentUser: {
        id: 'institution-1',
        name: 'Casa Esperanca',
        role: 'instituicao',
        approved: true,
      },
    });

    const view = render(
      <MemoryRouter>
        <InstitutionDashboard />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(overviewMock).toHaveBeenCalledTimes(1);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    useAppMock.mockReturnValue({
      currentUser: {
        id: 'institution-2',
        name: 'Outra Casa',
        role: 'instituicao',
        approved: true,
      },
    });

    view.rerender(
      <MemoryRouter>
        <InstitutionDashboard />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(overviewMock).toHaveBeenCalledTimes(2);
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });
});
