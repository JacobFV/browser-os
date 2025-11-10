import React from 'react';
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { Container, ViewportService, WindowPlacementService } from '@browser-os/core';
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
    const viewportService = this.container.resolve<ViewportService>('viewportService');
    const windowPlacementService = this.container.resolve<WindowPlacementService>('windowPlacementService');
    return new Window(
      this.id,
      'Process Monitor',
      { w: 900, h: 600 },
      config?.workspaceId || 'default',
      config,
      this.eventBus,
      viewportService,
      windowPlacementService
    );
  }
  
  createComponent(window: Window, config?: Record<string, any>): React.ComponentType<any> {
    return () => <MonitorView window={window} processManager={this.processManager} eventBus={this.eventBus} />;
  }
}

