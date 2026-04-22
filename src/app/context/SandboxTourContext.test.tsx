import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Outlet, Route, Routes, MemoryRouter, useLocation } from 'react-router';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_STORAGE_KEY } from '../lib/authSession';
import { AppProvider } from './AppContext';
import { SandboxTourProvider, useSandboxTour } from './SandboxTourContext';
import { SandboxEnvironmentBanner } from '../components/shared/SandboxEnvironmentBanner';
import { queueSandboxTourLaunch } from '../lib/sandboxTourSession';

function jsonResponse(payload: unknown) {
  return new window.Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="current-path">{location.pathname}</div>;
}

function OpenTourOnMount() {
  const { openTour } = useSandboxTour();

  useEffect(() => {
    openTour();
  }, [openTour]);

  return null;
}

function TestShell() {
  return (
    <AppProvider>
      <SandboxTourProvider>
        <SandboxEnvironmentBanner />
        <LocationProbe />
        <Outlet />
      </SandboxTourProvider>
    </AppProvider>
  );
}

function saveSandboxSession(role: 'paciente' | 'apoiador' | 'instituicao') {
  window.sessionStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      user: {
        id: `${role}-1`,
        name: role === 'instituicao' ? 'Casa Esperanca' : `Pessoa ${role}`,
        email: `${role}@nextdream.local`,
        role,
        verified: true,
        approved: true,
      },
    }),
  );
}

function renderSandboxTour(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<TestShell />}>
          <Route path="/paciente/dashboard" element={<div data-sandbox-tour-id="patient-dashboard-hero">Paciente dashboard</div>} />
          <Route path="/paciente/sonhos/criar" element={<div data-sandbox-tour-id="patient-create-dream-form">Paciente criar sonho</div>} />
          <Route path="/paciente/propostas" element={<div data-sandbox-tour-id="patient-proposals-panel">Paciente propostas</div>} />
          <Route path="/paciente/chat" element={<div data-sandbox-tour-id="patient-chat-panel">Paciente chat</div>} />

          <Route path="/apoiador/dashboard" element={<div data-sandbox-tour-id="supporter-dashboard-hero">Apoiador dashboard</div>} />
          <Route path="/apoiador/explorar" element={<div data-sandbox-tour-id="supporter-explore-panel">Apoiador explorar</div>} />
          <Route path="/apoiador/propostas" element={<div data-sandbox-tour-id="supporter-proposals-panel">Apoiador propostas</div>} />
          <Route path="/apoiador/chat" element={<div data-sandbox-tour-id="supporter-chat-panel">Apoiador chat</div>} />

          <Route path="/instituicao/dashboard" element={<div data-sandbox-tour-id="institution-dashboard-hero">Instituicao dashboard</div>} />
          <Route path="/instituicao/pacientes" element={<div data-sandbox-tour-id="institution-patients-panel">Instituicao pacientes</div>} />
          <Route path="/instituicao/sonhos/criar" element={<div data-sandbox-tour-id="institution-create-dream-form">Instituicao criar sonho</div>} />
          <Route path="/instituicao/propostas" element={<div data-sandbox-tour-id="institution-proposals-panel">Instituicao propostas</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

function renderSandboxTourWithForcedOpen(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppProvider>
        <SandboxTourProvider>
          <OpenTourOnMount />
          <SandboxEnvironmentBanner />
          <LocationProbe />
          <Routes>
            <Route path="/paciente/dashboard" element={<div data-sandbox-tour-id="patient-dashboard-hero">Paciente dashboard</div>} />
          </Routes>
        </SandboxTourProvider>
      </AppProvider>
    </MemoryRouter>,
  );
}

