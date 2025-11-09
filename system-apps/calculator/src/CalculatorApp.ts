import React from 'react';
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { ProcessManager } from '@browser-os/process';
import { EventBus } from '@browser-os/core';
import { CalculatorView } from './CalculatorView';

/**
 * Calculator application
 */
export class CalculatorApp extends App {
  readonly id = 'calculator';
  readonly name = 'Calculator';
  readonly version = '1.0.0';
  
  constructor(processManager: ProcessManager, eventBus: EventBus) {
    super(processManager, eventBus);
  }
  
  initialWindow(config?: Record<string, any>): Window {
    return new Window(
      this.id,
      'Calculator',
      { x: 200, y: 200, w: 300, h: 400 },
      config?.workspaceId || 'default',
      config,
      this.eventBus
    );
  }
  
  createComponent(window: Window, config?: Record<string, any>): React.ComponentType<any> {
    return () => <CalculatorView window={window} />;
  }
  
  async onLaunch(window: Window, config?: Record<string, any>): Promise<void> {
    // Initialize process
    this.initialize();
  }
  
  onClose(window: Window): void {
    // Cleanup process
    this.cleanup();
  }
}

