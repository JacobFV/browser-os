import React from 'react';
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { Container, ViewportService, WindowPlacementService } from '@browser-os/core';
import { AppManager } from '@browser-os/app-sdk';
import { StoreView } from './StoreView';

/**
 * Store application - app catalog and installation
 */
export class StoreApp extends App {
  readonly id = 'store';
  readonly name = 'Store';
  readonly version = '1.0.0';
  
  private appManager: AppManager;
  
  constructor(container: Container) {
    super(container);
    this.appManager = container.resolve('appManager');
  }
  
  initialWindow(config?: Record<string, unknown>): Window {
    const viewportService = this.container.resolve<ViewportService>('viewportService');
    const windowPlacementService = this.container.resolve<WindowPlacementService>('windowPlacementService');
    return new Window(
      this.id,
      'App Store',
      { w: 900, h: 700 },
      config?.workspaceId as string || 'default',
      config,
      this.eventBus,
      viewportService,
      windowPlacementService
    );
  }
  
  createComponent(window: Window, config?: Record<string, unknown>): React.ComponentType {
    return () => <StoreView window={window} appManager={this.appManager} />;
  }
}

