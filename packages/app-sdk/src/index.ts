export interface AppLifecycle {
  mount?: () => void | Promise<void>;
  unmount?: () => void | Promise<void>;
  suspend?: () => void | Promise<void>;
  resume?: () => void | Promise<void>;
}

export interface AppSDK {
  windowId: string;
  manifest: any;
  lifecycle: AppLifecycle;
  
  // IPC methods
  sendToHost: (action: string, data?: any) => void;
  onHostMessage: (handler: (message: any) => void) => () => void;
  
  // Capability requests
  requestCapability: (capability: string) => Promise<boolean>;
}

let appSDK: AppSDK | null = null;

export function initializeAppSDK(windowId: string, manifest: any): AppSDK {
  const lifecycle: AppLifecycle = {};
  
  const sdk: AppSDK = {
    windowId,
    manifest,
    lifecycle,
    
    sendToHost(action: string, data?: any) {
      if (window.parent) {
        window.parent.postMessage({
          type: 'app-message',
          appId: manifest.id,
          action,
          data,
        }, '*');
      }
    },
    
    onHostMessage(handler: (message: any) => void) {
      const messageHandler = (event: MessageEvent) => {
        if (event.data && event.data.type === 'host-init') {
          handler(event.data);
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      return () => {
        window.removeEventListener('message', messageHandler);
      };
    },
    
    async requestCapability(capability: string): Promise<boolean> {
      return new Promise((resolve) => {
        const handler = (event: MessageEvent) => {
          if (event.data && event.data.type === 'capability-response' && event.data.capability === capability) {
            resolve(event.data.granted);
            window.removeEventListener('message', handler);
          }
        };
        
        window.addEventListener('message', handler);
        sdk.sendToHost('request-capability', { capability });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          window.removeEventListener('message', handler);
          resolve(false);
        }, 5000);
      });
    },
  };
  
  // Register lifecycle hooks
  sdk.sendToHost('lifecycle-ready', {
    lifecycle: {
      mount: lifecycle.mount?.toString(),
      unmount: lifecycle.unmount?.toString(),
      suspend: lifecycle.suspend?.toString(),
      resume: lifecycle.resume?.toString(),
    },
  });
  
  appSDK = sdk;
  return sdk;
}

export function getAppSDK(): AppSDK | null {
  return appSDK;
}

export function registerLifecycleHook(
  hook: 'mount' | 'unmount' | 'suspend' | 'resume',
  callback: () => void | Promise<void>
): void {
  if (appSDK) {
    appSDK.lifecycle[hook] = callback;
  }
}
