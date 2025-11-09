import { AppManifest } from '@browser-os/core';
import React from 'react';

export class AppRegistry {
  private manifests: Map<string, AppManifest> = new Map();

  register(manifest: AppManifest): void {
    this.manifests.set(manifest.id, manifest);
  }

  registerMany(manifests: AppManifest[]): void {
    manifests.forEach(manifest => this.register(manifest));
  }

  get(appId: string): AppManifest | undefined {
    return this.manifests.get(appId);
  }

  getAll(): AppManifest[] {
    return Array.from(this.manifests.values());
  }

  has(appId: string): boolean {
    return this.manifests.has(appId);
  }

  async loadApp(appId: string): Promise<React.ComponentType<any> | null> {
    const manifest = this.manifests.get(appId);
    if (!manifest) {
      return null;
    }
    
    try {
      // Dynamic import of the app entry point - entry is a string path
      const entryPath: string = manifest.entry;
      const module = await import(entryPath);
      return module.default || module[appId] || null;
    } catch (error: any) {
      console.error(`Failed to load app ${appId}:`, error);
      return null;
    }
  }

  clear(): void {
    this.manifests.clear();
  }
}

