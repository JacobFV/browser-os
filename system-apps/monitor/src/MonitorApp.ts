import React from 'react';
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { Container } from '@browser-os/core';
import { MonitorView } from './MonitorView';

/**
 * Monitor application - process monitor
 */
export class MonitorApp extends App {
  readonly id = 'monitor';
  readonly name = 'Monitor';
  readonly version = '1.0.0';
  
  constructor(container: Container) {
    super(container);
  }
  
  initialWindow(config?: Record<string, any>): Window {
    return this.createWindowInstance(
      'Process Monitor',
      { w: 900, h: 600 },
      config
    );
  }
  
  createComponent(window: Window, config?: Record<string, any>): React.ComponentType<any> {
    return () => <MonitorView window={window} processManager={this.processManager} eventBus={this.eventBus} />;
  }
}

