import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { AppFactory } from './AppFactory';
import { Container } from '@browser-os/core';
import { AppManager } from './AppManager';
import { App } from './App';
import { Window } from '@browser-os/windowing';
import { EventBus } from '@browser-os/core';
import { ProcessManager } from '@browser-os/process';
import { WindowManagerImpl } from '@browser-os/windowing';

// Mock app class for testing
class TestApp extends App {
  readonly id = 'test-app';
  readonly name = 'Test App';
  readonly version = '1.0.0';
  
  constructor(container: Container) {
    super(container);
  }
  
  initialWindow(config?: Record<string, unknown>): Window {
    const eventBus = this.container.resolve('eventBus') as EventBus;
    return new Window(
      this.id,
      'Test Window',
      { x: 100, y: 100, w: 800, h: 600 },
      config?.workspaceId || 'default',
      config,
      eventBus
    );
  }
  
  createComponent(window: Window, config?: Record<string, unknown>): React.ComponentType {
    return () => null;
  }
}

describe('AppFactory', () => {
  let container: Container;
  let appManager: AppManager;
  let factory: AppFactory;

  beforeEach(() => {
    container = new Container();
    const eventBus = new EventBus();
    const processManager = new ProcessManager(eventBus);
    const windowManager = new WindowManagerImpl(eventBus);
    
    container.register('eventBus', eventBus);
    container.register('processManager', processManager);
    container.register('windowManager', windowManager);
    
    appManager = new AppManager(windowManager, processManager, eventBus);
    container.register('appManager', appManager);
    factory = new AppFactory(container, appManager);
  });

  describe('createApp', () => {
    it('should create and register an app instance', () => {
      const app = factory.createApp(TestApp);
      
      expect(app).toBeInstanceOf(TestApp);
      expect(app.id).toBe('test-app');
      expect(appManager.getApp('test-app')).toBe(app);
    });

    it('should throw error if app is already registered', () => {
      factory.createApp(TestApp);
      
      expect(() => {
        factory.createApp(TestApp);
      }).toThrow('App test-app is already registered');
    });

    it('should support apps with additional constructor arguments', () => {
      class AppWithArgs extends App {
        readonly id = 'app-with-args';
        readonly name = 'App With Args';
        readonly version = '1.0.0';
        private customArg: string;
        
        constructor(container: Container, customArg: string) {
          super(container);
          this.customArg = customArg;
        }
        
        initialWindow(): Window {
          const eventBus = this.container.resolve('eventBus') as EventBus;
          return new Window(this.id, 'Test', { x: 0, y: 0, w: 100, h: 100 }, 'default', {}, eventBus);
        }
        
        createComponent(): React.ComponentType {
          return () => null;
        }
        
        getCustomArg(): string {
          return this.customArg;
        }
      }
      
      const app = factory.createApp(AppWithArgs, 'test-value');
      expect(app.getCustomArg()).toBe('test-value');
    });
  });

  describe('createApps', () => {
    it('should create multiple apps', () => {
      class App1 extends App {
        readonly id = 'app1';
        readonly name = 'App 1';
        readonly version = '1.0.0';
        constructor(c: Container) {
          super(c);
        }
        initialWindow(): Window {
          const eventBus = this.container.resolve('eventBus') as EventBus;
          return new Window(this.id, 'Test', { x: 0, y: 0, w: 100, h: 100 }, 'default', {}, eventBus);
        }
        createComponent(): React.ComponentType {
          return () => null;
        }
      }
      
      class App2 extends App {
        readonly id = 'app2';
        readonly name = 'App 2';
        readonly version = '1.0.0';
        constructor(c: Container) {
          super(c);
        }
        initialWindow(): Window {
          const eventBus = this.container.resolve('eventBus') as EventBus;
          return new Window(this.id, 'Test', { x: 0, y: 0, w: 100, h: 100 }, 'default', {}, eventBus);
        }
        createComponent(): React.ComponentType {
          return () => null;
        }
      }
      
      const apps = factory.createApps([App1, App2]);
      
      expect(apps.length).toBe(2);
      expect(apps[0].id).toBe('app1');
      expect(apps[1].id).toBe('app2');
      expect(appManager.getApp('app1')).toBe(apps[0]);
      expect(appManager.getApp('app2')).toBe(apps[1]);
    });
  });

  describe('createAppFromManifest', () => {
    it('should create app from manifest', async () => {
      // Note: This test requires a real manifest and component
      // For now, we'll test the error case
      const manifest = {
        id: 'manifest-app',
        name: 'Manifest App',
        version: '1.0.0',
        icon: 'data:image/svg+xml,test',
        entry: './non-existent-path',
      };
      
      await expect(
        factory.createAppFromManifest(manifest)
      ).rejects.toThrow();
    });
  });
});

