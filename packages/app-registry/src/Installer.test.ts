import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '@browser-os/events';
import { FileSystem } from '@browser-os/fs';
import { EphemeralBackend } from '@browser-os/fs';
import { AppRegistry } from './AppRegistry';
import { Installer } from './Installer';

describe('Installer', () => {
  let eventBus: EventBus;
  let fs: FileSystem;
  let registry: AppRegistry;
  let installer: Installer;

  beforeEach(async () => {
    eventBus = new EventBus();
    fs = new FileSystem({ eventBus });
    const backend = new EphemeralBackend();
    await fs.mount('/', backend);
    await fs.mkdir('/etc', { recursive: true });
    await fs.mkdir('/bin', { recursive: true });

    registry = new AppRegistry({ fs, eventBus });
    await registry.load();
    installer = new Installer({ registry, fs, eventBus, userId: 'user-1' });
  });

  describe('install', () => {
    it('should install an app', async () => {
      const code = `console.log('test app');`;
      const manifest = {
        id: 'test-app',
        name: 'Test App',
        version: '1.0.0',
        entrypoint: '/bin/test-app.js',
        permissions: ['fs.read'],
      };

      await installer.install('test-app', code, manifest);

      expect(registry.isInstalled('test-app')).toBe(true);
      expect(await fs.exists('/bin/test-app.js')).toBe(true);
    });

    it('should validate manifest ID matches appId', async () => {
      const code = `console.log('test');`;
      const manifest = {
        id: 'different-id',
        name: 'Test App',
        version: '1.0.0',
        entrypoint: '/bin/test-app.js',
        permissions: [],
      };

      await expect(installer.install('test-app', code, manifest)).rejects.toThrow(
        'Manifest ID (different-id) does not match appId (test-app)'
      );
    });

    it('should set enabled flag', async () => {
      const code = `console.log('test');`;
      const manifest = {
        id: 'test-app',
        name: 'Test App',
        version: '1.0.0',
        entrypoint: '/bin/test-app.js',
        permissions: [],
      };

      await installer.install('test-app', code, manifest, { enabled: false });
      const entry = registry.get('test-app');
      expect(entry?.enabled).toBe(false);
    });
  });

  describe('uninstall', () => {
    it('should uninstall an app', async () => {
      const code = `console.log('test');`;
      const manifest = {
        id: 'test-app',
        name: 'Test App',
        version: '1.0.0',
        entrypoint: '/bin/test-app.js',
        permissions: [],
      };

      await installer.install('test-app', code, manifest);
      await installer.uninstall('test-app');

      expect(registry.isInstalled('test-app')).toBe(false);
    });

    it('should throw error if app not installed', async () => {
      await expect(installer.uninstall('nonexistent')).rejects.toThrow(
        'App nonexistent is not installed'
      );
    });
  });

  describe('enable/disable', () => {
    it('should enable an app', async () => {
      const code = `console.log('test');`;
      const manifest = {
        id: 'test-app',
        name: 'Test App',
        version: '1.0.0',
        entrypoint: '/bin/test-app.js',
        permissions: [],
      };

      await installer.install('test-app', code, manifest, { enabled: false });
      await installer.enable('test-app');

      const entry = registry.get('test-app');
      expect(entry?.enabled).toBe(true);
    });

    it('should disable an app', async () => {
      const code = `console.log('test');`;
      const manifest = {
        id: 'test-app',
        name: 'Test App',
        version: '1.0.0',
        entrypoint: '/bin/test-app.js',
        permissions: [],
      };

      await installer.install('test-app', code, manifest);
      await installer.disable('test-app');

      const entry = registry.get('test-app');
      expect(entry?.enabled).toBe(false);
    });
  });
});

