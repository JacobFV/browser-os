import { describe, it, expect } from 'vitest';
import {
  SyscallRequestSchema,
  SyscallResponseSchema,
  ProcessSchema,
  ProcessStatusSchema,
  FileMetadataSchema,
  MountPointSchema,
  AppManifestSchema,
  AppRegistryEntrySchema,
  EventSchema,
  PermissionSchema,
  SystemConfigSchema,
} from './index';

describe('Schemas', () => {
  describe('SyscallRequestSchema', () => {
    it('should validate a valid syscall request', () => {
      const request = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        syscall: 'fs.read',
        args: { path: '/test' },
        pid: 123,
      };
      expect(() => SyscallRequestSchema.parse(request)).not.toThrow();
    });

    it('should require id', () => {
      const request = {
        syscall: 'fs.read',
        args: {},
      };
      expect(() => SyscallRequestSchema.parse(request)).toThrow();
    });

    it('should require syscall', () => {
      const request = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        args: {},
      };
      expect(() => SyscallRequestSchema.parse(request)).toThrow();
    });
  });

  describe('SyscallResponseSchema', () => {
    it('should validate a successful response', () => {
      const response = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        success: true,
        data: { result: 'ok' },
      };
      expect(() => SyscallResponseSchema.parse(response)).not.toThrow();
    });

    it('should validate an error response', () => {
      const response = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        success: false,
        error: 'Permission denied',
      };
      expect(() => SyscallResponseSchema.parse(response)).not.toThrow();
    });
  });

  describe('ProcessSchema', () => {
    it('should validate a process', () => {
      const process = {
        pid: 1,
        ppid: null,
        name: 'test',
        status: 'running' as const,
        cwd: '/home/user',
        env: { PATH: '/bin' },
      };
      expect(() => ProcessSchema.parse(process)).not.toThrow();
    });

    it('should validate process status enum', () => {
      expect(ProcessStatusSchema.parse('running')).toBe('running');
      expect(ProcessStatusSchema.parse('stopped')).toBe('stopped');
      expect(ProcessStatusSchema.parse('terminated')).toBe('terminated');
      expect(() => ProcessStatusSchema.parse('invalid')).toThrow();
    });
  });

  describe('FileMetadataSchema', () => {
    it('should validate file metadata', () => {
      const metadata = {
        path: '/test/file.txt',
        type: 'file' as const,
        size: 1024,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        permissions: 'rwxrwxrwx',
      };
      expect(() => FileMetadataSchema.parse(metadata)).not.toThrow();
    });

    it('should validate directory metadata', () => {
      const metadata = {
        path: '/test',
        type: 'directory' as const,
        size: 0,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        permissions: 'rwxrwxrwx',
      };
      expect(() => FileMetadataSchema.parse(metadata)).not.toThrow();
    });
  });

  describe('MountPointSchema', () => {
    it('should validate mount point', () => {
      const mount = {
        path: '/',
        backend: 'indexedDB' as const,
        options: { dbName: 'test' },
      };
      expect(() => MountPointSchema.parse(mount)).not.toThrow();
    });

    it('should validate all backend types', () => {
      const backends: Array<'localStorage' | 'indexedDB' | 'server' | 'ephemeral'> = [
        'localStorage',
        'indexedDB',
        'server',
        'ephemeral',
      ];
      backends.forEach((backend) => {
        const mount = {
          path: '/',
          backend,
          options: {},
        };
        expect(() => MountPointSchema.parse(mount)).not.toThrow();
      });
    });
  });

  describe('AppManifestSchema', () => {
    it('should validate app manifest', () => {
      const manifest = {
        id: 'test-app',
        name: 'Test App',
        version: '1.0.0',
        description: 'A test app',
        entrypoint: '/bin/test-app.js',
        permissions: ['fs.read', 'fs.write'],
        icon: '/icons/test.png',
      };
      expect(() => AppManifestSchema.parse(manifest)).not.toThrow();
    });

    it('should allow optional fields', () => {
      const manifest = {
        id: 'test-app',
        name: 'Test App',
        version: '1.0.0',
        entrypoint: '/bin/test-app.js',
        permissions: [],
      };
      expect(() => AppManifestSchema.parse(manifest)).not.toThrow();
    });
  });

  describe('AppRegistryEntrySchema', () => {
    it('should validate registry entry', () => {
      const entry = {
        id: 'test-app',
        installedAt: Date.now(),
        installedBy: 'user-1',
        enabled: true,
        manifest: {
          id: 'test-app',
          name: 'Test App',
          version: '1.0.0',
          entrypoint: '/bin/test-app.js',
          permissions: [],
        },
      };
      expect(() => AppRegistryEntrySchema.parse(entry)).not.toThrow();
    });
  });

  describe('EventSchema', () => {
    it('should validate event', () => {
      const event = {
        type: 'test:event',
        payload: { data: 'test' },
        source: 'proc:123',
        target: 'proc:456',
        timestamp: Date.now(),
      };
      expect(() => EventSchema.parse(event)).not.toThrow();
    });

    it('should allow optional source and target', () => {
      const event = {
        type: 'test:event',
        payload: { data: 'test' },
        timestamp: Date.now(),
      };
      expect(() => EventSchema.parse(event)).not.toThrow();
    });
  });

  describe('PermissionSchema', () => {
    it('should validate permission', () => {
      const permission = {
        pid: 123,
        allowedSyscalls: ['fs.read', 'fs.write'],
        deniedSyscalls: ['proc.kill'],
        fsAccess: ['/home/user/**', '/tmp/**'],
      };
      expect(() => PermissionSchema.parse(permission)).not.toThrow();
    });

    it('should allow optional deniedSyscalls', () => {
      const permission = {
        pid: 123,
        allowedSyscalls: ['fs.read'],
        fsAccess: ['/home/user/**'],
      };
      expect(() => PermissionSchema.parse(permission)).not.toThrow();
    });
  });

  describe('SystemConfigSchema', () => {
    it('should validate system config', () => {
      const config = {
        users: [
          {
            id: 'user-1',
            username: 'user',
            homeDir: '/home/user',
          },
        ],
        defaultUser: 'user-1',
        mounts: [],
        system: {
          hostname: 'browser-os',
          timezone: 'UTC',
        },
      };
      expect(() => SystemConfigSchema.parse(config)).not.toThrow();
    });
  });
});

