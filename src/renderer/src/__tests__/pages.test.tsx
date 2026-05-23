import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '../pages/HomePage';

describe('HomePage', () => {
  it('renders the welcome heading', () => {
    render(<HomePage />);
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Welcome to Careers Builder')).toBeDefined();
  });
});
