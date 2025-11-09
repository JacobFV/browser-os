import React from 'react';
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { ProcessManager } from '@browser-os/process';
import { EventBus } from '@browser-os/core';
import { SettingsView } from './SettingsView';

/**
 * Settings application
 */
export class SettingsApp extends App {
  readonly id = 'settings';
  readonly name = 'Settings';
  readonly version = '1.0.0';
  
  constructor(processManager: ProcessManager, eventBus: EventBus) {
    super(processManager, eventBus);
  }
  
  initialWindow(config?: Record<string, any>): Window {
    return new Window(
      this.id,
      'Settings',
      { x: 200, y: 200, w: 600, h: 500 },
      config?.workspaceId || 'default',
      config,
      this.eventBus
    );
  }
  
  createComponent(window: Window, config?: Record<string, any>): React.ComponentType<any> {
    return () => <SettingsView window={window} />;
  }
}

