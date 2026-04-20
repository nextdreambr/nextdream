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

  it('submits institution registration and redirects to the institution dashboard', async () => {
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
    fireEvent.change(screen.getByLabelText(/nome completo/i), { target: { value: 'Casa Esperanca' } });
    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'casa@example.com' } });
    fireEvent.change(screen.getByLabelText(/estado \(opcional\)/i), { target: { value: 'PE' } });
    fireEvent.change(screen.getByLabelText(/cidade \(opcional\)/i), { target: { value: 'Recife' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'Secret123!' } });
    fireEvent.click(screen.getByLabelText(/li e aceito os/i));
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        name: 'Casa Esperanca',
        email: 'casa@example.com',
        password: 'Secret123!',
        role: 'instituicao',
        state: 'PE',
        city: 'Recife',
      });
    });

    expect(loginMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/instituicao/dashboard');
  });
});
