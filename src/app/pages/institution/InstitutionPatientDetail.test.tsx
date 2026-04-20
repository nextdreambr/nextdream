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
});
