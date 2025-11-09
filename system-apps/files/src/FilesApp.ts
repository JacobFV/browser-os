import React from 'react';
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { ProcessManager } from '@browser-os/process';
import { VfsImpl } from '@browser-os/fs';
import { EventBus } from '@browser-os/core';
import { FilesView } from './FilesView';

/**
 * Files application - file manager for browser-os
 */
export class FilesApp extends App {
  readonly id = 'files';
  readonly name = 'Files';
  readonly version = '1.0.0';
  
  constructor(
    processManager: ProcessManager,
    eventBus: EventBus,
    private vfs: VfsImpl,
    private initialPath: string = 'vfs://documents/'
  ) {
    super(processManager, eventBus);
  }
  
  initialWindow(config?: Record<string, any>): Window {
    return new Window(
      this.id,
      'Files',
      { x: 100, y: 100, w: 900, h: 700 },
      config?.workspaceId || 'default',
      { initialPath: config?.initialPath || this.initialPath, ...config },
      this.eventBus
    );
  }
  
  createComponent(window: Window, config?: Record<string, any>): React.ComponentType<any> {
    return () => (
      <FilesView 
        window={window}
        vfs={this.vfs}
        initialPath={window.payload?.initialPath || this.initialPath}
      />
    );
  }
}

