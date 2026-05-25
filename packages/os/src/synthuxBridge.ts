import type { EventBus } from '@browser-os/events';
import type { FileSystem } from '@browser-os/fs';
import type { AppRegistry } from '@browser-os/app-registry';
import type { WindowManager } from '@browser-os/windowing';

type SynthuxCommandMessage = {
  source: 'synthux-executor';
  type: 'synthux-command';
  requestId: string;
  command: {
    type: 'synthux.targetAction' | 'synthux.getState';
    action?: Record<string, unknown>;
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

const SURFACE_APP: Record<string, string> = {
  slack: 'messaging-client',
  notion: 'notes',
  github: 'browser',
  editor: 'notepad',
  terminal: 'terminal',
  browser: 'browser',
  dashboard: 'browser',
};

type VisibleStep = {
  step: number;
  surface: string;
  action: string;
  target: string;
  payload: string;
};

const visibleSteps: VisibleStep[] = [];

function isSynthuxCommand(data: unknown): data is SynthuxCommandMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as Record<string, unknown>).source === 'synthux-executor' &&
    (data as Record<string, unknown>).type === 'synthux-command'
  );
}

function postToParent(message: SynthuxCommandResultMessage): void {
  try {
    window.parent.postMessage(message, '*');
  } catch {
    // Standalone mode has no parent frame.
  }
}

function synthuxPath(path: string): string {
  if (path.startsWith('/')) return path;
  return `/home/user/synthux/${path.replace(/^\/+/, '')}`;
}

function visiblePayload(args: Record<string, unknown>, fallback = ''): string {
  const raw = args.visible_text ?? args.content ?? args.preview ?? args.text ?? args.query ?? args.title ?? args.command ?? fallback;
  return String(raw ?? '').slice(0, 2200);
}

function recordSynthuxStep(current: VisibleStep): void {
  visibleSteps.push(current);
  while (visibleSteps.length > 8) visibleSteps.shift();
}

async function ensureParentDirs(fs: FileSystem, path: string): Promise<void> {
  const parts = path.split('/').filter(Boolean);
  let current = '';
  for (const part of parts.slice(0, -1)) {
    current += `/${part}`;
    try {
      await fs.mkdir(current, { recursive: true });
    } catch {
      // Best effort: recursive mkdir can throw if the directory already exists.
    }
  }
}

function snapshot(options: SynthuxBridgeOptions, extra: Record<string, unknown> = {}): Record<string, unknown> {
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
    ...extra,
  };
}

function launchOrFocusApp(options: SynthuxBridgeOptions, surface: string): string {
  const appId = SURFACE_APP[surface] ?? 'browser';
  const app = options.appRegistry.get(appId);
  if (!app || !app.enabled) {
    throw new Error(`App ${appId} is not installed or enabled`);
  }

  const existing = options.windowManager
    .getWindowsInWorkspace(options.activeWorkspaceId)
    .find((window) => window.appId === appId);
  if (existing) {
    if (existing.state === 'minimized') options.windowManager.restoreWindow(existing.id);
    options.windowManager.focusWindow(existing.id);
    return appId;
  }

  options.windowManager.createWindow({
    title: app.manifest.name,
    width: 700,
    height: 520,
    workspaceId: options.activeWorkspaceId,
    appId,
  });
  return appId;
}

function ok(
  requestId: string,
  event: string,
  target: string,
  state: Record<string, unknown>,
  observation: string
): SynthuxCommandResultMessage {
  return {
    source: 'synthux-environment',
    type: 'synthux-command-result',
    requestId,
    ok: true,
    event,
    target,
    state,
    observation,
  };
}

function fail(requestId: string, options: SynthuxBridgeOptions, error: unknown): SynthuxCommandResultMessage {
  return {
    source: 'synthux-environment',
    type: 'synthux-command-result',
    requestId,
    ok: false,
    event: 'synthux.command_failed',
    state: snapshot(options),
    observation: 'SynthUX command failed.',
    error: error instanceof Error ? error.message : String(error),
  };
}

