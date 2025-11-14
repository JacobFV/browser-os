import React from 'react';
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { Container } from '@browser-os/core';
import { SettingsView } from './SettingsView';

/**
 * Settings application
 */
export class SettingsApp extends App {
  readonly id = 'settings';
  readonly name = 'Settings';
  readonly version = '1.0.0';
  
  constructor(container: Container) {
    super(container);
  }
  
  initialWindow(config?: Record<string, any>): Window {
    return this.createWindowInstance(
      'Settings',
      { w: 600, h: 500 },
      config
    );
  }
  
  createComponent(window: Window, config?: Record<string, any>): React.ComponentType<any> {
    return () => <SettingsView window={window} />;
  }
}

