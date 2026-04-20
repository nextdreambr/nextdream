import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InstitutionPatients from './InstitutionPatients';
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
      listPatientsPage: vi.fn(),
      createPatient: vi.fn(),
      updatePatient: vi.fn(),
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
      changePassword: vi.fn(),
    },
  };
});

const listPatientsPageMock = vi.mocked(institutionApi.listPatientsPage);
const createPatientMock = vi.mocked(institutionApi.createPatient);
const updatePatientMock = vi.mocked(institutionApi.updatePatient);

describe('InstitutionPatients', () => {
  beforeEach(() => {
    useAppMock.mockReset();
    listPatientsPageMock.mockReset();
    createPatientMock.mockReset();
    updatePatientMock.mockReset();

    useAppMock.mockReturnValue({
      currentUser: {
        id: 'institution-1',
        name: 'Casa Esperanca',
        role: 'instituicao',
        approved: true,
      },
      updateCurrentUser: vi.fn(),
    });
  });

  it('creates, edits and paginates managed patients', async () => {
    listPatientsPageMock.mockResolvedValueOnce({
      items: [],
      page: 1,
      pageSize: 2,
      total: 0,
      totalPages: 1,
    });
    createPatientMock.mockResolvedValue({
      id: 'managed-1',
      institutionId: 'institution-1',
      name: 'Maria das Dores',
      state: 'PE',
      city: 'Recife',
      locationLabel: 'Recife, PE',
      createdAt: '2026-04-18T10:00:00.000Z',
      updatedAt: '2026-04-18T10:00:00.000Z',
    });
    listPatientsPageMock.mockResolvedValueOnce({
      items: [{
        id: 'managed-1',
        institutionId: 'institution-1',
        name: 'Maria das Dores',
        state: 'PE',
        city: 'Recife',
        locationLabel: 'Recife, PE',
        createdAt: '2026-04-18T10:00:00.000Z',
        updatedAt: '2026-04-18T10:00:00.000Z',
      }],
      page: 1,
      pageSize: 2,
      total: 3,
      totalPages: 2,
    });
    updatePatientMock.mockResolvedValue({
      id: 'managed-1',
      institutionId: 'institution-1',
      name: 'Maria das Dores Atualizada',
      state: 'PE',
      city: 'Olinda',
      locationLabel: 'Olinda, PE',
      createdAt: '2026-04-18T10:00:00.000Z',
      updatedAt: '2026-04-18T10:05:00.000Z',
    });
    listPatientsPageMock.mockResolvedValueOnce({
      items: [{
        id: 'managed-1',
        institutionId: 'institution-1',
        name: 'Maria das Dores Atualizada',
        state: 'PE',
        city: 'Olinda',
        locationLabel: 'Olinda, PE',
        createdAt: '2026-04-18T10:00:00.000Z',
        updatedAt: '2026-04-18T10:05:00.000Z',
      }],
      page: 1,
      pageSize: 2,
      total: 3,
      totalPages: 2,
    });
    listPatientsPageMock.mockResolvedValueOnce({
      items: [{
        id: 'managed-2',
        institutionId: 'institution-1',
        name: 'Jose Carlos',
        state: 'PE',
        city: 'Paulista',
        locationLabel: 'Paulista, PE',
        createdAt: '2026-04-18T10:10:00.000Z',
        updatedAt: '2026-04-18T10:10:00.000Z',
      }],
      page: 2,
      pageSize: 2,
      total: 3,
      totalPages: 2,
    });

    render(
      <MemoryRouter>
        <InstitutionPatients />
      </MemoryRouter>,
    );

    await screen.findByText(/nenhum paciente acompanhado ainda/i);

    fireEvent.change(screen.getByLabelText(/nome do paciente/i), { target: { value: 'Maria das Dores' } });

    const stateSelect = screen.getByLabelText(/estado/i);
    const citySelect = screen.getByLabelText(/^cidade/i) as HTMLSelectElement;

    expect(citySelect.disabled).toBe(true);

    fireEvent.change(stateSelect, { target: { value: 'PE' } });
    expect(citySelect.disabled).toBe(false);
    fireEvent.change(citySelect, { target: { value: 'Recife' } });
    fireEvent.click(screen.getByRole('button', { name: /adicionar paciente/i }));

    await waitFor(() => {
      expect(createPatientMock).toHaveBeenCalledWith({
        name: 'Maria das Dores',
        state: 'PE',
        city: 'Recife',
      });
    });

    expect(await screen.findByText('Maria das Dores')).toBeInTheDocument();
    expect(screen.getByText('Recife, PE')).toBeInTheDocument();

    expect(screen.getByRole('textbox', { name: /buscar pacientes/i })).toBeInTheDocument();
    expect(screen.getByText(/página 1 de 2/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /editar maria das dores/i }));
    fireEvent.change(screen.getByLabelText(/nome do paciente/i), { target: { value: 'Maria das Dores Atualizada' } });
    fireEvent.change(screen.getByLabelText(/^estado$/i), { target: { value: 'PE' } });
    fireEvent.change(screen.getByLabelText(/^cidade/i), { target: { value: 'Olinda' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar edição/i }));

    await waitFor(() => {
      expect(updatePatientMock).toHaveBeenCalledWith('managed-1', {
        name: 'Maria das Dores Atualizada',
        state: 'PE',
        city: 'Olinda',
      });
    });

    expect(await screen.findByText('Maria das Dores Atualizada')).toBeInTheDocument();
    expect(screen.getByText('Olinda, PE')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: /próxima página/i }));

    await waitFor(() => {
      expect(listPatientsPageMock).toHaveBeenLastCalledWith({
        page: 2,
        pageSize: 2,
        query: '',
      });
    });
  });

  it('blocks programmatic submit when the location is incomplete', async () => {
    listPatientsPageMock.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 2,
      total: 0,
      totalPages: 1,
    });

    render(
      <MemoryRouter>
        <InstitutionPatients />
      </MemoryRouter>,
    );

    await screen.findByText(/nenhum paciente acompanhado ainda/i);

    fireEvent.change(screen.getByLabelText(/nome do paciente/i), { target: { value: 'Maria das Dores' } });
    fireEvent.change(screen.getByLabelText(/^estado$/i), { target: { value: 'PE' } });

    fireEvent.submit(screen.getByRole('button', { name: /adicionar paciente/i }).closest('form') as HTMLFormElement);

    expect(createPatientMock).not.toHaveBeenCalled();
    expect(screen.getByText(/preencha estado e cidade juntos ou deixe ambos em branco/i)).toBeInTheDocument();
  });
});
