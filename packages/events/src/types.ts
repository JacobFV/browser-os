import type { Event } from '@browser-os/schemas';

export type EventHandler = (event: Event) => void | Promise<void>;
export type Unsubscribe = () => void;

export interface RequestOptions {
  timeout?: number;
  source?: string;
  target?: string;
}

