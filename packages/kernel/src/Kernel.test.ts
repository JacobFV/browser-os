import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Kernel } from './Kernel';
import { FileSystem } from '@browser-os/fs';
import { EphemeralBackend } from '@browser-os/fs';

// Mock IndexedDB for Node.js environment
globalThis.indexedDB = {
  open: vi.fn(() => ({
    onerror: null,
    onsuccess: null,
    onupgradeneeded: null,
    result: null,
    error: null,
  })),
} as unknown as IDBFactory;

describe('Kernel', () => {
  let kernel: Kernel;

  beforeEach(() => {
    kernel = new Kernel();
  });

  describe('initialization', () => {
    it('should initialize kernel', async () => {
      // For testing, manually set up filesystem with EphemeralBackend
      const fs = kernel.getFS();
      const backend = new EphemeralBackend();
      await fs.mount('/', backend);
      await fs.mkdir('/etc', { recursive: true });
      await fs.mkdir('/bin', { recursive: true });
      await fs.mkdir('/home/user', { recursive: true });
      await fs.mkdir('/tmp', { recursive: true });
      await fs.mkdir('/var/log', { recursive: true });
      await fs.mkdir('/var/cache', { recursive: true });
      await fs.mkdir('/sys', { recursive: true });

      // Now initialize (skip filesystem init since it's already set up)
      await kernel.init({ skipFilesystem: true });
      
      // Kernel should be initialized
      expect(kernel.getFS()).toBeDefined();
      expect(kernel.getProcessManager()).toBeDefined();
      expect(kernel.getAppRegistry()).toBeDefined();
      expect(kernel.getEventBus()).toBeDefined();
    });

    it('should create default directory structure', async () => {
      // Set up filesystem manually for testing
      const fs = kernel.getFS();
      const backend = new EphemeralBackend();
      await fs.mount('/', backend);
      
      await kernel.init({ skipFilesystem: true });

      // Check that default directories exist
      expect(await fs.exists('/bin')).toBe(true);
      expect(await fs.exists('/etc')).toBe(true);
      expect(await fs.exists('/home')).toBe(true);
      expect(await fs.exists('/tmp')).toBe(true);
      expect(await fs.exists('/var')).toBe(true);
    });
  });

  describe('syscalls', () => {
    beforeEach(async () => {
      // Set up filesystem manually for testing
      const fs = kernel.getFS();
      const backend = new EphemeralBackend();
      await fs.mount('/', backend);
      await fs.mount('/tmp', new EphemeralBackend());
      await fs.mkdir('/etc', { recursive: true });
      await fs.mkdir('/bin', { recursive: true });
      await fs.mkdir('/home/user', { recursive: true });
      
      await kernel.init({ skipFilesystem: true });
    });

    it('should handle fs.read syscall', async () => {
      const fs = kernel.getFS();
      await fs.write('/test.txt', new TextEncoder().encode('hello'));

      const response = await kernel.handleSyscall({
        id: crypto.randomUUID(),
        syscall: 'fs.read',
        args: { path: '/test.txt' },
        pid: 1,
      });

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
    });

    it('should enforce permissions', async () => {
      // Set permissions for PID 1
      kernel.setPermissions(1, {
        allowedSyscalls: ['fs.read'],
        fsAccess: ['/tmp/**'],
      });

      // Try to read from unauthorized path
      const response = await kernel.handleSyscall({
        id: crypto.randomUUID(),
        syscall: 'fs.read',
        args: { path: '/etc/config.json' },
        pid: 1,
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('Permission denied');
    });
  });

  describe('security context', () => {
    beforeEach(async () => {
      // Set up filesystem manually for testing
      const fs = kernel.getFS();
      const backend = new EphemeralBackend();
      await fs.mount('/', backend);
      await fs.mkdir('/etc', { recursive: true });
      
      await kernel.init({ skipFilesystem: true });
    });

    it('should get security context for process', () => {
      kernel.setPermissions(123, {
        allowedSyscalls: ['fs.read', 'fs.write'],
        fsAccess: ['/home/user/**'],
      });

      const context = kernel.getSecurityContext(123);
      expect(context).toBeDefined();
      expect(context?.pid).toBe(123);
      expect(context?.canSyscall('fs.read')).toBe(true);
      expect(context?.canSyscall('proc.kill')).toBe(false);
    });

    it('should return null for process without permissions', () => {
      const context = kernel.getSecurityContext(999);
      expect(context).toBeNull();
    });
  });
});

