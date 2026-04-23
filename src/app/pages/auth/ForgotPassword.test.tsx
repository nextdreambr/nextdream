import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ForgotPassword from './ForgotPassword';
import { authApi } from '../../lib/api';

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      requestPasswordReset: vi.fn(),
    },
  };
});

const requestPasswordResetMock = vi.mocked(
  (authApi as unknown as {
    requestPasswordReset: (payload: { email: string }) => Promise<void>;
  }).requestPasswordReset,
);

describe('ForgotPassword', () => {
  beforeEach(() => {
    requestPasswordResetMock.mockReset();
    requestPasswordResetMock.mockResolvedValue();
  });

  it('submits the email to the password reset API before showing the success state', async () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: ' renan@example.com ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /enviar link de recuperação/i }));

    await waitFor(() => {
      expect(requestPasswordResetMock).toHaveBeenCalledWith({
        email: 'renan@example.com',
      });
    });

    expect(screen.getByText(/e-mail enviado!/i)).toBeInTheDocument();
  });
});
