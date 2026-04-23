import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './Login';
import { ApiError, authApi } from '../../lib/api';

const navigateMock = vi.fn();
const loginMock = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');

  return {
    ...actual,
    useNavigate: () => navigateMock,
    useSearchParams: () => [new URLSearchParams('tipo=instituicao')],
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
      login: vi.fn(),
    },
  };
});

const authLoginMock = vi.mocked(authApi.login);

describe('Login', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    loginMock.mockReset();
    authLoginMock.mockReset();
  });

  it('redirects an institution account to the institution dashboard after login', async () => {
    authLoginMock.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: 'institution-1',
        name: 'Casa Esperanca',
        email: 'casa@example.com',
        role: 'instituicao',
        city: 'Recife',
        verified: true,
        approved: false,
      },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText(/seu@email.com/i), { target: { value: 'casa@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'Secret123!' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(authLoginMock).toHaveBeenCalledWith({
        email: 'casa@example.com',
        password: 'Secret123!',
      });
    });

    expect(loginMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/instituicao/dashboard');
  });

  it('shows activation guidance when the backend blocks login for an unverified account', async () => {
    authLoginMock.mockRejectedValue(new ApiError('Email verification is required before login', 401));

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText(/seu@email.com/i), { target: { value: 'casa@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'Secret123!' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/confirme seu e-mail para ativar a conta antes de entrar/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver instruções de ativação/i })).toHaveAttribute(
      'href',
      '/verificar-email?email=casa%40example.com',
    );
    expect(loginMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
