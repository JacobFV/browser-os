import type { Event } from '@browser-os/schemas';
import type { EventHandler, Unsubscribe, RequestOptions } from './types';

export class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private patternHandlers: Array<{ pattern: string | RegExp; handler: EventHandler }> = [];
  private requestHandlers: Map<string, EventHandler> = new Map();
  private pendingRequests: Map<string, { resolve: (value: unknown) => void; reject: (error: Error) => void; timeout?: NodeJS.Timeout }> = new Map();

  /**
   * Subscribe to events of a specific type
   */
  on(type: string, handler: EventHandler): Unsubscribe {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.handlers.delete(type);
        }
      }
    };
  }

  /**
   * Subscribe to events matching a pattern
   */
  onPattern(pattern: string | RegExp, handler: EventHandler): Unsubscribe {
    this.patternHandlers.push({ pattern, handler });
    const index = this.patternHandlers.length - 1;

    return () => {
      this.patternHandlers.splice(index, 1);
    };
  }

  /**
   * Emit an event
   */
  emit(type: string, payload: unknown, options?: { source?: string; target?: string }): void {
    const event: Event = {
      type,
      payload,
      source: options?.source,
      target: options?.target,
      timestamp: Date.now(),
    };

    // Handle direct type matches
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${type}:`, error);
        }
      });
    }

    // Handle pattern matches
    this.patternHandlers.forEach(({ pattern, handler }) => {
      const matches =
        typeof pattern === 'string'
          ? type.includes(pattern) || type === pattern
          : pattern.test(type);
      if (matches) {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in pattern handler for ${type}:`, error);
        }
      }
    });

    // Handle request-response pattern
    if (event.target && this.pendingRequests.has(event.target)) {
      const request = this.pendingRequests.get(event.target)!;
      clearTimeout(request.timeout);
      this.pendingRequests.delete(event.target);
      request.resolve(event.payload);
    }
  }

  /**
   * Request-response pattern: send a request and wait for a response
   */
  async request(type: string, payload: unknown, options?: RequestOptions): Promise<unknown> {
    const requestId = `${type}:${Date.now()}:${Math.random()}`;
    const timeout = options?.timeout ?? 5000;

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Request timeout: ${type}`));
      }, timeout);

      this.pendingRequests.set(requestId, {
        resolve: (value) => {
          clearTimeout(timeoutId);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        timeout: timeoutId,
      });

      this.emit(type, payload, {
        source: options?.source,
        target: requestId,
      });
    });
  }

  /**
   * Respond to requests
   */
  respond(type: string, handler: (request: Event) => Promise<unknown> | unknown): Unsubscribe {
    this.requestHandlers.set(type, async (event: Event) => {
      try {
        const response = await handler(event);
        if (event.source) {
          this.emit(`${type}:response`, response, { target: event.source });
        }
      } catch (error) {
        if (event.source) {
          this.emit(`${type}:error`, error instanceof Error ? error.message : String(error), {
            target: event.source,
          });
        }
      }
    });

    return () => {
      this.requestHandlers.delete(type);
    };
  }

  /**
   * Remove all handlers
   */
  clear(): void {
    this.handlers.clear();
    this.patternHandlers = [];
    this.requestHandlers.clear();
    this.pendingRequests.forEach((request) => {
      if (request.timeout) {
        clearTimeout(request.timeout);
      }
      request.reject(new Error('EventBus cleared'));
    });
    this.pendingRequests.clear();
  }
}

