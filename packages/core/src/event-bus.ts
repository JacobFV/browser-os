/**
 * Event bus with typed channels
 */
type EventHandler<T = any> = (data: T) => void;
type ChannelMap = {
  window: WindowEvent;
  proc: ProcessEvent;
  fs: FsEvent;
  cursor: CursorEvent;
  notif: NotificationEvent;
};

export type WindowEvent =
  | { type: 'open'; winId: string; appId: string }
  | { type: 'close'; winId: string }
  | { type: 'focus'; winId: string }
  | { type: 'blur'; winId: string }
  | { type: 'move'; winId: string; x: number; y: number }
  | { type: 'resize'; winId: string; w: number; h: number }
  | { type: 'minimize'; winId: string }
  | { type: 'maximize'; winId: string }
  | { type: 'restore'; winId: string }
  | { type: 'update'; winId: string };

export type ProcessEvent =
  | { type: 'spawn'; pid: string; appId: string }
  | { type: 'kill'; pid: string }
  | { type: 'suspend'; pid: string }
  | { type: 'resume'; pid: string }
  | { type: 'crash'; pid: string; error: string };

export type FsEvent =
  | { type: 'mount'; mountPoint: string; driver: string }
  | { type: 'unmount'; mountPoint: string }
  | { type: 'write'; path: string }
  | { type: 'delete'; path: string }
  | { type: 'rename'; oldPath: string; newPath: string };

export type CursorEvent =
  | { type: 'move'; id: string; x: number; y: number }
  | { type: 'enter'; id: string }
  | { type: 'leave'; id: string };

export type NotificationEvent =
  | { type: 'show'; id: string; title: string; body?: string }
  | { type: 'dismiss'; id: string }
  | { type: 'click'; id: string };

class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  /**
   * Subscribe to a channel
   */
  on<K extends keyof ChannelMap>(
    channel: K,
    handler: EventHandler<ChannelMap[K]>
  ): () => void {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    this.handlers.get(channel)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(channel)?.delete(handler);
    };
  }

  /**
   * Emit an event to a channel
   */
  emit<K extends keyof ChannelMap>(channel: K, data: ChannelMap[K]): void {
    const handlers = this.handlers.get(channel);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${channel}:`, error);
        }
      });
    }
  }

  /**
   * Remove all handlers for a channel
   */
  clear(channel?: keyof ChannelMap): void {
    if (channel) {
      this.handlers.delete(channel);
    } else {
      this.handlers.clear();
    }
  }
}

export const eventBus = new EventBus();

/**
 * Base types
 */
export type ID = string;
export type Timestamp = number;

