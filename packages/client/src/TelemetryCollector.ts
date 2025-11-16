import { EventBus } from '@browser-os/events';
import type { Kernel } from '@browser-os/kernel';
import type { TelemetryData, TelemetryMetrics, TelemetryEvent } from './types';

/**
 * Collects telemetry data from the system
 */
export class TelemetryCollector {
  private eventBuffer: TelemetryEvent[] = [];
  private maxEventBufferSize = 100;
  private eventUnsubscribers: Array<() => void> = [];
  private activeWindowCount = 0;

  constructor(
    private eventBus: EventBus,
    private kernel: Kernel
  ) {}

  /**
   * Start collecting telemetry
   */
  start(): void {
    // Subscribe to process events
    const procUnsub = this.eventBus.onPattern('proc:*', (event) => {
      this.bufferEvent({
        type: event.type,
        timestamp: event.timestamp,
        data: event.payload,
      });
    });
    this.eventUnsubscribers.push(procUnsub);

    // Subscribe to windowing events
    const windowUnsub = this.eventBus.onPattern('windowing:*', (event) => {
      // Track window count from events
      if (event.type === 'windowing:created') {
        this.activeWindowCount++;
      } else if (event.type === 'windowing:destroyed') {
        this.activeWindowCount = Math.max(0, this.activeWindowCount - 1);
      }

      this.bufferEvent({
        type: event.type,
        timestamp: event.timestamp,
        data: event.payload,
      });
    });
    this.eventUnsubscribers.push(windowUnsub);
  }

  /**
   * Stop collecting telemetry
   */
  stop(): void {
    this.eventUnsubscribers.forEach((unsub) => unsub());
    this.eventUnsubscribers = [];
    this.eventBuffer = [];
    this.activeWindowCount = 0;
  }

  /**
   * Collect current telemetry snapshot
   */
  async collect(): Promise<TelemetryData> {
    const metrics = await this.collectMetrics();
    const events = this.flushEvents();

    return {
      timestamp: Date.now(),
      metrics,
      events,
    };
  }

  private async collectMetrics(): Promise<TelemetryMetrics> {
    const procManager = this.kernel.getProcessManager();
    const processes = procManager.list();

    // Get memory usage (approximate based on process count)
    // In a real implementation, this would use performance.memory API if available
    const memoryUsage = this.estimateMemoryUsage(processes.length);

    // Get active windows count (tracked from events)
    const activeWindows = this.activeWindowCount;

    return {
      processCount: processes.length,
      memoryUsage,
      activeWindows,
    };
  }

  private estimateMemoryUsage(processCount: number): number {
    // Rough estimate: each process uses ~5MB base + overhead
    // In a real implementation, use performance.memory if available
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const mem = (performance as { memory?: { usedJSHeapSize?: number } }).memory;
      if (mem?.usedJSHeapSize) {
        return mem.usedJSHeapSize;
      }
    }
    // Fallback estimate
    return processCount * 5 * 1024 * 1024;
  }


  private bufferEvent(event: TelemetryEvent): void {
    this.eventBuffer.push(event);
    if (this.eventBuffer.length > this.maxEventBufferSize) {
      this.eventBuffer.shift();
    }
  }

  private flushEvents(): TelemetryEvent[] {
    const events = [...this.eventBuffer];
    this.eventBuffer = [];
    return events;
  }
}

