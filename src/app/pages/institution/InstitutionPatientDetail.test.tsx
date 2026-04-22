import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InstitutionPatientDetail from './InstitutionPatientDetail';
import { institutionApi } from '../../lib/api';

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useParams: () => ({ managedPatientId: 'managed-1' }),
  };
});

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    institutionApi: {
      ...actual.institutionApi,
      getPatient: vi.fn(),
      updatePatient: vi.fn(),
      createPatientAccessInvite: vi.fn(),
    },
  };
});

const getPatientMock = vi.mocked(institutionApi.getPatient);
const updatePatientMock = vi.mocked(institutionApi.updatePatient);
const createPatientAccessInviteMock = vi.mocked(institutionApi.createPatientAccessInvite);

describe('InstitutionPatientDetail', () => {
  beforeEach(() => {
    getPatientMock.mockReset();
    updatePatientMock.mockReset();
    createPatientAccessInviteMock.mockReset();
  });

  it('lets the institution update patient data from the patient detail page', async () => {
    getPatientMock.mockResolvedValue({
      patient: {
        id: 'managed-1',
        institutionId: 'institution-1',
        linkedUserId: 'user-1',
        linkedUserEmail: 'paciente@example.com',
        accessStatus: 'ativo',
        name: 'Maria das Dores',
        state: 'PE',
        city: 'Recife',
        locationLabel: 'Recife, PE',
        caseSummary: 'Rotina marcada por fadiga no fim do dia e preferência por encontros em ambiente calmo.',
        supportContext: 'A família consegue acompanhar aos fins de semana, mas precisa de apoio para deslocamentos curtos.',
        careFocus: 'Experiências curtas, acolhedoras e com planejamento simples.',
        createdAt: '2026-04-19T10:00:00.000Z',
        updatedAt: '2026-04-19T10:00:00.000Z',
      },
      summary: {
        dreams: 2,
        proposals: 3,
        activeConversations: 1,
      },
      dreams: [],
      proposals: [],
      conversations: [],
      timeline: [
        {
          id: 'timeline-1',
          type: 'sonho',
          title: 'Sonho publicado com apoio da instituição',
          description: 'A equipe registrou um novo desejo e abriu a busca por apoiadores.',
          createdAt: '2026-04-19T09:00:00.000Z',
        },
      ],
    });
    updatePatientMock.mockResolvedValue({
      id: 'managed-1',
      institutionId: 'institution-1',
      linkedUserId: 'user-1',
      linkedUserEmail: 'paciente@example.com',
      accessStatus: 'ativo',
      name: 'Maria Clara',
      state: 'PE',
      city: 'Olinda',
      locationLabel: 'Olinda, PE',
      createdAt: '2026-04-19T10:00:00.000Z',
      updatedAt: '2026-04-19T11:00:00.000Z',
    });

    render(
      <MemoryRouter>
        <InstitutionPatientDetail />
      </MemoryRouter>,
    );

    expect(await screen.findByDisplayValue('Maria das Dores')).toBeInTheDocument();
    expect(screen.getByText(/rotina marcada por fadiga no fim do dia/i)).toBeInTheDocument();
    expect(screen.getByText(/sonho publicado com apoio da instituição/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/nome do paciente/i), { target: { value: 'Maria Clara' } });
    fireEvent.change(screen.getByLabelText(/cidade/i), { target: { value: 'Olinda' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar dados do paciente/i }));

    await waitFor(() => {
      expect(updatePatientMock).toHaveBeenCalledWith('managed-1', {
        name: 'Maria Clara',
        state: 'PE',
        city: 'Olinda',
      });
    });
  });

  it('renders the case view even when the API response omits timeline', async () => {
    getPatientMock.mockResolvedValue({
      patient: {
        id: 'managed-1',
        institutionId: 'institution-1',
        accessStatus: 'sem-acesso',
        name: 'Miguel Assistido',
        state: 'PE',
        city: 'Recife',
        locationLabel: 'Recife, PE',
        createdAt: '2026-04-19T10:00:00.000Z',
        updatedAt: '2026-04-19T10:00:00.000Z',
      },
      summary: {
        dreams: 2,
        proposals: 2,
        activeConversations: 1,
      },
      dreams: [
        {
          id: 'dream-1',
          title: 'Dia de oficinas de pintura',
          category: 'Arte',
          status: 'publicado',
          urgency: 'media',
          updatedAt: '2026-04-21T11:44:00.000Z',
        },
      ],
      proposals: [],
      conversations: [],
    });

    render(
      <MemoryRouter>
        <InstitutionPatientDetail />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Miguel Assistido')).toBeInTheDocument();
    expect(screen.getByText(/ainda não há eventos registrados para este caso/i)).toBeInTheDocument();
  });
});
