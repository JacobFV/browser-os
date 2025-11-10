import React from 'react';
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { Container, ViewportService, WindowPlacementService } from '@browser-os/core';
import { VfsImpl } from '@browser-os/fs';
import { EditorView } from './EditorView';

/**
 * Editor application - Monaco code editor
 */
export class EditorApp extends App {
  readonly id = 'editor';
  readonly name = 'Editor';
  readonly version = '1.0.0';
  
  private vfs: VfsImpl;
  
  constructor(container: Container) {
    super(container);
    this.vfs = container.resolve('vfs');
  }
  
  initialWindow(config?: Record<string, any>): Window {
    const viewportService = this.container.resolve<ViewportService>('viewportService');
    const windowPlacementService = this.container.resolve<WindowPlacementService>('windowPlacementService');
    return new Window(
      this.id,
      'Editor',
      { w: 1000, h: 700 },
      config?.workspaceId || 'default',
      config,
      this.eventBus,
      viewportService,
      windowPlacementService
    );
  }
  
  createComponent(window: Window, config?: Record<string, any>): React.ComponentType<any> {
    return () => <EditorView window={window} vfs={this.vfs} />;
  }
}

