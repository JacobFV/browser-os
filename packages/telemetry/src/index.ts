import { eventBus } from '@browser-os/core';

export interface TelemetryEvent {
  type: string;
  timestamp: number;
  data?: Record<string, any>;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  processes: number;
  windows: number;
}

class TelemetryManager {
  private events: TelemetryEvent[] = [];
  private maxEvents = 1000;
  
  record(event: Omit<TelemetryEvent, 'timestamp'>): void {
    const telemetryEvent: TelemetryEvent = {
      ...event,
      timestamp: Date.now(),
    };
    
    this.events.push(telemetryEvent);
    
    // Keep only last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
    
    // Emit event for listeners
    eventBus.emit('telemetry', telemetryEvent);
  }
  
  getEvents(type?: string): TelemetryEvent[] {
    if (type) {
      return this.events.filter(e => e.type === type);
    }
    return [...this.events];
  }
  
  clear(): void {
    this.events = [];
  }
  
  getSystemMetrics(): SystemMetrics {
    const memory = (performance as any).memory?.usedJSHeapSize || 0;
    const cpu = performance.now();
    
    // Get process and window counts from event bus or managers
    // This is a simplified version - in reality you'd query the managers
    const processes = 0; // Would query processManager
    const windows = 0; // Would query windowManager
    
    return {
      cpu,
      memory,
      processes,
      windows,
    };
  }
}

export const telemetryManager = new TelemetryManager();

export function recordTelemetry(event: Omit<TelemetryEvent, 'timestamp'>): void {
  telemetryManager.record(event);
}

export function getTelemetryEvents(type?: string): TelemetryEvent[] {
  return telemetryManager.getEvents(type);
}

export function clearTelemetry(): void {
  telemetryManager.clear();
}

export function getSystemMetrics(): SystemMetrics {
  return telemetryManager.getSystemMetrics();
}
