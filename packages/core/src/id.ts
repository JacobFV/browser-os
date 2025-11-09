import { ulid } from 'ulid';

/**
 * Generate a unique ID using ULID
 */
export function createId(): string {
  return ulid();
}

/**
 * Clock/time utilities
 */
export class Clock {
  static now(): number {
    return Date.now();
  }

  static nowSeconds(): number {
    return Math.floor(Date.now() / 1000);
  }

  static timestamp(): string {
    return new Date().toISOString();
  }
}

