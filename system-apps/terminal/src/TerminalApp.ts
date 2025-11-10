import React from 'react';
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { Container, ViewportService, WindowPlacementService } from '@browser-os/core';
import { VfsImpl } from '@browser-os/fs';
import { ShellProcess } from './ShellProcess';
import { TerminalView } from './TerminalView';

/**
 * Terminal application with separated shell process logic
 */
export class TerminalApp extends App {
  readonly id = 'terminal';
  readonly name = 'Terminal';
  readonly version = '1.0.0';
  
  private shellProcess?: ShellProcess;
  private vfs: VfsImpl;
  private initialDir: string;
  
  constructor(
    container: Container,
    initialDir: string = 'vfs://documents/'
  ) {
    super(container);
    this.vfs = container.resolve('vfs');
    this.initialDir = initialDir;
  }
  
  initialWindow(config?: Record<string, any>): Window {
    const initialDir = config?.initialDir || this.initialDir;
    const viewportService = this.container.resolve<ViewportService>('viewportService');
    const windowPlacementService = this.container.resolve<WindowPlacementService>('windowPlacementService');
    
    return new Window(
      this.id,
      'Terminal',
      { w: 800, h: 600 },
      config?.workspaceId || 'default',
      { initialDir, ...config },
      this.eventBus,
      viewportService,
      windowPlacementService
    );
  }
  
  createComponent(window: Window, config?: Record<string, any>): React.ComponentType<any> {
    if (!this.shellProcess) {
      throw new Error('Shell process not initialized. onLaunch must be called first.');
    }
    
    return () => (
      <TerminalView 
        shell={this.shellProcess!} 
        window={window}
        initialDir={window.payload?.initialDir || this.initialDir}
      />
    );
  }
  
  async onLaunch(window: Window, config?: Record<string, any>): Promise<void> {
    // Initialize shell process when first window opens
    const initialDir = config?.initialDir || window.payload?.initialDir || this.initialDir;
    this.shellProcess = new ShellProcess(
      this.processManager,
      this.vfs,
      initialDir
    );
    this.initialize();
  }
  
  onClose(window: Window): void {
    // Cleanup shell process
    this.shellProcess?.cleanup();
    this.shellProcess = undefined;
    this.cleanup();
  }
}

