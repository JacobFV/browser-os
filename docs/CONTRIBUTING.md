# Contributing to browser-os

Thank you for your interest in contributing to browser-os! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd browser-os

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

## Development Workflow

### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Build and test:
   ```bash
   pnpm build
   pnpm test
   ```

4. Commit your changes:
   ```bash
   git commit -m "feat: add your feature"
   ```

### Package Development

When working on a specific package:

```bash
# Build in watch mode
pnpm --filter @browser-os/your-package dev

# Build the package
pnpm --filter @browser-os/your-package build

# Run tests
pnpm --filter @browser-os/your-package test
```

### App Development

When working on an app:

```bash
# Run in development mode
pnpm --filter @browser-os/web-shell dev

# Build for production
pnpm --filter @browser-os/web-shell build
```

## Code Style

### TypeScript

- Use strict TypeScript
- Prefer interfaces over types for public APIs
- Use explicit return types for exported functions
- Document public APIs with JSDoc comments

### React

- Use functional components with hooks
- Prefer `React.FC` or explicit prop types
- Use `React.memo` for expensive components
- Keep components focused and composable

### Naming Conventions

- Packages: `@browser-os/package-name`
- Components: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example:
```
feat(windowing): add snap-to-grid functionality
```

## Pull Requests

1. Ensure all tests pass
2. Update documentation if needed
3. Add tests for new features
4. Keep PRs focused and small
5. Write clear PR descriptions

## Package Guidelines

### Creating a New Package

1. Create directory in `packages/`
2. Add `package.json` with proper name (`@browser-os/package-name`)
3. Add TypeScript config
4. Add build config (tsup)
5. Create `src/index.ts` with exports
6. Add README.md

### Package Structure

```
packages/your-package/
├── src/
│   ├── index.ts
│   └── ...
├── package.json
├── tsconfig.json
├── tsup.config.ts
└── README.md
```

## Testing

### Unit Tests

Place tests next to source files:

```
src/
├── component.tsx
└── component.test.tsx
```

### E2E Tests

E2E tests go in `apps/web-shell/tests/e2e/`:

```typescript
import { test, expect } from '@playwright/test';

test('opens window', async ({ page }) => {
  // Test implementation
});
```

## Documentation

### README Files

Each package should have a README.md with:
- Description
- Installation
- Usage examples
- API reference
- Examples

### Code Comments

- Document public APIs with JSDoc
- Explain complex logic
- Add TODO comments for future work

## Architecture Decisions

When making significant changes:

1. Document the decision in `docs/ARCHITECTURE.md`
2. Consider backward compatibility
3. Update relevant documentation
4. Discuss in PR if unsure

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for architecture questions
- Check existing issues before creating new ones

Thank you for contributing! 🎉

