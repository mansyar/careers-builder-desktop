import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { App } from '../App';

describe('App', () => {
  it('renders the sidebar', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<App />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Careers Builder')).toBeDefined();
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('CV Builder')).toBeDefined();
    expect(screen.getByText('Job Search')).toBeDefined();
  });

  it('renders children via Outlet', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<p>Child content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText('Child content')).toBeDefined();
  });

  it('renders with correct layout structure', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<App />} />
        </Routes>
      </MemoryRouter>
    );
    const main = container.querySelector('main');
    expect(main).not.toBeNull();
    expect(main?.className).toContain('flex-1');
  });
});
