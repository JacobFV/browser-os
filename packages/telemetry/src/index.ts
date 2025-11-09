import { eventBus } from '@browser-os/core';

export interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  context?: Record<string, any>;
}

class TelemetryManager {
  private metrics: Metric[] = [];
  private logs: LogEntry[] = [];
  private enabled: boolean = true;
  private maxMetrics: number = 1000;
  private maxLogs: number = 1000;

  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.enabled) return;
    
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    };
    
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  log(level: 'info' | 'warn' | 'error', message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      context,
    };
    
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    console[level](`[${level.toUpperCase()}]`, message, context || '');
  }

  getMetrics(name?: string): Metric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  getLogs(level?: 'info' | 'warn' | 'error'): LogEntry[] {
    if (level) {
      return this.logs.filter(l => l.level === level);
    }
    return [...this.logs];
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  clear(): void {
    this.metrics = [];
    this.logs = [];
  }
}

export const telemetry = new TelemetryManager();

export function recordMetric(name: string, value: number, tags?: Record<string, string>): void {
  telemetry.recordMetric(name, value, tags);
}

export function log(level: 'info' | 'warn' | 'error', message: string, context?: Record<string, any>): void {
  telemetry.log(level, message, context);
}

