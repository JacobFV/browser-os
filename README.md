# browser-os

A monorepo for browser-based operating system UI components built with React.

## Overview

browser-os provides a collection of React component libraries that recreate classic operating system interfaces in the browser. Each package represents a different OS theme and UI paradigm.

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

This project uses [pnpm](https://pnpm.io/) workspaces for monorepo management. Install pnpm globally if you haven't already:

```bash
npm install -g pnpm
```

## Packages

- **[windows](./packages/windows)** - Windows-style UI components

## Examples

- **[win95](./examples/win95)** - Windows 95 demonstration application

## Getting Started

### Installation

Install all dependencies for the monorepo:

```bash
pnpm install
```

This will install dependencies for all packages and examples in the workspace.

### Development

Build all packages:

```bash
pnpm build
```

Run development mode for all packages:

```bash
pnpm dev
```

### Working with Individual Packages

Each package can be developed independently. Use pnpm's filter flag to run commands for specific packages:

```bash
# Build a specific package
pnpm --filter @browser-os/windows build

# Run dev mode for a specific package
pnpm --filter @browser-os/windows dev
```

Or navigate to the package directory and use its specific scripts:

```bash
cd packages/windows
pnpm dev
```

### Running Examples

Examples demonstrate how to use the component libraries. Run the win95 example:

```bash
# From the root directory
pnpm --filter @browser-os/example-win95 dev

# Or navigate to the example directory
cd examples/win95
pnpm dev
```

The example will be available at `http://localhost:3000`.

## Project Structure

```
browser-os/
├── packages/
│   └── windows/          # Windows UI components
├── examples/
│   └── win95/            # Windows 95 example application
├── package.json          # Root package.json with workspace scripts
├── pnpm-workspace.yaml   # pnpm workspace configuration
└── README.md            # This file
```

## Monorepo Setup

This project uses pnpm workspaces. The workspace configuration is defined in `pnpm-workspace.yaml`. Local packages are referenced using the `workspace:*` protocol in `package.json` dependencies.

### Building Packages

Before using a package in an example, ensure it's built:

```bash
pnpm --filter @browser-os/windows build
```

Or build all packages:

```bash
pnpm build
```

## License

MIT

