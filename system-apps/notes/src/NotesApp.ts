import React from 'react';
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { Container } from '@browser-os/core';
import { VfsImpl } from '@browser-os/fs';
import { NotesView } from './NotesView';

/**
 * Notes application - simple text editor
 */
export class NotesApp extends App {
  readonly id = 'notes';
  readonly name = 'Notes';
  readonly version = '1.0.0';
  
  private vfs: VfsImpl;
  
  constructor(container: Container) {
    super(container);
    this.vfs = container.resolve('vfs');
  }
  
  initialWindow(config?: Record<string, any>): Window {
    return new Window(
      this.id,
      'Notes',
      { x: 100, y: 100, w: 800, h: 600 },
      config?.workspaceId || 'default',
      config,
      this.eventBus
    );
  }
  
  createComponent(window: Window, config?: Record<string, any>): React.ComponentType<any> {
    return () => <NotesView window={window} vfs={this.vfs} />;
  }
}

