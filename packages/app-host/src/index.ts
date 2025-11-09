import { Window } from '@browser-os/windowing';
import { AppManifest } from '@browser-os/core';

export interface AppLifecycle {
  mount?: () => void | Promise<void>;
  unmount?: () => void | Promise<void>;
  suspend?: () => void | Promise<void>;
  resume?: () => void | Promise<void>;
}

export interface SandboxedApp {
  id: string;
  manifest: AppManifest;
  iframe: HTMLIFrameElement;
  lifecycle: AppLifecycle;
  state: 'mounted' | 'suspended' | 'unmounted';
}

class AppHost {
  private apps: Map<string, SandboxedApp> = new Map();
  
  async createSandboxedApp(manifest: AppManifest, windowId: string): Promise<SandboxedApp> {
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    
    // Sandbox with restricted permissions
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    iframe.src = manifest.entry;
    
    const app: SandboxedApp = {
      id: manifest.id,
      manifest,
      iframe,
      lifecycle: {},
      state: 'unmounted',
    };
    
    // Set up IPC communication
    this.setupIPC(app, windowId);
    
    this.apps.set(manifest.id, app);
    return app;
  }
  
  private setupIPC(app: SandboxedApp, windowId: string): void {
    window.addEventListener('message', (event) => {
      // Verify origin and handle messages
      if (event.data && event.data.type === 'app-message' && event.data.appId === app.id) {
        this.handleAppMessage(app, event.data);
      }
    });
    
    // Send initial setup message
    app.iframe.onload = () => {
      app.iframe.contentWindow?.postMessage({
        type: 'host-init',
        appId: app.id,
        windowId,
        manifest: app.manifest,
      }, '*');
    };
  }
  
  private handleAppMessage(app: SandboxedApp, message: any): void {
    // Handle IPC messages from sandboxed app
    switch (message.action) {
      case 'lifecycle-ready':
        app.lifecycle = message.lifecycle || {};
        break;
      case 'request-capability':
        // Handle capability requests
        break;
      default:
        console.log('Unknown app message:', message);
    }
  }
  
  async mountApp(appId: string): Promise<void> {
    const app = this.apps.get(appId);
    if (!app) throw new Error(`App not found: ${appId}`);
    
    if (app.state === 'unmounted') {
      app.state = 'mounted';
      if (app.lifecycle.mount) {
        await app.lifecycle.mount();
      }
    }
  }
  
  async unmountApp(appId: string): Promise<void> {
    const app = this.apps.get(appId);
    if (!app) throw new Error(`App not found: ${appId}`);
    
    if (app.state !== 'unmounted') {
      if (app.lifecycle.unmount) {
        await app.lifecycle.unmount();
      }
      app.state = 'unmounted';
    }
  }
  
  async suspendApp(appId: string): Promise<void> {
    const app = this.apps.get(appId);
    if (!app) throw new Error(`App not found: ${appId}`);
    
    if (app.state === 'mounted') {
      app.state = 'suspended';
      if (app.lifecycle.suspend) {
        await app.lifecycle.suspend();
      }
    }
  }
  
  async resumeApp(appId: string): Promise<void> {
    const app = this.apps.get(appId);
    if (!app) throw new Error(`App not found: ${appId}`);
    
    if (app.state === 'suspended') {
      app.state = 'mounted';
      if (app.lifecycle.resume) {
        await app.lifecycle.resume();
      }
    }
  }
  
  getApp(appId: string): SandboxedApp | undefined {
    return this.apps.get(appId);
  }
  
  getAllApps(): SandboxedApp[] {
    return Array.from(this.apps.values());
  }
}

export const appHost = new AppHost();

export async function createSandboxedApp(manifest: AppManifest, windowId: string): Promise<SandboxedApp> {
  return appHost.createSandboxedApp(manifest, windowId);
}

export async function mountApp(appId: string): Promise<void> {
  return appHost.mountApp(appId);
}

export async function unmountApp(appId: string): Promise<void> {
  return appHost.unmountApp(appId);
}

export async function suspendApp(appId: string): Promise<void> {
  return appHost.suspendApp(appId);
}

export async function resumeApp(appId: string): Promise<void> {
  return appHost.resumeApp(appId);
}
