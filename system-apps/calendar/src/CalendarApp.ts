import React from 'react';
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { ProcessManager } from '@browser-os/process';
import { EventBus } from '@browser-os/core';
import { CalendarView } from './CalendarView';

/**
 * Calendar application
 */
export class CalendarApp extends App {
  readonly id = 'calendar';
  readonly name = 'Calendar';
  readonly version = '1.0.0';
  
  constructor(processManager: ProcessManager, eventBus: EventBus) {
    super(processManager, eventBus);
  }
  
  initialWindow(config?: Record<string, any>): Window {
    return new Window(
      this.id,
      'Calendar',
      { x: 200, y: 200, w: 700, h: 600 },
      config?.workspaceId || 'default',
      config,
      this.eventBus
    );
  }
  
  createComponent(window: Window, config?: Record<string, any>): React.ComponentType<any> {
    return () => <CalendarView window={window} />;
  }
}

