import { ulid } from 'ulid';

/**
 * Branded types for IDs to prevent mixing different ID types
 * These provide compile-time type safety while remaining compatible with strings
 */

/**
 * Branded type for Window IDs
 */
export type WindowId = string & { readonly __brand: 'WindowId' };

/**
 * Branded type for App IDs
 */
export type AppId = string & { readonly __brand: 'AppId' };

/**
 * Branded type for Process IDs
 */
export type Pid = string & { readonly __brand: 'Pid' };

/**
 * Branded type for Workspace IDs
 */
export type WorkspaceId = string & { readonly __brand: 'WorkspaceId' };

/**
 * Generate a unique ID using ULID
 * Returns a plain string (not branded) - use createWindowId/createAppId/createPid for branded types
 */
export function createId(): string {
  return ulid();
}

/**
 * Create a branded WindowId
 */
export function createWindowId(): WindowId {
  return createId() as WindowId;
}

/**
 * Create a branded AppId
 */
export function createAppId(): AppId {
  return createId() as AppId;
}

/**
 * Create a branded Pid
 */
export function createPid(): Pid {
  return createId() as Pid;
}

/**
 * Create a branded WorkspaceId
 */
export function createWorkspaceId(): WorkspaceId {
  return createId() as WorkspaceId;
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

