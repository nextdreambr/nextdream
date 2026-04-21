import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InstitutionDreams from './InstitutionDreams';
import { dreamsApi } from '../../lib/api';

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    dreamsApi: {
      ...actual.dreamsApi,
      listMinePage: vi.fn(),
    },
  };
});

const listMinePageMock = vi.mocked(dreamsApi.listMinePage);

describe('InstitutionDreams', () => {
  beforeEach(() => {
    listMinePageMock.mockReset();
  });

  it('renders paginated dreams with an edit link', async () => {
    listMinePageMock.mockResolvedValue({
      items: [{
        id: 'dream-1',
        title: 'Oficina de musica suave',
        description: 'Uma tarde musical mediada pela instituição.',
        category: 'Arte e Música',
        format: 'presencial',
        urgency: 'media',
        privacy: 'publico',
        status: 'publicado',
        patientId: 'managed-1',
        managedPatientId: 'managed-1',
        managedByInstitution: true,
        institutionName: 'Casa Esperanca',
        patientName: 'Maria das Dores',
        patientCity: 'Recife, PE',
        createdAt: '2026-04-19T10:00:00.000Z',
        updatedAt: '2026-04-19T10:00:00.000Z',
      }],
      page: 1,
      pageSize: 6,
      total: 1,
      totalPages: 1,
    });

    render(
      <MemoryRouter>
        <InstitutionDreams />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Oficina de musica suave')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/buscar sonhos/i)).toBeInTheDocument();
    expect(screen.getByText(/página 1 de 1/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /editar sonho oficina de musica suave/i })).toHaveAttribute(
      'href',
      '/instituicao/sonhos/editar/dream-1',
    );
  });
});
