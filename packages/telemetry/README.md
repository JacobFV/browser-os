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

### Recording Metrics

```typescript
import { recordMetric, telemetry } from '@browser-os/telemetry';

// Record a metric
recordMetric('window.open.duration', 150, { appId: 'files' });
recordMetric('memory.usage', 1024 * 1024 * 50); // 50MB

// Record metric with tags
recordMetric('api.request', 200, {
  endpoint: '/api/data',
  method: 'GET',
});
```

### Logging

```typescript
import { log } from '@browser-os/telemetry';

// Info log
log('info', 'Window opened', { winId: 'win-123' });

// Warning log
log('warn', 'Low memory', { available: 1024 * 1024 * 10 });

// Error log
log('error', 'Failed to load app', { appId: 'my-app', error: '...' });
```

### Querying Metrics

```typescript
import { telemetry } from '@browser-os/telemetry';

// Get all metrics
const allMetrics = telemetry.getMetrics();

// Get metrics by name
const windowMetrics = telemetry.getMetrics('window.open.duration');

// Get logs
const allLogs = telemetry.getLogs();
const errors = telemetry.getLogs('error');
```

### Enabling/Disabling

```typescript
import { telemetry } from '@browser-os/telemetry';

// Disable telemetry
telemetry.setEnabled(false);

// Enable telemetry
telemetry.setEnabled(true);
```

## Metric Interface

```typescript
interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}
```

## Log Entry Interface

```typescript
interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  context?: Record<string, any>;
}
```

## Privacy

Telemetry is privacy-safe:
- No personal data collected
- Anonymized metrics
- User can disable
- Local storage only (by default)

## Performance Metrics

Common metrics to track:

```typescript
// Window operations
recordMetric('window.open.duration', duration);
recordMetric('window.close.duration', duration);
recordMetric('window.resize.duration', duration);

// App operations
recordMetric('app.load.duration', duration);
recordMetric('app.render.duration', duration);

// Memory
recordMetric('memory.usage', bytes);
recordMetric('memory.peak', bytes);

// Network
recordMetric('network.request.duration', duration);
recordMetric('network.request.size', bytes);
```

## Log Levels

- **info**: Informational messages
- **warn**: Warning messages
- **error**: Error messages

## Clearing Data

```typescript
import { telemetry } from '@browser-os/telemetry';

// Clear all metrics and logs
telemetry.clear();
```

## API Reference

See [TypeScript definitions](./dist/index.d.ts) for complete API documentation.

