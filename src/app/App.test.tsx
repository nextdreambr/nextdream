import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

const { listPublicMock } = vi.hoisted(() => ({
  listPublicMock: vi.fn(),
}));

vi.mock('./lib/api', async () => {
  const actual = await vi.importActual<typeof import('./lib/api')>('./lib/api');

  return {
    ...actual,
    dreamsApi: {
      ...actual.dreamsApi,
      listPublic: listPublicMock,
    },
  };
});

describe('App', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    listPublicMock.mockReset();
    listPublicMock.mockResolvedValue([]);
  });

  it('renders the public landing route', async () => {
    window.history.pushState({}, '', '/');

    const { container } = render(<App />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /sonhos possíveis começam com presença/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/sempre com cuidado e consentimento/i)).toBeInTheDocument();
    await waitFor(() => expect(listPublicMock).toHaveBeenCalledTimes(1));
    expect(container.querySelector('#sonhos')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { level: 2, name: /histórias públicas, mostradas com cuidado/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /uma linha de cuidado até o encontro/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /escolha como estar perto/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /cada história merece cuidado antes de virar encontro/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3, name: /compartilhe um sonho/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/apoio por presença, tempo ou habilidade/i).length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByRole('link', { name: /compartilhar um sonho/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /conversar sobre parceria/i }).length).toBeGreaterThan(0);
  });

});
