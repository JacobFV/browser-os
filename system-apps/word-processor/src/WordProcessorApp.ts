import React from 'react';
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { Container } from '@browser-os/core';
import { createId } from '@browser-os/core';
import { DocumentWindow } from './DocumentWindow';

/**
 * Word Processor application
 */
export class WordProcessorApp extends App {
  readonly id = 'os.word-processor';
  readonly name = 'Word Processor';
  readonly version = '1.0.0';
  
  constructor(container: Container) {
    super(container);
  }
  
  initialWindow(config?: Record<string, unknown>): Window {
    const documentId = config?.documentId as string || createId();
    
    return new Window(
      this.id,
      config?.title as string || 'Untitled',
      { x: 100, y: 100, w: 1000, h: 700 },
      config?.workspaceId as string || 'default',
      { documentId, fileUri: config?.fileUri, ...config },
      this.eventBus
    );
  }
  
  createComponent(window: Window, config?: Record<string, unknown>): React.ComponentType<any> {
    return () => (
      <DocumentWindow
        documentId={window.payload?.documentId as string}
        windowId={window.id}
        initialFileUri={window.payload?.fileUri as string | undefined}
        window={window}
      />
    );
  }
  
  async onLaunch(window: Window, config?: Record<string, unknown>): Promise<void> {
    this.initialize();
  }
  
  onClose(window: Window): void {
    this.cleanup();
  }
}

