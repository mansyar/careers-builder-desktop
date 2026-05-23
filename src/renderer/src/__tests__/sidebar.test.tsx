import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

function renderWithRouter(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Sidebar />
    </MemoryRouter>
  );
}

describe('Sidebar', () => {
  it('renders all navigation links', () => {
    renderWithRouter();
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('CV Builder')).toBeDefined();
    expect(screen.getByText('Job Search')).toBeDefined();
  });

  it('renders the app title', () => {
    renderWithRouter();
    expect(screen.getByText('Careers Builder')).toBeDefined();
  });

  it('highlights the active route', () => {
    renderWithRouter('/cv-builder');
    const cvLink = screen.getByText('CV Builder').closest('a');
    expect(cvLink?.className).toContain('bg-blue-50');
  });

  it('does not highlight inactive routes', () => {
    renderWithRouter('/');
    const cvLink = screen.getByText('Job Search').closest('a');
    expect(cvLink?.className).not.toContain('bg-blue-50');
  });
});
