# Windows 95 Example

A demonstration application showcasing the `@browser-os/windows` component library.

## Features

- Multiple draggable windows
- Taskbar with Start menu
- Window controls (minimize, maximize, close)
- Classic Windows 95 aesthetic

## Prerequisites

This example is part of the browser-os monorepo and requires:
- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Setup

First, ensure dependencies are installed from the root of the monorepo:

```bash
# From the root directory
pnpm install
```

Make sure the `@browser-os/windows` package is built:

```bash
pnpm --filter @browser-os/windows build
```

## Running the Example

From the root directory:

```bash
pnpm --filter @browser-os/example-win95 dev
```

Or navigate to this directory:

```bash
cd examples/win95
pnpm dev
```

The application will open at `http://localhost:3000`.

## Building

Build the example for production:

```bash
pnpm --filter @browser-os/example-win95 build
```

Or from this directory:

```bash
pnpm build
```

## Preview Production Build

Preview the production build:

```bash
pnpm --filter @browser-os/example-win95 preview
```

Or from this directory:

```bash
pnpm preview
```

## Note

This example uses the local `@browser-os/windows` package via pnpm workspace protocol (`workspace:*`). When developing, ensure the windows package is built so changes are reflected in the example.

