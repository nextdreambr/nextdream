import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SandboxAccess from './SandboxAccess';

const { demoLoginMock, loginMock } = vi.hoisted(() => ({
  demoLoginMock: vi.fn(),
  loginMock: vi.fn(),
}));

vi.mock('../context/AppContext', () => ({
  useApp: () => ({
    login: loginMock,
  }),
}));

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api');
  return {
    ...actual,
    authApi: {
      ...actual.authApi,
      demoLogin: demoLoginMock,
    },
  };
});

const sandboxSessions = {
  paciente: {
    user: {
      id: 'paciente-1',
      name: 'Ana Paciente',
      email: 'paciente@nextdream.local',
      role: 'paciente' as const,
      verified: true,
      approved: true,
    },
  },
  apoiador: {
    user: {
      id: 'apoiador-1',
      name: 'Bruno Apoiador',
      email: 'apoiador@nextdream.local',
      role: 'apoiador' as const,
      verified: true,
      approved: true,
    },
  },
  instituicao: {
    user: {
      id: 'instituicao-1',
      name: 'Casa Esperanca',
      email: 'instituicao@nextdream.local',
      role: 'instituicao' as const,
      verified: true,
      approved: true,
    },
  },
};

function renderSandboxAccess(initialEntry = '/sandbox?tipo=apoiador') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/sandbox" element={<SandboxAccess />} />
        <Route path="/paciente/dashboard" element={<div>Paciente dashboard</div>} />
        <Route path="/apoiador/dashboard" element={<div>Apoiador dashboard</div>} />
        <Route path="/instituicao/dashboard" element={<div>Instituicao dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SandboxAccess', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.stubEnv('VITE_APP_ENV', 'sandbox');
    vi.stubEnv('VITE_SANDBOX_HOSTNAME', 'sandbox.nextdream.ong.br');
    loginMock.mockReset();
    demoLoginMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    window.sessionStorage.clear();
  });

  it('renders the non-technical sandbox entry with trust guidance and tour offers', () => {
    renderSandboxAccess();

    expect(screen.getByText(/escolha uma jornada para testar o nextdream/i)).toBeInTheDocument();
    expect(screen.getByText(/este é um ambiente de demonstração/i)).toBeInTheDocument();
    expect(screen.getByText(/você pode recomeçar quando quiser/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar como apoiador/i })).toBeInTheDocument();
    const tourButtons = screen.getAllByRole('button', { name: /ver tour/i });
    expect(tourButtons).toHaveLength(3);
    for (const button of tourButtons) {
      expect(button).toHaveClass('text-center');
      expect(button).toHaveClass('sm:whitespace-nowrap');
    }
    expect(screen.queryByText(/regras desta demo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mesmas apis principais/i)).not.toBeInTheDocument();
  });

  it('offers a manual guided tour from the entry and queues the sandbox session launch', async () => {
    demoLoginMock.mockResolvedValue(sandboxSessions.apoiador);

    renderSandboxAccess();

    fireEvent.click(screen.getByRole('button', { name: /ver tour guiado do apoiador/i }));

    expect(screen.getByRole('dialog', { name: /tour guiado do apoiador/i })).toBeInTheDocument();
    expect(screen.getByText(/veja como a jornada funciona antes de entrar/i)).toBeInTheDocument();
    expect(screen.getByText(/o que você vai ver em cada etapa/i)).toBeInTheDocument();
    expect(screen.getByText(/explorar sonhos/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /entrar e começar o tour/i }));

    await screen.findByText('Apoiador dashboard');
    expect(loginMock).toHaveBeenCalledWith(sandboxSessions.apoiador);
    expect(window.sessionStorage.getItem('nextdream.sandbox.tour')).toContain('"queuedLaunchPersona":"apoiador"');
  });

  it('keeps the sandbox login redirecting to the correct logged area', async () => {
    demoLoginMock.mockResolvedValue(sandboxSessions.instituicao);

    renderSandboxAccess('/sandbox?tipo=instituicao');

    fireEvent.click(screen.getByRole('button', { name: /entrar como instituição/i }));

    await screen.findByText('Instituicao dashboard');
    expect(loginMock).toHaveBeenCalledWith(sandboxSessions.instituicao);
    expect(window.sessionStorage.getItem('nextdream.sandbox.tour')).toBeNull();
  });

  it('shows a simple non-technical message when the sandbox session cannot start', async () => {
    demoLoginMock.mockRejectedValue(new Error('backend exploded'));

    renderSandboxAccess('/sandbox?tipo=paciente');

    fireEvent.click(screen.getByRole('button', { name: /entrar como paciente/i }));

    await waitFor(() => {
      expect(screen.getByText(/não foi possível abrir esta experiência agora/i)).toBeInTheDocument();
    });
  });
});
