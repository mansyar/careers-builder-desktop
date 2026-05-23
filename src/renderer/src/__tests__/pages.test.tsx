import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomePage } from '../pages/HomePage';
import { CVBuilderPage } from '../pages/CVBuilderPage';
import { JobSearchPage } from '../pages/JobSearchPage';

describe('HomePage', () => {
  it('renders the welcome heading', () => {
    render(<HomePage />);
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Welcome to Careers Builder')).toBeDefined();
  });
});

describe('CVBuilderPage', () => {
  it('renders the CV Builder heading', () => {
    render(<CVBuilderPage />);
    expect(screen.getByText('CV Builder')).toBeDefined();
    expect(screen.getByText('AI-powered CV creation coming soon')).toBeDefined();
  });
});

describe('JobSearchPage', () => {
  it('renders the Job Search heading', () => {
    render(<JobSearchPage />);
    expect(screen.getByText('Job Search')).toBeDefined();
    expect(screen.getByText('Smart job opportunity searcher coming soon')).toBeDefined();
  });
});