describe('SandboxTourProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.stubEnv('VITE_APP_ENV', 'sandbox');
    vi.stubEnv('VITE_SANDBOX_HOSTNAME', 'sandbox.nextdream.ong.br');
    vi.stubEnv('VITE_API_URL', 'http://localhost');
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse([])));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('opens the queued supporter tour and advances through the configured steps', async () => {
    saveSandboxSession('apoiador');
    queueSandboxTourLaunch('apoiador');

    renderSandboxTour('/apoiador/dashboard');

    await screen.findByRole('dialog', { name: /tour guiado do apoiador/i });
    expect(screen.getByText(/passo 1 de 4/i)).toBeInTheDocument();
    expect(screen.getByText(/o que você vê nesta etapa/i)).toBeInTheDocument();
    expect(screen.getByText(/o que fazer agora/i)).toBeInTheDocument();
    expect(screen.getByText(/por que isso vale a pena/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /veja o painel com sonhos, propostas e conversas/i })).toBeInTheDocument();
    expect(screen.getByTestId('current-path')).toHaveTextContent('/apoiador/dashboard');

    fireEvent.click(screen.getByRole('button', { name: /proximo passo/i }));
    await screen.findByRole('heading', { name: /explore os sonhos e escolha onde você quer chegar junto/i });
    expect(screen.getByTestId('current-path')).toHaveTextContent('/apoiador/explorar');

    fireEvent.click(screen.getByRole('button', { name: /proximo passo/i }));
    await screen.findByRole('heading', { name: /acompanhe as respostas e retome contatos sem se perder/i });
    expect(screen.getByTestId('current-path')).toHaveTextContent('/apoiador/propostas');

    fireEvent.click(screen.getByRole('button', { name: /proximo passo/i }));
    await screen.findByRole('heading', { name: /combine os próximos passos quando a conexão for aceita/i });
    expect(screen.getByTestId('current-path')).toHaveTextContent('/apoiador/chat');
  });

  it('allows skipping the tour and reopening it from the sandbox banner', async () => {
    saveSandboxSession('paciente');
    queueSandboxTourLaunch('paciente');

    renderSandboxTour('/paciente/dashboard');

    await screen.findByRole('dialog', { name: /tour guiado do paciente/i });
    fireEvent.click(screen.getByRole('button', { name: /pular tour/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /tour guiado do paciente/i })).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /ver tour guiado/i }));
    await screen.findByRole('dialog', { name: /tour guiado do paciente/i });
  });

  it('allows completing the patient tour and persists completion in the sandbox session', async () => {
    saveSandboxSession('paciente');
    queueSandboxTourLaunch('paciente');

    renderSandboxTour('/paciente/dashboard');

    await screen.findByRole('dialog', { name: /tour guiado do paciente/i });

    fireEvent.click(screen.getByRole('button', { name: /proximo passo/i }));
    await screen.findByRole('heading', { name: /crie um sonho com clareza para receber apoios compatíveis/i });

    fireEvent.click(screen.getByRole('button', { name: /proximo passo/i }));
    await screen.findByRole('heading', { name: /veja quem respondeu e avance só com quem fizer sentido/i });

    fireEvent.click(screen.getByRole('button', { name: /proximo passo/i }));
    await screen.findByRole('heading', { name: /combine detalhes com segurança quando a ajuda for confirmada/i });

    fireEvent.click(screen.getByRole('button', { name: /encerrar tour e explorar/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /tour guiado do paciente/i })).not.toBeInTheDocument();
    });

    expect(window.sessionStorage.getItem('nextdream.sandbox.tour')).toContain('completed');
  });

  it('keeps the banner visible in logged sandbox areas with human role labels and relaunch access', async () => {
    saveSandboxSession('instituicao');

    renderSandboxTour('/instituicao/dashboard');

    await waitFor(() => {
      expect(screen.getByText(/ambiente de demonstração/i)).toBeInTheDocument();
      expect(screen.getByText('Instituição')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /recomeçar demo/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ver tour/i })).toBeInTheDocument();
    });
  });

  it('does not open the tour when a consumer calls openTour outside sandbox mode', async () => {
    saveSandboxSession('paciente');
    vi.stubEnv('VITE_APP_ENV', 'production');
    vi.stubEnv('VITE_SANDBOX_HOSTNAME', 'sandbox.nextdream.ong.br');

    renderSandboxTourWithForcedOpen('/paciente/dashboard');

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /tour guiado do paciente/i })).not.toBeInTheDocument();
    });
  });
});
