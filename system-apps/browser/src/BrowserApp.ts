import React from 'react';
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { ProcessManager } from '@browser-os/process';
import { EventBus } from '@browser-os/core';
import { BrowserView } from './BrowserView';

/**
 * Browser application
 */
export class BrowserApp extends App {
  readonly id = 'browser';
  readonly name = 'Browser';
  readonly version = '1.0.0';
  
  constructor(processManager: ProcessManager, eventBus: EventBus) {
    super(processManager, eventBus);
  }
  
  initialWindow(config?: Record<string, any>): Window {
    return new Window(
      this.id,
      'Browser',
      { x: 100, y: 100, w: 1000, h: 700 },
      config?.workspaceId || 'default',
      config,
      this.eventBus
    );
  }
  
  createComponent(window: Window, config?: Record<string, any>): React.ComponentType<any> {
    return () => <BrowserView window={window} />;
  }
}

