import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ExploreDreams from './ExploreDreams';
import { dreamsApi, proposalsApi, type Proposal, type PublicDream } from '../../lib/api';

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    dreamsApi: {
      ...actual.dreamsApi,
      listPublic: vi.fn(),
    },
    proposalsApi: {
      ...actual.proposalsApi,
      listMine: vi.fn(),
    },
  };
});

vi.mock('../../lib/proposals', () => ({
  buildProposalMapByDream: vi.fn(() => new Map<string, Proposal>()),
}));

const listPublicMock = vi.mocked(dreamsApi.listPublic);
const listMineMock = vi.mocked(proposalsApi.listMine);

const dreamsFixture: PublicDream[] = [
  {
    id: 'dream-art-high',
    title: 'Sessão de violão no parque',
    description: 'Um encontro musical ao ar livre.',
    category: 'Arte e Música',
    format: 'presencial',
    urgency: 'alta',
    privacy: 'publico',
    status: 'publicado',
    patientId: 'patient-1',
    patientName: 'Ana',
    patientCity: 'Maringá',
    createdAt: '2026-04-10T12:00:00.000Z',
    updatedAt: '2026-04-10T12:00:00.000Z',
  },
  {
    id: 'dream-food-high',
    title: 'Cozinhar receita de família',
    description: 'Quero preparar uma receita afetiva.',
    category: 'Culinária',
    format: 'remoto',
    urgency: 'alta',
    privacy: 'publico',
    status: 'publicado',
    patientId: 'patient-2',
    patientName: 'Bia',
    patientCity: 'Londrina',
    createdAt: '2026-04-10T12:00:00.000Z',
    updatedAt: '2026-04-10T12:00:00.000Z',
  },
  {
    id: 'dream-tech-high',
    title: 'Montar meu primeiro computador',
    description: 'Gostaria de ajuda para aprender hardware.',
    category: 'Tecnologia',
    format: 'remoto',
    urgency: 'alta',
    privacy: 'publico',
    status: 'publicado',
    patientId: 'patient-3',
    patientName: 'Caio',
    patientCity: 'Curitiba',
    createdAt: '2026-04-10T12:00:00.000Z',
    updatedAt: '2026-04-10T12:00:00.000Z',
  },
  {
    id: 'dream-art-low',
    title: 'Visita calma ao museu',
    description: 'Um passeio cultural sem pressa.',
    category: 'Arte e Música',
    format: 'ambos',
    urgency: 'baixa',
    privacy: 'publico',
    status: 'publicado',
    patientId: 'patient-4',
    patientName: 'Dora',
    patientCity: 'Maringá',
    createdAt: '2026-04-10T12:00:00.000Z',
    updatedAt: '2026-04-10T12:00:00.000Z',
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <ExploreDreams />
    </MemoryRouter>,
  );
}

describe('ExploreDreams', () => {
  beforeEach(() => {
    listPublicMock.mockResolvedValue(dreamsFixture);
    listMineMock.mockResolvedValue([]);
  });

  it('supports multiple category filters combined with urgency', async () => {
    renderPage();

    expect(await screen.findByText('Sessão de violão no parque')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Filtros' }));
    fireEvent.click(screen.getByRole('button', { name: 'Arte e Música' }));
    fireEvent.click(screen.getByRole('button', { name: 'Culinária' }));
    fireEvent.click(screen.getByRole('button', { name: '🔴 Alta' }));

    expect(screen.getByText('Sessão de violão no parque')).toBeInTheDocument();
    expect(screen.getByText('Cozinhar receita de família')).toBeInTheDocument();
    expect(screen.queryByText('Montar meu primeiro computador')).not.toBeInTheDocument();
    expect(screen.queryByText('Visita calma ao museu')).not.toBeInTheDocument();
    expect(screen.getByText('2 sonhos aguardando um apoiador como você')).toBeInTheDocument();
  });

  it('keeps format filter as single selection', async () => {
    renderPage();

    expect(await screen.findByText('Montar meu primeiro computador')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Filtros' }));
    fireEvent.click(screen.getByRole('button', { name: '💻 Online' }));
    fireEvent.click(screen.getByRole('button', { name: '📍 Presencial' }));

    expect(screen.getByText('Sessão de violão no parque')).toBeInTheDocument();
    expect(screen.getByText('Visita calma ao museu')).toBeInTheDocument();
    expect(screen.queryByText('Cozinhar receita de família')).not.toBeInTheDocument();
    expect(screen.queryByText('Montar meu primeiro computador')).not.toBeInTheDocument();
  });

  it('treats both formats as an inclusive filter', async () => {
    renderPage();

    expect(await screen.findByText('Montar meu primeiro computador')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Filtros' }));
    fireEvent.click(screen.getByRole('button', { name: '🤝 Ambos' }));

    expect(screen.getByText('Sessão de violão no parque')).toBeInTheDocument();
    expect(screen.getByText('Cozinhar receita de família')).toBeInTheDocument();
    expect(screen.getByText('Montar meu primeiro computador')).toBeInTheDocument();
    expect(screen.getByText('Visita calma ao museu')).toBeInTheDocument();
    expect(screen.getByText('4 sonhos aguardando um apoiador como você')).toBeInTheDocument();
  });
});
