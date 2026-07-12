import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthPage from '../pages/AuthPage';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe('AuthPage', () => {
  it('renders login form by default', () => {
    render(<AuthPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Login');
  });

  it('renders email and password inputs', () => {
    render(<AuthPage />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('toggles to register form', () => {
    render(<AuthPage />);
    fireEvent.click(screen.getByText('Register', { selector: '.auth-toggle button' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Register');
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  it('has submit button', () => {
    render(<AuthPage />);
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });
});
