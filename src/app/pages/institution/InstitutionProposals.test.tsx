import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InstitutionProposals from './InstitutionProposals';
import { proposalsApi } from '../../lib/api';

const navigateMock = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    proposalsApi: {
      ...actual.proposalsApi,
      listReceivedPage: vi.fn(),
      reject: vi.fn(),
    },
  };
});

const listReceivedPageMock = vi.mocked(proposalsApi.listReceivedPage);
const rejectProposalMock = vi.mocked(proposalsApi.reject);

describe('InstitutionProposals', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    listReceivedPageMock.mockReset();
    rejectProposalMock.mockReset();
  });

  it('uses real rejection and paginated proposal loading', async () => {
    listReceivedPageMock.mockResolvedValueOnce({
      items: [{
        id: 'proposal-1',
        dreamId: 'dream-1',
        dreamTitle: 'Oficina de musica suave',
        supporterId: 'supporter-1',
        supporterName: 'Apoiador Um',
        message: 'Posso conduzir a oficina.',
        offering: 'Atividade musical guiada',
        availability: 'Quartas à tarde',
        duration: '90 minutos',
        status: 'enviada',
        createdAt: '2026-04-19T10:00:00.000Z',
      }],
      page: 1,
      pageSize: 6,
      total: 1,
      totalPages: 1,
    });
    rejectProposalMock.mockResolvedValue({
      id: 'proposal-1',
      dreamId: 'dream-1',
      dreamTitle: 'Oficina de musica suave',
      supporterId: 'supporter-1',
      supporterName: 'Apoiador Um',
      message: 'Posso conduzir a oficina.',
      offering: 'Atividade musical guiada',
      availability: 'Quartas à tarde',
      duration: '90 minutos',
      status: 'recusada',
      createdAt: '2026-04-19T10:00:00.000Z',
    });
    listReceivedPageMock.mockResolvedValueOnce({
      items: [{
        id: 'proposal-1',
        dreamId: 'dream-1',
        dreamTitle: 'Oficina de musica suave',
        supporterId: 'supporter-1',
        supporterName: 'Apoiador Um',
        message: 'Posso conduzir a oficina.',
        offering: 'Atividade musical guiada',
        availability: 'Quartas à tarde',
        duration: '90 minutos',
        status: 'recusada',
        createdAt: '2026-04-19T10:00:00.000Z',
      }],
      page: 1,
      pageSize: 6,
      total: 1,
      totalPages: 1,
    });

    render(
      <MemoryRouter>
        <InstitutionProposals />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Apoiador Um')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/buscar propostas/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /recusar proposta de apoiador um/i }));

    await waitFor(() => {
      expect(rejectProposalMock).toHaveBeenCalledWith('proposal-1');
    });
  });
});
