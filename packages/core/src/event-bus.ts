/**
 * Event bus with typed channels
 */
import type { WindowId, AppId, Pid } from './id';

type EventHandler<T> = (data: T) => void;
type ChannelMap = {
  window: WindowEvent;
  proc: ProcessEvent;
  fs: FsEvent;
  cursor: CursorEvent;
  notif: NotificationEvent;
};

export type WindowEvent =
  | { type: 'open'; winId: WindowId; appId: AppId }
  | { type: 'close'; winId: WindowId }
  | { type: 'focus'; winId: WindowId }
  | { type: 'blur'; winId: WindowId }
  | { type: 'move'; winId: WindowId; x: number; y: number }
  | { type: 'resize'; winId: WindowId; w: number; h: number }
  | { type: 'minimize'; winId: WindowId }
  | { type: 'maximize'; winId: WindowId }
  | { type: 'restore'; winId: WindowId }
  | { type: 'update'; winId: WindowId };

export type ProcessEvent =
  | { type: 'spawn'; pid: Pid; appId: AppId }
  | { type: 'kill'; pid: Pid }
  | { type: 'suspend'; pid: Pid }
  | { type: 'resume'; pid: Pid }
  | { type: 'crash'; pid: Pid; error: string };

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

export class EventBus {
  private handlers: Map<keyof ChannelMap, Set<EventHandler<ChannelMap[keyof ChannelMap]>>> = new Map();

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
    const handlersSet = this.handlers.get(channel)!;
    handlersSet.add(handler as EventHandler<ChannelMap[keyof ChannelMap]>);

    // Return unsubscribe function
    return () => {
      handlersSet.delete(handler as EventHandler<ChannelMap[keyof ChannelMap]>);
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
          (handler as EventHandler<ChannelMap[K]>)(data);
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

/**
 * Base types
 */
export type ID = string;
export type Timestamp = number;

