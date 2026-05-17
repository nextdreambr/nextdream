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

describe('PublicLayout footer', () => {
  it('renders the concise NextDream purpose statement', () => {
    renderPublicLayout();

    expect(
      screen.getByText(/NextDream conecta pessoas em momentos delicados de saúde/i),
    ).toBeInTheDocument();
  });

  it('keeps the essential footer links available', () => {
    renderPublicLayout();

    expect(screen.getAllByRole('link', { name: /como funciona/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /segurança/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /faq/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /fale conosco/i }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /termos de uso/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /privacidade/i })).toBeInTheDocument();
  });

  it('keeps the human care statement in the footer', () => {
    renderPublicLayout();

    expect(screen.getByText(/^Presença, tempo e cuidado também realizam sonhos\.$/i)).toBeInTheDocument();
  });
});
