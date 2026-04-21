import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InstitutionCreateDream from './InstitutionCreateDream';
import { dreamsApi, institutionApi } from '../../lib/api';

const navigateMock = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ id: 'dream-1' }),
  };
});

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    institutionApi: {
      ...actual.institutionApi,
      listPatients: vi.fn(),
    },
    dreamsApi: {
      ...actual.dreamsApi,
      getById: vi.fn(),
      update: vi.fn(),
    },
  };
});

const listPatientsMock = vi.mocked(institutionApi.listPatients);
const getDreamByIdMock = vi.mocked(dreamsApi.getById);
const updateDreamMock = vi.mocked(dreamsApi.update);

describe('InstitutionCreateDream', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    listPatientsMock.mockReset();
    getDreamByIdMock.mockReset();
    updateDreamMock.mockReset();
  });

  it('loads existing dream data and updates it in edit mode', async () => {
    listPatientsMock.mockResolvedValue([
      {
        id: 'managed-1',
        institutionId: 'institution-1',
        name: 'Maria das Dores',
        state: 'PE',
        city: 'Recife',
        locationLabel: 'Recife, PE',
        createdAt: '2026-04-19T10:00:00.000Z',
        updatedAt: '2026-04-19T10:00:00.000Z',
      },
    ]);
    getDreamByIdMock.mockResolvedValue({
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
      patientName: 'Maria das Dores',
      patientCity: 'Recife, PE',
      institutionName: 'Casa Esperanca',
      createdAt: '2026-04-19T10:00:00.000Z',
      updatedAt: '2026-04-19T10:00:00.000Z',
    });
    updateDreamMock.mockResolvedValue({
      id: 'dream-1',
      title: 'Oficina de musica e pintura',
      description: 'Uma tarde artística mediada pela instituição.',
      category: 'Arte e Música',
      format: 'ambos',
      urgency: 'alta',
      privacy: 'verificados',
      status: 'publicado',
      patientId: 'managed-1',
      managedPatientId: 'managed-1',
      managedByInstitution: true,
      patientName: 'Maria das Dores',
      patientCity: 'Recife, PE',
      institutionName: 'Casa Esperanca',
      createdAt: '2026-04-19T10:00:00.000Z',
      updatedAt: '2026-04-19T10:10:00.000Z',
    });

    render(
      <MemoryRouter>
        <InstitutionCreateDream />
      </MemoryRouter>,
    );

    expect(await screen.findByDisplayValue('Oficina de musica suave')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/título do sonho/i), { target: { value: 'Oficina de musica e pintura' } });
    fireEvent.change(screen.getByLabelText(/descrição/i), { target: { value: 'Uma tarde artística mediada pela instituição.' } });
    fireEvent.change(screen.getByLabelText(/formato/i), { target: { value: 'ambos' } });
    fireEvent.change(screen.getByLabelText(/urgência/i), { target: { value: 'alta' } });
    fireEvent.change(screen.getByLabelText(/privacidade/i), { target: { value: 'verificados' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar alterações/i }));

    await waitFor(() => {
      expect(updateDreamMock).toHaveBeenCalledWith('dream-1', expect.objectContaining({
        title: 'Oficina de musica e pintura',
        format: 'ambos',
        urgency: 'alta',
        privacy: 'verificados',
      }));
    });
  });
});
