# Developing

This guide covers how to set up your development environment and contribute to browser-os.

## Prerequisites

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0
- **Git**: For version control

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd browser-os

# Install dependencies
pnpm install
```

### Development Scripts

```bash
# Build all packages
pnpm build

# Run development server for desktop shell
pnpm --filter @browser-os/desktop-shell dev

# Run tests
pnpm test

# Run linting
pnpm lint

# Clean build artifacts
pnpm clean
```

## Project Structure

```
browser-os/
├── apps/
│   └── desktop-shell/      # Main application
├── packages/               # Core packages
│   ├── events/             # Event bus
│   ├── fs/                 # Filesystem
│   ├── kernel/             # Kernel
│   ├── os/                 # OS component
│   ├── proc/               # Process management
│   ├── schemas/            # Type schemas
│   ├── taskbar/            # Taskbar
│   ├── windowing/          # Windowing
│   └── workspace/          # Workspace management
└── system-apps/            # System applications
```

## Monorepo Setup

This project uses:

- **pnpm workspaces**: For monorepo management
- **Turbo**: For build orchestration
- **TypeScript**: For type safety

### Adding a New Package

1. Create directory in `packages/`
2. Add `package.json` with name `@browser-os/<package-name>`
3. Add `tsconfig.json` extending root config
4. Update `pnpm-workspace.yaml` if needed (usually not required)
5. Add package to dependencies where needed

### Package Dependencies

Packages can depend on other packages using workspace protocol:

```json
{
  "dependencies": {
    "@browser-os/events": "workspace:*"
  }
}
```

## Development Workflow

### Running Tests

Each package can have its own tests:

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @browser-os/kernel test
```

Tests use Vitest. See individual package `vitest.config.ts` files for configuration.

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @browser-os/kernel build
```

Build outputs go to `dist/` in each package.

### Type Checking

TypeScript is used throughout. The root `tsconfig.json` provides base configuration that packages extend.

```bash
# Type check all packages
pnpm build  # Build includes type checking
```

## Code Style

### TypeScript

- Use TypeScript for all code
- Prefer interfaces over types for public APIs
- Use Zod schemas for runtime validation (see `@browser-os/schemas`)

### React Components

- Use functional components with hooks
- Prefer composition over inheritance
- Keep components focused and small

### File Organization

- One main export per file
- Co-locate related files
- Use index files for public API

## Testing

### Unit Tests

Each package should have unit tests:

```typescript
import { describe, it, expect } from 'vitest';
import { MyClass } from './MyClass';

describe('MyClass', () => {
  it('should work', () => {
    const instance = new MyClass();
    expect(instance).toBeDefined();
  });
});
```

### Integration Tests

Test packages together:

```typescript
import { Kernel } from '@browser-os/kernel';
import { FileSystem } from '@browser-os/fs';

describe('Kernel integration', () => {
  it('should initialize filesystem', async () => {
    const kernel = new Kernel();
    await kernel.init();
    const fs = kernel.getFS();
    expect(fs).toBeDefined();
  });
});
```

## Debugging

### Browser DevTools

The desktop shell runs in the browser, so use browser DevTools:

- **Console**: For logs and errors
- **Network**: For filesystem operations
- **Application**: For IndexedDB inspection

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["test"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Contributing

### Making Changes

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Write/update tests
4. Run tests: `pnpm test`
5. Build: `pnpm build`
6. Commit: `git commit -m "Add feature"`
7. Push: `git push origin feature/my-feature`

### Pull Request Process

1. Ensure all tests pass
2. Ensure code builds without errors
3. Update documentation if needed
4. Create pull request with clear description

### Commit Messages

Use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/tooling changes

## Package-Specific Development

### Events Package

Core event bus system. Changes here affect all packages.

```bash
cd packages/events
pnpm test
```

### Kernel Package

Central orchestrator. Test initialization and syscall routing carefully.

```bash
cd packages/kernel
pnpm test
```

### OS Component

UI component that composes system components. Test in browser.

```bash
cd packages/os
pnpm build
```

### Desktop Shell

Main application. Run dev server to see changes.

```bash
cd apps/desktop-shell
pnpm dev
```

## Common Issues

### Build Failures

- Ensure all dependencies are installed: `pnpm install`
- Clear build cache: `pnpm clean && pnpm build`
- Check TypeScript errors: `pnpm build`

### Test Failures

- Run tests in watch mode: `pnpm test --watch`
- Check test setup files
- Ensure mocks are properly configured

### Dependency Issues

- Clear pnpm store: `pnpm store prune`
- Reinstall: `rm -rf node_modules && pnpm install`

## Resources

- [Architecture Guide](./ARCHITECTURE.md) - System architecture
- Package READMEs - Individual package documentation
- [Turbo Documentation](https://turbo.build/repo/docs) - Build system docs
- [pnpm Documentation](https://pnpm.io/) - Package manager docs

