import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SearchPage from '../pages/SearchPage';

vi.mock('../services/api', () => ({
  tmdbApi: {
    trending: vi.fn().mockResolvedValue({ results: [] }),
    search: vi.fn().mockResolvedValue({ results: [] }),
  },
  img: vi.fn().mockReturnValue('https://example.com/img.jpg'),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe('SearchPage', () => {
  it('renders search input with placeholder', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByPlaceholderText('Movie title...')).toBeInTheDocument();
  });

  it('renders heading', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Search Movies');
  });

  it('has accessible search landmark', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('renders movie grid', () => {
    renderWithProviders(<SearchPage />);
    expect(screen.getByText('Trending Now')).toBeInTheDocument();
  });
});
