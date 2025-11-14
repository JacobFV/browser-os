import React from 'react';
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { Container } from '@browser-os/core';
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
    return this.createWindowInstance(
      'Browser',
      { w: 1000, h: 700 },
      config
    );
  }
  
  createComponent(window: Window, config?: Record<string, any>): React.ComponentType<any> {
    return () => <BrowserView window={window} />;
  }
}

