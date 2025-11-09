import { AppManifest, Capability } from '@browser-os/app-sdk';

export interface SandboxOptions {
  iframe?: boolean;
  capabilities?: Capability[];
  csp?: string;
}

export class AppHost {
  private sandboxed: Map<string, SandboxOptions> = new Map();

  createSandbox(appId: string, options: SandboxOptions = {}): HTMLElement {
    if (options.iframe) {
      const iframe = document.createElement('iframe');
      iframe.sandbox.add('allow-scripts', 'allow-same-origin');
      if (options.csp) {
        iframe.setAttribute('csp', options.csp);
      }
      this.sandboxed.set(appId, options);
      return iframe;
    }
    const div = document.createElement('div');
    this.sandboxed.set(appId, options);
    return div;
  }

  checkCapability(appId: string, capability: Capability): boolean {
    const sandbox = this.sandboxed.get(appId);
    return sandbox?.capabilities?.includes(capability) ?? false;
  }
}

export const appHost = new AppHost();

