import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('renders the public landing route', () => {
    window.history.pushState({}, '', '/');

    render(<App />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /sonhos possíveis começam com presença/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/sempre com cuidado e consentimento/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /histórias públicas, mostradas com cuidado/i })).toBeInTheDocument();
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
