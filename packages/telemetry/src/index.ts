import { EventBus } from '@browser-os/core';

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

export class TelemetryManager {
  private events: TelemetryEvent[] = [];
  private maxEvents = 1000;
  private eventBus: EventBus;
  
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }
  
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
    
    // Note: Telemetry events are stored internally and can be queried via getEvents()
    // If external event emission is needed, add 'telemetry' channel to core event bus
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
