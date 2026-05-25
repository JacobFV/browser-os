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

export function installSynthuxBridge(options: SynthuxBridgeOptions): () => void {
  const handler = (event: MessageEvent) => {
    if (!isSynthuxCommand(event.data)) return;
    postToParent(stateResult(options, event.data.requestId));
  };

  window.addEventListener('message', handler);
  postToParent(stateResult(options, 'synthux-ready'));

  return () => window.removeEventListener('message', handler);
}
