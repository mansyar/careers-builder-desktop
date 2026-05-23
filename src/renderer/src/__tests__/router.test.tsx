import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { router } from '../router';

describe('router', () => {
  it('creates a router with routes', () => {
    expect(router).toBeDefined();
    expect(router.routes).toHaveLength(1);
  });

  it('has the App as the root route element', () => {
    const rootRoute = router.routes[0];
    expect(rootRoute.path).toBe('/');
    expect(rootRoute.children).toHaveLength(3);
  });

  it('renders all child routes', () => {
    const rootRoute = router.routes[0];
    const childPaths = rootRoute.children?.map((child) => child.path ?? 'index');
    expect(childPaths).toContain('index');
    expect(childPaths).toContain('cv-builder');
    expect(childPaths).toContain('job-search');
  });

  it('renders the HomePage at /', () => {
    render(<RouterProvider router={router} />);
    expect(screen.getByText('Welcome to Careers Builder')).toBeDefined();
  });
});
