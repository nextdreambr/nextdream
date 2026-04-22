import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InstitutionLayout } from './InstitutionLayout';
import { PatientLayout } from './PatientLayout';
import { SupporterLayout } from './SupporterLayout';

const useAppMock = vi.fn();

vi.mock('../../context/AppContext', () => ({
  useApp: () => useAppMock(),
}));

type LayoutFixture = {
  name: string;
  Component: typeof PatientLayout | typeof SupporterLayout | typeof InstitutionLayout;
  basePath: string;
  entryPath: string;
  childPath: string;
  user: {
    id: string;
    name: string;
    role: 'paciente' | 'apoiador' | 'instituicao';
    approved: boolean;
  };
};

const fixtures: LayoutFixture[] = [
  {
    name: 'patient shell',
    Component: PatientLayout,
    basePath: '/paciente',
    entryPath: '/paciente/sonhos',
    childPath: 'sonhos',
    user: {
      id: 'patient-1',
      name: 'Ana Souza',
      role: 'paciente',
      approved: true,
    },
  },
  {
    name: 'supporter shell',
    Component: SupporterLayout,
    basePath: '/apoiador',
    entryPath: '/apoiador/explorar',
    childPath: 'explorar',
    user: {
      id: 'supporter-1',
      name: 'Felipe Costa',
      role: 'apoiador',
      approved: true,
    },
  },
  {
    name: 'institution shell',
    Component: InstitutionLayout,
    basePath: '/instituicao',
    entryPath: '/instituicao/pacientes',
    childPath: 'pacientes',
    user: {
      id: 'institution-1',
      name: 'Casa Esperanca',
      role: 'instituicao',
      approved: true,
    },
  },
];

describe('Sandbox authenticated shells', () => {
  beforeEach(() => {
    useAppMock.mockReset();
  });

  it.each(fixtures)('$name keeps the desktop sidebar sticky without offsetting the main column', ({ Component, basePath, entryPath, childPath, user }) => {
    useAppMock.mockReturnValue({
      currentUser: user,
      notifications: [],
      unreadCount: 0,
      logout: vi.fn(),
    });

    const router = createMemoryRouter(
      [
        {
          path: basePath,
          Component,
          children: [
            {
              path: childPath,
              element: <div>Conteudo</div>,
            },
          ],
        },
      ],
      {
        initialEntries: [entryPath],
      },
    );

    const { container } = render(<RouterProvider router={router} />);

    const desktopSidebar = Array.from(container.querySelectorAll('aside')).find((aside) =>
      aside.className.includes('md:flex'),
    );
    const mainColumn = container.querySelector('header')?.parentElement;

    expect(desktopSidebar).toBeTruthy();
    expect(desktopSidebar?.className).toContain('sticky');
    expect(desktopSidebar?.className).not.toContain('fixed');
    expect(mainColumn).toBeTruthy();
    expect(mainColumn?.className).not.toContain('md:ml-64');
    expect(screen.getByText('Conteudo')).toBeInTheDocument();
  });
});
