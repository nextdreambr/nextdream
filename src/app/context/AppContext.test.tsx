import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { AppProvider, useApp } from './AppContext';

function ContextProbe() {
  const { currentRole, isAuthenticated, currentUser } = useApp();

  return (
    <div>
      <span>{currentRole}</span>
      <span>{isAuthenticated ? 'authenticated' : 'anonymous'}</span>
      <span>{currentUser?.name ?? 'no-user'}</span>
    </div>
  );
}

describe('AppProvider', () => {
  it('restores a cookie-based auth session that only stores the user payload', () => {
    localStorage.setItem(
      'nextdream.auth.session',
      JSON.stringify({
        user: {
          id: 'u-instituicao-1',
          name: 'Casa Esperanca Demo',
          email: 'instituicao1@nextdream.local',
          role: 'instituicao',
          city: 'Recife, PE',
          verified: true,
          approved: true,
        },
      }),
    );

    render(
      <AppProvider>
        <ContextProbe />
      </AppProvider>,
    );

    expect(screen.getByText('instituicao')).toBeInTheDocument();
    expect(screen.getByText('authenticated')).toBeInTheDocument();
    expect(screen.getByText('Casa Esperanca Demo')).toBeInTheDocument();
  });

  it('clears a stale stored session when the API reports expired authentication', () => {
    localStorage.setItem(
      'nextdream.auth.session',
      JSON.stringify({
        user: {
          id: 'u-instituicao-1',
          name: 'Casa Esperanca Demo',
          email: 'instituicao1@nextdream.local',
          role: 'instituicao',
          state: 'PE',
          city: 'Recife',
          locationLabel: 'Recife, PE',
          verified: true,
          approved: true,
        },
      }),
    );

    render(
      <AppProvider>
        <ContextProbe />
      </AppProvider>,
    );

    act(() => {
      window.dispatchEvent(new Event('nextdream:auth-expired'));
    });

    expect(screen.getByText('public')).toBeInTheDocument();
    expect(screen.getByText('anonymous')).toBeInTheDocument();
    expect(screen.getByText('no-user')).toBeInTheDocument();
  });
});
