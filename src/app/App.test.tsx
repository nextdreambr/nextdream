import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the public landing route', () => {
    window.history.pushState({}, '', '/');

    render(<App />);

    expect(screen.getByText(/realize sonhos com o poder da/i)).toBeInTheDocument();
  });
});