async function executeTargetAction(
  options: SynthuxBridgeOptions,
  requestId: string,
  action: Record<string, unknown>
): Promise<SynthuxCommandResultMessage> {
  const surface = String(action.surface ?? '');
  const targetAction = String(action.action ?? '');
  const target = String(action.target ?? '');
  const args = (action.args && typeof action.args === 'object' ? action.args : {}) as Record<string, unknown>;
  const visible = visiblePayload(args, target);
  recordSynthuxStep({
    step: Number(action.step ?? visibleSteps.length + 1),
    surface,
    action: targetAction,
    target,
    payload: visible,
  });
  const appId = launchOrFocusApp(options, surface);

  if (surface === 'editor' && targetAction === 'open_file') {
    const path = synthuxPath(target);
    let chars = 0;
    try {
      chars = (await options.fs.read(path)).length;
    } catch {
      chars = 0;
    }
    return ok(requestId, 'file.opened', path, snapshot(options, { appId, path, chars, visibleText: visible }), `${appId} opened ${path}.`);
  }

  if (surface === 'editor' && targetAction === 'replace_buffer') {
    const path = synthuxPath(target);
    const content = String(args.content ?? args.preview ?? `<buffer:${String(args.chars ?? 0)} chars>`);
    await ensureParentDirs(options.fs, path);
    await options.fs.write(path, new TextEncoder().encode(content), { create: true });
    return ok(requestId, 'buffer.replaced', path, snapshot(options, { appId, path, chars: content.length, visibleText: visible }), `${appId} wrote ${path}.`);
  }

  if (surface === 'editor' && targetAction === 'save_file') {
    const path = synthuxPath(target);
    return ok(requestId, 'file.saved', path, snapshot(options, { appId, path, visibleText: visible }), `${path} is saved in browser-os.`);
  }

  if (surface === 'terminal' && targetAction === 'run_command') {
    options.eventBus.emit('synthux:terminal:run', { command: args.command, exitCode: args.exit_code ?? 0 }, { source: 'synthux' });
    return ok(
      requestId,
      'process.exited',
      target,
      snapshot(options, { appId, command: args.command, exitCode: args.exit_code ?? 0, visibleText: visible }),
      `Terminal ran ${String(args.command ?? target)}.`
    );
  }

  if (surface === 'browser' || surface === 'github' || surface === 'dashboard') {
    const event =
      targetAction === 'open_url' ? 'browser.navigated' :
      targetAction === 'search' ? 'browser.search' :
      targetAction === 'open_repo' ? 'repo.opened' :
      targetAction === 'create_branch' ? 'branch.created' :
      targetAction === 'open_pull_request' ? 'pull_request.opened' :
      targetAction === 'request_review' ? 'review.requested' :
      targetAction === 'open_panel' ? 'dashboard.panel_opened' :
      targetAction === 'set_time_range' ? 'dashboard.range_set' :
      targetAction === 'drill_into_alert' ? 'dashboard.alert_drilled' :
      'app.action';
    options.eventBus.emit(`synthux:${surface}:${targetAction}`, { target, args }, { source: 'synthux' });
    return ok(requestId, event, target, snapshot(options, { appId, args, visibleText: visible }), `${appId} executed ${surface}.${targetAction}.`);
  }

  if (surface === 'notion' || surface === 'slack') {
    const event =
      targetAction === 'create_page' ? 'document.created' :
      targetAction === 'insert_checklist' ? 'checklist.inserted' :
      targetAction === 'attach_artifact' ? 'artifact.attached' :
      targetAction === 'edit_block' ? 'document.edited' :
      targetAction === 'open_channel' ? 'channel.opened' :
      targetAction === 'post_message' ? 'message.posted' :
      targetAction === 'scroll_history' ? 'channel.scrolled' :
      targetAction === 'react_to_message' ? 'message.reacted' :
      'app.action';
    options.eventBus.emit(`synthux:${surface}:${targetAction}`, { target, args }, { source: 'synthux' });
    return ok(requestId, event, target, snapshot(options, { appId, args, visibleText: visible }), `${appId} executed ${surface}.${targetAction}.`);
  }

  return ok(requestId, 'app.action', target, snapshot(options, { appId, args, visibleText: visible }), `${appId} accepted ${surface}.${targetAction}.`);
}

async function executeCommand(
  options: SynthuxBridgeOptions,
  data: SynthuxCommandMessage
): Promise<SynthuxCommandResultMessage> {
  try {
    if (data.command.type === 'synthux.getState') {
      return ok(data.requestId, 'state.snapshot', 'browser-os', snapshot(options), 'Captured browser-os state.');
    }
    return await executeTargetAction(options, data.requestId, data.command.action ?? {});
  } catch (error) {
    return fail(data.requestId, options, error);
  }
}

export function installSynthuxBridge(options: SynthuxBridgeOptions): () => void {
  const handler = (event: MessageEvent) => {
    if (!isSynthuxCommand(event.data)) return;
    void executeCommand(options, event.data).then(postToParent);
  };

  window.addEventListener('message', handler);
  postToParent({
    source: 'synthux-environment',
    type: 'synthux-command-result',
    requestId: 'synthux-ready',
    ok: true,
    event: 'environment.ready',
    target: 'browser-os',
    state: snapshot(options),
    observation: 'browser-os SynthUX bridge ready.',
  });

  return () => window.removeEventListener('message', handler);
}
