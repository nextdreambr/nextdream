import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { PublicLayout } from './PublicLayout';

function renderPublicLayout() {
  return render(
    <MemoryRouter>
      <PublicLayout />
    </MemoryRouter>,
  );
}

describe('PublicLayout – GitHub open source link', () => {
  it('renders the open source link', () => {
    renderPublicLayout();

    expect(
      screen.getByRole('link', { name: /projeto open source no github/i }),
    ).toBeInTheDocument();
  });

  it('points to the correct GitHub repository URL', () => {
    renderPublicLayout();

    const link = screen.getByRole('link', { name: /projeto open source no github/i });
    expect(link).toHaveAttribute('href', 'https://github.com/nextdreambr/nextdream');
  });

  it('opens in a new tab via target="_blank"', () => {
    renderPublicLayout();

    const link = screen.getByRole('link', { name: /projeto open source no github/i });
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('has rel="noreferrer noopener" to prevent tab-napping', () => {
    renderPublicLayout();

    const link = screen.getByRole('link', { name: /projeto open source no github/i });
    expect(link).toHaveAttribute('rel', 'noreferrer noopener');
  });

  it('renders the exact link text', () => {
    renderPublicLayout();

    expect(screen.getByText('Projeto open source no GitHub')).toBeInTheDocument();
  });

  it('applies the expected CSS classes', () => {
    renderPublicLayout();

    const link = screen.getByRole('link', { name: /projeto open source no github/i });
    expect(link).toHaveClass('text-xs');
    expect(link).toHaveClass('text-gray-400');
    expect(link).toHaveClass('transition-colors');
  });

  it('is rendered inside the footer element', () => {
    renderPublicLayout();

    const footer = document.querySelector('footer');
    expect(footer).not.toBeNull();
    expect(footer).toContainElement(
      screen.getByRole('link', { name: /projeto open source no github/i }),
    );
  });

  it('is distinct from the email contact link and nav links', () => {
    renderPublicLayout();

    // All links with the GitHub href should be exactly one
    const githubLinks = document
      .querySelectorAll('a[href="https://github.com/nextdreambr/nextdream"]');
    expect(githubLinks).toHaveLength(1);
  });

  // Regression: the copyright paragraph must still appear alongside the new link
  it('does not replace the copyright notice already present in the footer', () => {
    renderPublicLayout();

    expect(
      screen.getByText(/© 2026 NextDream/),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: /projeto open source no github/i }),
    ).toBeInTheDocument();
  });

  // Regression: the "no money" disclaimer must still appear alongside the new link
  it('does not displace the no-money disclaimer in the footer', () => {
    renderPublicLayout();

    expect(
      screen.getByText(/Sem dinheiro, PIX ou doações/),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: /projeto open source no github/i }),
    ).toBeInTheDocument();
  });
});