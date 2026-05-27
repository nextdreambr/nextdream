import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SupporterDreamDetail from './SupporterDreamDetail';
import { dreamsApi, proposalsApi } from '../../lib/api';
import { SANDBOX_PROFILE_STORAGE_PREFIX } from '../../lib/sandboxProfileState';
import { I18nProvider } from '../../i18n/I18nProvider';

const navigateMock = vi.fn();
const useAppMock = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ id: 'dream-1' }),
  };
});

vi.mock('../../context/AppContext', () => ({
  useApp: () => useAppMock(),
}));

vi.mock('../../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../../lib/api')>('../../lib/api');

  return {
    ...actual,
    dreamsApi: {
      ...actual.dreamsApi,
      getById: vi.fn(),
      createProposal: vi.fn(),
      translateDream: vi.fn(),
    },
    proposalsApi: {
      ...actual.proposalsApi,
      listMine: vi.fn(),
    },
  };
});

const getByIdMock = vi.mocked(dreamsApi.getById);
const translateDreamMock = vi.mocked(dreamsApi.translateDream);
const listMineMock = vi.mocked(proposalsApi.listMine);

function renderPage(locale: 'pt-BR' | 'en-US' | 'es-ES' = 'pt-BR') {
  return render(
    <MemoryRouter>
      <I18nProvider locale={locale}>
        <SupporterDreamDetail />
      </I18nProvider>
    </MemoryRouter>,
  );
}

describe('SupporterDreamDetail', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    useAppMock.mockReset();
    getByIdMock.mockReset();
    translateDreamMock.mockReset();
    listMineMock.mockReset();
    window.sessionStorage.clear();

    useAppMock.mockReturnValue({
      currentUser: {
        id: 'supporter-1',
        role: 'apoiador',
      },
    });

    getByIdMock.mockResolvedValue({
      id: 'dream-1',
      title: 'Sessão de violão no parque',
      description: 'Um encontro musical ao ar livre.',
      category: 'Arte e Música',
      format: 'presencial',
      urgency: 'alta',
      privacy: 'publico',
      status: 'publicado',
      patientId: 'patient-1',
      patientName: 'Ana',
      patientCity: 'Recife, PE',
      originalLanguage: 'pt-BR',
      translations: {},
      createdAt: '2026-04-20T10:00:00.000Z',
      updatedAt: '2026-04-20T10:00:00.000Z',
    });
    translateDreamMock.mockResolvedValue({
      title: 'Guitar session in the park',
      description: 'An outdoor musical gathering.',
      source: 'machine',
      createdAt: '2026-04-21T12:00:00.000Z',
      updatedAt: '2026-04-21T12:00:00.000Z',
    });
    listMineMock.mockResolvedValue([]);
  });

  it('records the opened dream in the sandbox session history for the supporter profile', async () => {
    renderPage();

    expect(await screen.findByText('Sessão de violão no parque')).toBeInTheDocument();

    await waitFor(() => {
      expect(window.sessionStorage.getItem(`${SANDBOX_PROFILE_STORAGE_PREFIX}supporter-1`)).toContain(
        '"title":"Sessão de violão no parque"',
      );
    });
    expect(window.sessionStorage.getItem(`${SANDBOX_PROFILE_STORAGE_PREFIX}supporter-1`)).toContain(
      '"path":"/apoiador/sonhos/dream-1"',
    );
  });

  it('shows the language block and applies the translated dream title and description', async () => {
    renderPage('en-US');

    expect(await screen.findByText('Sessão de violão no parque')).toBeInTheDocument();
    expect(screen.getByText('Original')).toBeInTheDocument();
    expect(screen.getAllByText('Portuguese').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Translate to English' }));

    expect(await screen.findByText('Guitar session in the park')).toBeInTheDocument();
    expect(screen.getByText('An outdoor musical gathering.')).toBeInTheDocument();
    expect(translateDreamMock).toHaveBeenCalledWith('dream-1', 'en-US');
  });
});
