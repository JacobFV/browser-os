# @browser-os/telemetry

Telemetry and logging system for browser-os.

## Installation

```bash
pnpm add @browser-os/telemetry
```

## Features

- **Metrics**: Record performance and usage metrics
- **Logging**: Structured logging (info, warn, error)
- **Privacy-Safe**: Anonymized telemetry
- **Toggle**: Enable/disable telemetry

## Usage

```typescript
import { recordMetric, log, telemetry } from '@browser-os/telemetry';

// Record metrics
recordMetric('window.open.duration', 150, { appId: 'files' });
recordMetric('memory.usage', 1024 * 1024 * 50);

// Logging
log('info', 'Window opened', { winId: 'win-123' });
log('warn', 'Low memory', { available: 1024 * 1024 * 10 });
log('error', 'Failed to load app', { appId: 'my-app', error: '...' });

// Query metrics
const allMetrics = telemetry.getMetrics();
const windowMetrics = telemetry.getMetrics('window.open.duration');
const errors = telemetry.getLogs('error');

// Enable/disable
telemetry.setEnabled(false);
telemetry.setEnabled(true);
```

## Privacy

Telemetry is privacy-safe:
- No personal data collected
- Anonymized metrics
- User can disable
- Local storage only (by default)

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

