import { AppManifest } from '@browser-os/core';
import { z } from 'zod';
import { AppManifestSchema } from '@browser-os/core';

const appManifests = new Map<string, AppManifest>();

export async function loadAppManifest(manifestPath: string): Promise<AppManifest> {
  try {
    const response = await fetch(manifestPath);
    const manifestData = await response.json();
    
    const manifest = AppManifestSchema.parse(manifestData);
    appManifests.set(manifest.id, manifest);
    
    return manifest;
  } catch (error: any) {
    throw new Error(`Failed to load app manifest: ${error.message}`);
  }
}

export function registerAppManifest(manifest: AppManifest): void {
  appManifests.set(manifest.id, manifest);
}

export function getAppManifest(appId: string): AppManifest | undefined {
  return appManifests.get(appId);
}

export function getAllAppManifests(): AppManifest[] {
  return Array.from(appManifests.values());
}

export async function loadAppFromManifest(appId: string): Promise<React.ComponentType<any> | null> {
  const manifest = appManifests.get(appId);
  if (!manifest) {
    return null;
  }
  
  try {
    // Dynamic import of the app entry point
    const module = await import(manifest.entry);
    return module.default || module[manifest.id] || null;
  } catch (error: any) {
    console.error(`Failed to load app ${appId}:`, error);
    return null;
  }
}

