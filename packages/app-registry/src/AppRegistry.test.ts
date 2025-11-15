import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '@browser-os/events';
import { FileSystem } from '@browser-os/fs';
import { EphemeralBackend } from '@browser-os/fs';
import { AppRegistry } from './AppRegistry';

describe('AppRegistry', () => {
  let eventBus: EventBus;
  let fs: FileSystem;
  let registry: AppRegistry;

  beforeEach(async () => {
    eventBus = new EventBus();
    fs = new FileSystem({ eventBus });
    const backend = new EphemeralBackend();
    await fs.mount('/', backend);
    await fs.mkdir('/etc', { recursive: true });

    registry = new AppRegistry({ fs, eventBus });
  });

  describe('load/save', () => {
    it('should create empty registry if file does not exist', async () => {
      await registry.load();
      expect(registry.list()).toEqual([]);
    });

    it('should load registry from filesystem', async () => {
      const entries = [
        {
          id: 'app-1',
          installedAt: Date.now(),
          installedBy: 'user-1',
          enabled: true,
          manifest: {
            id: 'app-1',
            name: 'App 1',
            version: '1.0.0',
            entrypoint: '/bin/app-1.js',
            permissions: [],
            showInTaskbar: true,
          },
        },
      ];
      await fs.write('/etc/registry.json', new TextEncoder().encode(JSON.stringify(entries)));

      await registry.load();
      expect(registry.list().length).toBe(1);
      expect(registry.get('app-1')).toBeDefined();
    });

    it('should save registry to filesystem', async () => {
      await registry.load();
      registry.add({
        id: 'app-1',
        installedAt: Date.now(),
        installedBy: 'user-1',
        enabled: true,
        manifest: {
          id: 'app-1',
          name: 'App 1',
          version: '1.0.0',
          entrypoint: '/bin/app-1.js',
          permissions: [],
          showInTaskbar: true,
        },
      });

      await registry.save();
      const data = await fs.read('/etc/registry.json');
      const loaded = JSON.parse(new TextDecoder().decode(data));
      expect(loaded.length).toBe(1);
    });
  });

  describe('list/get', () => {
    it('should list all apps', async () => {
      await registry.load();
      registry.add({
        id: 'app-1',
        installedAt: Date.now(),
        installedBy: 'user-1',
        enabled: true,
        manifest: {
          id: 'app-1',
          name: 'App 1',
          version: '1.0.0',
          entrypoint: '/bin/app-1.js',
          permissions: [],
          showInTaskbar: true,
        },
      });

      const apps = registry.list();
      expect(apps.length).toBe(1);
    });

    it('should get app by ID', async () => {
      await registry.load();
      registry.add({
        id: 'app-1',
        installedAt: Date.now(),
        installedBy: 'user-1',
        enabled: true,
        manifest: {
          id: 'app-1',
          name: 'App 1',
          version: '1.0.0',
          entrypoint: '/bin/app-1.js',
          permissions: [],
          showInTaskbar: true,
        },
      });

      const app = registry.get('app-1');
      expect(app).toBeDefined();
      expect(app?.id).toBe('app-1');
    });

    it('should return null for non-existent app', () => {
      expect(registry.get('nonexistent')).toBeNull();
    });
  });

  describe('isInstalled', () => {
    it('should check if app is installed', async () => {
      await registry.load();
      registry.add({
        id: 'app-1',
        installedAt: Date.now(),
        installedBy: 'user-1',
        enabled: true,
        manifest: {
          id: 'app-1',
          name: 'App 1',
          version: '1.0.0',
          entrypoint: '/bin/app-1.js',
          permissions: [],
          showInTaskbar: true,
        },
      });

      expect(registry.isInstalled('app-1')).toBe(true);
      expect(registry.isInstalled('nonexistent')).toBe(false);
    });
  });

  describe('getEnabled', () => {
    it('should return only enabled apps', async () => {
      await registry.load();
      registry.add({
        id: 'app-1',
        installedAt: Date.now(),
        installedBy: 'user-1',
        enabled: true,
        manifest: {
          id: 'app-1',
          name: 'App 1',
          version: '1.0.0',
          entrypoint: '/bin/app-1.js',
          permissions: [],
          showInTaskbar: true,
        },
      });
      registry.add({
        id: 'app-2',
        installedAt: Date.now(),
        installedBy: 'user-1',
        enabled: false,
        manifest: {
          id: 'app-2',
          name: 'App 2',
          version: '1.0.0',
          entrypoint: '/bin/app-2.js',
          permissions: [],
          showInTaskbar: true,
        },
      });

      const enabled = registry.getEnabled();
      expect(enabled.length).toBe(1);
      expect(enabled[0].id).toBe('app-1');
    });
  });
});

