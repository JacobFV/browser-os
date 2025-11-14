import { EventBus } from './EventBus';
import type { EventHandler, Unsubscribe } from './types';

/**
 * Channel provides a named communication channel for IPC
 */
export class Channel {
  private prefix: string;

  constructor(private name: string, private bus: EventBus) {
    this.prefix = `channel:${name}:`;
  }

  /**
   * Send a message on this channel
   */
  send(type: string, payload: unknown): void {
    this.bus.emit(`${this.prefix}${type}`, payload);
  }

  /**
   * Listen for messages on this channel
   */
  on(type: string, handler: EventHandler): Unsubscribe {
    return this.bus.on(`${this.prefix}${type}`, handler);
  }

  /**
   * Request-response pattern
   */
  async request(type: string, payload: unknown, timeout?: number): Promise<unknown> {
    return this.bus.request(`${this.prefix}${type}`, payload, { timeout });
  }

  /**
   * Respond to requests
   */
  respond(type: string, handler: (payload: unknown) => Promise<unknown> | unknown): Unsubscribe {
    return this.bus.respond(`${this.prefix}${type}`, async (event) => {
      return handler(event.payload);
    });
  }
}

