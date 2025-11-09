import { AppManifest, Capability } from '@browser-os/core';

export interface AppContext {
  appId: string;
  pid: string;
  permissions: Capability[];
}

export interface AppLifecycle {
  mount: (container: HTMLElement) => void;
  unmount: () => void;
}

export function createAppContext(manifest: AppManifest, pid: string): AppContext {
  return {
    appId: manifest.id,
    pid,
    permissions: manifest.permissions || [],
  };
}

export function validateManifest(manifest: unknown): manifest is AppManifest {
  // Basic validation - full validation should use Zod schema
  return (
    typeof manifest === 'object' &&
    manifest !== null &&
    'id' in manifest &&
    'name' in manifest &&
    'version' in manifest &&
    'entry' in manifest
  );
}

