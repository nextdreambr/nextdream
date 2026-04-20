import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InstitutionLayout } from './InstitutionLayout';

const useAppMock = vi.fn();

vi.mock('../../context/AppContext', () => ({
  useApp: () => useAppMock(),
}));

describe('InstitutionLayout', () => {
  beforeEach(() => {
    useAppMock.mockReset();
  });

  it('matches the patient shell structure with breadcrumb and notifications entry', () => {
    useAppMock.mockReturnValue({
      currentUser: {
        id: 'institution-1',
        name: 'Casa Esperanca',
        role: 'instituicao',
        approved: true,
      },
      notifications: [
        {
          id: 'n-1',
          title: 'Nova proposta',
          message: 'Uma nova proposta chegou.',
          type: 'proposta',
          read: false,
          createdAt: '2026-04-18T10:00:00.000Z',
        },
      ],
      unreadCount: 1,
      logout: vi.fn(),
    });

    const router = createMemoryRouter(
      [
        {
          path: '/instituicao',
          Component: InstitutionLayout,
          children: [
            {
              path: 'pacientes',
              element: <div>Conteudo pacientes</div>,
            },
            {
              path: 'notificacoes',
              element: <div>Conteudo notificacoes</div>,
            },
          ],
        },
      ],
      {
        initialEntries: ['/instituicao/pacientes'],
      },
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText('Área da Instituição')).toBeInTheDocument();
    expect(screen.getAllByText('Pacientes').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /notificações/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /pacientes/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /abrir menu/i })).toBeInTheDocument();
  });
});
