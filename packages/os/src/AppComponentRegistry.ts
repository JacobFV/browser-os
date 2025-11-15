import React from 'react';
import { EventBus } from '@browser-os/events';
import type { AppComponentRegistry as IAppComponentRegistry, AppComponent, AppComponentProps } from '@browser-os/workspace';

export type { AppComponentProps, AppComponent };

/**
 * Registry that maps app IDs to React components
 */
export class AppComponentRegistry implements IAppComponentRegistry {
  private components: Map<string, AppComponent> = new Map();
  private eventBus?: EventBus;

  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Register an app component
   */
  registerAppComponent(appId: string, component: AppComponent): void {
    this.components.set(appId, component);
    this.eventBus?.emit('app:component:registered', { appId }, { source: 'app-component-registry' });
  }

  /**
   * Get an app component by ID
   */
  getAppComponent(appId: string): AppComponent | null {
    return this.components.get(appId) ?? null;
  }

  /**
   * Check if an app component is registered
   */
  hasAppComponent(appId: string): boolean {
    return this.components.has(appId);
  }

  /**
   * Unregister an app component
   */
  unregisterAppComponent(appId: string): void {
    this.components.delete(appId);
    this.eventBus?.emit('app:component:unregistered', { appId }, { source: 'app-component-registry' });
  }
}

