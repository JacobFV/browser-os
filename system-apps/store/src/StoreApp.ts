import React from 'react';
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { Container } from '@browser-os/core';
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
  
  constructor(
    container: Container,
    appManager: AppManager
  ) {
    super(container);
    this.appManager = appManager;
  }
  
  initialWindow(config?: Record<string, any>): Window {
    return new Window(
      this.id,
      'App Store',
      { x: 100, y: 100, w: 900, h: 700 },
      config?.workspaceId || 'default',
      config,
      this.eventBus
    );
  }
  
  createComponent(window: Window, config?: Record<string, any>): React.ComponentType<any> {
    return () => <StoreView window={window} appManager={this.appManager} />;
  }
}

