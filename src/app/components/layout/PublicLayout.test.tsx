import { render, screen, within } from '@testing-library/react';
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
    const footer = screen.getByRole('contentinfo');

    expect(within(footer).getByRole('link', { name: /como funciona/i })).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: /segurança/i })).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: /faq/i })).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: /fale conosco/i })).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: /termos de uso/i })).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: /privacidade/i })).toBeInTheDocument();
  });

  it('keeps the human care statement in the footer', () => {
    renderPublicLayout();

    expect(screen.getByText(/^Presença, tempo e cuidado também realizam sonhos\.$/i)).toBeInTheDocument();
  });
});
