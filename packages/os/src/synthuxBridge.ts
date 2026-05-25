import type { AppRegistry } from '@browser-os/app-registry';
import type { EventBus } from '@browser-os/events';
import type { FileSystem } from '@browser-os/fs';
import type { WindowManager } from '@browser-os/windowing';

type SynthuxCommandMessage = {
  source: 'synthux-executor';
  type: 'synthux-command';
  requestId: string;
  command: {
    type: 'synthux.getState';
  };
};

type SynthuxLaunchMessage = {
  source: 'synthux-executor';
  type: 'synthux-launch';
  appId: string;
  surface?: string;
};

type SynthuxCommandResultMessage = {
  source: 'synthux-environment';
  type: 'synthux-command-result';
  requestId: string;
  ok: boolean;
  event: string;
  target?: string;
  state: Record<string, unknown>;
  observation: string;
  error?: string;
};

export interface SynthuxBridgeOptions {
  eventBus: EventBus;
  fs: FileSystem;
  appRegistry: AppRegistry;
  windowManager: WindowManager;
  activeWorkspaceId: string;
}

function isSynthuxCommand(data: unknown): data is SynthuxCommandMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as Record<string, unknown>).source === 'synthux-executor' &&
    (data as Record<string, unknown>).type === 'synthux-command' &&
    ((data as Record<string, unknown>).command as Record<string, unknown> | undefined)?.type === 'synthux.getState'
  );
}

function isSynthuxLaunch(data: unknown): data is SynthuxLaunchMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as Record<string, unknown>).source === 'synthux-executor' &&
    (data as Record<string, unknown>).type === 'synthux-launch' &&
    typeof (data as Record<string, unknown>).appId === 'string'
  );
}

function postToParent(message: SynthuxCommandResultMessage): void {
  try {
    window.parent.postMessage(message, '*');
  } catch {
    // Standalone mode has no parent frame.
  }
}

function snapshot(options: SynthuxBridgeOptions): Record<string, unknown> {
  const windows = options.windowManager.getAllWindows();
  return {
    activeWorkspaceId: options.activeWorkspaceId,
    openWindows: windows.map((window) => ({
      id: window.id,
      appId: window.appId,
      title: window.title,
      state: window.state,
      zIndex: window.zIndex,
    })),
  };
}

function stateResult(options: SynthuxBridgeOptions, requestId: string): SynthuxCommandResultMessage {
  return {
    source: 'synthux-environment',
    type: 'synthux-command-result',
    requestId,
    ok: true,
    event: 'state.snapshot',
    target: 'browser-os',
    state: snapshot(options),
    observation: 'Captured browser-os state.',
  };
}

/**
 * Launch an app the same way a real taskbar shortcut click would, by emitting
 * the canonical `taskbar:shortcut:clicked` event. SynthUX's executor calls
 * this from a real low-level click on its launcher overlay button, so the
 * resulting state change is still caused by an observable input event.
 */
function launchApp(options: SynthuxBridgeOptions, appId: string): boolean {
  const entry = options.appRegistry.get(appId);
  if (!entry || !entry.enabled) {
    console.warn('[synthuxBridge] launch refused, app not installed:', appId);
    return false;
  }
  try {
    options.eventBus.emit('taskbar:shortcut:clicked', { appId, forceNew: true }, { source: 'synthux-launcher' });
    return true;
  } catch (error) {
    console.warn('[synthuxBridge] launch failed for', appId, error);
    return false;
  }
}

export function installSynthuxBridge(options: SynthuxBridgeOptions): () => void {
  const handler = (event: MessageEvent) => {
    if (isSynthuxCommand(event.data)) {
      postToParent(stateResult(options, event.data.requestId));
      return;
    }
    if (isSynthuxLaunch(event.data)) {
      launchApp(options, event.data.appId);
      return;
    }
  };

  window.addEventListener('message', handler);

  // Expose a window-level helper so SynthUX's launcher overlay can invoke
  // app launches via a direct function call rather than postMessage. The
  // resulting eventBus emit is identical to the real taskbar shortcut path.
  (window as unknown as { __synthuxLaunchApp?: (appId: string, surface?: string) => boolean }).__synthuxLaunchApp =
    (appId: string) => launchApp(options, appId);

  postToParent(stateResult(options, 'synthux-ready'));

  return () => {
    window.removeEventListener('message', handler);
    try {
      delete (window as unknown as { __synthuxLaunchApp?: unknown }).__synthuxLaunchApp;
    } catch {
      // ignore
    }
  };
}
