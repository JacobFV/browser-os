/**
 * Strict types for app and window configuration
 */

import type { WindowId, AppId, WorkspaceId } from './id';
import type { WindowBounds, WindowState } from './event-bus';

/**
 * Configuration for creating a window
 */
export interface WindowConfig {
  title?: string;
  bounds?: WindowBounds;
  workspaceId?: WorkspaceId;
  state?: WindowState;
  payload?: Record<string, unknown>;
}

/**
 * Configuration for launching an app
 */
export interface AppLaunchConfig extends WindowConfig {
  // Additional app-specific launch options can be added here
}

/**
 * Configuration for app initialization
 */
export interface AppConfig {
  id: AppId;
  name: string;
  version: string;
  defaultWindow?: {
    bounds: WindowBounds;
    state?: WindowState;
  };
}

