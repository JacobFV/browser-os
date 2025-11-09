import React from 'react';
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { ProcessManager } from '@browser-os/process';
import { EventBus } from '@browser-os/core';
import { MonitorView } from './MonitorView';

/**
 * Monitor application - process monitor
 */
export class MonitorApp extends App {
  readonly id = 'monitor';
  readonly name = 'Monitor';
  readonly version = '1.0.0';
  
  constructor(
    processManager: ProcessManager,
    eventBus: EventBus
  ) {
    super(processManager, eventBus);
  }
  
  initialWindow(config?: Record<string, any>): Window {
    return new Window(
      this.id,
      'Process Monitor',
      { x: 100, y: 100, w: 900, h: 600 },
      config?.workspaceId || 'default',
      config,
      this.eventBus
    );
  }
  
  createComponent(window: Window, config?: Record<string, any>): React.ComponentType<any> {
    return () => <MonitorView window={window} processManager={this.processManager} eventBus={this.eventBus} />;
  }
}

