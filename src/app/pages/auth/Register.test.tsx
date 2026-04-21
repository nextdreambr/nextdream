import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Register from './Register';
import { authApi } from '../../lib/api';

const navigateMock = vi.fn();
const loginMock = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');

  return {
    ...actual,
    useNavigate: () => navigateMock,
    useSearchParams: () => [new URLSearchParams()],
    useLocation: () => ({ state: null }),
  };
});

vi.mock('../../context/AppContext', () => ({
  useApp: () => ({
    login: loginMock,
  }),
}));

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      register: vi.fn(),
    },
  };
});

const registerMock = vi.mocked(authApi.register);

describe('Register', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    loginMock.mockReset();
    registerMock.mockReset();
  });

  it('submits institution registration with dedicated institution fields and redirects to the institution dashboard', async () => {
    registerMock.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: 'institution-1',
        name: 'Casa Esperanca',
        email: 'casa@example.com',
        role: 'instituicao',
        state: 'PE',
        city: 'Recife',
        locationLabel: 'Recife, PE',
        institutionResponsibleName: 'Ana Souza',
        institutionResponsiblePhone: '(81) 99999-0000',
        institutionType: 'ONG',
        institutionDescription: 'Acolhimento e cuidado humanizado.',
        verified: true,
        approved: false,
      },
    });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /hospital \/ ong/i }));

    expect(screen.queryByLabelText(/nome completo/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta institucional/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/nome da instituição/i), { target: { value: 'Casa Esperanca' } });
    fireEvent.change(screen.getByLabelText(/nome do responsável/i), { target: { value: 'Ana Souza' } });
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'casa@example.com' } });
    fireEvent.change(screen.getByLabelText(/tipo da instituição/i), { target: { value: 'ONG' } });
    fireEvent.change(screen.getByLabelText(/telefone ou whatsapp do responsável/i), { target: { value: '(81) 99999-0000' } });
    fireEvent.change(screen.getByLabelText(/descrição curta da instituição/i), { target: { value: 'Acolhimento e cuidado humanizado.' } });
    fireEvent.change(screen.getByLabelText(/estado \(opcional\)/i), { target: { value: 'PE' } });
    fireEvent.change(screen.getByLabelText(/cidade \(opcional\)/i), { target: { value: 'Recife' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'Secret123!' } });
    fireEvent.click(screen.getByLabelText(/li e aceito os/i));
    fireEvent.click(screen.getByRole('button', { name: /criar conta institucional/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        name: 'Casa Esperanca',
        email: 'casa@example.com',
        password: 'Secret123!',
        role: 'instituicao',
        institutionResponsibleName: 'Ana Souza',
        institutionType: 'ONG',
        institutionResponsiblePhone: '(81) 99999-0000',
        institutionDescription: 'Acolhimento e cuidado humanizado.',
        state: 'PE',
        city: 'Recife',
      });
    });

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalledWith('/instituicao/dashboard');
    });
  });
});
