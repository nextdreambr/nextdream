import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '../i18n/I18nProvider';
import Landing from './Landing';
import type { PublicDream } from '../lib/api';

const { listPublicMock } = vi.hoisted(() => ({
  listPublicMock: vi.fn(),
}));

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/api')>('../lib/api');

  return {
    ...actual,
    dreamsApi: {
      ...actual.dreamsApi,
      listPublic: listPublicMock,
    },
  };
});

function renderLanding() {
  return render(
    <MemoryRouter>
      <I18nProvider locale="pt-BR">
        <Landing />
      </I18nProvider>
    </MemoryRouter>,
  );
}

function sandboxLinks(container: HTMLElement) {
  return container.querySelectorAll('a[href*="sandbox.nextdream.ong.br"]');
}

const publicDream: PublicDream = {
  id: 'dream-real',
  title: 'Uma manhã com fotografia',
  description: 'Uma família quer registrar memórias em um encontro leve e consentido.',
  category: 'Família e Memórias',
  format: 'presencial',
  urgency: 'media',
  privacy: 'publico',
  status: 'publicado',
  patientId: 'patient-1',
  patientName: 'Ana',
  patientCity: 'São Paulo',
  createdAt: '2026-05-20T10:00:00.000Z',
  updatedAt: '2026-05-20T10:00:00.000Z',
};

describe('Landing dream previews', () => {
  beforeEach(() => {
    listPublicMock.mockReset();
  });

  it('hides the dream section when production has no public dreams', async () => {
    listPublicMock.mockResolvedValue([]);

    const { container } = renderLanding();

    await waitFor(() => expect(listPublicMock).toHaveBeenCalledTimes(1));

    expect(container.querySelector('#sonhos')).not.toBeInTheDocument();
    expect(screen.queryByText('Sonhos cadastrados')).not.toBeInTheDocument();
    expect(screen.queryByText('Uma tarde com música ao vivo')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ver todos os sonhos/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /abrir (demonstração|sandbox)/i })).not.toBeInTheDocument();
    expect(sandboxLinks(container)).toHaveLength(0);
  });

  it('hides the dream section when the public endpoint fails', async () => {
    listPublicMock.mockRejectedValue(new Error('network unavailable'));

    const { container } = renderLanding();

    await waitFor(() => expect(listPublicMock).toHaveBeenCalledTimes(1));

    expect(container.querySelector('#sonhos')).not.toBeInTheDocument();
    expect(screen.queryByText('Sonhos cadastrados')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ver todos os sonhos/i })).not.toBeInTheDocument();
    expect(sandboxLinks(container)).toHaveLength(0);
  });

  it('keeps the published-dream section when public published dreams exist', async () => {
    listPublicMock.mockResolvedValue([publicDream]);

    const { container } = renderLanding();

    expect(await screen.findByText('Uma manhã com fotografia')).toBeInTheDocument();
    expect(container.querySelector('#sonhos')).toBeInTheDocument();
    expect(screen.getByText('Sonhos cadastrados')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Histórias públicas, mostradas com cuidado.' })).toBeInTheDocument();
    const allDreamsLink = screen.getByRole('link', { name: /ver todos os sonhos/i });
    const dreamDetailsLink = screen.getByRole('link', { name: /ver detalhes/i });
    expect(allDreamsLink.getAttribute('href')).toMatch(/\/apoiador\/explorar$/);
    expect(dreamDetailsLink.getAttribute('href')).toMatch(/\/sonhos\/dream-real$/);
    expect(sandboxLinks(container)).toHaveLength(0);
  });

  it('hides the dream section when dreams are not both public and published', async () => {
    listPublicMock.mockResolvedValue([
      { ...publicDream, id: 'private-dream', privacy: 'verificados' },
      { ...publicDream, id: 'draft-dream', status: 'rascunho' },
    ]);

    const { container } = renderLanding();

    await waitFor(() => expect(listPublicMock).toHaveBeenCalledTimes(1));

    expect(container.querySelector('#sonhos')).not.toBeInTheDocument();
    expect(screen.queryByText('Sonhos cadastrados')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ver todos os sonhos/i })).not.toBeInTheDocument();
    expect(sandboxLinks(container)).toHaveLength(0);
  });
});
