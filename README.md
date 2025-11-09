# browser-os

A monorepo for browser-based operating system UI components built with React.

## Overview

browser-os provides a collection of React component libraries that recreate classic operating system interfaces in the browser. Each package represents a different OS theme and UI paradigm.

## Packages

- **[windows](./packages/windows)** - Windows-style UI components

## Examples

- **[win95](./examples/win95)** - Windows 95 demonstration application

## Getting Started

### Installation

```bash
npm install
```

### Development

Build all packages:

```bash
npm run build
```

Run development mode for all packages:

```bash
npm run dev
```

### Working with Individual Packages

Each package can be developed independently. Navigate to the package directory and use its specific scripts:

```bash
cd packages/windows
npm run dev
```

### Running Examples

Examples demonstrate how to use the component libraries:

```bash
cd examples/win95
npm run dev
```

## Project Structure

```
browser-os/
├── packages/
│   └── windows/          # Windows UI components
├── examples/
│   └── win95/            # Windows 95 example application
├── package.json          # Root package.json with workspaces
└── README.md            # This file
```

## License

MIT

