import React from 'react';
import { App } from '@browser-os/app-sdk';
import { Window } from '@browser-os/windowing';
import { Container, createId } from '@browser-os/core';
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
    const title = (config?.title as string) || 'Untitled';
    
    return this.createWindowInstance(
      title,
      { w: 1000, h: 700 },
      { documentId, fileUri: config?.fileUri, ...config }
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

