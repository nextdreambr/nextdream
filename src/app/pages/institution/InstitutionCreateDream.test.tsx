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

  it('uses the patient wizard flow before saving institution dream changes', async () => {
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
    expect(screen.queryByText(/imagem de capa/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/o que você precisa\?/i)).not.toBeInTheDocument();
    expect(screen.getAllByText('Conte seu sonho').length).toBeGreaterThan(0);
    expect(screen.getByText('Preferências')).toBeInTheDocument();
    expect(screen.getByText('Privacidade')).toBeInTheDocument();
    expect(screen.getByText('Revisar e publicar')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/título do sonho/i), { target: { value: 'Oficina de musica e pintura' } });
    fireEvent.change(screen.getByLabelText(/descreva seu sonho/i), { target: { value: 'Uma tarde artística mediada pela instituição.' } });
    fireEvent.click(screen.getByRole('button', { name: /alta/i }));
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    expect(screen.getByRole('heading', { name: /preferências de apoio/i })).toBeInTheDocument();
    expect(screen.queryByText(/dias preferidos/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/cidade \/ região/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/restrições ou necessidades especiais/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^idioma$/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /ambos/i }));
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    expect(screen.getByRole('heading', { name: /configurações de privacidade/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /somente verificados/i }));
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    expect(screen.getByRole('heading', { name: /revisar e publicar/i })).toBeInTheDocument();
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

  it('does not auto-select the first patient when editing a legacy dream without managedPatientId', async () => {
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
      {
        id: 'managed-2',
        institutionId: 'institution-1',
        name: 'João Batista',
        state: 'PE',
        city: 'Olinda',
        locationLabel: 'Olinda, PE',
        createdAt: '2026-04-19T10:00:00.000Z',
        updatedAt: '2026-04-19T10:00:00.000Z',
      },
    ]);
    getDreamByIdMock.mockResolvedValue({
      id: 'dream-legacy',
      title: 'Sonho legado sem beneficiário',
      description: 'Cadastro legado que ainda não aponta para um beneficiário gerido.',
      category: 'Arte e Música',
      format: 'presencial',
      urgency: 'media',
      privacy: 'publico',
      status: 'publicado',
      patientId: 'institution-1',
      managedPatientId: undefined,
      managedByInstitution: false,
      patientName: 'Casa Esperanca',
      patientCity: 'Recife, PE',
      institutionName: undefined,
      createdAt: '2026-04-19T10:00:00.000Z',
      updatedAt: '2026-04-19T10:00:00.000Z',
    });

    render(
      <MemoryRouter>
        <InstitutionCreateDream />
      </MemoryRouter>,
    );

    expect(await screen.findByDisplayValue('Sonho legado sem beneficiário')).toBeInTheDocument();
    expect(screen.getByLabelText(/paciente acompanhado/i)).toHaveValue('');
    expect(screen.queryByText(/beneficiário do caso/i)).not.toBeInTheDocument();
  });
});
