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
      dreams: 2,
      proposals: 4,
      activeConversations: 1,
    });

    render(
      <MemoryRouter>
        <InstitutionDashboard />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /pacientes acompanhados/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /propostas recebidas/i })).toBeInTheDocument();
    });
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});
