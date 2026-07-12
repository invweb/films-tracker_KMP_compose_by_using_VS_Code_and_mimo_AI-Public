# Contributing to Films

Thank you for your interest in contributing to Films! This document provides guidelines and information about contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help create a welcoming environment

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 20+
- JDK 17+ (for KMP features)
- Git

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/films-tracker.git
cd films-tracker

# Install server dependencies
cd server
npm install

# Install web dependencies
cd ../web
npm install
```

### Running Locally

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd web
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
films-tracker/
├── web/                    # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API and services
│   │   ├── hooks/         # Custom hooks
│   │   ├── contexts/      # React contexts
│   │   ├── locales/       # Translations (en, ru)
│   │   └── __tests__/     # Tests
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── index.ts       # Entry point
│   └── package.json
├── films-app/              # Kotlin Multiplatform
└── .github/workflows/      # CI/CD
```

## Making Changes

### Branch Naming

- `feature/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation changes
- `refactor/description` — Code refactoring

### Commit Messages

Use conventional commits:

```
feat: add user reviews
fix: resolve login issue
docs: update README
refactor: optimize API calls
test: add unit tests for auth
chore: update dependencies
```

## Testing

### Run All Tests

```bash
cd web
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Writing Tests

- Place tests in `__tests__/` directory
- Name files as `*.test.ts` or `*.test.tsx`
- Use Vitest and Testing Library

Example:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure tests pass**: `npm test`
4. **Update translations** if adding UI text
5. **Create PR** with clear description
6. **Wait for review** and address feedback

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactoring

## Testing
- [ ] Tests added/updated
- [ ] All tests pass

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Translations added (if applicable)
```

## Style Guidelines

### TypeScript/React

- Use TypeScript for all new code
- Prefer functional components with hooks
- Use meaningful variable/function names
- Keep components small and focused

### CSS

- Use CSS variables for theming
- Follow BEM-like naming (kebab-case)
- Mobile-first responsive design

### API

- RESTful conventions
- Proper error handling
- Input validation

### Translations

- Add keys to both `en.json` and `ru.json`
- Use nested keys for related strings
- Keep translations concise

## Questions?

Open an issue for any questions about contributing.
