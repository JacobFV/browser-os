import React from 'react';
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { Container, ViewportService, WindowPlacementService } from '@browser-os/core';
import { BrowserView } from './BrowserView';

/**
 * Browser application
 */
export class BrowserApp extends App {
  readonly id = 'browser';
  readonly name = 'Browser';
  readonly version = '1.0.0';
  
  constructor(container: Container) {
    super(container);
  }
  
  initialWindow(config?: Record<string, any>): Window {
    const viewportService = this.container.resolve<ViewportService>('viewportService');
    const windowPlacementService = this.container.resolve<WindowPlacementService>('windowPlacementService');
    return new Window(
      this.id,
      'Browser',
      { w: 1000, h: 700 },
      config?.workspaceId || 'default',
      config,
      this.eventBus,
      viewportService,
      windowPlacementService
    );
  }
  
  createComponent(window: Window, config?: Record<string, any>): React.ComponentType<any> {
    return () => <BrowserView window={window} />;
  }
}

