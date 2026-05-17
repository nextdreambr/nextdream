import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('renders the public landing route', async () => {
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

    const publicStoriesSection = screen
      .getByRole('heading', { level: 2, name: /histórias públicas, mostradas com cuidado/i })
      .closest('section');
    const publicStoriesGrid = publicStoriesSection?.querySelector('.lg\\:grid-cols-3');

    expect(publicStoriesGrid).toHaveClass('lg:items-stretch');
    expect(publicStoriesGrid).not.toHaveClass('lg:items-start');
    await waitFor(() => {
      expect(publicStoriesGrid?.querySelectorAll('article')).toHaveLength(3);
    });

    const publicStoryCards = publicStoriesGrid?.querySelectorAll('article');
    expect(publicStoryCards).toHaveLength(3);
    publicStoryCards?.forEach((card) => {
      expect(card).not.toHaveClass('lg:mt-10');
      expect(card).not.toHaveClass('lg:mt-5');

      const visual = card.firstElementChild;
      const content = card.lastElementChild;
      const title = card.querySelector('h3');
      const description = title?.nextElementSibling;
      const metadata = description?.nextElementSibling;
      const supportBand = metadata?.nextElementSibling;
      const cta = supportBand?.nextElementSibling;

      expect(card).toHaveClass('flex', 'h-full', 'flex-col');
      expect(visual).toHaveClass('aspect-[1.34]');
      expect(content).toHaveClass('flex', 'flex-1', 'flex-col');
      expect(title).toHaveClass('line-clamp-2', 'min-h-[3.75rem]');
      expect(description).toHaveClass('line-clamp-3', 'min-h-[4.875rem]');
      expect(metadata).toHaveClass('min-h-[4.5rem]');
      expect(supportBand).toHaveClass('min-h-[4rem]');
      expect(cta).toHaveClass('mt-auto');
    });
  });

});
