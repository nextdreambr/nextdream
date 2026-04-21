import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InstitutionProfile from './InstitutionProfile';
import { institutionApi, notificationsApi } from '../../lib/api';

const useAppMock = vi.fn();
const updateCurrentUserMock = vi.fn();

vi.mock('../../context/AppContext', () => ({
  useApp: () => useAppMock(),
}));

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    institutionApi: {
      ...actual.institutionApi,
      overview: vi.fn(),
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
      changePassword: vi.fn(),
    },
    notificationsApi: {
      ...actual.notificationsApi,
      getPreferences: vi.fn(),
      updatePreferences: vi.fn(),
    },
  };
});

const getProfileMock = vi.mocked(institutionApi.getProfile);
const overviewMock = vi.mocked(institutionApi.overview);
const updateProfileMock = vi.mocked(institutionApi.updateProfile);
const changePasswordMock = vi.mocked(institutionApi.changePassword);
const getPreferencesMock = vi.mocked(notificationsApi.getPreferences);
const updatePreferencesMock = vi.mocked(notificationsApi.updatePreferences);

describe('InstitutionProfile', () => {
  beforeEach(() => {
    useAppMock.mockReset();
    updateCurrentUserMock.mockReset();
    getProfileMock.mockReset();
    overviewMock.mockReset();
    updateProfileMock.mockReset();
    changePasswordMock.mockReset();
    getPreferencesMock.mockReset();
    updatePreferencesMock.mockReset();

    useAppMock.mockReturnValue({
      currentUser: {
        id: 'institution-1',
        name: 'Casa Esperanca',
        email: 'casa@example.com',
        role: 'instituicao',
        approved: true,
        state: 'PE',
        city: 'Recife',
        locationLabel: 'Recife, PE',
        verified: true,
        institutionType: 'ONG',
        institutionDescription: 'Acolhimento e acompanhamento humanizado.',
        emailNotificationsEnabled: true,
      },
      updateCurrentUser: updateCurrentUserMock,
    });
  });

  it('updates institution profile data, notification preferences and password', async () => {
    getProfileMock.mockResolvedValue({
      id: 'institution-1',
      name: 'Casa Esperanca',
      email: 'casa@example.com',
      role: 'instituicao',
      approved: true,
      approvedAt: '2026-04-18T10:00:00.000Z',
      verified: true,
      state: 'PE',
      city: 'Recife',
      locationLabel: 'Recife, PE',
      institutionType: 'ONG',
      institutionDescription: 'Acolhimento e acompanhamento humanizado.',
      emailNotificationsEnabled: true,
      createdAt: '2026-04-18T10:00:00.000Z',
      updatedAt: '2026-04-18T10:00:00.000Z',
    });
    overviewMock.mockResolvedValue({
      managedPatients: 4,
      dreams: 3,
      proposals: 5,
      activeConversations: 1,
    });
    getPreferencesMock.mockResolvedValue({ emailEnabled: true });
    updateProfileMock.mockResolvedValue({
      id: 'institution-1',
      name: 'Casa Esperanca Atualizada',
      email: 'casa-atualizada@example.com',
      role: 'instituicao',
      approved: true,
      approvedAt: '2026-04-18T10:00:00.000Z',
      verified: true,
      state: 'PE',
      city: 'Olinda',
      locationLabel: 'Olinda, PE',
      institutionType: 'Hospital',
      institutionDescription: 'Atendimento social e clínico integrado.',
      emailNotificationsEnabled: true,
      createdAt: '2026-04-18T10:00:00.000Z',
      updatedAt: '2026-04-19T10:00:00.000Z',
    });
    updatePreferencesMock.mockResolvedValue({ emailEnabled: false });
    changePasswordMock.mockResolvedValue({ ok: true });

    render(
      <MemoryRouter>
        <InstitutionProfile />
      </MemoryRouter>,
    );

    expect(await screen.findByDisplayValue('Casa Esperanca')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/nome da instituição/i), { target: { value: 'Casa Esperanca Atualizada' } });
    fireEvent.change(screen.getByLabelText(/e-mail institucional/i), { target: { value: 'casa-atualizada@example.com' } });
    fireEvent.change(screen.getByLabelText(/tipo institucional/i), { target: { value: 'Hospital' } });
    fireEvent.change(screen.getByLabelText(/estado/i), { target: { value: 'PE' } });
    fireEvent.change(screen.getByLabelText(/^cidade/i), { target: { value: 'Olinda' } });
    fireEvent.change(screen.getByLabelText(/descrição institucional/i), { target: { value: 'Atendimento social e clínico integrado.' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar dados institucionais/i }));

    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledWith({
        name: 'Casa Esperanca Atualizada',
        email: 'casa-atualizada@example.com',
        state: 'PE',
        city: 'Olinda',
        institutionType: 'Hospital',
        institutionDescription: 'Atendimento social e clínico integrado.',
      });
    });

    fireEvent.click(screen.getByRole('switch', { name: /receber notificações por e-mail/i }));

    await waitFor(() => {
      expect(updatePreferencesMock).toHaveBeenCalledWith({ emailEnabled: false });
    });

    fireEvent.change(screen.getByLabelText(/senha atual/i), { target: { value: 'Secret123!' } });
    fireEvent.change(screen.getByLabelText(/nova senha/i), { target: { value: 'NovaSenha123!' } });
    fireEvent.click(screen.getByRole('button', { name: /atualizar senha/i }));

    await waitFor(() => {
      expect(changePasswordMock).toHaveBeenCalledWith({
        currentPassword: 'Secret123!',
        newPassword: 'NovaSenha123!',
      });
    });
  });
});
