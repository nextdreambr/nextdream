import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VerifyEmail from './VerifyEmail';
import { authApi } from '../../lib/api';

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      verifyEmail: vi.fn(),
    },
  };
});

const verifyEmailMock = vi.mocked(authApi.verifyEmail);

describe('VerifyEmail', () => {
  beforeEach(() => {
    verifyEmailMock.mockReset();
    verifyEmailMock.mockResolvedValue({ success: true });
  });

  it('shows activation instructions when the page is opened without a token', () => {
    render(
      <MemoryRouter initialEntries={['/verificar-email?email=ana@example.com&role=paciente']}>
        <VerifyEmail />
      </MemoryRouter>,
    );

    expect(verifyEmailMock).not.toHaveBeenCalled();
    expect(screen.getByText(/enviamos um link de ativação para ana@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/depois da confirmação do e-mail, sua conta será ativada/i)).toBeInTheDocument();
  });

  it('verifies the token automatically and shows the institution approval follow-up', async () => {
    render(
      <MemoryRouter initialEntries={['/verificar-email?token=verify-123&email=casa@example.com&role=instituicao']}>
        <VerifyEmail />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(verifyEmailMock).toHaveBeenCalledWith({ token: 'verify-123' });
    });

    expect(await screen.findByRole('heading', { name: /seu e-mail foi confirmado/i })).toBeInTheDocument();
    expect(screen.getByText(/agora sua conta institucional aguarda a aprovação da equipe/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ir para o login/i })).toHaveAttribute(
      'href',
      '/login?email=casa%40example.com&tipo=instituicao',
    );
  });
});
